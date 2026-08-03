import CalendarBoard from '../../components/CalendarBoard';

// Rendered inside AdminLayout's <Outlet />, which already provides the page chrome.
export default function AdminCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your hospital’s appointments laid out by day — click any entry for the full details.
        </p>
      </div>

      <CalendarBoard
        title="Hospital Calendar"
        subtitle="Appointments booked at your hospital"
      />
    </div>
  );
}
