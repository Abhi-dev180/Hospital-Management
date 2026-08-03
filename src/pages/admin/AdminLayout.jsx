
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API_URL from '../../config/api';

export default function AdminLayout() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const hospitalName = user?.hospital || user?.name || 'Your Hospital';
  const [hospital, setHospital] = useState(null);

  const isOverview = location.pathname === '/admin' || location.pathname === '/admin/';

  useEffect(() => {
    if (user?.hospitalId) {
      fetch(`${API_URL}/api/hospitals/${user.hospitalId}`)
        .then((res) => res.json())
        .then((data) => setHospital(data))
        .catch(() => { /* non-blocking */ });
    }
  }, [user?.hospitalId]);
  const title = '';
  const subtitle = '';

  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      user={user}
      showHeader={false}
    >
      {/* Redesigned Hospital Banner matching your requested text order and layout */}
      {user?.role === 'admin' && (
        <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_35px_-10px_rgba(15,23,42,0.35)] border border-white/10 backdrop-blur-md">
          {hospital?.imageUrl ? (
            <img
              src={hospital.imageUrl}
              alt={hospitalName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shrink-0 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
              <Building2 className="w-7 h-7 text-blue-200" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full mb-2 border border-blue-400/30">
              Hospital
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome, {hospitalName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">
              Manage appointments, timings, calls, transcriptions, and patient feedback.
            </p>
          </div>
        </div>
      )}

      <Outlet />
    </DashboardLayout>
  );
}