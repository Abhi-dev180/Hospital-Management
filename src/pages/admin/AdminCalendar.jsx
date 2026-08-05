// import CalendarBoard from '../../components/CalendarBoard';
// export default function AdminCalendar() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
//         <p className="text-sm text-gray-500 mt-0.5">
//           Your hospital’s appointments laid out by day — click any entry for the full details.
//         </p>
//       </div>

//       <CalendarBoard
//         title="Hospital Calendar"
//         subtitle="Appointments booked at your hospital"
//       />
//     </div>
//   );
// }



// import React, { useState } from 'react';

// // Sample Mock Data mapped by 'YYYY-MM-DD'
// const MOCK_EVENTS = {
//   '2026-08-02': [
//     { id: 1, title: 'John Doe - Emergency', type: 'appointment', status: 'booked', time: '10:00 AM' }
//   ],
//   '2026-08-03': [
//     { id: 2, title: 'AI Voice Demo Call', type: 'demo', status: 'available', time: '09:00 AM' },
//     { id: 3, title: 'Dr. Smith Review', type: 'appointment', status: 'available', time: '11:30 AM' }
//   ],
//   '2026-08-05': [
//     { id: 4, title: 'Test Patient', type: 'appointment', status: 'completed', time: '10:00 AM' }
//   ],
//   '2026-08-06': [
//     { id: 5, title: 'Jane Doe - Operation', type: 'appointment', status: 'booked', time: '02:00 PM' }
//   ]
// };

// const MONTH_NAMES = [
//   'January', 'February', 'March', 'April', 'May', 'June', 
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// export default function CalendarBoard({ title = "Hospital Calendar", subtitle = "Appointments booked at your hospital" }) {
//   const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
//   const [selectedDateStr, setSelectedDateStr] = useState('2026-08-05');
//   const [filter, setFilter] = useState('all');

//   const year = currentDate.getFullYear();
//   const month = currentDate.getMonth();

//   const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
//   const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
//   const handleToday = () => {
//     const today = new Date();
//     const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
//     setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
//     setSelectedDateStr(todayStr);
//   };

//   const firstDayOfWeek = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const activeEvents = MOCK_EVENTS[selectedDateStr] || [];
//   const filteredEvents = activeEvents.filter(evt => {
//     if (filter === 'appointments') return evt.type === 'appointment';
//     if (filter === 'demos') return evt.type === 'demo';
//     return true;
//   });

//   const formatDateKey = (dayNum) => {
//     const m = String(month + 1).padStart(2, '0');
//     const d = String(dayNum).padStart(2, '0');
//     return `${year}-${m}-${d}`;
//   };

//   const isToday = (dateKey) => {
//     const today = new Date();
//     const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
//     return dateKey === todayStr;
//   };

//   return (
//     <div className="flex flex-col h-[calc(100vh-120px)] w-full bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
//         <div>
//           <h2 className="text-lg font-bold text-slate-800">{title}</h2>
//           <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
//         </div>

//         {/* Status Filters */}
//         <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//               filter === 'all' 
//                 ? 'bg-blue-600 text-white shadow-md' 
//                 : 'text-slate-600 hover:bg-slate-200'
//             }`}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setFilter('appointments')}
//             className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//               filter === 'appointments' 
//                 ? 'bg-blue-600 text-white shadow-md' 
//                 : 'text-slate-600 hover:bg-slate-200'
//             }`}
//           >
//             Appointments
//           </button>
//           <button
//             onClick={() => setFilter('demos')}
//             className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//               filter === 'demos' 
//                 ? 'bg-blue-600 text-white shadow-md' 
//                 : 'text-slate-600 hover:bg-slate-200'
//             }`}
//           >
//             Demos
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-1 min-h-0">
        
//         {/* LEFT: Calendar Grid */}
//         <div className="w-[62%] flex flex-col border-r border-slate-200 bg-white">
          
//           {/* Month Navigation */}
//           <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
//             <button
//               onClick={handlePrevMonth}
//               className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-sm font-bold shadow-sm"
//             >
//               ‹
//             </button>
            
//             <div className="flex items-center gap-3">
//               <span className="font-bold text-slate-800 text-sm">
//                 {MONTH_NAMES[month]} {year}
//               </span>
//               <button
//                 onClick={handleToday}
//                 className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold transition-all border border-blue-200"
//               >
//                 Today
//               </button>
//             </div>

//             <button
//               onClick={handleNextMonth}
//               className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-sm font-bold shadow-sm"
//             >
//               ›
//             </button>
//           </div>

//           {/* Days Header */}
//           <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
//             {DAY_NAMES.map((day) => (
//               <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2 bg-slate-50">
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Calendar Grid */}
//           <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1">
//             {/* Blank Start Day Offsets */}
//             {Array.from({ length: firstDayOfWeek }).map((_, i) => (
//               <div key={`empty-${i}`} className="bg-slate-50" />
//             ))}

//             {/* Calendar Days */}
//             {Array.from({ length: daysInMonth }).map((_, i) => {
//               const dayNum = i + 1;
//               const dateKey = formatDateKey(dayNum);
//               const isSelected = dateKey === selectedDateStr;
//               const isTodayDate = isToday(dateKey);
//               const dayEvents = MOCK_EVENTS[dateKey] || [];

//               return (
//                 <div
//                   key={dayNum}
//                   onClick={() => setSelectedDateStr(dateKey)}
//                   className={`bg-white p-1.5 cursor-pointer transition-all flex flex-col gap-1 min-h-[70px] ${
//                     isSelected
//                       ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
//                       : 'hover:bg-slate-50'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <span className={`text-xs font-bold ${
//                       isSelected ? 'text-blue-700' : isTodayDate ? 'text-blue-600' : 'text-slate-700'
//                     }`}>
//                       {dayNum}
//                     </span>
//                     {isTodayDate && (
//                       <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
//                         Today
//                       </span>
//                     )}
//                   </div>

//                   {/* Event Indicators */}
//                   <div className="flex flex-col gap-1 flex-1 overflow-hidden">
//                     {dayEvents.slice(0, 3).map((evt) => (
//                       <div
//                         key={evt.id}
//                         className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-md truncate ${
//                           evt.status === 'booked'
//                             ? 'bg-red-500 text-white'
//                             : evt.status === 'completed'
//                             ? 'bg-slate-400 text-white'
//                             : 'bg-emerald-500 text-white'
//                         }`}
//                       >
//                         {evt.time}
//                       </div>
//                     ))}
//                     {dayEvents.length > 3 && (
//                       <span className="text-[8px] text-slate-400 font-medium text-center">
//                         +{dayEvents.length - 3} more
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* RIGHT: Appointment Sidebar */}
//         <div className="w-[38%] flex flex-col bg-gradient-to-b from-slate-50 to-white">
//           <div className="px-5 py-4 border-b border-slate-200 bg-white">
//             <h3 className="text-sm font-bold text-slate-800">
//               {new Date(selectedDateStr).toLocaleDateString('en-US', {
//                 weekday: 'long',
//                 month: 'short',
//                 day: 'numeric',
//                 year: 'numeric'
//               })}
//             </h3>
//             <p className="text-xs text-slate-500 mt-1">
//               {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} scheduled
//             </p>
//           </div>

//           {/* Event Cards */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-3">
//             {filteredEvents.length > 0 ? (
//               filteredEvents.map((evt) => (
//                 <div
//                   key={evt.id}
//                   className={`p-3 border rounded-xl transition-all hover:shadow-md ${
//                     evt.status === 'booked'
//                       ? 'border-red-200 bg-gradient-to-r from-red-50 to-white'
//                       : evt.status === 'completed'
//                       ? 'border-slate-200 bg-gradient-to-r from-slate-50 to-white'
//                       : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between gap-2 mb-2">
//                     <span className="font-semibold text-xs text-slate-800 leading-tight">{evt.title}</span>
//                     <span
//                       className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
//                         evt.status === 'booked'
//                           ? 'bg-red-500 text-white'
//                           : evt.status === 'completed'
//                           ? 'bg-slate-400 text-white'
//                           : 'bg-emerald-500 text-white'
//                       }`}
//                     >
//                       {evt.status.toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3 text-[10px] text-slate-500">
//                     <span className="flex items-center gap-1">
//                       <span>🕒</span> {evt.time}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <span>📋</span> <span className="capitalize">{evt.type}</span>
//                     </span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
//                 <div className="text-4xl mb-3">📅</div>
//                 <p className="text-sm font-medium">No bookings found</p>
//                 <p className="text-xs mt-1">Select another date to view appointments</p>
//               </div>
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarBoard({ title = "Hospital Calendar", subtitle = "Appointments booked at your hospital" }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-05');
  const [filter, setFilter] = useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(todayStr);
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

  const isToday = (dateKey) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateKey === todayStr;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-100 shrink-0 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Status Filters - Mobile friendly scrollable */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('appointments')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'appointments' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setFilter('demos')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'demos' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Demos
          </button>
        </div>
      </div>

      {/* Main Content - Stacks vertically on mobile */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: Calendar Grid - Takes full width on mobile, 62% on desktop */}
        <div className="w-full sm:w-[62%] flex flex-col border-b sm:border-b-0 sm:border-r border-slate-200 bg-white overflow-hidden">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-sm font-bold shadow-sm cursor-pointer"
            >
              ‹
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-bold text-slate-800 text-sm">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                onClick={handleToday}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold transition-all border border-blue-200 cursor-pointer"
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-sm font-bold shadow-sm cursor-pointer"
            >
              ›
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
            {DAY_NAMES.map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2 bg-slate-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Makes cells taller on mobile for easier tapping */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 overflow-y-auto">
            {/* Blank Start Day Offsets */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = formatDateKey(dayNum);
              const isSelected = dateKey === selectedDateStr;
              const isTodayDate = isToday(dateKey);
              const dayEvents = MOCK_EVENTS[dateKey] || [];

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`bg-white p-1 sm:p-1.5 cursor-pointer transition-all flex flex-col gap-0.5 sm:gap-1 min-h-[50px] sm:min-h-[70px] ${
                    isSelected
                      ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between px-0.5 sm:px-0">
                    <span className={`text-[10px] sm:text-xs font-bold ${
                      isSelected ? 'text-blue-700' : isTodayDate ? 'text-blue-600' : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>
                    {isTodayDate && (
                      <span className="hidden sm:block text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Event Indicators - Hides on smaller mobile to keep it clean */}
                  <div className="hidden sm:flex flex-col gap-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-md truncate ${
                          evt.status === 'booked'
                            ? 'bg-red-500 text-white'
                            : evt.status === 'completed'
                            ? 'bg-slate-400 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {evt.time}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-slate-400 font-medium text-center">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                  
                  {/* Mobile indicator dots instead of full time blocks */}
                  <div className="flex sm:hidden gap-1 justify-center mt-0.5">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          evt.status === 'booked'
                            ? 'bg-red-500'
                            : evt.status === 'completed'
                            ? 'bg-slate-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-slate-400 font-bold">+</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Appointment Sidebar - Takes full width on mobile, 38% on desktop */}
        <div className="w-full sm:w-[38%] flex flex-col bg-gradient-to-b from-slate-50 to-white max-h-[40vh] sm:max-h-full">
          
          {/* Selected Day Header */}
          <div className="px-5 py-4 border-b border-slate-200 bg-white shrink-0">
            <h3 className="text-sm font-bold text-slate-800">
              {new Date(selectedDateStr).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>

          {/* Event Cards - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 border rounded-xl transition-all hover:shadow-md bg-white ${
                    evt.status === 'booked'
                      ? 'border-red-200'
                      : evt.status === 'completed'
                      ? 'border-slate-200'
                      : 'border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 leading-tight">{evt.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap self-start sm:self-center ${
                        evt.status === 'booked'
                          ? 'bg-red-500 text-white'
                          : evt.status === 'completed'
                          ? 'bg-slate-400 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {evt.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span>🕒</span> {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📋</span> <span className="capitalize">{evt.type}</span>
                    </span>
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
    </div>
  );
}