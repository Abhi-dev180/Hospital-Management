
import React from 'react';
import CalendarBoard from '../../components/calendar/CalendarBoard';
import DashboardTabs from '../../components/DashboardTabs';

export default function AdminCalendar() {
  return (
    <div className="min-h-screen w-full bg-slate-50 py-3 sm:py-4 px-2 sm:px-3 md:px-4 lg:px-5">
      <div className="w-full max-w-[1720px] mx-auto space-y-4">
        <DashboardTabs role="admin" />
        <CalendarBoard 
          title="Admin Calendar" 
          subtitle="Your hospital's appointments" 
        />
      </div>
    </div>
  );
}