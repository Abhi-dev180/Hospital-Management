import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  PhoneCall,
  FileText,
  MessageSquare,
  Send,
  Loader2,
  Star,
  Building2,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  PlusCircle,
  CalendarPlus,
  HeartPulse,
  Activity,
  Bed,
  Droplet,
  TestTube,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import SlotSelector from '../../components/SlotSelector';
import Pagination from '../../components/Pagination';
import AppointmentFeedbackModal from '../../components/portal/AppointmentFeedbackModal';
import AppointmentPaymentModal from '../../components/AppointmentPaymentModal';
import { ListSkeleton } from '../../components/Loader';

const APPOINTMENTS_PER_PAGE = 4;

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [transcriptions, setTranscriptions] = useState([]);
  const [selectedApptForFeedback, setSelectedApptForFeedback] = useState(null);

  // Booking Form State
  const [formData, setFormData] = useState({
    hospitalId: '',
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    email: '',
    reason: ''
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [appointmentFilter, setAppointmentFilter] = useState('all');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingDetails, setPaymentBookingDetails] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        patientName: parsedUser.name || '',
        patientPhone: parsedUser.mobile || parsedUser.phone || '',
        email: parsedUser.email || ''
      }));
      fetchHospitals();
      fetchAppointments(token);
      fetchFeedbacks(token);
      fetchTranscriptions(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load hospitals');
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchAppointments = async (token) => {
    setLoadingAppointments(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchFeedbacks = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/appointment-feedbacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  const fetchTranscriptions = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/calls/transcriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) return handleUnauthorized();
      const data = await res.json();
      setTranscriptions(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientPhone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!formData.hospitalId || !formData.date || !formData.time || !formData.patientName || !formData.patientPhone) {
      return toast.error('Please fill all required fields');
    }

    if (!/^\d{10}$/.test(formData.patientPhone.trim())) {
      return toast.error('Mobile number must be exactly 10 digits');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return toast.error('Please enter a valid email address');
    }

    const hospObj = hospitals.find((h) => String(h.id) === String(formData.hospitalId));
    setPendingFormData(formData);
    setPaymentBookingDetails({
      hospitalName: hospObj ? hospObj.name : 'Selected Hospital',
      patientName: formData.patientName,
      serviceName: formData.reason || 'Doctor Consultation',
      appointmentType: 'Consult',
      date: formData.date,
      time: formData.time,
      amount: 500,
      email: formData.email || user?.email || ''
    });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    setShowPaymentModal(false);
    setBookingLoading(true);

    try {
      const token = localStorage.getItem('token');
      const finalPayload = {
        ...pendingFormData,
        email: pendingFormData.email || user?.email || '',
        paymentStatus: 'Paid',
        paymentId: paymentInfo.paymentId,
        paymentMethod: paymentInfo.paymentMethod,
        paymentAmount: paymentInfo.amount
      };

      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Appointment booked & paid successfully!');
        fetchAppointments(token);
        setFormData({
          hospitalId: '',
          date: '',
          time: '',
          patientName: user?.name || '',
          patientPhone: user?.mobile || user?.phone || '',
          email: user?.email || '',
          reason: ''
        });
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCallHospital = async () => {
    if (!formData.hospitalId || !formData.patientName || !formData.patientPhone) {
      return toast.error('Select hospital and enter patient details first');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitalId: formData.hospitalId,
          patientName: formData.patientName,
          patientPhone: formData.patientPhone,
          notes: formData.reason || 'Patient requested a hospital callback'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Call logged successfully');
        fetchTranscriptions(token);
      } else {
        toast.error(data.message || 'Failed to log call');
      }
    } catch {
      toast.error('Failed to create call');
    }
  };

  // Feedback mapping
  const feedbackMap = useMemo(() => {
    const map = new Map();
    feedbacks.forEach((f) => {
      if (f.appointmentId) map.set(String(f.appointmentId), f);
      if (f.appointmentNumber) map.set(String(f.appointmentNumber), f);
    });
    return map;
  }, [feedbacks]);

  // Split appointments by consultation vs lab test
  const doctorAppointments = useMemo(() => {
    return appointments.filter((a) => a && a.appointmentType !== 'Lab Test' && !a.serviceName);
  }, [appointments]);

  const labAppointments = useMemo(() => {
    return appointments.filter((a) => a && (a.appointmentType === 'Lab Test' || Boolean(a.serviceName)));
  }, [appointments]);

  // Compute metrics
  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(
      (a) => a.date >= today && a.status !== 'Cancelled' && a.status !== 'Completed'
    );
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === 'Completed');
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    if (upcomingAppointments.length === 0) return null;
    return [...upcomingAppointments].sort(
      (a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`)
    )[0];
  }, [upcomingAppointments]);

  // Active filtered appointments for the recent list
  const filteredAppointments = useMemo(() => {
    if (appointmentFilter === 'doctor') return doctorAppointments;
    if (appointmentFilter === 'lab') return labAppointments;
    return appointments;
  }, [appointments, doctorAppointments, labAppointments, appointmentFilter]);

  // Paginated appointments
  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * APPOINTMENTS_PER_PAGE;
    return filteredAppointments.slice(start, start + APPOINTMENTS_PER_PAGE);
  }, [filteredAppointments, page]);

  const totalPages = Math.ceil(filteredAppointments.length / APPOINTMENTS_PER_PAGE);

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name || 'Patient'} 👋`}
      subtitle="Manage your medical appointments, explore accredited hospitals, and share feedback."
      user={user}
    >
      <DashboardTabs role="user" />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Doctor Visits</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{doctorAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <TestTube className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lab Tests</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{labAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Visits</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{upcomingAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hospitals</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{hospitals.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Feedbacks Given</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{feedbacks.length}</p>
          </div>
        </div>
      </div>

      {/* Next Upcoming Appointment Highlight Banner */}
      {nextAppointment && (() => {
        const isNextLab = nextAppointment.appointmentType === 'Lab Test' || Boolean(nextAppointment.serviceName);
        const nextUrl = isNextLab ? '/dashboard/my-appointments?tab=lab' : '/dashboard/my-appointments?tab=doctor';

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 text-white ${
              isNextLab
                ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-800/30'
                : 'bg-gradient-to-r from-medical-dark via-slate-900 to-medical-blue'
            }`}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                  isNextLab ? 'bg-rose-500/20 text-rose-300' : 'bg-teal-400/20 text-teal-300'
                }`}>
                  {isNextLab ? <TestTube className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isNextLab ? 'Next Scheduled Lab Test' : 'Next Doctor Consultation'}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  {isNextLab
                    ? (nextAppointment.serviceName || 'Diagnostic Lab Investigation')
                    : (nextAppointment.doctorName ? `Dr. ${nextAppointment.doctorName}` : (nextAppointment.hospital || 'Hospital Consultation'))}
                </h3>
                <p className="text-slate-300 text-sm flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className={`w-4 h-4 ${isNextLab ? 'text-rose-300' : 'text-teal-300'}`} />
                    {nextAppointment.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className={`w-4 h-4 ${isNextLab ? 'text-rose-300' : 'text-teal-300'}`} />
                    {nextAppointment.time}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className={`w-4 h-4 ${isNextLab ? 'text-rose-300' : 'text-teal-300'}`} />
                    {nextAppointment.patientName}
                  </span>
                  {nextAppointment.petName && (
                    <span className="flex items-center gap-1.5 font-bold text-amber-300">
                      🐾 {nextAppointment.petName} {nextAppointment.species ? `(${nextAppointment.species})` : ''}
                    </span>
                  )}
                </p>
                {nextAppointment.reason && (
                  <p className="text-xs text-slate-300 italic">
                    Purpose: {nextAppointment.reason}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(nextUrl)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
                >
                  Manage Booking
                </button>
                <button
                  onClick={() => navigate(nextUrl)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition inline-flex items-center gap-1.5 ${
                    isNextLab
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  View in Schedule
                </button>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Quick Navigation Feature Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Diagnostic Lab Tests Card */}
        <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div className="inline-block bg-white/20 text-rose-100 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
              New Services
            </div>
            <h3 className="text-xl font-bold">Pet Lab Tests</h3>
            <p className="text-xs text-rose-100 mt-2 leading-relaxed">
              Book certified blood tests, urine analysis, digital X-rays, and organ health panels for your pet.
            </p>
          </div>
          <Link
            to="/dashboard/services"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-rose-200 group-hover:translate-x-1 transition-transform"
          >
            Explore Tests Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Explore Hospitals Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Explore Hospitals</h3>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">
              Browse top multi-specialty medical centers, view facility timings, emergency services, and doctors.
            </p>
          </div>
          <Link
            to="/dashboard/explore-hospitals"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-teal-200 group-hover:translate-x-1 transition-transform"
          >
            Browse All Hospitals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Book Appointment Card */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
              <CalendarPlus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Doctor Consult</h3>
            <p className="text-xs text-teal-100 mt-2 leading-relaxed">
              Choose your preferred hospital and doctor slot with instant confirmation and Google Calendar sync.
            </p>
          </div>
          <Link
            to="/dashboard/book-appointment"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-teal-200 group-hover:translate-x-1 transition-transform"
          >
            Start Booking Form <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Give Feedback Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <h3 className="text-xl font-bold">Reviews & Ratings</h3>
            <p className="text-xs text-amber-100 mt-2 leading-relaxed">
              Share your experience for your booked consultations and lab tests. Rate doctor expertise and care.
            </p>
          </div>
          <Link
            to="/dashboard/feedbacks"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-yellow-100 group-hover:translate-x-1 transition-transform"
          >
            Review Visits <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Booking Form & My Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Quick Book Appointment */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-medical-blue rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Book Appointment</h3>
                  <p className="text-xs text-slate-500">Quickly reserve your consultation</p>
                </div>
              </div>
              <Link
                to="/dashboard/explore-hospitals"
                className="text-xs font-semibold text-medical-blue hover:underline"
              >
                Browse Hospitals →
              </Link>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Hospital *
                </label>
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleAppointmentChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-medical-blue outline-none"
                  required
                >
                  <option value="">-- Choose Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    name="date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={handleAppointmentChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-medical-blue outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot *
                  </label>
                  <input
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleAppointmentChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-medical-blue outline-none"
                    required
                  />
                </div>
              </div>

              {formData.date && formData.hospitalId && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <SlotSelector
                    date={formData.date}
                    hospitalId={formData.hospitalId}
                    selectedTime={formData.time}
                    onSelectTime={(slot) => setFormData((f) => ({ ...f, time: slot }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Patient Name *
                  </label>
                  <input
                    name="patientName"
                    type="text"
                    placeholder="Full name"
                    value={formData.patientName}
                    onChange={handleAppointmentChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-medical-blue outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone (10 Digits) *
                  </label>
                  <input
                    name="patientPhone"
                    type="text"
                    placeholder="Mobile number"
                    value={formData.patientPhone}
                    onChange={handleAppointmentChange}
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-medical-blue outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Visit (Optional)
                </label>
                <textarea
                  name="reason"
                  placeholder="E.g. Cardiology checkup, fever, general consultation..."
                  value={formData.reason}
                  onChange={handleAppointmentChange}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:border-medical-blue outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-medical-blue to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-medical-blue/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirm Appointment
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCallHospital}
                  title="Request hospital callback"
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4" /> Call
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): My Bookings with Feedback Action */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recent Appointments</h3>
                  <p className="text-xs text-slate-500">
                    Track your consults and diagnostic tests
                  </p>
                </div>
              </div>
              <Link
                to={
                  appointmentFilter === 'lab'
                    ? '/dashboard/my-appointments?tab=lab'
                    : appointmentFilter === 'doctor'
                    ? '/dashboard/my-appointments?tab=doctor'
                    : '/dashboard/my-appointments'
                }
                className="text-xs font-semibold text-medical-blue hover:underline shrink-0"
              >
                View All {appointmentFilter === 'lab' ? `(${labAppointments.length})` : appointmentFilter === 'doctor' ? `(${doctorAppointments.length})` : `(${appointments.length})`} →
              </Link>
            </div>

            {/* Quick Segment Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl w-fit mb-4 border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setAppointmentFilter('all'); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appointmentFilter === 'all'
                    ? 'bg-white text-slate-950 shadow-xs scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => { setAppointmentFilter('doctor'); setPage(1); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appointmentFilter === 'doctor'
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3 h-3" />
                <span>Doctor ({doctorAppointments.length})</span>
              </button>
              <button
                type="button"
                onClick={() => { setAppointmentFilter('lab'); setPage(1); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appointmentFilter === 'lab'
                    ? 'bg-rose-600 text-white shadow-xs scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TestTube className="w-3 h-3" />
                <span>Lab Tests ({labAppointments.length})</span>
              </button>
            </div>

            {loadingAppointments ? (
              <ListSkeleton rows={3} />
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                {appointmentFilter === 'lab' ? (
                  <>
                    <TestTube className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No Lab Tests Booked Yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-3">
                      Order certified blood tests, urine tests, or health panels for your pets.
                    </p>
                    <Link
                      to="/dashboard/services"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700 transition"
                    >
                      Explore Lab Catalog
                    </Link>
                  </>
                ) : (
                  <>
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No Consultations Booked Yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Book your first consultation with any affiliated hospital using the form on the left.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {paginatedAppointments.map((app) => {
                  const isLabTest = app.appointmentType === 'Lab Test' || Boolean(app.serviceName);
                  const existingFeedback =
                    feedbackMap.get(String(app.id)) ||
                    feedbackMap.get(String(app.appointment_number));

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLabTest
                          ? 'border-rose-100 bg-rose-50/20 hover:bg-white hover:border-rose-300 hover:shadow-md'
                          : 'border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isLabTest ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <TestTube className="w-3 h-3 text-rose-600" />
                              Lab Test
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-blue-600" />
                              Doctor Consult
                            </span>
                          )}

                          <span className="font-bold text-slate-900 text-sm">
                            {isLabTest
                              ? (app.serviceName || app.reason || 'Diagnostic Lab Test')
                              : (app.doctorName ? `Dr. ${app.doctorName}` : (app.hospital || 'Hospital Visit'))}
                          </span>

                          {app.appointment_number && (
                            <span className="bg-medical-blue/10 text-medical-blue text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                              #{app.appointment_number}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              app.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : app.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : app.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          {isLabTest && (
                            <span className="font-medium text-slate-700 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {app.hospital}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {app.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {app.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {app.patientName}
                          </span>
                          {app.petName && (
                            <span className="font-bold text-amber-700">
                              🐾 {app.petName}
                            </span>
                          )}
                        </div>

                        {app.reason && !isLabTest && (
                          <p className="text-xs text-slate-600 italic line-clamp-1">
                            {app.reason}
                          </p>
                        )}
                      </div>

                      {/* Feedback action button */}
                      <div className="sm:text-right">
                        {existingFeedback ? (
                          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                            <span>
                              {existingFeedback.rating ? `${existingFeedback.rating}★ Rated` : 'Reviewed'}
                            </span>
                          </div>
                        ) : app.status === 'Completed' ? (
                          <button
                            onClick={() => setSelectedApptForFeedback(app)}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            Give Feedback
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Feedback enabled after completion
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                page={page}
                total={filteredAppointments.length}
                perPage={APPOINTMENTS_PER_PAGE}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Featured Hospitals Spotlight */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Explore Partner Hospitals</h3>
            <p className="text-xs text-slate-500">
              Accredited health centers with advanced care and 24/7 emergency support
            </p>
          </div>
          <Link
            to="/dashboard/explore-hospitals"
            className="text-xs font-bold text-medical-blue hover:underline inline-flex items-center gap-1"
          >
            View Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hospitals.slice(0, 3).map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md hover:shadow-xl transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-3 bg-blue-50 text-medical-blue rounded-2xl group-hover:bg-medical-blue group-hover:text-white transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {h.emergency || '24/7 Emergency'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-medical-blue transition">
                  {h.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-medical-blue" /> {h.location}
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {h.specialty || h.careType || 'Multi-Specialty Healthcare Center'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {h.beds || '350+ Beds'}
                </span>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, hospitalId: h.id }));
                    window.scrollTo({ top: 450, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 bg-medical-blue/10 hover:bg-medical-blue hover:text-white text-medical-blue font-bold text-xs rounded-xl transition"
                >
                  Book Here
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Feedback Modal */}
      <AppointmentFeedbackModal
        isOpen={Boolean(selectedApptForFeedback)}
        onClose={() => setSelectedApptForFeedback(null)}
        appointment={selectedApptForFeedback}
        onFeedbackSubmitted={(newFb) => {
          setFeedbacks((prev) => [newFb, ...prev]);
          const token = localStorage.getItem('token');
          if (token) fetchFeedbacks(token);
        }}
      />

      <AppointmentPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingDetails={paymentBookingDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </DashboardLayout>
  );
}