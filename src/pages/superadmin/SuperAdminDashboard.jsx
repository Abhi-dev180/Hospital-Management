import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  Search, RefreshCw, Edit3, Trash2, Plus, Bell, ShieldCheck,
  AlertCircle, CalendarDays, CalendarClock, CheckCircle2, ClipboardList,
  ArrowRight, ChevronLeft, ChevronRight, UserPlus, Radio, Hourglass, MessageSquare,
  TestTube, Droplet, Stethoscope, Filter, Activity, PawPrint,
  RotateCcw, Receipt, CreditCard, BadgePercent
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import Loader, { StatSkeleton, TableSkeleton } from '../../components/Loader';
import { useWebSocket } from '../../hooks/useWebSocket';

// How often the live counters refresh (ms). The API rate limiter allows 120 req/min.
const LIVE_REFRESH_MS = 15000;

// Counts animate from their previous value so a change is visible, not just different.
function AnimatedCount({ value = 0 }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const from = display;
    const to = Number(value) || 0;
    if (from === to) return;

    const steps = 18;
    const stepMs = 900 / steps;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      // ease-out so it decelerates into the final number
      const progress = 1 - Math.pow(1 - i / steps, 3);
      setDisplay(i >= steps ? to : Math.round(from + (to - from) * progress));
      if (i >= steps) clearInterval(id);
    }, stepMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

// Dummy Data for Graphs
const systemGrowthData = [
  { name: 'Jan', patients: 4000, hospitals: 2, admins: 2 },
  { name: 'Feb', patients: 4500, hospitals: 3, admins: 3 },
  { name: 'Mar', patients: 5200, hospitals: 4, admins: 4 },
  { name: 'Apr', patients: 6100, hospitals: 5, admins: 5 },
  { name: 'May', patients: 7500, hospitals: 8, admins: 8 },
  { name: 'Jun', patients: 8900, hospitals: 10, admins: 10 },
  { name: 'Jul', patients: 11000, hospitals: 12, admins: 14 },
];

const resourceData = [
  { name: 'Hospitals', value: 12 },
  { name: 'Admins', value: 14 },
  { name: 'Doctors', value: 145 },
  { name: 'Staff', value: 530 },
];

const systemLogs = [
  { time: '10 mins ago', event: 'SuperAdmin updated system-wide HL7 endpoints', status: 'Success' },
  { time: '30 mins ago', event: 'New Admin "Dr. Rajesh Sharma" onboarded to Mohali West', status: 'Success' },
  { time: '2 hours ago', event: 'Automated Database Backup completed successfully', status: 'Success' },
  { time: '5 hours ago', event: 'Security Audit: All 12 Hospital Nodes HIPAA Compliant', status: 'Verified' },
];

const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'];
const appointmentStatusOptions = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

export default function SuperAdminDashboard() {
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState('all'); // 'all' | 'test' | 'consult'
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', hospital: '' });
  const [demoCounts, setDemoCounts] = useState({ total: 0, requested: 0, scheduled: 0, completed: 0, cancelled: 0 });
  const [growthTimeframe, setGrowthTimeframe] = useState('monthly'); // 'monthly' | 'weekly'

  // Pagination States
  const [adminPage, setAdminPage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [refundPage, setRefundPage] = useState(1);
  const [refundSearch, setRefundSearch] = useState('');
  const itemsPerPage = 5;

  // ─── Live counters (polled) ───────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const navigate = useNavigate();

  const fetchStats = async ({ silent = false } = {}) => {
    if (!silent) setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
      setLastSynced(new Date());
    } catch {
      // Polling is best-effort — a transient failure keeps the last known counts.
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDemoStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/demos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.counts) setDemoCounts(data.counts);
    } catch (err) {}
  };

  const handleRealTimeEvent = () => {
    fetchStats({ silent: true });
    fetchDemoStats();
    loadAppointments(); // Optional: keeps appointments table fresh too
  };

  // Real-time WebSocket triggers for instant dashboard updates
  useWebSocket('demo_created', handleRealTimeEvent);
  useWebSocket('demo_updated', handleRealTimeEvent);
  useWebSocket('demo_deleted', handleRealTimeEvent);
  useWebSocket('registration_created', handleRealTimeEvent);
  useWebSocket('registration_updated', handleRealTimeEvent);
  useWebSocket('registration_deleted', handleRealTimeEvent);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(data);
        setFilteredAdmins(data);
      } else {
        toast.error(data.message || 'Failed to load admins');
      }
    } catch (err) {
      toast.error('Unable to load admins.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      if (res.ok) {
        setHospitals(data);
      }
    } catch (err) {
      toast.error('Unable to load hospitals.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', hospital: '' });
    setEditingAdmin(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setAdminPage(1); // Reset page on search filter change
    const query = value.toLowerCase();
    setFilteredAdmins(admins.filter((admin) =>
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.hospital || '').toLowerCase().includes(query)
    ));
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(parsedUser);
        fetchAdmins();
        fetchHospitals();
        loadAppointments();
        fetchDemoStats();
        fetchStats();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Poll the live counters, and refresh immediately when the tab regains focus
  // so a superadmin returning to the dashboard never reads a stale number.
  useEffect(() => {
    if (!user) return;

    const id = setInterval(() => fetchStats({ silent: true }), LIVE_REFRESH_MS);
    const onFocus = () => fetchStats({ silent: true });
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      }
    } catch (err) {
      toast.error('Unable to load appointments.');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const changeAppointmentStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Unable to update appointment');
      }
      const updated = appointments.map((appointment) => appointment.id === id ? data.appointment || data : appointment);
      setAppointments(updated);
      toast.success('Appointment status updated');
    } catch (err) {
      toast.error('Unable to update appointment status.');
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/admins/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message || 'Unable to delete admin');
      }

      const updatedAdmins = admins.filter(a => a.id !== id);
      setAdmins(updatedAdmins);
      setFilteredAdmins(updatedAdmins.filter((admin) =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Admin deleted successfully');
    } catch (err) {
      toast.error('Unable to delete admin. Please try again.');
    }
  };

  const handleDelete = (admin) => {
    toast((t) => (
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200 max-w-sm mx-auto text-sm">
        <p className="text-gray-900 mb-4">Are you sure you want to delete <span className="font-bold">{admin.name}</span>?</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 font-bold transition"
            onClick={() => {
              handleDeleteConfirm(admin.id);
              toast.dismiss(t.id);
            }}
          >
            Yes, delete
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-4 py-2 font-bold transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, hospital: admin.hospital || '' });
    setShowAddForm(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.email) return toast.error('Please fill required fields');

    try {
      const token = localStorage.getItem('token');
      let res;
      let data;

      if (editingAdmin) {
        res = await fetch(`${API_URL}/api/auth/admins/${editingAdmin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            hospital: formData.hospital
          })
        });
        data = await res.json();

        if (!res.ok) {
          return toast.error(data.message || 'Unable to update admin');
        }

        const updatedAdmins = admins.map(a => a.id === editingAdmin.id ? data : a);
        setAdmins(updatedAdmins);
        setFilteredAdmins(updatedAdmins.filter((admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
        ));
        toast.success('Admin updated successfully');
      } else {
        res = await fetch(`${API_URL}/api/auth/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            hospital: formData.hospital
          })
        });
        data = await res.json();

        if (!res.ok) {
          return toast.error(data.message || 'Unable to add admin');
        }

        const updatedAdmins = [...admins, data];
        setAdmins(updatedAdmins);
        setFilteredAdmins(updatedAdmins.filter((admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
        ));
        toast.success('New Admin added successfully');
      }

      resetForm();
      setShowAddForm(false);
    } catch (err) {
      toast.error(editingAdmin ? 'Unable to update admin.' : 'Unable to add admin.');
    }
  };

  const broadcastAlert = () => {
    toast.success("Broadcast alert sent to all active hospital administrators!");
  };

  // Pagination Slicing calculations
  const totalAdminPages = Math.ceil(filteredAdmins.length / itemsPerPage) || 1;
  const paginatedAdmins = filteredAdmins.slice((adminPage - 1) * itemsPerPage, adminPage * itemsPerPage);

  const labTestCount = appointments.filter((a) => a.appointmentType === 'Lab Test' || Boolean(a.serviceName)).length;
  const consultCount = Math.max(0, appointments.length - labTestCount);

  const filteredAppointments = appointments.filter((appt) => {
    const isLab = appt.appointmentType === 'Lab Test' || Boolean(appt.serviceName);
    const matchType =
      appointmentTypeFilter === 'all' ||
      (appointmentTypeFilter === 'test' && isLab) ||
      (appointmentTypeFilter === 'consult' && !isLab);

    if (!matchType) return false;

    if (!appointmentSearch.trim()) return true;
    const q = appointmentSearch.toLowerCase().trim();
    return (
      (appt.patientName || '').toLowerCase().includes(q) ||
      (appt.petName || '').toLowerCase().includes(q) ||
      (appt.serviceName || '').toLowerCase().includes(q) ||
      (appt.serviceCategory || '').toLowerCase().includes(q) ||
      (appt.doctorName || '').toLowerCase().includes(q) ||
      (appt.hospital || '').toLowerCase().includes(q) ||
      (appt.hospitalId ? String(appt.hospitalId).toLowerCase().includes(q) : false) ||
      (appt.appointment_number ? String(appt.appointment_number).includes(q) : false)
    );
  });

  const totalAppointmentPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = filteredAppointments.slice((appointmentPage - 1) * itemsPerPage, appointmentPage * itemsPerPage);

  // System-wide Refunds calculations
  const allRefunds = appointments.filter((a) =>
    a && (a.status === 'Cancelled' || (a.refundAmount && a.refundAmount > 0) || a.refundStatus === 'Refunded')
  );
  const totalSystemRefundAmount = allRefunds.reduce((sum, a) => sum + (Number(a.refundAmount) || 0), 0);
  const totalSystemRetainedFees = allRefunds.reduce((sum, a) => sum + (Number(a.cancellationFee) || 0), 0);

  const filteredRefunds = allRefunds.filter((appt) => {
    if (!refundSearch.trim()) return true;
    const q = refundSearch.toLowerCase().trim();
    return (
      (appt.patientName || '').toLowerCase().includes(q) ||
      (appt.patientPhone || '').toLowerCase().includes(q) ||
      (appt.email || '').toLowerCase().includes(q) ||
      (appt.hospital || '').toLowerCase().includes(q) ||
      (appt.serviceName || '').toLowerCase().includes(q) ||
      (appt.doctorName || '').toLowerCase().includes(q) ||
      (appt.refundId || '').toLowerCase().includes(q) ||
      (appt.refundStatus || '').toLowerCase().includes(q) ||
      (appt.cancellationReason || '').toLowerCase().includes(q) ||
      (appt.paymentMethod || '').toLowerCase().includes(q) ||
      (appt.appointment_number ? String(appt.appointment_number).includes(q) : false)
    );
  });

  const totalRefundPages = Math.ceil(filteredRefunds.length / itemsPerPage) || 1;
  const paginatedRefunds = filteredRefunds.slice((refundPage - 1) * itemsPerPage, refundPage * itemsPerPage);

  return (
    <DashboardLayout
      title="Super Admin Master Control Center"
      subtitle="System-wide management, global hospital statistics, and admin access control."
      user={user}
    >
      {/* SuperAdmin Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/30">
            <ShieldCheck size={14} /> Master Privileges Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Global Hospital System Overview</h1>
          <p className="text-gray-300 text-sm mt-1">Manage global admins, monitor database uptime, and issue system alerts.</p>
        </div>
        <button
          onClick={broadcastAlert}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md transition"
        >
          <Bell size={16} /> Broadcast System Notice
        </button>
      </div>

      {/* ─── Live counters ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="inline-flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="text-lg font-bold text-gray-900">Live Counters</h2>
          <span className="text-xs text-gray-400 font-medium">
            {lastSynced ? `Synced ${lastSynced.toLocaleTimeString()}` : 'Syncing…'} · auto-refreshes every {LIVE_REFRESH_MS / 1000}s
          </span>
        </div>
        <button
          type="button"
          onClick={() => fetchStats()}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold transition text-sm"
        >
          <Radio size={15} /> Refresh now
        </button>
      </div>

      {statsLoading && !stats ? (
        <StatSkeleton count={5} className="mb-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              title: 'Total Registrations',
              value: stats?.registrations?.total ?? 0,
              trend: `${stats?.registrations?.pending ?? 0} pending · ${stats?.registrations?.today ?? 0} today`,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              icon: UserPlus,
              to: '/superadmin/registrations'
            },
            {
              title: 'Total Bookings',
              value: stats?.bookings?.total ?? appointments.length,
              trend: `${stats?.bookings?.pending ?? 0} pending · ${stats?.bookings?.today ?? 0} today`,
              color: 'text-medical-blue',
              bg: 'bg-blue-50',
              icon: ClipboardList,
              to: '/superadmin/appointments'
            },
            {
              title: 'Active Admins',
              value: stats?.network?.admins ?? admins.length,
              trend: `${stats?.network?.hospitals ?? hospitals.length} hospitals on the network`,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              icon: ShieldCheck,
              to: '/superadmin/manage-admin'
            },
            {
              title: 'Refunds & Settlements',
              value: stats?.refunds?.totalCount ?? allRefunds.length,
              trend: `₹${(stats?.refunds?.totalAmount ?? totalSystemRefundAmount).toLocaleString()} net refunded`,
              color: 'text-teal-600',
              bg: 'bg-teal-50',
              icon: RotateCcw,
              to: '/superadmin/appointments?tab=refunds'
            },
            {
              title: 'New Enquiries',
              value: stats?.contacts?.new ?? 0,
              trend: `${stats?.contacts?.total ?? 0} contact messages in total`,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              icon: MessageSquare,
              to: '/superadmin/contacts'
            }
          ].map((kpi) => {
            const IconComp = kpi.icon;
            return (
              <Link
                key={kpi.title}
                to={kpi.to}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 truncate">{kpi.title}</h3>
                  <p className={`text-2xl font-extrabold ${kpi.color}`}>
                    <AnimatedCount value={kpi.value} />
                  </p>
                  <span className="text-[11px] font-bold text-gray-400 mt-1 block truncate">{kpi.trend}</span>
                </div>
                <div className={`p-3 rounded-2xl border border-gray-100 shrink-0 ${kpi.bg} ${kpi.color}`}>
                  <IconComp size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Booking / registration status breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-medical-blue" size={19} />
                <h3 className="font-bold text-gray-900">Bookings by status</h3>
              </div>
              <Link to="/superadmin/appointments" className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pending', value: stats.bookings.pending, cls: 'bg-amber-50 text-amber-700', icon: Hourglass },
                { label: 'Confirmed', value: stats.bookings.confirmed, cls: 'bg-blue-50 text-blue-700', icon: CalendarClock },
                { label: 'Completed', value: stats.bookings.completed, cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
                { label: 'Cancelled', value: stats.bookings.cancelled, cls: 'bg-red-50 text-red-700', icon: AlertCircle }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl p-4 ${s.cls}`}>
                    <Icon size={17} className="mb-2" />
                    <p className="text-2xl font-extrabold leading-none"><AnimatedCount value={s.value} /></p>
                    <p className="text-[11px] font-bold uppercase tracking-wide mt-1.5 opacity-80">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Doctor Consultations</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {stats.bookings?.consultations?.pending ?? 0} pending review
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-blue-700 block leading-tight">
                    <AnimatedCount value={stats.bookings?.consultations?.total ?? consultCount} />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-blue-500">Bookings</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <TestTube size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Lab &amp; Diagnostic Tests</span>
                    <span className="text-[11px] text-rose-600 font-medium">
                      {stats.bookings?.labTests?.pending ?? 0} sample collection pending
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-rose-700 block leading-tight">
                    <AnimatedCount value={stats.bookings?.labTests?.total ?? labTestCount} />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-rose-500">Tests</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">
              {stats.bookings.thisMonth} booking{stats.bookings.thisMonth === 1 ? '' : 's'} this month
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus className="text-indigo-600" size={19} />
                <h3 className="font-bold text-gray-900">Registrations by status</h3>
              </div>
              <Link to="/superadmin/registrations" className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pending', value: stats.registrations.pending, cls: 'bg-amber-50 text-amber-700', icon: Hourglass },
                { label: 'Approved', value: stats.registrations.approved, cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
                { label: 'Denied', value: stats.registrations.denied, cls: 'bg-red-50 text-red-700', icon: AlertCircle },
                { label: 'Demos', value: stats.demos.total, cls: 'bg-indigo-50 text-indigo-700', icon: CalendarDays }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl p-4 ${s.cls}`}>
                    <Icon size={17} className="mb-2" />
                    <p className="text-2xl font-extrabold leading-none"><AnimatedCount value={s.value} /></p>
                    <p className="text-[11px] font-bold uppercase tracking-wide mt-1.5 opacity-80">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4 font-medium">
              {stats.registrations.thisMonth} registration{stats.registrations.thisMonth === 1 ? '' : 's'} this month
            </p>
          </div>
        </div>
      )}

      {/* ─── 📊 REAL-TIME ANALYTICS DASHBOARD ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 1. HOSPITAL STATUS DONUT CHART */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900">Hospital Status</h3>
            <p className="text-xs text-slate-400 font-medium">Enabled vs Disabled hospitals</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 min-h-[220px]">
            {/* Donut Chart with Overlayed Center Text */}
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Enabled', value: stats?.hospitalStatusChart?.enabled ?? (hospitals.length || 20), fill: '#0ea5e9' },
                      { name: 'Disabled', value: stats?.hospitalStatusChart?.disabled ?? 3, fill: '#f97316' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#f97316" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {stats?.hospitalStatusChart?.total ?? (hospitals.length || 23)}
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">TOTAL</span>
              </div>
            </div>

            {/* Side Legends */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md bg-sky-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Enabled</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500">
                    {stats?.hospitalStatusChart?.enabled ?? 20}
                  </span>
                  <span className="text-xs font-black text-sky-600 w-10 text-right">
                    {stats?.hospitalStatusChart?.enabledPct ?? 87}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md bg-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Disabled</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500">
                    {stats?.hospitalStatusChart?.disabled ?? 3}
                  </span>
                  <span className="text-xs font-black text-orange-600 w-10 text-right">
                    {stats?.hospitalStatusChart?.disabledPct ?? 13}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DEMO REQUEST BREAKDOWN BAR CHART */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900">Demo Request Breakdown</h3>
            <p className="text-xs text-slate-400 font-medium">Status distribution of all demo requests</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.demoBreakdownChart || [
                  { status: 'New', count: stats?.demos?.requested || 2 },
                  { status: 'Contacted', count: stats?.demos?.scheduled || 2 },
                  { status: 'Completed', count: stats?.demos?.completed || 15 },
                  { status: 'Registered', count: stats?.registrations?.approved || 6 }
                ]}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                barSize={36}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  formatter={(value) => [`${value} Demo Requests`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                  {(stats?.demoBreakdownChart || []).map((entry, index) => {
                    const colors = ['#f97316', '#a855f7', '#22c55e', '#3b82f6'];
                    return <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. REGISTRATION STATUS DONUT CHART */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900">Registration Status</h3>
            <p className="text-xs text-slate-400 font-medium">Approved, pending &amp; rejected users</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 min-h-[220px]">
            {/* Donut Chart with Overlayed Center Text */}
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: stats?.registrationStatusChart?.approved ?? (stats?.registrations?.approved || 17), fill: '#0ea5e9' },
                      { name: 'Pending', value: stats?.registrationStatusChart?.pending ?? (stats?.registrations?.pending || 6), fill: '#f97316' },
                      { name: 'Rejected', value: stats?.registrationStatusChart?.rejected ?? (stats?.registrations?.denied || 1), fill: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#f97316" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {stats?.registrationStatusChart?.total ?? (stats?.registrations?.total || 24)}
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">TOTAL</span>
              </div>
            </div>

            {/* Side Legends */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-sky-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Approved</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">{stats?.registrationStatusChart?.approved ?? 17}</span>
                  <span className="text-xs font-black text-sky-600 w-10 text-right">{stats?.registrationStatusChart?.approvedPct ?? 71}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-orange-50/50 border border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Pending</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">{stats?.registrationStatusChart?.pending ?? 6}</span>
                  <span className="text-xs font-black text-orange-600 w-10 text-right">{stats?.registrationStatusChart?.pendingPct ?? 25}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Rejected</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">{stats?.registrationStatusChart?.rejected ?? 1}</span>
                  <span className="text-xs font-black text-rose-600 w-10 text-right">{stats?.registrationStatusChart?.rejectedPct ?? 4}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. GROWTH COMPARISON CURVED SPLINE CHART */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Growth Comparison</h3>
              <p className="text-xs text-slate-400 font-medium">New Users vs Hospitals vs Demo Requests</p>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setGrowthTimeframe('monthly')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  growthTimeframe === 'monthly' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 3 Months
              </button>
              <button
                type="button"
                onClick={() => setGrowthTimeframe('weekly')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  growthTimeframe === 'weekly' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 3 Weeks
              </button>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  growthTimeframe === 'monthly'
                    ? (stats?.growthChart?.monthly || [
                        { name: 'May 26', users: 1, hospitals: 1, demos: 1 },
                        { name: 'Jun 26', users: 3, hospitals: 4, demos: 2 },
                        { name: 'Jul 26', users: 4, hospitals: 4, demos: 3 },
                        { name: 'Aug 26', users: stats?.network?.users || 26, hospitals: stats?.network?.hospitals || 15, demos: stats?.demos?.total || 25 }
                      ])
                    : (stats?.growthChart?.weekly || [
                        { name: 'W1', users: 4, hospitals: 2, demos: 5 },
                        { name: 'W2', users: 10, hospitals: 6, demos: 11 },
                        { name: 'W3', users: 19, hospitals: 10, demos: 20 },
                        { name: 'W4', users: stats?.network?.users || 26, hospitals: stats?.network?.hospitals || 15, demos: stats?.demos?.total || 25 }
                      ])
                }
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} name="Users" />
                <Line type="monotone" dataKey="hospitals" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} name="Hospitals" />
                <Line type="monotone" dataKey="demos" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} name="Demos" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Users</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Hospitals</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Demos</span>
          </div>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Hospital Admins</h2>
            <p className="text-sm text-gray-500">Onboard new hospital administrators and modify privileges.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search admins..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue outline-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={fetchAdmins}
              disabled={loadingAdmins}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm disabled:opacity-60"
            >
              {loadingAdmins ? <Loader size="sm" /> : <RefreshCw size={16} />} Refresh
            </button>
            <button 
              onClick={() => {
                if (showAddForm) resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-medical-blue text-white font-bold py-2 px-5 rounded-full transition-colors shadow-xs text-sm"
            >
              <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Admin'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-sm">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue bg-white" placeholder="Dr. Jane Doe" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue bg-white" placeholder="jane@hospital.com" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Assigned Hospital</label>
              <input type="text" name="hospital" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue bg-white" placeholder="Medpark West Branch" />
            </div>
            <div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
                {editingAdmin ? 'Update Admin' : 'Save New Admin'}
              </button>
            </div>
          </form>
        )}

        {loadingAdmins ? <TableSkeleton rows={5} cols={4} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-medical-blue/10 text-medical-dark text-sm">
                <th className="py-3.5 px-4 font-semibold rounded-tl-lg">Admin Name</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Hospital</th>
                <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                  <td className="py-4 px-4 font-bold text-gray-900">{admin.name}</td>
                  <td className="py-4 px-4 text-gray-600">{admin.email}</td>
                  <td className="py-4 px-4 text-gray-600">{admin.hospital || 'Unassigned'}</td>
                  <td className="py-4 px-4 text-right flex justify-end gap-3">
                    <button onClick={() => handleEdit(admin)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition">
                      <Edit3 size={15} /> Edit
                    </button>
                    <button onClick={() => handleDelete(admin)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition">
                      <Trash2 size={15} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedAdmins.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 italic">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Admins Pagination Controls */}
        {!loadingAdmins && filteredAdmins.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-700">{(adminPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(adminPage * itemsPerPage, filteredAdmins.length)}</span> of <span className="font-bold text-gray-700">{filteredAdmins.length}</span> admins
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={adminPage === 1}
                onClick={() => setAdminPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 font-bold text-gray-700">Page {adminPage} of {totalAdminPages}</span>
              <button
                disabled={adminPage === totalAdminPages}
                onClick={() => setAdminPage(p => Math.min(p + 1, totalAdminPages))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* All Appointments Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <span>System Appointments Stream</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Global System Appointments</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Showing <span className="font-bold text-blue-600">{filteredAppointments.length}</span> of {appointments.length} total bookings across all hospitals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            {/* Quick Type Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setAppointmentTypeFilter('all'); setAppointmentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appointmentTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => { setAppointmentTypeFilter('test'); setAppointmentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appointmentTypeFilter === 'test'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <TestTube size={13} />
                Lab Tests ({labTestCount})
              </button>
              <button
                type="button"
                onClick={() => { setAppointmentTypeFilter('consult'); setAppointmentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appointmentTypeFilter === 'consult'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Stethoscope size={13} />
                Consults ({consultCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={appointmentSearch}
                onChange={(e) => { setAppointmentSearch(e.target.value); setAppointmentPage(1); }}
                placeholder="Search patient, pet, test..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue outline-none text-xs sm:text-sm bg-white"
              />
            </div>

            <button
              type="button"
              onClick={loadAppointments}
              disabled={loadingAppointments}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm disabled:opacity-60 shrink-0"
            >
              {loadingAppointments ? <Loader size="sm" /> : <RefreshCw size={16} />} Refresh
            </button>
          </div>
        </div>

        {loadingAppointments ? <TableSkeleton rows={5} cols={7} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[900px]">
            <thead>
              <tr className="bg-medical-blue/10 text-medical-dark">
                <th className="py-3.5 px-4 font-semibold rounded-tl-lg">App # &amp; Type</th>
                <th className="py-3.5 px-4 font-semibold">Patient &amp; Pet</th>
                <th className="py-3.5 px-4 font-semibold">Service / Doctor</th>
                <th className="py-3.5 px-4 font-semibold">Hospital</th>
                <th className="py-3.5 px-4 font-semibold">Schedule</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((appointment) => {
                const isLabTest = appointment.appointmentType === 'Lab Test' || Boolean(appointment.serviceName);
                return (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* App # and Type badge */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-gray-900 text-xs tracking-wider">
                          #{appointment.appointment_number || appointment.id?.slice(-4)}
                        </span>
                        {isLabTest ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">
                            <TestTube size={11} className="text-rose-600" />
                            Lab Test
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">
                            <Stethoscope size={11} className="text-blue-600" />
                            Consult
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient & Pet */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{appointment.patientName}</span>
                        {appointment.petName ? (
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <PawPrint size={11} className="text-slate-400" />
                            {appointment.petName} {appointment.species ? `(${appointment.species})` : ''}
                          </span>
                        ) : (
                          appointment.patientPhone && (
                            <span className="text-xs text-gray-400 mt-0.5">{appointment.patientPhone}</span>
                          )
                        )}
                      </div>
                    </td>

                    {/* Service / Doctor */}
                    <td className="py-4 px-4">
                      {isLabTest ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs">
                            {appointment.serviceName || appointment.reason || 'Diagnostic Lab Test'}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {appointment.serviceCategory && (
                              <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded">
                                {appointment.serviceCategory}
                              </span>
                            )}
                            {appointment.sampleType && (
                              <span className="text-[10px] text-slate-500">
                                Sample: <strong>{appointment.sampleType}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">
                            {appointment.doctorName || 'Assigned Doctor'}
                          </span>
                          {appointment.reason && (
                            <span className="text-xs text-slate-400 truncate max-w-[160px] mt-0.5">
                              {appointment.reason}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Hospital */}
                    <td className="py-4 px-4 text-gray-600 text-xs font-medium">
                      {appointment.hospital || appointment.hospitalId || '—'}
                    </td>

                    {/* Schedule */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{appointment.date}</span>
                        <span className="text-xs text-blue-600 font-semibold">{appointment.time}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        appointment.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>

                    {/* Status Update */}
                    <td className="py-4 px-4 text-right">
                      <select
                        value={appointment.status}
                        onChange={(e) => changeAppointmentStatus(appointment.id, e.target.value)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-full bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue"
                      >
                        {appointmentStatusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {paginatedAppointments.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500 italic">
                    {appointmentSearch || appointmentTypeFilter !== 'all'
                      ? 'No appointments matched your search/filter criteria.'
                      : 'No appointments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Appointments Pagination Controls */}
        {!loadingAppointments && filteredAppointments.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-700">{(appointmentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(appointmentPage * itemsPerPage, filteredAppointments.length)}</span> of <span className="font-bold text-gray-700">{filteredAppointments.length}</span> appointments
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={appointmentPage === 1}
                onClick={() => setAppointmentPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 font-bold text-gray-700">Page {appointmentPage} of {totalAppointmentPages}</span>
              <button
                disabled={appointmentPage === totalAppointmentPages}
                onClick={() => setAppointmentPage(p => Math.min(p + 1, totalAppointmentPages))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Global Refunds & Payment Settlements Audit Center ──── */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mt-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200/60">
              <RotateCcw size={13} />
              <span>Financial Settlements Audit</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">System Refunds &amp; Payment Settlements</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Live audit records of all Stripe and Razorpay refunds with 10% cancellation fee retention across all hospitals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={refundSearch}
                onChange={(e) => { setRefundSearch(e.target.value); setRefundPage(1); }}
                placeholder="Search refund ID, patient, reason..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue outline-none text-xs sm:text-sm bg-white"
              />
            </div>

            <button
              type="button"
              onClick={loadAppointments}
              disabled={loadingAppointments}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm disabled:opacity-60 shrink-0"
            >
              {loadingAppointments ? <Loader size="sm" /> : <RefreshCw size={16} />} Refresh
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Total Net Refunded</span>
              <p className="text-2xl font-extrabold text-emerald-950 mt-1">₹{totalSystemRefundAmount.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-700/80 font-medium">Returned to patient payment methods</span>
            </div>
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <RotateCcw size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Retained Platform Fees (10%)</span>
              <p className="text-2xl font-extrabold text-amber-950 mt-1">₹{totalSystemRetainedFees.toLocaleString()}</p>
              <span className="text-[11px] text-amber-700/80 font-medium">Standard cancellation platform revenue</span>
            </div>
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-sm">
              <BadgePercent size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Refund Audit Records</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{allRefunds.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Processed cancellations to date</span>
            </div>
            <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-sm">
              <Receipt size={20} />
            </div>
          </div>
        </div>

        {loadingAppointments ? (
          <TableSkeleton rows={4} cols={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[950px]">
              <thead>
                <tr className="bg-emerald-50/80 text-emerald-950">
                  <th className="py-3.5 px-4 font-semibold rounded-tl-lg">App # &amp; Ref ID</th>
                  <th className="py-3.5 px-4 font-semibold">Patient &amp; Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Service / Consultation</th>
                  <th className="py-3.5 px-4 font-semibold">Hospital</th>
                  <th className="py-3.5 px-4 font-semibold">Itemized Financial Breakdown</th>
                  <th className="py-3.5 px-4 font-semibold">Cancellation Reason</th>
                  <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Settlement Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRefunds.map((appt) => {
                  const isLabTest = appt.appointmentType === 'Lab Test' || Boolean(appt.serviceName);
                  const paidAmt = Number(appt.paymentAmount || appt.servicePrice || 0);
                  const feeAmt = Number(appt.cancellationFee || (paidAmt * 0.10) || 0);
                  const netRefund = Number(appt.refundAmount || (paidAmt - feeAmt) || 0);
                  const isRazorpay = String(appt.paymentMethod || '').toLowerCase().includes('razorpay') ||
                                    (appt.paymentId && String(appt.paymentId).startsWith('pay_'));

                  return (
                    <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      {/* App # & Ref ID */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-gray-900 text-xs">
                              #{appt.appointment_number || appt.id?.slice(-4)}
                            </span>
                            {isLabTest ? (
                              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Lab</span>
                            ) : (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Consult</span>
                            )}
                          </div>
                          {appt.refundId ? (
                            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                              {appt.refundId}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">No Ref ID</span>
                          )}
                          <span className="text-[10px] text-gray-400 font-medium">
                            Gateway: <strong className="text-gray-600">{isRazorpay ? 'Razorpay' : 'Stripe'}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Patient & Contact */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{appt.patientName}</span>
                          {appt.email && <span className="text-xs text-gray-500 truncate max-w-[170px]">{appt.email}</span>}
                          {appt.patientPhone && <span className="text-xs text-gray-400">{appt.patientPhone}</span>}
                        </div>
                      </td>

                      {/* Service / Consultation */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs">
                            {isLabTest ? (appt.serviceName || 'Diagnostic Investigation') : (appt.doctorName ? `Dr. ${appt.doctorName}` : 'Consultation')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Booked for: {appt.date} ({appt.time})
                          </span>
                        </div>
                      </td>

                      {/* Hospital */}
                      <td className="py-4 px-4 text-gray-600 text-xs font-medium">
                        {appt.hospital || '—'}
                      </td>

                      {/* Itemized Financial Breakdown */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center justify-between gap-3 text-slate-600">
                            <span>Gross Paid:</span>
                            <strong className="text-slate-900">₹{paidAmt}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-amber-700">
                            <span>10% Fee Retained:</span>
                            <strong>-₹{feeAmt}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 text-emerald-700 font-bold">
                            <span>Net Refund:</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
                              ₹{netRefund}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cancellation Reason */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                          {appt.cancellationReason || 'Cancelled by user/admin'}
                        </p>
                        {appt.cancelledAt && (
                          <span className="text-[10px] text-gray-400 block mt-1">
                            {new Date(appt.cancelledAt).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Settlement Status */}
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          appt.refundStatus === 'Refunded' || netRefund > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.refundStatus === 'No Refund' || paidAmt === 0
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <CheckCircle2 size={13} />
                          {appt.refundStatus || (netRefund > 0 ? 'Refunded' : 'No Refund')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {paginatedRefunds.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500 italic">
                      {refundSearch
                        ? 'No refund records matched your search query.'
                        : 'No cancellation refunds processed yet in the system.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Refunds Pagination Controls */}
        {!loadingAppointments && filteredRefunds.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-700">{(refundPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(refundPage * itemsPerPage, filteredRefunds.length)}</span> of <span className="font-bold text-gray-700">{filteredRefunds.length}</span> refunds
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={refundPage === 1}
                onClick={() => setRefundPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 font-bold text-gray-700">Page {refundPage} of {totalRefundPages}</span>
              <button
                disabled={refundPage === totalRefundPages}
                onClick={() => setRefundPage(p => Math.min(p + 1, totalRefundPages))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}