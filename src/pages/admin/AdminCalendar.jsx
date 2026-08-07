
import React from 'react';
import CalendarBoard from '../../components/calendar/CalendarBoard';

export default function AdminCalendar() {
  return (
    <div className="p-4">
      <CalendarBoard 
        title="Admin Calendar" 
        subtitle="Your hospital's appointments" 
      />
    </div>
  );
}