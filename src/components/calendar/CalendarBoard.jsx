import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api'; 

// ─── Helpers ──────────────────────────────────────────────────
const formatDateKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Status colour mapping ────────────────────────────────────
const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'scheduled') return 'bg-blue-500';
  if (s === 'completed' || s === 'resolved') return 'bg-slate-400';
  if (s === 'cancelled') return 'bg-red-500';
  if (s === 'pending' || s === 'requested') return 'bg-amber-500';
  return 'bg-emerald-500';
};

export default function CalendarBoard({ title = "Hospital Calendar", subtitle = "Appointments booked at your hospital" }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [filter, setFilter] = useState('all');
  const [eventsMap, setEventsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ─── Fetch events for the current month ─────────────────────
  const fetchEvents = async () => {
    const from = formatDateKey(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = formatDateKey(year, month, lastDay);

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/calendar/events?from=${from}&to=${to}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to fetch events');
      }
      const data = await res.json();

      // ─── Convert array into a map by date ────────────────────
      const map = {};
      data.events.forEach((evt) => {
        const dateKey = evt.date; // 'YYYY-MM-DD'
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push({
          id: evt.recordId,
          title: evt.title,
          type: evt.type,           // 'appointment' or 'demo'
          status: evt.status,
          time: evt.time || 'TBD',
        });
      });
      setEventsMap(map);

      // ─── Auto‑select the first day with events, or today ────
      const todayStr = formatDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      const firstDate = Object.keys(map).sort()[0];
      setSelectedDateStr(firstDate || todayStr);
    } catch (err) {
      console.error('[CalendarBoard] fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeEvents = eventsMap[selectedDateStr] || [];
  const filteredEvents = activeEvents.filter(evt => {
    if (filter === 'appointments') return evt.type === 'appointment';
    if (filter === 'demos') return evt.type === 'demo';
    return true;
  });

  const isToday = (dateKey) => {
    const today = new Date();
    return dateKey === formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-100 shrink-0 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['all', 'appointments', 'demos'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm p-4">
          {error}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
              <div className="bg-white py-2 px-4 rounded-full shadow-md border border-slate-100 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-sm font-semibold text-slate-600 animate-pulse">Loading month...</span>
              </div>
            </div>
          )}
          {/* ─── Calendar Grid ───────────────────────────────── */}
          <div className="w-full sm:w-[62%] flex flex-col border-b sm:border-b-0 sm:border-r border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <button disabled={loading} onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all text-sm font-bold shadow-sm">‹</button>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-bold text-slate-800 text-sm">{MONTH_NAMES[month]} {year}</span>
                <button disabled={loading} onClick={handleToday} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold transition-all border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">Today</button>
              </div>
              <button disabled={loading} onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all text-sm font-bold shadow-sm">›</button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
              {DAY_NAMES.map((day) => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2 bg-slate-50">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 overflow-y-auto">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = formatDateKey(year, month, dayNum);
                const isSelected = dateKey === selectedDateStr;
                const isTodayDate = isToday(dateKey);
                const dayEvents = eventsMap[dateKey] || [];

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDateStr(dateKey)}
                    className={`bg-white p-1 sm:p-1.5 cursor-pointer transition-all flex flex-col gap-0.5 sm:gap-1 min-h-[50px] sm:min-h-[70px] ${
                      isSelected ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between px-0.5 sm:px-0">
                      <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-blue-700' : isTodayDate ? 'text-blue-600' : 'text-slate-700'}`}>
                        {dayNum}
                      </span>
                      {isTodayDate && (
                        <span className="hidden sm:block text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">Today</span>
                      )}
                    </div>

                    {/* Desktop indicators */}
                    <div className="hidden sm:flex flex-col gap-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div key={evt.id} className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-md truncate text-white ${statusClass(evt.status)}`}>
                          {evt.time}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <span className="text-[8px] text-slate-400 font-medium text-center">+{dayEvents.length - 2}</span>}
                    </div>

                    {/* Mobile dots */}
                    <div className="flex sm:hidden gap-1 justify-center mt-0.5">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <div key={evt.id} className={`w-1.5 h-1.5 rounded-full ${statusClass(evt.status)}`} />
                      ))}
                      {dayEvents.length > 3 && <span className="text-[8px] text-slate-400 font-bold">+</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right Sidebar ────────────────────────────────── */}
          <div className="w-full sm:w-[38%] flex flex-col bg-gradient-to-b from-slate-50 to-white max-h-[40vh] sm:max-h-full">
            <div className="px-5 py-4 border-b border-slate-200 bg-white shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {selectedDateStr
                  ? new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Select a date'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3 border rounded-xl transition-all hover:shadow-md bg-white ${
                      evt.status === 'Cancelled' ? 'border-red-200' :
                      evt.status === 'Completed' ? 'border-slate-200' :
                      'border-emerald-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-800 leading-tight">{evt.title}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap self-start sm:self-center text-white ${statusClass(evt.status)}`}>
                        {evt.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-slate-500">
                      <span className="flex items-center gap-1">🕒 {evt.time}</span>
                      <span className="flex items-center gap-1">📋 <span className="capitalize">{evt.type}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-8">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm font-medium">No bookings found</p>
                  <p className="text-xs mt-1">Select another date to view appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}