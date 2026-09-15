import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Calendar,
  Clock,
  Hospital,
  Phone,
  Loader2,
  X,
  CheckCircle2,
  Trash2,
  CalendarClock,
  Star,
  MessageSquare,
  TestTube,
  PawPrint,
  Droplet,
  Activity,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Stethoscope,
  ClipboardList,
  Sparkles,
  Filter,
  ArrowRight,
  User,
  PlusCircle,
  FileText,
  Banknote,
  Undo2,
  BadgePercent,
  Receipt,
  Info,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import SlotSelector from '../../components/SlotSelector';
import AppointmentFeedbackModal from '../../components/portal/AppointmentFeedbackModal';
import { ListSkeleton } from '../../components/Loader';

const PER_PAGE = 5;

const CATEGORY_COLORS = {
  'Blood Test': 'bg-rose-50 text-rose-700 border-rose-200',
  'Urine Test': 'bg-amber-50 text-amber-700 border-amber-200',
  'Diagnostic Imaging': 'bg-blue-50 text-blue-700 border-blue-200',
  'Pathology & Biopsy': 'bg-purple-50 text-purple-700 border-purple-200',
  'Preventive Health Checkup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Microbiology & Culture': 'bg-teal-50 text-teal-700 border-teal-200',
  'Cardiac & ECG': 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

export default function UserMyAppointmentsList() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // ─── Master Section Tabs ────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab'); // 'doctor' | 'lab' | 'refunds' | 'all'
  const activeTab = rawTab === 'lab' ? 'lab' : (rawTab === 'refunds' ? 'refunds' : (rawTab === 'all' ? 'all' : 'doctor'));

  const handleTabChange = (tabKey) => {
    setPage(1);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set('tab', tabKey);
        return p;
      },
      { replace: true }
    );
  };

  // ─── Modal state for reschedule ─────────────────────────────
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Modal state for feedback ───────────────────────────────
  const [selectedApptForFeedback, setSelectedApptForFeedback] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchAppointments();
    } else {
      navigate('/login');
    }

    const handlePaymentVerified = () => {
      fetchAppointments();
    };

    window.addEventListener('appointment_payment_verified', handlePaymentVerified);
    return () => {
      window.removeEventListener('appointment_payment_verified', handlePaymentVerified);
    };
  }, [navigate]);

  // ─── Handle Stripe return callback ──────────────────────────
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const payment = searchParams.get('payment');
    const appointmentId = searchParams.get('appointment_id');

    if (sessionId && payment === 'success') {
      (async () => {
        const toastId = toast.loading('Verifying payment with Stripe...');
        try {
          const res = await fetch(
            `${API_URL}/api/payments/verify-appointment-session?session_id=${sessionId}&appointment_id=${appointmentId || ''}&payment=success`
          );
          const data = await res.json();
          if (res.ok) {
            toast.success('🎉 Official Stripe Payment Verified & Confirmed!', { id: toastId });
          } else {
            toast.error(data.message || 'Payment verification complete', { id: toastId });
          }
          fetchAppointments();
          const cleanParams = new URLSearchParams(searchParams);
          cleanParams.delete('session_id');
          cleanParams.delete('payment');
          cleanParams.delete('appointment_id');
          cleanParams.delete('type');
          setSearchParams(cleanParams, { replace: true });
        } catch (e) {
          console.error('Stripe verify error:', e);
          toast.error('Could not verify Stripe payment session', { id: toastId });
        }
      })();
    } else if (payment === 'cancelled') {
      toast.error('Payment cancelled on Stripe.');
      const cleanParams = new URLSearchParams(searchParams);
      cleanParams.delete('session_id');
      cleanParams.delete('payment');
      cleanParams.delete('appointment_id');
      cleanParams.delete('type');
      setSearchParams(cleanParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.appointments) ? data.appointments : []);
        setAppointments(list);
      } else {
        toast.error('Failed to load appointments');
      }

      // Also fetch feedbacks to show status
      if (token) {
        const fbRes = await fetch(`${API_URL}/api/appointment-feedbacks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (fbRes.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          const fbList = Array.isArray(fbData) ? fbData : (Array.isArray(fbData.feedbacks) ? fbData.feedbacks : []);
          setFeedbacks(fbList);
        }
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Feedback map
  const feedbackMap = useMemo(() => {
    const map = new Map();
    const list = Array.isArray(feedbacks) ? feedbacks : [];
    list.forEach((f) => {
      if (f && f.appointmentId) map.set(String(f.appointmentId), f);
      if (f && f.appointmentNumber) map.set(String(f.appointmentNumber), f);
    });
    return map;
  }, [feedbacks]);

  // ─── Modal state for cancel & refund ────────────────────────
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedApptForCancel, setSelectedApptForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // ─── Open cancel modal ──────────────────────────────────────
  const openCancelModal = (appointment) => {
    setSelectedApptForCancel(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // ─── Confirm cancel appointment with Stripe refund ──────────
  const handleConfirmCancellation = async (e) => {
    e?.preventDefault();
    if (!selectedApptForCancel) return;

    setCancelSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${selectedApptForCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by patient' })
      });
      const data = await res.json();
      if (res.ok) {
        const refundMsg = data.appointment?.refundAmount > 0 
          ? ` Refund of ₹${data.appointment.refundAmount} initiated.`
          : '';
        toast.success(`Appointment #${data.appointment?.appointment_number || ''} cancelled.${refundMsg}`);
        setShowCancelModal(false);
        setSelectedApptForCancel(null);
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch {
      toast.error('Network error while cancelling appointment');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // ─── Open reschedule modal ──────────────────────────────────
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.date || '');
    setNewTime(appointment.time || '');
    setShowRescheduleModal(true);
  };

  // ─── Submit reschedule ──────────────────────────────────────
  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      return toast.error('Please select both date and time');
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          status: 'Rescheduled'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Appointment rescheduled successfully');
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to reschedule');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = (app, isCancel = false) => {
    const apptId = app.appointment_number || app.id;
    const token = localStorage.getItem('token');
    const url = isCancel
      ? `${API_URL}/api/appointments/${apptId}/cancellation-invoice`
      : `${API_URL}/api/appointments/${apptId}/invoice`;
    window.open(url, '_blank');
  };

  const apptsList = Array.isArray(appointments) ? appointments : [];

  // ─── Section Counts ──────────────────────────────────────────
  const doctorCount = useMemo(
    () => apptsList.filter((a) => a && a.appointmentType !== 'Lab Test' && !a.serviceName).length,
    [apptsList]
  );
  const labCount = useMemo(
    () => apptsList.filter((a) => a && (a.appointmentType === 'Lab Test' || Boolean(a.serviceName))).length,
    [apptsList]
  );
  const refundCount = useMemo(
    () => apptsList.filter((a) => a && (a.status === 'Cancelled' || Number(a.refundAmount) > 0 || Boolean(a.refundStatus) || Boolean(a.refundId))).length,
    [apptsList]
  );
  const totalCount = apptsList.length;

  // ─── Filtered by Section Tab + Search + Status ───────────────
  const filtered = useMemo(() => {
    return apptsList.filter((app) => {
      if (!app) return false;
      const isLab = app.appointmentType === 'Lab Test' || Boolean(app.serviceName);

      if (activeTab === 'doctor' && isLab) return false;
      if (activeTab === 'lab' && !isLab) return false;
      if (activeTab === 'refunds' && !(app.status === 'Cancelled' || Number(app.refundAmount) > 0 || Boolean(app.refundStatus) || Boolean(app.refundId))) return false;

      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (app.patientName || '').toLowerCase().includes(q) ||
        (app.hospital || '').toLowerCase().includes(q) ||
        (app.serviceName || '').toLowerCase().includes(q) ||
        (app.serviceCategory || '').toLowerCase().includes(q) ||
        (app.sampleType || '').toLowerCase().includes(q) ||
        (app.petName || '').toLowerCase().includes(q) ||
        (app.doctorName || '').toLowerCase().includes(q) ||
        (app.date || '').includes(q) ||
        (app.appointment_number && String(app.appointment_number).includes(q));

      return matchStatus && matchSearch;
    });

    return [...result].sort((a, b) => {
      const getTimestamp = (item) => {
        if (!item) return 0;
        if (item.createdAt) {
          const t = new Date(item.createdAt).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (item.date) {
          const t = new Date(`${item.date}T${item.time || '00:00'}`).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (item.appointment_number) {
          return Number(item.appointment_number) || 0;
        }
        return Number(item.id) || 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [apptsList, activeTab, statusFilter, search]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => setPage(1), [search, statusFilter, activeTab]);

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
      Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      Rescheduled: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return map[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <DashboardLayout
      title="My Appointments"
      subtitle="View your scheduled consultations and diagnostic lab tests."
      user={user}
      showHeader={false}
    >
      <DashboardTabs role="user" />

      <div className="bg-white p-5 sm:p-7 lg:p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100">
        
        {/* ─── Master Section Switcher Tabs ─────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTabChange('doctor')}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'doctor'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Stethoscope size={16} />
              <span>Doctor Appointments</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'doctor' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {doctorCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('lab')}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'lab'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TestTube size={16} />
              <span>Lab Test Appointments</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'lab' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {labCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('refunds')}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'refunds'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Undo2 size={16} />
              <span>Refunds &amp; Cancellations</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'refunds' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {refundCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ClipboardList size={15} />
              <span>All Bookings</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {totalCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'lab' ? (
              <Link
                to="/dashboard/services"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all duration-200"
              >
                <Sparkles size={15} /> Book Lab Test
              </Link>
            ) : (
              <Link
                to="/dashboard/book-appointment"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all duration-200"
              >
                <CalendarClock size={15} /> Book Consultation
              </Link>
            )}
          </div>
        </div>

        {/* ─── Active Section Description & Filter Controls ─────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {activeTab === 'lab' && <TestTube className="text-rose-600" size={24} />}
              {activeTab === 'doctor' && <Stethoscope className="text-blue-600" size={24} />}
              {activeTab === 'refunds' && <RotateCcw className="text-emerald-600" size={24} />}
              {activeTab === 'lab'
                ? 'Laboratory & Diagnostic Bookings'
                : activeTab === 'doctor'
                ? 'Doctor Consultations'
                : activeTab === 'refunds'
                ? 'Refunds & Payment Settlements'
                : 'All Appointments & Diagnostic Bookings'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {activeTab === 'lab'
                ? 'Showing diagnostic tests, sample collection slots, and laboratory investigations booked for your pets.'
                : activeTab === 'doctor'
                ? 'Showing outpatient consultations and clinical checkups with veterinary doctors.'
                : activeTab === 'refunds'
                ? 'Showing all cancelled appointments with Stripe / Razorpay refunds, 10% fee deductions, and settlement records.'
                : 'Combined master view of all doctor visits and laboratory diagnostic tests.'}
              {' '}
              <span className="text-blue-600 font-bold">
                ({filtered.length} of {apptsList.length} records)
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                placeholder={
                  activeTab === 'lab'
                    ? 'Search test, sample, pet...'
                    : 'Search patient, doctor, hospital...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="relative flex items-center">
              <Filter className="absolute left-3.5 text-slate-400 pointer-events-none" size={15} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>

            <button
              onClick={fetchAppointments}
              disabled={loading}
              title="Refresh bookings list"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ─── Appointments List ─────────────────────────────────── */}
        {loading ? (
          <ListSkeleton rows={4} className="py-4" />
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            {activeTab === 'lab' ? (
              <>
                <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <TestTube className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No lab test appointments found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your search query or status filter.'
                    : "You haven't booked any veterinary laboratory diagnostic tests yet."}
                </p>
                <Link
                  to="/dashboard/services"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
                >
                  <Sparkles size={14} /> Explore Lab Catalog
                </Link>
              </>
            ) : activeTab === 'doctor' ? (
              <>
                <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No doctor appointments found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your search query or status filter.'
                    : "You haven't scheduled any doctor consultations yet."}
                </p>
                <Link
                  to="/dashboard/book-appointment"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
                >
                  <CalendarClock size={14} /> Book a Consultation
                </Link>
              </>
            ) : (
              <>
                <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800">No appointments found</h3>
                <p className="text-sm text-slate-500">Book your first doctor visit or lab test from the dashboard.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map((app, idx) => {
              const isLabTest = app.appointmentType === 'Lab Test' || Boolean(app.serviceName);

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-5 rounded-3xl border transition-all ${
                    isLabTest
                      ? 'border-rose-100 bg-gradient-to-r from-white via-white to-rose-50/20 hover:border-rose-300 hover:shadow-md'
                      : 'border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2.5">
                      
                      {/* Top Badges Row */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Type Badge */}
                        {isLabTest ? (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold tracking-tight">
                            <TestTube className="w-3.5 h-3.5 text-rose-600" />
                            Lab Test: {app.serviceCategory || 'Diagnostic Testing'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold tracking-tight">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                            Doctor Consult
                          </span>
                        )}

                        {/* Order / Appointment Number */}
                        {app.appointment_number && (
                          <span className="bg-slate-100 text-slate-700 text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                            #{app.appointment_number}
                          </span>
                        )}

                        {/* Status Badge */}
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>

                        {/* Turnaround time badge for lab test */}
                        {isLabTest && app.turnaroundTime && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Results in {app.turnaroundTime}
                          </span>
                        )}
                      </div>

                      {/* Main Title: Test Name or Doctor / Reason */}
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          {isLabTest
                            ? (app.serviceName || app.reason || 'Diagnostic Lab Investigation')
                            : (app.doctorName ? `Dr. ${app.doctorName}` : (app.reason || 'Outpatient Consultation'))}
                        </h3>
                        {!isLabTest && app.reason && app.doctorName && (
                          <p className="text-xs text-slate-500 italic mt-0.5">
                            Reason: "{app.reason}"
                          </p>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-xs sm:text-sm text-slate-600 pt-1">
                        <div className="flex items-center gap-2">
                          <Hospital size={15} className={isLabTest ? "text-rose-600 shrink-0" : "text-blue-600 shrink-0"} />
                          <span className="font-bold text-slate-800 line-clamp-1">{app.hospital}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={15} className={isLabTest ? "text-rose-600 shrink-0" : "text-blue-600 shrink-0"} />
                          <span className="font-semibold">{app.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={15} className={isLabTest ? "text-rose-600 shrink-0" : "text-blue-600 shrink-0"} />
                          <span className="font-semibold">{app.time}</span>
                        </div>

                        {app.petName && (
                          <div className="flex items-center gap-2">
                            <PawPrint size={15} className={isLabTest ? "text-rose-600 shrink-0" : "text-blue-600 shrink-0"} />
                            <span>Pet: <strong className="text-slate-900">{app.petName}</strong> {app.species ? `(${app.species})` : ''}</span>
                          </div>
                        )}
                      </div>

                      {/* Diagnostic Lab Test Specifications Card */}
                      {isLabTest && (
                        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                          {app.sampleType && (
                            <div className="inline-flex items-center gap-1.5 text-slate-700">
                              <Droplet size={13} className="text-rose-500 shrink-0" />
                              <span>Sample Required: <strong className="text-slate-900">{app.sampleType}</strong></span>
                            </div>
                          )}

                          {app.fastingRequired && (
                            <div className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-semibold">
                              <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                              <span>Fasting Notice: {app.fastingDetails || 'Pet must be fasted before sample collection.'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cancellation reason banner if cancelled */}
                      {app.status === 'Cancelled' && (
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-rose-800">Booking Cancelled:</span>
                            <span className="text-rose-700 ml-1">
                              {app.cancellationReason || 'Cancelled upon customer request.'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Payment & Refund Metadata Banner */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {app.paymentStatus || 'Paid'}
                        </span>

                        <span className="font-semibold text-slate-700">
                          Amount: <strong className="text-emerald-700 font-extrabold text-sm">₹{app.paymentAmount || app.servicePrice || 500}</strong>
                        </span>

                        {/* Refund badge if cancelled with refund */}
                        {app.status === 'Cancelled' && (Number(app.refundAmount) > 0 || app.refundStatus) && (
                          <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                            <Undo2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>
                              {app.refundStatus || 'Refunded'}: ₹{Number(app.refundAmount || 0).toFixed(2)}
                              {app.cancellationFee ? ` (₹${Number(app.cancellationFee).toFixed(2)} fee)` : ''}
                            </span>
                          </span>
                        )}

                        <span className="text-slate-500 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          Method: <strong className="text-slate-800">{app.paymentMethod || 'Online Gateway'}</strong>
                        </span>

                        {app.refundId && (
                          <span className="font-mono text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200" title="Stripe / Gateway Refund Reference">
                            Ref: {app.refundId}
                          </span>
                        )}

                        {(app.paymentId || app.stripe_session_id) && !app.refundId && (
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200" title={app.paymentId || app.stripe_session_id}>
                            Txn: {app.paymentId || app.stripe_session_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ─── Action Buttons ─────────────────────────────── */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                      
                      {/* Feedback button */}
                      {feedbackMap.get(String(app.id)) || feedbackMap.get(String(app.appointment_number)) ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                          <span>{feedbackMap.get(String(app.id))?.rating || feedbackMap.get(String(app.appointment_number))?.rating || '5'}★ Reviewed</span>
                        </div>
                      ) : app.status === 'Completed' ? (
                        <button
                          onClick={() => setSelectedApptForFeedback(app)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          Give Feedback
                        </button>
                      ) : null}

                      {/* Invoice download button */}
                      {app.status === 'Cancelled' ? (
                        <button
                          onClick={() => handleDownloadInvoice(app, true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 active:scale-95 transition shadow-2xs"
                          title="Download PDF Cancellation Invoice & Credit Memo"
                        >
                          <Receipt size={13} />
                          <span>Cancel Invoice</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadInvoice(app, false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition shadow-2xs"
                          title="Download PDF Booking Invoice"
                        >
                          <Receipt size={13} />
                          <span>Invoice</span>
                        </button>
                      )}

                      {/* Reschedule / Cancel actions */}
                      {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openRescheduleModal(app)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 active:scale-95 transition shadow-xs"
                          >
                            <CalendarClock size={13} /> Reschedule
                          </button>

                          <button
                            onClick={() => openCancelModal(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 active:scale-95 transition"
                          >
                            <Trash2 size={13} /> Cancel
                          </button>
                        </div>
                      )}

                      {/* Quick link to book again */}
                      {isLabTest ? (
                        <Link
                          to="/dashboard/services"
                          className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 transition mt-1"
                        >
                          Book another test <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard/book-appointment"
                          className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition mt-1"
                        >
                          Book consultation <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── Pagination ─────────────────────────────────────────── */}
        {!loading && filtered.length > PER_PAGE && (
          <div className="mt-8 pt-4 border-t border-slate-100">
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        )}
      </div>

      {/* ─── Reschedule Modal with Slot Selector ────────────────── */}
      <AnimatePresence>
        {showRescheduleModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-medical-dark flex items-center gap-2">
                  <CalendarClock className="text-medical-blue" size={20} />
                  Reschedule Slot
                </h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReschedule} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-800">
                    {selectedAppointment.appointmentType === 'Lab Test' || selectedAppointment.serviceName
                      ? `🧪 ${selectedAppointment.serviceName || 'Diagnostic Lab Test'}`
                      : `🩺 Doctor Consultation`}
                  </p>
                  <p className="text-slate-600">Patient: <strong className="text-slate-800">{selectedAppointment.patientName}</strong></p>
                  <p className="text-slate-500">Current Slot: {selectedAppointment.date} at {selectedAppointment.time}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">New Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-medical-blue focus:border-medical-blue outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>New Time Slot *</span>
                    {newTime && (
                      <span className="text-blue-600 font-extrabold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Selected: {newTime}
                      </span>
                    )}
                  </label>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <SlotSelector
                      date={newDate}
                      hospitalId={selectedAppointment?.hospitalId}
                      selectedTime={newTime || '10:00'}
                      onSelectTime={(slot) => setNewTime(slot)}
                      showClock={true}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-medical-blue text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
                    {submitting ? 'Saving...' : 'Confirm Reschedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cancel Appointment & Refund Modal ──────────────────── */}
      <AnimatePresence>
        {showCancelModal && selectedApptForCancel && (() => {
          const isLab = selectedApptForCancel.appointmentType === 'Lab Test' || Boolean(selectedApptForCancel.serviceName);
          const amountPaid = Number(selectedApptForCancel.paymentAmount || selectedApptForCancel.servicePrice || 500);
          const isPaid = String(selectedApptForCancel.paymentStatus || '').toLowerCase() === 'paid';
          const cancelFee = isPaid ? Math.round(amountPaid * 0.10 * 100) / 100 : 0;
          const netRefund = isPaid ? Math.max(0, Math.round((amountPaid - cancelFee) * 100) / 100) : 0;

          const quickReasons = [
            'Change of schedule / plans',
            'Found alternative doctor or lab',
            'Booked wrong date/time slot',
            'Pet feeling better / recovered',
            'Emergency / personal conflict'
          ];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => !cancelSubmitting && setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 border border-slate-100 my-8 overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                      <Trash2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        Cancel {isLab ? 'Lab Test' : 'Appointment'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Appointment #{selectedApptForCancel.appointment_number} • {selectedApptForCancel.hospital}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelSubmitting}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleConfirmCancellation} className="space-y-4">
                  {/* Service Card Summary */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                    <p className="font-extrabold text-slate-900 text-sm">
                      {isLab
                        ? `🧪 ${selectedApptForCancel.serviceName || 'Diagnostic Lab Investigation'}`
                        : `🩺 ${selectedApptForCancel.doctorName ? `Dr. ${selectedApptForCancel.doctorName}` : 'Doctor Consultation'}`}
                    </p>
                    <p className="text-slate-600">
                      Patient: <strong className="text-slate-800">{selectedApptForCancel.patientName}</strong>
                      {selectedApptForCancel.petName ? ` (Pet: ${selectedApptForCancel.petName})` : ''}
                    </p>
                    <p className="text-slate-500">
                      Slot: {selectedApptForCancel.date} at {selectedApptForCancel.time}
                    </p>
                  </div>

                  {/* Financial & Refund Breakdown */}
                  {isPaid ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Receipt size={14} className="text-rose-600" /> Refund & Fee Statement
                        </span>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                          10% Cancellation Fee
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Amount Paid</span>
                          <span className="font-bold text-slate-900">₹{amountPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>Cancellation Charge (10%)</span>
                          <span className="font-bold">-₹{cancelFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-rose-200 flex justify-between text-sm font-black text-emerald-800 bg-emerald-50/70 p-2 rounded-xl">
                          <span>Estimated Refund to Card</span>
                          <span className="text-base text-emerald-700">₹{netRefund.toFixed(2)}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        💡 The refund of <strong>₹{netRefund.toFixed(2)}</strong> will be automatically credited to your original payment card / method via <strong>Stripe Gateway</strong> within <strong>5–7 business days</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                      ℹ️ This booking is not pre-paid. No cancellation fee or refund will be charged.
                    </div>
                  )}

                  {/* Reason for Cancellation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Reason for Cancellation
                    </label>

                    {/* Quick chips */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {quickReasons.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setCancelReason(r)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                            cancelReason === r
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please specify your reason for cancelling (optional)..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled={cancelSubmitting}
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
                    >
                      Keep Booking
                    </button>
                    <button
                      type="submit"
                      disabled={cancelSubmitting}
                      className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
                    >
                      {cancelSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={15} />}
                      {cancelSubmitting ? 'Processing Refund...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ─── Appointment Feedback Modal ─────────────────────────── */}
      <AppointmentFeedbackModal
        isOpen={Boolean(selectedApptForFeedback)}
        onClose={() => setSelectedApptForFeedback(null)}
        appointment={selectedApptForFeedback}
        onFeedbackSubmitted={() => {
          fetchAppointments();
        }}
      />
    </DashboardLayout>
  );
}