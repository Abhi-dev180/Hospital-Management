import { NavLink } from 'react-router-dom';

const ROLE_TABS = {
  superadmin: [
    { name: 'Demo Bookings', to: '/superadmin/demos' },
    { name: 'Registrations', to: '/superadmin/registrations' },
    { name: 'Users', to: '/superadmin/users' },
    { name: 'Lab & Diagnostics', to: '/superadmin/services' },
    { name: 'Manage Admin', to: '/superadmin/manage-admin' },
    { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals' },
    { name: 'Appointments', to: '/superadmin/appointments' },
    { name: 'Calendar', to: '/superadmin/calendar' },
    { name: 'Contacts', to: '/superadmin/contacts' }
  ],
  admin: [
    { name: 'Appointments', to: '/admin/appointments' },
    { name: 'Calendar', to: '/admin/calendar' }
  ],
  user: [
    { name: 'Overview', to: '/dashboard' },
    { name: 'Lab & Diagnostics', to: '/dashboard/services' },
    { name: 'Explore Hospitals', to: '/dashboard/explore-hospitals' },
    { name: 'Book Appointment', to: '/dashboard/book-appointment' },
    { name: 'My Appointments', to: '/dashboard/my-appointments' },
    { name: 'Feedback & Reviews', to: '/dashboard/feedbacks' }
  ]
};

export default function DashboardTabs({ role }) {
  const tabs = ROLE_TABS[role] || [];

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.to}
          className={({ isActive }) =>
            `inline-flex items-center px-5 py-2 rounded-full border ${isActive ? 'bg-medical-blue text-white border-medical-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-medical-blue hover:text-medical-blue'} font-semibold transition`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  );
}
