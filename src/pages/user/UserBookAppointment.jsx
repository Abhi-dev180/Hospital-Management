import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import BookAppointmentShared from '../../components/portal/BookAppointmentShared';

export default function UserBookAppointment() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const presetHospitalId = location.state?.preselectedHospitalId || searchParams.get('hospitalId') || '';
  const initialTab = searchParams.get('tab') === 'manage' ? 'manage' : 'book';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <DashboardLayout
      title="Book an Appointment"
      subtitle="Schedule your doctor consultation with real-time slot booking and instant confirmation."
      user={user}
    >
      <DashboardTabs role="user" />

      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
        <BookAppointmentShared initialTab={initialTab} presetHospitalId={presetHospitalId} />
      </div>
    </DashboardLayout>
  );
}