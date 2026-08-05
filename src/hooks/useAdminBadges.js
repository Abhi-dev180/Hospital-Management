import { useCallback, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import API_URL from '../config/api';

const POLL_MS = 15000;
const SEEN_KEY = 'admin:seenCounts';

// Which route "clears" which badge.
export const BADGE_ROUTES = {
  appointments: '/admin/appointments',
  feedback: '/admin/appointment-feedback'
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

// Extract admin totals straight off the stats payload.
const liveCounts = (stats) => ({
  appointments: stats?.appointments?.pending ?? 0,
  feedback: stats?.feedback?.unread ?? 0
});

export default function useAdminBadges(enabled = true) {
  const location = useLocation();
  const [raw, setRaw] = useState({ appointments: 0, feedback: 0 });
  const [seen, setSeen] = useState(readSeen);

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // Assuming your backend returns admin stats in the same overview endpoint
      const res = await fetch(`${API_URL}/api/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setRaw(liveCounts(data));
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
    // Use exact match or startsWith for nested routes
    const key = Object.keys(BADGE_ROUTES).find((k) => 
      location.pathname === BADGE_ROUTES[k] || location.pathname.startsWith(`${BADGE_ROUTES[k]}/`)
    );
    if (!key) return;

    setSeen((prev) => {
      // If the current raw count is LOWER than the stored seen count, 
      // it means data was deleted/reset on the backend. 
      const safeRaw = raw[key] ?? 0;
      const safePrev = prev[key] ?? 0;
      
      // Reset logic: If backend erased data, match the marker.
      if (safeRaw < safePrev) {
        const next = { ...prev, [key]: safeRaw };
        writeSeen(next);
        return next;
      }

      // Standard logic: Save the current raw number as 'seen'
      if (safePrev !== safeRaw) {
        const next = { ...prev, [key]: safeRaw };
        writeSeen(next);
        return next;
      }
      return prev;
    });
  }, [location.pathname, raw]);

  // Memoize the badge calculation to prevent unnecessary re-renders in Navbar
  const badges = useMemo(() => {
    return Object.keys(raw).reduce((acc, key) => {
      const rawCount = raw[key] ?? 0;
      const seenCount = seen[key] ?? 0;
      
      // Math.max ensures we don't go negative if seen > raw due to deletions
      acc[key] = Math.max(0, rawCount - seenCount);
      return acc;
    }, {});
  }, [raw, seen]);

  return { badges, counts: raw, refresh: fetchCounts };
}