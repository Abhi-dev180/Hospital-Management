import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API_URL from '../config/api';

/**
 * Live "needs attention" counts for the superadmin navigation.
 *
 * The number on each tab is the real count of unhandled records
 * (pending registrations, new contact enquiries, un-actioned demo requests).
 * Opening a section acknowledges what is currently there, so the badge drops
 * to 0 and only reappears when something new arrives.
 *
 * Acknowledgement is stored per browser in localStorage — it's a read marker,
 * not application state, so it deliberately never hits the server.
 */

const POLL_MS = 15000;
const SEEN_KEY = 'superadmin:seenCounts';

// Which route "clears" which badge.
export const BADGE_ROUTES = {
  registrations: '/superadmin/registrations',
  contacts: '/superadmin/contacts',
  demos: '/superadmin/demos'
};

const readSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
  } catch {
    return {};
  }
};

const writeSeen = (next) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch { /* storage unavailable — badges just won't persist */ }
};

// Unhandled totals straight off the stats payload.
const liveCounts = (stats) => ({
  registrations: stats?.registrations?.pending ?? 0,
  contacts: stats?.contacts?.new ?? 0,
  demos: stats?.demos?.requested ?? 0
});

export default function useSuperAdminBadges(enabled = true) {
  const location = useLocation();
  const [raw, setRaw] = useState({ registrations: 0, contacts: 0, demos: 0 });
  const [seen, setSeen] = useState(readSeen);

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      setRaw(liveCounts(await res.json()));
    } catch {
      // Best-effort: keep the last known counts on a transient failure.
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchCounts();
    const id = setInterval(fetchCounts, POLL_MS);
    const onFocus = () => fetchCounts();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, fetchCounts]);

  // Opening a section marks its current count as read.
  useEffect(() => {
    const key = Object.keys(BADGE_ROUTES).find((k) => location.pathname.startsWith(BADGE_ROUTES[k]));
    if (!key) return;
    setSeen((prev) => {
      if (prev[key] === raw[key]) return prev;
      const next = { ...prev, [key]: raw[key] };
      writeSeen(next);
      return next;
    });
  }, [location.pathname, raw]);

  // Badge = how many arrived since this section was last opened. If items were
  // handled elsewhere the live count can fall below the marker — clamp at 0.
  const badges = Object.keys(raw).reduce((acc, key) => {
    acc[key] = Math.max(0, raw[key] - (seen[key] ?? 0));
    return acc;
  }, {});

  return { badges, counts: raw, refresh: fetchCounts };
}
