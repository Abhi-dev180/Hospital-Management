import { Link, useLocation } from 'react-router-dom';

const ROLE_TABS = {
  superadmin: [
    { name: 'Demo Bookings', to: '/superadmin/demos' },
    { name: 'Registrations', to: '/superadmin/registrations' },
    { name: 'Users', to: '/superadmin/users' },
    { name: 'Lab Catalog', to: '/superadmin/services' },
    { name: 'Manage Admin', to: '/superadmin/manage-admin' },
    { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals' },
    { name: 'Appointments', to: '/superadmin/appointments' },
    { name: 'Lab Bookings', to: '/superadmin/appointments?tab=lab' },
    { name: 'Calendar', to: '/superadmin/calendar' },
    { name: 'Contacts', to: '/superadmin/contacts' }
  ],
  admin: [
    { name: 'Appointments', to: '/admin/appointments' },
    { name: 'Calendar', to: '/admin/calendar' }
  ],
  user: [
    { name: 'Overview', to: '/dashboard' },
    { name: 'Lab Catalog', to: '/dashboard/services' },
    { name: 'Book Consult', to: '/dashboard/book-appointment' },
    { name: 'Doctor Appointments', to: '/dashboard/my-appointments?tab=doctor' },
    { name: 'Lab Bookings', to: '/dashboard/my-appointments?tab=lab' },
    { name: 'Explore Hospitals', to: '/dashboard/explore-hospitals' },
    { name: 'Feedback & Reviews', to: '/dashboard/feedbacks' }
  ]
};

export default function DashboardTabs({ role }) {
  const tabs = ROLE_TABS[role] || [];
  const location = useLocation();

  const isTabActive = (to) => {
    if (to.includes('?tab=lab')) {
      return (
        (location.pathname === '/superadmin/appointments' || location.pathname === '/dashboard/my-appointments') &&
        location.search.includes('tab=lab')
      );
    }
    if (to.includes('?tab=doctor')) {
      return (
        location.pathname === '/dashboard/my-appointments' &&
        (location.search.includes('tab=doctor') || (!location.search.includes('tab=lab') && !location.search.includes('tab=all')))
      );
    }
    if (to === '/superadmin/appointments') {
      return location.pathname === '/superadmin/appointments' && !location.search.includes('tab=lab');
    }
    if (to === '/dashboard/my-appointments') {
      return location.pathname === '/dashboard/my-appointments' && !location.search.includes('tab=lab');
    }
    return location.pathname === to;
  };

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const active = isTabActive(tab.to);
        return (
          <Link
            key={tab.name}
            to={tab.to}
            className={`inline-flex items-center px-5 py-2 rounded-full border ${
              active
                ? 'bg-medical-blue text-white border-medical-blue shadow-xs font-bold'
                : 'bg-white text-gray-700 border-gray-200 hover:border-medical-blue hover:text-medical-blue font-semibold'
            } transition`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
