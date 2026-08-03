import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, Video, Stethoscope, Clock,
  Phone, Mail, PawPrint, MapPin, X, RefreshCw, CalendarX2, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';
import Loader, { SectionLoader } from './Loader';

/**
 * Month calendar showing appointments and demo meetings side by side.
 * Data comes from GET /api/calendar/events, which scopes rows by role.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Tailwind can't build class names at runtime, so map colour keys to full strings.
const DOT = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500',
  purple: 'bg-purple-500',
  slate: 'bg-slate-400'
};

const CHIP = {
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  red: 'bg-red-50 text-red-800 border-red-200',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200'
};

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isSameDay = (a, b) => ymd(a) === ymd(b);

const monthLabel = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const prettyDay = (key) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

export default function CalendarBoard({ title = 'Calendar', subtitle = 'Appointments and demo meetings at a glance' }) {
  const today = new Date();

  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, appointment: 0, demo: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(ymd(today));
  const [typeFilter, setTypeFilter] = useState('all'); // all | appointment | demo
  const [detail, setDetail] = useState(null);

  // ─── Grid: pad to whole weeks so the month always renders 6 rows max ──
  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const rangeFrom = ymd(grid[0]);
  const rangeTo = ymd(grid[grid.length - 1]);

  const fetchEvents = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/calendar/events?from=${rangeFrom}&to=${rangeTo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load the calendar');
      setEvents(Array.isArray(data.events) ? data.events : []);
      setCounts(data.counts || { total: 0, appointment: 0, demo: 0 });
    } catch (err) {
      setError(err.message || 'Could not load the calendar');
      if (!silent) toast.error(err.message || 'Could not load the calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeFrom, rangeTo]);

  const visible = useMemo(
    () => (typeFilter === 'all' ? events : events.filter((e) => e.type === typeFilter)),
    [events, typeFilter]
  );

  // date → events, so each cell is an O(1) lookup instead of a scan.
  const byDay = useMemo(() => {
    return visible.reduce((acc, e) => {
      if (!e.date) return acc;
      (acc[e.date] ||= []).push(e);
      return acc;
    }, {});
  }, [visible]);

  const dayEvents = (byDay[selectedDay] || [])
    .slice()
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));

  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(ymd(now));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-medical-blue" /> {title}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter */}
          <div className="inline-flex rounded-full border border-gray-200 p-1 bg-slate-50">
            {[
              { key: 'all', label: `All (${counts.total})` },
              { key: 'appointment', label: `Appointments (${counts.appointment})` },
              { key: 'demo', label: `Demos (${counts.demo})` }
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setTypeFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  typeFilter === f.key ? 'bg-medical-blue text-white shadow-sm' : 'text-gray-600 hover:text-medical-blue'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchEvents()}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold transition text-sm disabled:opacity-60"
          >
            {loading ? <Loader size="sm" /> : <RefreshCw size={15} />} Refresh
          </button>
        </div>
      </div>

      {/* ─── Month nav ───────────────────────────────────── */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
          aria-label="Previous month"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-extrabold text-gray-900">{monthLabel(cursor)}</h3>
          <button
            type="button"
            onClick={goToday}
            className="text-xs font-bold text-medical-blue hover:text-medical-dark border border-medical-blue/30 rounded-full px-3 py-1 transition"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
          aria-label="Next month"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      {loading && events.length === 0 ? (
        <SectionLoader label="Loading calendar…" sub="Fetching appointments and demo meetings" />
      ) : error ? (
        <div className="py-16 text-center">
          <CalendarX2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-700">{error}</p>
          <button type="button" onClick={() => fetchEvents()} className="btn btn-outline btn-sm mt-4">
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
          {/* ─── Month grid ────────────────────────────── */}
          <div className="xl:col-span-2 p-4 sm:p-6 border-b xl:border-b-0 xl:border-r border-gray-100">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((d) => {
                const key = ymd(d);
                const inMonth = d.getMonth() === cursor.getMonth();
                const isToday = isSameDay(d, today);
                const isSelected = key === selectedDay;
                const dayList = byDay[key] || [];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    className={`relative min-h-[74px] sm:min-h-[86px] rounded-xl border p-1.5 text-left transition
                      ${isSelected
                        ? 'border-medical-blue ring-2 ring-medical-blue/20 bg-blue-50/50'
                        : 'border-gray-100 hover:border-medical-blue/40 hover:bg-slate-50'}
                      ${inMonth ? '' : 'opacity-40'}`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                        ${isToday ? 'bg-medical-blue text-white' : 'text-gray-700'}`}
                    >
                      {d.getDate()}
                    </span>

                    {/* Up to 2 chips, then a “+n more” hint */}
                    <div className="mt-1 space-y-0.5">
                      {dayList.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-bold border truncate ${CHIP[e.colour] || CHIP.slate}`}
                          title={`${e.time || ''} ${e.title}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[e.colour] || DOT.slate}`} />
                          <span className="truncate">{e.time ? `${e.time} ` : ''}{e.title}</span>
                        </span>
                      ))}
                      {dayList.length > 2 && (
                        <span className="block text-[9px] font-bold text-gray-400 pl-1">
                          +{dayList.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Day agenda ────────────────────────────── */}
          <div className="p-5 sm:p-6 bg-slate-50/60">
            <h3 className="font-bold text-gray-900">{prettyDay(selectedDay)}</h3>
            <p className="text-xs text-gray-500 mb-5">
              {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'} scheduled
            </p>

            {dayEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarX2 className="w-9 h-9 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nothing scheduled for this day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((e) => {
                  const Icon = e.type === 'demo' ? Video : Stethoscope;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setDetail(e)}
                      className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4 hover:border-medical-blue hover:shadow-sm transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${CHIP[e.colour] || CHIP.slate}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-sm text-gray-900 truncate">{e.title}</p>
                            <span className={`pill border text-[10px] shrink-0 ${CHIP[e.colour] || CHIP.slate}`}>{e.status}</span>
                          </div>
                          {e.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{e.subtitle}</p>}
                          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {e.time || 'Time not set'}
                            <span className="text-gray-300">·</span>
                            <span className="capitalize">{e.type}</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Detail modal ────────────────────────────────── */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 14 }}
              onClick={(ev) => ev.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {detail.type === 'demo' ? 'Demo meeting' : 'Patient appointment'}
                  </span>
                  <h4 className="text-lg font-bold truncate">{detail.title}</h4>
                </div>
                <button onClick={() => setDetail(null)} className="p-1.5 rounded-full hover:bg-white/10 transition" aria-label="Close">
                  <X size={19} />
                </button>
              </div>

              <div className="p-6 space-y-3 text-sm">
                <Row icon={CalendarDays} label="Date" value={detail.date ? prettyDay(detail.date) : '—'} />
                <Row icon={Clock} label="Time" value={detail.time || 'Not set'} />
                <Row icon={Stethoscope} label="Status" value={detail.status} />
                {detail.subtitle && <Row icon={MapPin} label={detail.type === 'demo' ? 'Contact' : 'Hospital'} value={detail.subtitle} />}
                {detail.meta?.petName && <Row icon={PawPrint} label="Pet" value={detail.meta.petName} />}
                {detail.meta?.phone && <Row icon={Phone} label="Phone" value={detail.meta.phone} href={`tel:${detail.meta.phone}`} />}
                {detail.meta?.email && <Row icon={Mail} label="Email" value={detail.meta.email} href={`mailto:${detail.meta.email}`} />}
                {detail.meta?.city && <Row icon={MapPin} label="City" value={detail.meta.city} />}
                {detail.meta?.reason && <Row icon={Stethoscope} label="Reason" value={detail.meta.reason} />}

                {detail.meta?.meetingLink && (
                  <a
                    href={detail.meta.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-md w-full mt-2"
                  >
                    <Video className="w-4 h-4" /> Join meeting <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon: Icon, label, value, href }) {
  const body = (
    <>
      <div className="w-9 h-9 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">{label}</span>
        <span className="text-sm font-semibold text-gray-900 break-words">{value}</span>
      </div>
    </>
  );

  return href ? (
    <a href={href} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200/70 hover:border-medical-blue transition">
      {body}
    </a>
  ) : (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200/70">{body}</div>
  );
}
