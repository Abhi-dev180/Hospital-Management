import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import API_URL from '../config/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function SlotSelector({
  date,
  hospitalId,
  selectedTime,
  onSelectTime,
  showClock = true
}) {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Parse initial 12-hour clock state from selectedTime or default to 10:00 AM
  const parseTime = (t) => {
    if (!t) return { hour12: 10, minute: 0, ampm: 'AM' };
    const [hStr, mStr] = String(t).split(':');
    let h = parseInt(hStr || '10', 10);
    const m = parseInt(mStr || '0', 10);
    if (isNaN(h)) h = 10;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return { hour12, minute: isNaN(m) ? 0 : m, ampm };
  };

  const initial = parseTime(selectedTime);
  const [timeHour, setTimeHour] = useState(initial.hour12);
  const [timeMinute, setTimeMinute] = useState(initial.minute);
  const [timeAmPm, setTimeAmPm] = useState(initial.ampm);

  // Keep clock hands in sync when selectedTime prop updates externally
  useEffect(() => {
    if (selectedTime) {
      const parsed = parseTime(selectedTime);
      setTimeHour(parsed.hour12);
      setTimeMinute(parsed.minute);
      setTimeAmPm(parsed.ampm);
    }
  }, [selectedTime]);

  // Update parent when clock spinners change
  const handleTimeChange = (h12, min, ap) => {
    setTimeHour(h12);
    setTimeMinute(min);
    setTimeAmPm(ap);

    let h24 = h12 % 12;
    if (ap === 'PM') h24 += 12;
    const formatted = `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    if (onSelectTime) onSelectTime(formatted);
  };

  const fetchBookedSlots = useCallback(async () => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/booked-slots?date=${date}&hospitalId=${hospitalId || ''}`
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.bookedSlots)) {
        setBookedSlots(data.bookedSlots);
      } else {
        setBookedSlots([]);
      }
    } catch (e) {
      console.error('Could not fetch booked slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  }, [date, hospitalId]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Real-time slot update listeners
  useWebSocket('appointment_cancelled', (payload) => {
    if (!payload || !payload.date || payload.date === date) {
      fetchBookedSlots();
    }
  });

  useWebSocket('slots_updated', (payload) => {
    if (!payload || !payload.date || payload.date === date) {
      fetchBookedSlots();
    }
  });

  useWebSocket('appointment_created', (payload) => {
    if (!payload || !payload.date || payload.date === date) {
      fetchBookedSlots();
    }
  });

  const slots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const isSlotBooked = (slot) => {
    if (!bookedSlots || !Array.isArray(bookedSlots)) return false;
    const s = String(slot).trim().slice(0, 5);
    return bookedSlots.some((b) => String(b).trim().slice(0, 5) === s);
  };

  const isPastSlot = (slot) => {
    if (!date) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) return true;
    if (date === todayStr) {
      const now = new Date();
      const minValid = new Date(now.getTime() + 60 * 60 * 1000);
      const [h, m] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      return slotDate < minValid;
    }
    return false;
  };

  const availableCount = slots.filter((s) => !isPastSlot(s) && !isSlotBooked(s)).length;

  return (
    <div className="w-full space-y-3">
      {/* Interactive Clock Section */}
      {showClock && (
        <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-blue-800 font-semibold text-xs">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Interactive Clock Picker
            </span>
            <span className="text-[11px] font-bold bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 text-blue-700 shadow-2xs">
              {String(timeHour).padStart(2, '0')}:{String(timeMinute).padStart(2, '0')} {timeAmPm}
            </span>
          </div>

          {/* Clock Face + Spinners Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
            {/* SVG Analog Clock Face */}
            <div className="relative w-24 h-24 rounded-full border-2 border-blue-300/80 bg-white shadow-inner flex items-center justify-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Center dot */}
                <circle cx="100" cy="100" r="5" fill="#1e40af" />

                {/* Hour numbers (1-12) */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                  const isActive = timeHour === num;
                  const rotation = num * 30;
                  return (
                    <g
                      key={num}
                      transform={`rotate(${rotation}, 100, 100)`}
                      onClick={() => handleTimeChange(num, timeMinute, timeAmPm)}
                      className="cursor-pointer"
                    >
                      {isActive && <circle cx="100" cy="27" r="13" fill="#2563eb" />}
                      <text
                        x="100"
                        y="32"
                        textAnchor="middle"
                        className={`text-xs font-bold select-none ${
                          isActive ? 'fill-white' : 'fill-slate-600'
                        }`}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}

                {/* Hour Hand */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="65"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform={`rotate(${(timeHour % 12) * 30 + timeMinute * 0.5}, 100, 100)`}
                />

                {/* Minute Hand */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="50"
                  stroke="#ec4899"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${timeMinute * 6}, 100, 100)`}
                />
              </svg>
            </div>

            {/* Up/Down Digital Selectors */}
            <div className="flex items-end gap-3">
              {/* Hour Spinner */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTimeChange(timeHour < 12 ? timeHour + 1 : 1, timeMinute, timeAmPm)}
                  className="w-7 h-6 flex items-center justify-center bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  ▲
                </button>
                <div className="w-8 h-8 border-2 border-blue-300 rounded-xl bg-white flex items-center justify-center text-base font-extrabold text-blue-900 shadow-xs">
                  {String(timeHour).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => handleTimeChange(timeHour > 1 ? timeHour - 1 : 12, timeMinute, timeAmPm)}
                  className="w-7 h-6 flex items-center justify-center bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  ▼
                </button>
              </div>

              <div className="text-2xl font-bold text-blue-400 mb-2">:</div>

              {/* Minute Spinner */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTimeChange(timeHour, timeMinute < 45 ? timeMinute + 15 : 0, timeAmPm)}
                  className="w-7 h-6 flex items-center justify-center bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  ▲
                </button>
                <div className="w-8 h-8 border-2 border-blue-300 rounded-xl bg-white flex items-center justify-center text-base font-extrabold text-blue-900 shadow-xs">
                  {String(timeMinute).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => handleTimeChange(timeHour, timeMinute > 0 ? timeMinute - 15 : 45, timeAmPm)}
                  className="w-7 h-6 flex items-center justify-center bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  ▼
                </button>
              </div>

              {/* AM / PM Toggle */}
              <div className="flex flex-col bg-white rounded-xl border border-blue-300 overflow-hidden shadow-xs ml-1">
                <button
                  type="button"
                  onClick={() => handleTimeChange(timeHour, timeMinute, 'AM')}
                  className={`px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    timeAmPm === 'AM' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeChange(timeHour, timeMinute, 'PM')}
                  className={`px-2.5 py-1 text-xs font-bold transition border-t border-blue-200 cursor-pointer ${
                    timeAmPm === 'PM' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Slots Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 font-medium px-0.5">
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 text-[10px]">
          {loadingSlots ? 'Checking calendar...' : `${availableCount} slots open`}
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Open</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Past</span>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
        {slots.map((slot) => {
          const isPast = isPastSlot(slot);
          const bookedMatch = isSlotBooked(slot);
          const isUnavailable = bookedMatch || isPast;
          const isSelected = selectedTime === slot;

          return (
            <button
              key={slot}
              type="button"
              disabled={isUnavailable}
              onClick={() => {
                if (onSelectTime) onSelectTime(slot);
                const p = parseTime(slot);
                setTimeHour(p.hour12);
                setTimeMinute(p.minute);
                setTimeAmPm(p.ampm);
              }}
              className={`group flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border transition-all text-center min-h-[44px] ${
                isPast
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : bookedMatch
                  ? 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed opacity-90 shadow-xs'
                  : isSelected
                  ? 'bg-gradient-to-br from-medical-blue to-blue-700 text-white border-blue-600 shadow-md ring-2 ring-blue-300/60 font-bold scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-medical-blue hover:bg-blue-50/60 hover:shadow-xs hover:text-medical-blue'
              }`}
              title={
                isPast
                  ? 'Time slot has already passed'
                  : bookedMatch
                  ? 'This slot is already booked in the hospital calendar'
                  : `Click to select ${slot}`
              }
            >
              <span className={`text-xs sm:text-sm leading-tight font-bold ${
                isPast ? 'line-through text-slate-400' : bookedMatch ? 'line-through text-red-600' : ''
              }`}>
                {slot}
              </span>
              <span className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider leading-none ${
                isPast
                  ? 'text-slate-400'
                  : bookedMatch
                  ? 'text-red-500 font-extrabold'
                  : isSelected
                  ? 'text-blue-100 font-bold'
                  : 'text-slate-400 group-hover:text-medical-blue'
              }`}>
                {isPast ? 'Past' : bookedMatch ? 'Booked' : isSelected ? 'Selected' : 'Open'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}