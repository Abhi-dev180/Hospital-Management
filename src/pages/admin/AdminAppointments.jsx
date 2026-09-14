import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, CalendarClock, CheckCircle2, XCircle, Loader2,
  CalendarPlus, Mail, Phone, Filter, User, PawPrint, Calendar,
  Clock, MessageSquare, Stethoscope, Eye, Hospital, Trash2,
  FileText, Check, AlertCircle, ChevronLeft, ChevronRight,
  TestTube, Droplet, Activity, AlertTriangle,
  RotateCcw, Receipt, CreditCard, BadgePercent, ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import SlotSelector from '../../components/SlotSelector';
import { TableSkeleton } from '../../components/Loader';
import { useWebSocket } from '../../hooks/useWebSocket';

const PER_PAGE = 10;
const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'];
const SPECIES_OPTIONS = ['', 'Cat', 'Dog', 'Horse', 'Bird', 'Rabbit', 'Other'];
const ALL_SLOTS = (() => {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
})();

const statusColors = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Rescheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200'
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

const modalPanel = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.15 } }
};

export default function AdminAppointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab'); // 'doctor' | 'lab' | 'refunds' | 'all'
  const initialType = tabParam === 'lab' ? 'test' : tabParam === 'refunds' ? 'refunds' : tabParam === 'all' ? 'all' : 'consult';
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (tabParam === 'lab') setTypeFilter('test');
    else if (tabParam === 'refunds') setTypeFilter('refunds');
    else if (tabParam === 'all') setTypeFilter('all');
    else if (tabParam === 'doctor') setTypeFilter('consult');
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    if (newTab === 'lab') {
      setTypeFilter('test');
      setSearchParams({ tab: 'lab' });
    } else if (newTab === 'refunds') {
      setTypeFilter('refunds');
      setSearchParams({ tab: 'refunds' });
    } else if (newTab === 'all') {
      setTypeFilter('all');
      setSearchParams({ tab: 'all' });
    } else {
      setTypeFilter('consult');
      setSearchParams({ tab: 'doctor' });
    }
    setPage(1);
  };

  // ─── Detail Modal ───────────────────────────────────────────
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // ─── Reschedule ─────────────────────────────────────────────
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [saving, setSaving] = useState(false);

  // ─── Book Modal ─────────────────────────────────────────────
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({
    patientName: '',
    patientPhone: '',
    email: '',
    hospitalId: '',
    date: '',
    time: '',
    petName: '',
    species: '',
    sex: '',
    breed: '',
    description: '',
    appointmentType: 'Consult'
  });
  const [bookErrors, setBookErrors] = useState({});
  const [hospitals, setHospitals] = useState([]);

  // ─── Calendar & Time Picker State ──────────────────────────
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [timeHour, setTimeHour] = useState(10);
  const [timeMinute, setTimeMinute] = useState(0);
  const [timeAmPm, setTimeAmPm] = useState('AM');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ─── Feedback Modal ─────────────────────────────────────────
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAppt, setFeedbackAppt] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'admin' && parsed.role !== 'superadmin') {
      navigate('/');
      return;
    }
    setUser(parsed);
    fetchAppointments(parsed);
    fetchHospitals();
  }, [navigate]);

  const fetchAppointments = async (currentUser) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to load appointments');
      let filteredData = Array.isArray(data) ? data : [];
      if (currentUser?.role === 'admin' && currentUser?.hospitalId) {
        filteredData = filteredData.filter(a => String(a.hospitalId) === String(currentUser.hospitalId));
      }
      setAppointments(filteredData);
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = () => {
    const u = localStorage.getItem('user');
    if (u) fetchAppointments(JSON.parse(u));
  };

  // ─── Real-Time WebSocket Updates ─────────────────────────────
  useWebSocket("appointment_created", (newAppt) => {
    // Only add if it belongs to this admin's hospital (or if superadmin)
    if (user?.role === 'admin' && String(newAppt.hospitalId) !== String(user.hospitalId)) return;
    setAppointments((prev) => {
      if (prev.some(a => a.id === newAppt.id)) return prev;
      return [newAppt, ...prev];
    });
    toast.success(`New appointment for ${newAppt.patientName}`);
  });

  useWebSocket("appointment_updated", (updatedAppt) => {
    if (user?.role === 'admin' && String(updatedAppt.hospitalId) !== String(user.hospitalId)) return;
    setAppointments((prev) => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
  });

  useWebSocket("appointment_deleted", ({ id }) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  });

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : data.hospitals || []);
    } catch {
      setHospitals([]);
    }
  };

  // ─── View Details ───────────────────────────────────────────
  const openDetail = (appt) => {
    setSelectedAppt(appt);
    setShowDetailModal(true);
  };

  // ─── Reschedule ─────────────────────────────────────────────
  const openReschedule = () => {
    if (!selectedAppt) return;
    setRescheduleForm({ date: selectedAppt.date || '', time: selectedAppt.time || '' });
    setShowRescheduleModal(true);
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time) {
      return toast.error('Please select a new date and time');
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          date: rescheduleForm.date,
          time: rescheduleForm.time,
          status: 'Rescheduled'
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Reschedule failed');
      toast.success('Appointment rescheduled');
      setShowRescheduleModal(false);
      setShowDetailModal(false);
      refreshAppointments();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Status Changes ─────────────────────────────────────────
  const handleUpdateStatus = async (statusName) => {
    if (!selectedAppt) return;
    try {
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt.id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: statusName })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || `Failed to set ${statusName}`);
      toast.success(`Appointment status set to ${statusName}`);
      setShowDetailModal(false);
      refreshAppointments();
    } catch {
      toast.error('Network error');
    }
  };

  // ─── Complete ──────────────────────────────────────────────
  const handleComplete = async () => {
    if (!selectedAppt) return;
    if (!confirm(`Mark "${selectedAppt.patientName}" as Completed?`)) return;
    handleUpdateStatus('Completed');
  };

  // ─── Cancel ─────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!selectedAppt) return;
    if (!confirm(`Cancel appointment for "${selectedAppt.patientName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt.id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'Cancelled' })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to cancel');
      toast.success('Appointment cancelled');
      setShowDetailModal(false);
      refreshAppointments();
    } catch {
      toast.error('Network error');
    }
  };

  // ─── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedAppt) return;
    if (!confirm(`Permanently delete appointment for "${selectedAppt.patientName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to delete');
      toast.success('Appointment deleted');
      setShowDetailModal(false);
      refreshAppointments();
    } catch {
      toast.error('Network error');
    }
  };

  // ─── Quick Delete ───────────────────────────────────────────
  const handleQuickDelete = async (appt) => {
    if (!confirm(`Permanently delete appointment for "${appt.patientName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/appointments/${appt.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to delete');
      toast.success('Appointment deleted');
      refreshAppointments();
    } catch {
      toast.error('Network error');
    }
  };

  // ─── Feedback ───────────────────────────────────────────────
  const openFeedback = (appt) => {
    setFeedbackAppt(appt);
    setFeedbackText('');
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return toast.error('Please enter feedback');
    setFeedbackSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/appointment-feedbacks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          patientName: feedbackAppt.patientName,
          petName: feedbackAppt.petName,
          appointmentType: feedbackAppt.appointmentType,
          date: feedbackAppt.date,
          time: feedbackAppt.time,
          feedbackStatus: 'Published',
          feedbackGiven: true,
          feedbackText: feedbackText,
          callAttempted: false,
          callPicked: false,
          appointmentId: feedbackAppt.id
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to save feedback');
      toast.success('Feedback added');
      setShowFeedbackModal(false);
      refreshAppointments();
    } catch {
      toast.error('Network error');
    } finally {
      setFeedbackSaving(false);
    }
  };

  // ─── Book Modal ─────────────────────────────────────────────
  const openBookModal = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setTimeHour(10);
    setTimeMinute(0);
    setTimeAmPm('AM');
    setBookForm({
      patientName: '',
      patientPhone: '',
      email: '',
      hospitalId: user?.hospitalId || '',
      date: '',
      time: '',
      petName: '',
      species: '',
      sex: '',
      breed: '',
      description: '',
      appointmentType: 'Consult'
    });
    setBookErrors({});
    setBookedSlots([]);
    setShowBookModal(true);
  };

  // ─── Fetch booked slots when date or hospital changes ──────
  useEffect(() => {
    if (!bookForm.date || !showBookModal) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`${API_URL}/api/appointments/booked-slots?date=${bookForm.date}&hospitalId=${bookForm.hospitalId || ''}`);
        const data = await res.json();
        setBookedSlots(res.ok && Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
      } catch {
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [bookForm.date, bookForm.hospitalId, showBookModal]);

  // ─── Sync time picker with bookForm.time ──────────────────
  useEffect(() => {
    if (!bookForm.time) return;
    const [h, m] = bookForm.time.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const hour12 = h % 12 || 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      setTimeHour(hour12);
      setTimeMinute(m);
      setTimeAmPm(ampm);
    }
  }, [bookForm.time]);

  // ─── Update bookForm.time when time picker changes ────────
  useEffect(() => {
    if (!showBookModal) return;
    let hour24 = timeHour;
    if (timeAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    if (timeAmPm === 'AM' && hour24 === 12) hour24 = 0;
    const timeStr = `${String(hour24).padStart(2, '0')}:${String(timeMinute).padStart(2, '0')}`;
    if (bookForm.time !== timeStr) {
      setBookForm(f => ({ ...f, time: timeStr }));
    }
  }, [timeHour, timeMinute, timeAmPm, showBookModal]);

  const validateBookForm = () => {
    const errors = {};
    if (!bookForm.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!bookForm.patientPhone.trim()) errors.patientPhone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(bookForm.patientPhone.trim())) errors.patientPhone = 'Enter a valid 10-digit mobile number';
    if (!bookForm.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookForm.email.trim())) errors.email = 'Please enter a valid email address';
    if (!bookForm.hospitalId) errors.hospitalId = 'Please select a hospital';
    if (!bookForm.date) errors.date = 'Please select a date';
    if (!bookForm.time) errors.time = 'Please select a time';
    if (bookedSlots.includes(bookForm.time)) errors.time = 'That slot is already booked. Please choose another time.';
    if (!validateTime()) errors.time = 'Time must be at least 1 hour from now.';
    if (!bookForm.species) errors.species = 'Please select a species';
    if (!bookForm.sex) errors.sex = 'Please select sex';
    setBookErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTime = () => {
    if (!bookForm.date || !bookForm.time) return true;
    const dateTime = new Date(`${bookForm.date}T${bookForm.time}:00`);
    const now = new Date();
    return (dateTime - now) >= 3600000;
  };

  const submitBook = async (e) => {
    e.preventDefault();
    if (!validateBookForm()) return toast.error('Please fix the booking fields');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Could not book appointment');
        return;
      }
      toast.success('Appointment booked successfully');

      // Optimistic update – add new appointment to the list immediately
      if (data.appointment) {
        setAppointments(prev => [data.appointment, ...prev]);
      }

      setShowBookModal(false);
      // Refresh in background to sync any changes (e.g., google_event_id)
      refreshAppointments();
    } catch (err) {
      console.error('Admin book appointment failed:', err);
      toast.error('Network error while booking');
    } finally {
      setSaving(false);
    }
  };

  // ─── Calendar helpers ──────────────────────────────────────
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (selectedDate < new Date(todayYear, todayMonth, todayDate)) {
      toast.error('Cannot select a past date.');
      return;
    }
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setBookForm(f => ({ ...f, date: dateStr }));
    setBookErrors(e => ({ ...e, date: undefined }));
  };

  // ─── Filtering & Tab Counts ────────────────────────────────
  const doctorCount = useMemo(() => appointments.filter(a => a.appointmentType !== 'Lab Test' && !a.serviceName).length, [appointments]);
  const labCount = useMemo(() => appointments.filter(a => a.appointmentType === 'Lab Test' || Boolean(a.serviceName)).length, [appointments]);
  const refundCount = useMemo(() => appointments.filter(a => a.status === 'Cancelled' || (a.refundAmount && a.refundAmount > 0) || a.refundStatus === 'Refunded').length, [appointments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter(a => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const isLabTest = a.appointmentType === 'Lab Test' || Boolean(a.serviceName);
      const isRefunded = a.status === 'Cancelled' || (a.refundAmount && a.refundAmount > 0) || a.refundStatus === 'Refunded';
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'test' && isLabTest) ||
        (typeFilter === 'refunds' && isRefunded) ||
        (typeFilter === 'consult' && !isLabTest);

      const matchSearch =
        !q ||
        [a.patientName, a.petName, a.appointmentType, a.serviceName, a.serviceCategory, a.email, a.patientPhone, a.refundId, a.cancellationReason, a.refundStatus]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);

      return matchStatus && matchType && matchSearch;
    });
  }, [appointments, search, statusFilter, typeFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  useEffect(() => setPage(1), [search, statusFilter, typeFilter]);

  return (
    <div className="w-full px-2 sm:px-3 py-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="w-full space-y-4"
      >
        <DashboardTabs role="admin" />

      <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100">
        
        {/* ─── Master Section Tabs ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/70">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTabChange("doctor")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "consult"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Stethoscope size={16} />
              <span>Doctor Appointments</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "consult"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {doctorCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("lab")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "test"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <TestTube size={16} />
              <span>Lab Test Appointments</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "test"
                    ? "bg-white/20 text-white"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {labCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("refunds")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "refunds"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <RotateCcw size={16} />
              <span>Refunds &amp; Settlements</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "refunds"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {refundCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "all"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <ClipboardList size={15} />
              <span>All Bookings</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {appointments.length}
              </span>
            </button>
          </div>

          <button
            onClick={openBookModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all duration-200 shrink-0"
          >
            <CalendarPlus size={16} /> Book Appointment
          </button>
        </div>

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {typeFilter === "test" && <TestTube className="text-rose-600" size={24} />}
              {typeFilter === "consult" && <Stethoscope className="text-blue-600" size={24} />}
              {typeFilter === "refunds" && <RotateCcw className="text-emerald-600" size={24} />}
              {typeFilter === "all" && <ClipboardList className="text-slate-700" size={24} />}
              {typeFilter === "test"
                ? "Hospital Diagnostic & Lab Tests"
                : typeFilter === "consult"
                ? "Doctor Consultations"
                : typeFilter === "refunds"
                ? "Hospital Refunds & Settlements"
                : "All Hospital Appointments"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {typeFilter === "refunds"
                ? "Showing cancelled bookings with Stripe & Razorpay refunds and 10% fee deductions."
                : `Showing ${filtered.length} of ${appointments.length} total entries`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-56 min-w-[180px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={typeFilter === 'refunds' ? 'Search refund ID, patient...' : 'Search patient, pet, test...'}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="relative flex items-center">
              <Filter className="absolute left-3.5 text-slate-400 pointer-events-none" size={15} />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 appearance-none"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={refreshAppointments}
              className="p-2.5 border border-slate-200/80 rounded-2xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-300 flex items-center justify-center transition shrink-0"
              title="Refresh Appointments"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* ─── Table ───────────────────────────────────────────── */}
        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/70 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[1100px] text-sm">
              <thead>
                {typeFilter === 'refunds' ? (
                  <tr className="bg-emerald-50/80 text-emerald-900 text-xs font-bold uppercase tracking-wider border-b border-emerald-200/80">
                    <th className="py-3.5 px-3">APP # &amp; REF ID</th>
                    <th className="py-3.5 px-3">Patient &amp; Contact</th>
                    <th className="py-3.5 px-3">Service / Test</th>
                    <th className="py-3.5 px-3">Schedule</th>
                    <th className="py-3.5 px-3">Gross Paid</th>
                    <th className="py-3.5 px-3">10% Fee Retained</th>
                    <th className="py-3.5 px-3">Net Refund</th>
                    <th className="py-3.5 px-3">Reason</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-3">APP #</th>
                    <th className="py-3.5 px-3">Patient Details</th>
                    <th className="py-3.5 px-3">Pet Name</th>
                    <th className="py-3.5 px-3">Type</th>
                    <th className="py-3.5 px-3">Schedule</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Feedback</th>
                    <th className="py-3.5 px-3">Call Status</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginated.map((a, idx) => {
                  if (typeFilter === 'refunds') {
                    const isLabTest = a.appointmentType === 'Lab Test' || Boolean(a.serviceName);
                    const paidAmt = Number(a.paymentAmount || a.servicePrice || 0);
                    const feeAmt = Number(a.cancellationFee || (paidAmt * 0.10) || 0);
                    const netRefund = Number(a.refundAmount || (paidAmt - feeAmt) || 0);
                    const isRazorpay = String(a.paymentMethod || '').toLowerCase().includes('razorpay') ||
                                      (a.paymentId && String(a.paymentId).startsWith('pay_'));

                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900 text-xs">
                              #{a.appointment_number}
                            </span>
                            {a.refundId ? (
                              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200/80 w-fit">
                                {a.refundId}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No Ref ID</span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              Via {isRazorpay ? 'Razorpay' : 'Stripe'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{a.patientName}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {a.patientPhone && <span>{a.patientPhone}</span>}
                              {a.email && <span className="truncate max-w-[130px]">{a.email}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                              {isLabTest ? (a.serviceName || 'Diagnostic Test') : (a.doctorName ? `Dr. ${a.doctorName}` : 'Consultation')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isLabTest ? 'Lab Investigation' : 'Clinical Consult'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <span className="font-bold text-slate-700 text-xs">{a.date || '—'}</span>
                            <span className="text-xs font-medium text-slate-500">{a.time || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-bold text-slate-800">
                          ₹{paidAmt}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-bold text-amber-700">
                          -₹{feeAmt}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200">
                            ₹{netRefund}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 max-w-[160px]">
                          <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded-lg line-clamp-2">
                            {a.cancellationReason || 'Cancelled'}
                          </p>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            a.refundStatus === 'Refunded' || netRefund > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            <CheckCircle2 size={11} />
                            {a.refundStatus || (netRefund > 0 ? 'Refunded' : 'No Refund')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openDetail(a)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition" title="View Details">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleQuickDelete(a)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        <div>#{a.appointment_number}</div>
                        {(a.paymentId || a.stripe_session_id || a.paymentMethod) && (
                          <div className="text-[10px] text-slate-500 font-normal mt-1">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <CreditCard size={10} /> {a.paymentMethod || 'Paid'}
                            </span>
                            <span className="block font-mono text-[9px] text-slate-400 truncate max-w-[120px] mt-0.5" title={a.paymentId || a.stripe_session_id}>
                              Txn: {a.paymentId || a.stripe_session_id}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{a.patientName}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {a.patientPhone && (
                              <span className="flex items-center gap-1"><Phone size={11} /> {a.patientPhone}</span>
                            )}
                            {a.email && (
                              <span className="flex items-center gap-1"><Mail size={11} /> {a.email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{a.petName || '—'}</span>
                          {a.species && <span className="text-xs text-slate-400">{a.species}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {a.appointmentType === 'Lab Test' || a.serviceName ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg text-xs font-bold w-fit">
                              <TestTube size={11} className="text-rose-600" />
                              {a.serviceCategory || 'Lab Test'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[150px] mt-0.5">
                              {a.serviceName || 'Diagnostic Test'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                            {a.appointmentType || 'Consult'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100/50">
                          <span className="font-bold text-blue-700">{a.date || '—'}</span>
                          <span className="text-xs font-medium text-blue-600">{a.time || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[a.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {a.feedback ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><Check size={12} /> Given</span>
                        ) : (
                          <button onClick={() => openFeedback(a)} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                            <FileText size={12} /> Add Feedback
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {a.callStatus === 'called' ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><Check size={12} /> Called</span>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1"><AlertCircle size={12} /> Not called</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(a)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleQuickDelete(a)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-slate-400 font-medium italic">No appointments matching the search criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* ─── Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showDetailModal && selectedAppt && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User size={20} className="text-blue-500" />
                    {selectedAppt.patientName}
                  </h3>
                  <p className="text-sm text-slate-500">Appointment #{selectedAppt.appointment_number}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                  <XCircle size={20} />
                </button>
              </div>

              {/* Lab Test Notice Banner */}
              {(selectedAppt.serviceName || selectedAppt.appointmentType === 'Lab Test') && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-start gap-3">
                  <TestTube className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-rose-900 text-sm">{selectedAppt.serviceName || 'Diagnostic Test'}</span>
                      <span className="bg-rose-200/80 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {selectedAppt.serviceCategory || 'Lab Test'}
                      </span>
                      {selectedAppt.servicePrice && (
                        <span className="font-extrabold text-rose-950">₹{selectedAppt.servicePrice}</span>
                      )}
                    </div>
                    {selectedAppt.sampleType && (
                      <p className="text-rose-800"><strong>Sample:</strong> {selectedAppt.sampleType}</p>
                    )}
                    {selectedAppt.fastingRequired && (
                      <p className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-semibold">
                        ⚡ {selectedAppt.fastingDetails || 'Fasting required before sample collection.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2"><Phone size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Phone</p><p className="text-sm font-medium text-slate-800">{selectedAppt.patientPhone || '—'}</p></div></div>
                <div className="flex items-start gap-2"><Mail size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Email</p><p className="text-sm font-medium text-slate-800">{selectedAppt.email || '—'}</p></div></div>
                <div className="flex items-start gap-2"><Hospital size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Hospital</p><p className="text-sm font-medium text-slate-800">{selectedAppt.hospital || '—'}</p></div></div>
                <div className="flex items-start gap-2"><Calendar size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Date</p><p className="text-sm font-medium text-slate-800">{selectedAppt.date || '—'}</p></div></div>
                <div className="flex items-start gap-2"><Clock size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Time</p><p className="text-sm font-medium text-slate-800">{selectedAppt.time || '—'}</p></div></div>
                <div className="flex items-start gap-2"><PawPrint size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Pet</p><p className="text-sm font-medium text-slate-800">{selectedAppt.petName || '—'}</p></div></div>
                <div className="flex items-start gap-2"><PawPrint size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Species</p><p className="text-sm font-medium text-slate-800">{selectedAppt.species || '—'}</p></div></div>
                <div className="flex items-start gap-2"><PawPrint size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Sex</p><p className="text-sm font-medium text-slate-800">{selectedAppt.sex || '—'}</p></div></div>
                <div className="flex items-start gap-2"><PawPrint size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Breed</p><p className="text-sm font-medium text-slate-800">{selectedAppt.breed || '—'}</p></div></div>
                <div className="flex items-start gap-2 sm:col-span-2"><Stethoscope size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Appointment Type</p><p className="text-sm font-medium text-slate-800">{selectedAppt.appointmentType || 'Consult'}</p></div></div>
                <div className="flex items-start gap-2 sm:col-span-2"><MessageSquare size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs font-semibold text-slate-500 uppercase">Reason / Notes</p><p className="text-sm font-medium text-slate-800">{selectedAppt.reason || 'No reason provided'}</p></div></div>

                {/* 💳 Payment & Stripe Transaction Details */}
                <div className="sm:col-span-2 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-600" />
                      <span className="font-bold text-slate-800 text-sm">Payment &amp; Transaction Details</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      String(selectedAppt.paymentStatus).toLowerCase() === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {selectedAppt.paymentStatus || 'Paid'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Amount Paid</p>
                      <p className="text-sm font-extrabold text-slate-900">
                        ₹{selectedAppt.paymentAmount || selectedAppt.servicePrice || 500}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {selectedAppt.paymentMethod || 'Stripe Card / Online Gateway'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gateway Transaction / Payment ID</p>
                      <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 select-all break-all mt-0.5">
                        {selectedAppt.paymentId || selectedAppt.stripe_session_id || `ST_${selectedAppt.id}`}
                      </p>
                    </div>
                    {selectedAppt.stripe_session_id && selectedAppt.stripe_session_id !== selectedAppt.paymentId && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Stripe Checkout Session ID</p>
                        <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 select-all break-all mt-0.5">
                          {selectedAppt.stripe_session_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:col-span-2">
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Status</p><span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[selectedAppt.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{selectedAppt.status}</span></div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-100">
                {selectedAppt.status !== 'Completed' && selectedAppt.status !== 'Cancelled' && (
                  <>
                    {selectedAppt.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus('Confirmed')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        <CheckCircle2 size={15} /> Confirm Booking
                      </button>
                    )}
                    {selectedAppt.status !== 'In Progress' && (
                      <button
                        onClick={() => handleUpdateStatus('In Progress')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                      >
                        <Activity size={15} /> Set In Progress
                      </button>
                    )}
                    <button onClick={openReschedule} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
                      <CalendarClock size={15} /> Reschedule
                    </button>
                    <button onClick={handleComplete} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                      <CheckCircle2 size={15} /> Complete
                    </button>
                    <button onClick={handleCancel} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors">
                      <XCircle size={15} /> Cancel
                    </button>
                  </>
                )}
                {(selectedAppt.status === 'Cancelled' || selectedAppt.status === 'Completed') && (
                  <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                    <Trash2 size={15} /> Delete
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reschedule Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showRescheduleModal && selectedAppt && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div><h3 className="text-xl font-bold text-slate-900">Reschedule</h3><p className="text-sm text-slate-500">{selectedAppt.patientName}</p></div>
                <button onClick={() => setShowRescheduleModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"><XCircle size={20} /></button>
              </div>
              <form onSubmit={submitReschedule} className="space-y-4">
                <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">New Date *</label><input type="date" value={rescheduleForm.date} onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" required /></div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                    <span>New Time Slot *</span>
                    {rescheduleForm.time && (
                      <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Selected: {rescheduleForm.time}
                      </span>
                    )}
                  </label>
                  <div className="mt-1 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <SlotSelector
                      date={rescheduleForm.date}
                      hospitalId={selectedAppt?.hospitalId}
                      selectedTime={rescheduleForm.time || '10:00'}
                      onSelectTime={(slot) => setRescheduleForm((f) => ({ ...f, time: slot }))}
                      showClock={true}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowRescheduleModal(false)} className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold shadow-md shadow-amber-500/20 disabled:opacity-60 hover:bg-amber-700 transition">
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Reschedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Feedback Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showFeedbackModal && feedbackAppt && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div><h3 className="text-xl font-bold text-slate-900">Add Feedback</h3><p className="text-sm text-slate-500">{feedbackAppt.patientName} – #{feedbackAppt.appointment_number}</p></div>
                <button onClick={() => setShowFeedbackModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"><XCircle size={20} /></button>
              </div>
              <form onSubmit={submitFeedback} className="space-y-4">
                <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Feedback *</label><textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" placeholder="Write your feedback here..." required /></div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                  <button type="submit" disabled={feedbackSaving} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition">
                    {feedbackSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {feedbackSaving ? 'Saving…' : 'Add Feedback'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Book Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showBookModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowBookModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Book New Appointment</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Create a direct booking on behalf of a patient.</p>
                </div>
                <button onClick={() => setShowBookModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"><XCircle size={20} /></button>
              </div>

              <form onSubmit={submitBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Select Hospital *</label>
                    <select value={bookForm.hospitalId} onChange={e => setBookForm(f => ({ ...f, hospitalId: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition">
                      <option value="">Choose hospital</option>
                      {hospitals.map(h => <option key={h.id} value={String(h.id)}>{h.name}</option>)}
                    </select>
                    {bookErrors.hospitalId && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.hospitalId}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Patient Name *</label>
                    <input type="text" value={bookForm.patientName} onChange={e => setBookForm(f => ({ ...f, patientName: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" />
                    {bookErrors.patientName && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.patientName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mobile Number *</label>
                    <input type="tel" value={bookForm.patientPhone} onChange={e => setBookForm(f => ({ ...f, patientPhone: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" placeholder="10-digit number" />
                    {bookErrors.patientPhone && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.patientPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email *</label>
                    <input type="email" value={bookForm.email} onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" placeholder="Required" />
                    {bookErrors.email && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.email}</p>}
                  </div>

                  {/* ─── Calendar + Time Picker ────────────────── */}
                  <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Calendar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3">
                      <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full">
                          <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <span className="font-semibold text-medical-dark">
                          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full">
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                        {['SU','MO','TU','WE','TH','FR','SA'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }, (_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }, (_, i) => {
                          const day = i + 1;
                          const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
                          const isSelected = bookForm.date === `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                          const isPast = new Date(currentYear, currentMonth, day) < new Date(todayYear, todayMonth, todayDate);
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleDateSelect(day)}
                              className={`p-1.5 rounded-full text-sm font-medium transition ${
                                isPast ? 'text-slate-300 cursor-not-allowed' :
                                isSelected ? 'bg-medical-blue text-white shadow-md' :
                                isToday ? 'bg-blue-50 text-medical-blue border border-medical-blue' :
                                'hover:bg-blue-50 text-slate-700'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {bookErrors.date && <p className="text-red-500 text-xs mt-2">{bookErrors.date}</p>}
                    </div>

                    {/* Time Picker */}
                    <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-3 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm uppercase tracking-wide">SELECT TIME</span>
                      </div>

                      {/* Clock Face */}
                      <div className="flex justify-center py-2">
                        <div className="relative w-28 h-28 rounded-full border-2 border-blue-200 bg-white shadow-inner flex items-center justify-center">
                          <svg viewBox="0 0 200 200" className="w-full h-full">
                            {/* Center dot */}
                            <circle cx="100" cy="100" r="5" fill="#1e40af" />

                            {/* Hour numbers (1-12) */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                              const isActive = timeHour === num;
                              const rotation = num * 30;
                              return (
                                <g
                                  key={num}
                                  transform={`rotate(${rotation}, 100, 100)`}
                                  onClick={() => {
                                    setTimeHour(num);
                                    setBookErrors((p) => ({ ...p, time: undefined }));
                                  }}
                                  className="cursor-pointer"
                                >
                                  {isActive && <circle cx="100" cy="27" r="13" fill="#2563eb" />}
                                  <text
                                    x="100"
                                    y="32"
                                    textAnchor="middle"
                                    className={`text-xs font-bold select-none ${
                                      isActive ? 'fill-white' : 'fill-gray-600'
                                    }`}
                                  >
                                    {num}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Hour Hand */}
                            <line
                              x1="100"
                              y1="100"
                              x2="100"
                              y2="65"
                              stroke="#2563eb"
                              strokeWidth="4"
                              strokeLinecap="round"
                              transform={`rotate(${(timeHour % 12) * 30 + timeMinute * 0.5}, 100, 100)`}
                            />

                            {/* Minute Hand */}
                            <line
                              x1="100"
                              y1="100"
                              x2="100"
                              y2="50"
                              stroke="#ec4899"
                              strokeWidth="3"
                              strokeLinecap="round"
                              transform={`rotate(${timeMinute * 6}, 100, 100)`}
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Up/Down Selectors */}
                      <div className="flex justify-center items-end gap-4 mt-1">
                        {/* Hour */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setTimeHour((h) => (h < 12 ? h + 1 : 1))}
                            className="text-blue-500 hover:text-blue-700 transition text-lg"
                          >
                            ▲
                          </button>
                          <div className="w-8 h-8 border-2 border-blue-200 rounded-lg bg-white flex items-center justify-center text-xl font-bold text-blue-800 shadow-sm">
                            {String(timeHour).padStart(2, '0')}
                          </div>
                          <button
                            type="button"
                            onClick={() => setTimeHour((h) => (h > 1 ? h - 1 : 12))}
                            className="text-blue-500 hover:text-blue-700 transition text-lg"
                          >
                            ▼
                          </button>
                        </div>

                        <div className="text-3xl font-bold text-blue-300 mb-4">:</div>

                        {/* Minute */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setTimeMinute((m) => (m < 45 ? m + 15 : 0))}
                            className="text-blue-500 hover:text-blue-700 transition text-lg"
                          >
                            ▲
                          </button>
                          <div className="w-8 h-8 border-2 border-blue-200 rounded-lg bg-white flex items-center justify-center text-xl font-bold text-blue-800 shadow-sm">
                            {String(timeMinute).padStart(2, '0')}
                          </div>
                          <button
                            type="button"
                            onClick={() => setTimeMinute((m) => (m > 0 ? m - 15 : 45))}
                            className="text-blue-500 hover:text-blue-700 transition text-lg"
                          >
                            ▼
                          </button>
                        </div>

                        {/* AM / PM */}
                        <div className="flex flex-col bg-white rounded-lg border-2 border-blue-200 overflow-hidden shadow-sm ml-1">
                          <button
                            type="button"
                            onClick={() => setTimeAmPm('AM')}
                            className={`px-3 py-1.5 text-sm font-bold transition ${
                              timeAmPm === 'AM' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setTimeAmPm('PM')}
                            className={`px-3 py-1.5 text-sm font-bold transition border-t border-blue-200 ${
                              timeAmPm === 'PM' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>

                      {bookErrors.time && <p className="text-red-500 text-xs text-center">{bookErrors.time}</p>}

                      {bookForm.date && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1.5">
                            Available Slots {loadingSlots && <Loader2 size={14} className="animate-spin" />}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ALL_SLOTS.map(slot => {
                              const isBooked = bookedSlots.includes(slot);
                              const isSelected = bookForm.time === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={isBooked}
                                  onClick={() => {
                                    const [h, m] = slot.split(':').map(Number);
                                    const hour12 = h % 12 || 12;
                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                    setTimeHour(hour12);
                                    setTimeMinute(m);
                                    setTimeAmPm(ampm);
                                    setBookErrors(e => ({ ...e, time: undefined }));
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                                    isBooked ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through' :
                                    isSelected ? 'bg-green-600 text-white border-green-600 shadow-md' :
                                    'bg-white text-slate-700 border-slate-300 hover:border-green-500 hover:bg-green-50'
                                  }`}
                                  title={isBooked ? 'Slot not available' : 'Click to select slot'}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pet details */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pet Name</label>
                    <input type="text" value={bookForm.petName} onChange={e => setBookForm(f => ({ ...f, petName: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Species *</label>
                    <select value={bookForm.species} onChange={e => setBookForm(f => ({ ...f, species: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition">
                      {SPECIES_OPTIONS.map(s => <option key={s} value={s}>{s || '— Select —'}</option>)}
                    </select>
                    {bookErrors.species && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.species}</p>}
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Sex *</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="radio" name="sex" value="Male" checked={bookForm.sex === 'Male'} onChange={e => setBookForm(f => ({ ...f, sex: e.target.value }))} className="w-4 h-4 text-medical-blue" /> Male
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="radio" name="sex" value="Female" checked={bookForm.sex === 'Female'} onChange={e => setBookForm(f => ({ ...f, sex: e.target.value }))} className="w-4 h-4 text-medical-blue" /> Female
                      </label>
                    </div>
                    {bookErrors.sex && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.sex}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Breed (optional)</label>
                    <input type="text" value={bookForm.breed} onChange={e => setBookForm(f => ({ ...f, breed: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" placeholder="e.g. Golden Retriever" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Description</label>
                    <textarea value={bookForm.description} onChange={e => setBookForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition" placeholder="Optional booking notes" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowBookModal(false)} className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition">
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
                    {saving ? 'Booking…' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
  );
}