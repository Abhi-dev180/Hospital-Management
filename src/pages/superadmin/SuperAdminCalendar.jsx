
import React from 'react';
import CalendarBoard from '../../components/calendar/CalendarBoard';

export default function SuperAdminCalendar() {
  return (
    <div className="p-4">
      <CalendarBoard 
        title="Super Admin Calendar" 
        subtitle="All appointments & demos" 
      />
    </div>
  );
}