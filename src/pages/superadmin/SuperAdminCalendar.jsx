// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';
// import CalendarBoard from '../../components/CalendarBoard';

// export default function SuperAdminCalendar() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const stored = localStorage.getItem('user');
//     if (!stored) return navigate('/login');
//     try {
//       const parsed = JSON.parse(stored);
//       if (parsed.role !== 'superadmin') return navigate('/');
//       setUser(parsed);
//     } catch {
//       navigate('/login');
//     }
//   }, [navigate]);

//   return (
//     <DashboardLayout
//       title="Calendar"
//       subtitle="Every patient appointment and demo meeting across the network, in one view."
//       user={user}
//     >
//       <DashboardTabs role="superadmin" />
//       <CalendarBoard
//         title="Network Calendar"
//         subtitle="Appointments from all hospitals plus scheduled demo meetings"
//       />
//     </DashboardLayout>
//   );
// }


import React, { useState } from 'react';

// Sample Mock Data mapped by 'YYYY-MM-DD'
const MOCK_EVENTS = {
  '2026-08-02': [
    { id: 1, title: 'John Doe - Emergency', type: 'appointment', status: 'booked', time: '10:00 AM' }
  ],
  '2026-08-03': [
    { id: 2, title: 'AI Voice Demo Call', type: 'demo', status: 'available', time: '09:00 AM' },
    { id: 3, title: 'Dr. Smith Review', type: 'appointment', status: 'available', time: '11:30 AM' }
  ],
  '2026-08-05': [
    { id: 4, title: 'Test Patient', type: 'appointment', status: 'completed', time: '10:00 AM' }
  ],
  '2026-08-06': [
    { id: 5, title: 'Jane Doe - Operation', type: 'appointment', status: 'booked', time: '02:00 PM' }
  ]
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarBoard({ title = "Network Calendar", subtitle = "Appointments & Demos" }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-05');
  const [filter, setFilter] = useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 1));
    setSelectedDateStr('2026-08-05');
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeEvents = MOCK_EVENTS[selectedDateStr] || [];
  const filteredEvents = activeEvents.filter(evt => {
    if (filter === 'appointments') return evt.type === 'appointment';
    if (filter === 'demos') return evt.type === 'demo';
    return true;
  });

  const formatDateKey = (dayNum) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl border border-slate-200 p-2 sm:p-4 shadow-sm text-slate-800 overflow-y-auto lg:overflow-hidden">
      
      {/* Responsive Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">{title}</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">{subtitle}</p>
        </div>

        {/* Status Filters */}
        <div className="bg-slate-100 p-1 rounded-lg flex self-start sm:self-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-3 py-1 rounded-md transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('appointments')}
            className={`px-2.5 sm:px-3 py-1 rounded-md transition-all ${filter === 'appointments' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
          >
            Appointments
          </button>
          <button
            onClick={() => setFilter('demos')}
            className={`px-2.5 sm:px-3 py-1 rounded-md transition-all ${filter === 'demos' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
          >
            Demos
          </button>
        </div>
      </div>

      {/* Main Container: Stacked on Mobile (`flex-col`), Side-by-Side on Desktop (`lg:flex-row`) */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-3 mt-3">
        
        {/* LEFT COLUMN: Compact Calendar Grid */}
        <div className="w-full lg:w-[60%] flex flex-col border border-slate-200 rounded-lg p-2 sm:p-3 bg-slate-50/50">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition-all text-sm font-bold"
            >
              &#8249;
            </button>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                onClick={handleToday}
                className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded font-medium"
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition-all text-sm font-bold"
            >
              &#8250;
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 shrink-0">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Dynamic Grid Layout */}
          <div className="grid grid-cols-7 gap-1 flex-1 min-h-[220px] lg:min-h-0">
            {/* Blank Start Day Offsets */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="border border-slate-100 rounded-md bg-slate-100/30" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = formatDateKey(dayNum);
              const isSelected = dateKey === selectedDateStr;
              const dayEvents = MOCK_EVENTS[dateKey] || [];

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`border rounded-md p-0.5 sm:p-1 flex flex-col justify-start min-h-[38px] sm:min-h-[44px] cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[9px] sm:text-[10px] font-bold leading-none ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>

                  {/* Compact Event Indicators */}
                  <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className={`text-[8px] sm:text-[9px] font-semibold px-1 py-0.5 rounded truncate ${
                          evt.status === 'booked'
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <span className="hidden sm:inline">{evt.time} </span>
                        {evt.status === 'booked' ? 'Booked' : 'Slot'}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Responsive Appointment Sidebar */}
        <div className="w-full lg:w-[40%] flex flex-col border border-slate-200 rounded-lg p-3 bg-white min-h-[160px]">
          <div className="border-b border-slate-100 pb-2 mb-2 shrink-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              {new Date(selectedDateStr).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              {filteredEvents.length} event(s) scheduled
            </p>
          </div>

          {/* Event Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] lg:max-h-none">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-2.5 border rounded-lg transition-all ${
                    evt.status === 'booked'
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800">{evt.title}</span>
                    <span
                      className={`text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        evt.status === 'booked'
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {evt.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1">
                    <span>🕒 {evt.time}</span>
                    <span className="capitalize">• {evt.type}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                <p className="text-xs">No bookings found for this date.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}