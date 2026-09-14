
import React from 'react';
import CalendarBoard from '../../components/calendar/CalendarBoard';
import DashboardTabs from '../../components/DashboardTabs';

export default function SuperAdminCalendar() {
  return (
    <div className="w-full px-2 sm:px-3 py-4 space-y-4">
      <DashboardTabs role="superadmin" />
      <CalendarBoard 
        title="Super Admin Calendar" 
        subtitle="All appointments & demos" 
      />
    </div>
  );
}