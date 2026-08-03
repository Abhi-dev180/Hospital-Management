import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import CalendarBoard from '../../components/CalendarBoard';

export default function SuperAdminCalendar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return navigate('/login');
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'superadmin') return navigate('/');
      setUser(parsed);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <DashboardLayout
      title="Calendar"
      subtitle="Every patient appointment and demo meeting across the network, in one view."
      user={user}
    >
      <DashboardTabs role="superadmin" />
      <CalendarBoard
        title="Network Calendar"
        subtitle="Appointments from all hospitals plus scheduled demo meetings"
      />
    </DashboardLayout>
  );
}
