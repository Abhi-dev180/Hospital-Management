import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Building2, Mail, Calendar, Clock, MessageSquare,
  ArrowRight, CheckCircle2, Stethoscope, Search, CalendarClock, XCircle,
  Inbox, ShieldCheck, AlertTriangle, RotateCcw, CalendarPlus,
  ChevronLeft, ChevronRight, FlaskConical, Home as HomeIcon, Video,
  Activity, Sparkles, CreditCard, Receipt, FileText, Check, Info,
  PawPrint, Dog, Venus, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import Loader, { ListSkeleton, OverlayLoader } from '../../components/Loader';
import AppointmentPaymentModal from '../AppointmentPaymentModal';
import SlotSelector from '../SlotSelector';
import { useWebSocket } from '../../hooks/useWebSocket';

// ─── Constants & Presets ──────────────────────────────────────
const POPULAR_LAB_TESTS = [
  { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Routine Blood Tests', price: 350, originalPrice: 700, fasting: 'No Fasting Required', turnaround: '6 Hours' },
  { id: 'lipid', name: 'Lipid Cardiac Profile (Cholesterol)', category: 'Heart & Lipid', price: 450, originalPrice: 900, fasting: '10-12 Hours Fasting', turnaround: '8 Hours' },
  { id: 'hba1c', name: 'HbA1c Glycated Hemoglobin (Diabetes)', category: 'Diabetes & Thyroid', price: 399, originalPrice: 800, fasting: 'No Fasting Required', turnaround: '6 Hours' },
  { id: 'thyroid', name: 'Thyroid Profile Total (T3, T4, TSH)', category: 'Diabetes & Thyroid', price: 400, originalPrice: 850, fasting: 'Fasting Preferred', turnaround: '12 Hours' },
  { id: 'lft', name: 'Liver Function Test (LFT)', category: 'Vital Organs', price: 499, originalPrice: 1000, fasting: '8-10 Hours Fasting', turnaround: '8 Hours' },
  { id: 'kft', name: 'Kidney Function Test (KFT / Renal Profile)', category: 'Vital Organs', price: 480, originalPrice: 950, fasting: '8 Hours Fasting', turnaround: '8 Hours' },
  { id: 'vit_duo', name: 'Vitamin D & B12 Vitality Duo', category: 'Full Body Packages', price: 999, originalPrice: 2500, fasting: 'No Fasting Required', turnaround: '24 Hours' },
  { id: 'full_body', name: 'Executive Master Full Body Health Package', category: 'Full Body Packages', price: 1499, originalPrice: 4999, fasting: '10-12 Hours Fasting', turnaround: '24 Hours' }
];

const ALL_BUSINESS_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const STATUS_PILL = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const formatDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ─── Main Component ──────────────────────────────────────────
export default function BookAppointmentShared({ initialTab = 'book', presetHospitalId = '' }) {
  const [tab, setTab] = useState(initialTab === 'manage' ? 'manage' : 'book');
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/hospitals`);
        const data = await res.json();
        setHospitals(Array.isArray(data) ? data : data.hospitals || []);
      } catch { /* ignore */ }
    })();
  }, []);

  return (
    <>
      {/* Top Main Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        <button
          type="button"
          onClick={() => setTab('book')}
          className={`portal-tab ${tab === 'book' ? 'portal-tab-active' : 'portal-tab-inactive'}`}
        >
          <CalendarPlus className="w-4 h-4" /> Book Appointment
        </button>
        <button
          type="button"
          onClick={() => setTab('manage')}
          className={`portal-tab ${tab === 'manage' ? 'portal-tab-active' : 'portal-tab-inactive'}`}
        >
          <CalendarClock className="w-4 h-4" /> Cancel / Reschedule
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'book' ? (
          <motion.div key="book" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <BookTab hospitals={hospitals} presetHospitalId={presetHospitalId} onManage={() => setTab('manage')} />
          </motion.div>
        ) : (
          <motion.div key="manage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <ManageTab onBook={() => setTab('book')} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Book Tab ────────────────────────────────────────────────
function BookTab({ hospitals, presetHospitalId, onManage }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'consult' (Doctor / Clinic Appointment) vs 'lab' (Diagnostic Lab Test)
  const [mode, setMode] = useState(() => {
    const s = searchParams.get('service');
    const t = searchParams.get('test');
    if (s === 'lab' || t) return 'lab';
    return 'consult';
  });

  // Regular Doctor Appointment Form State
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    email: '',
    hospitalId: presetHospitalId || '',
    petName: '',
    species: 'Human / Patient',
    sex: 'Male',
    breed: '',
    date: '',
    time: '',
    description: ''
  });

  // Diagnostic Lab Test Form State
  const [labForm, setLabForm] = useState({
    patientName: '',
    patientPhone: '',
    email: '',
    hospitalId: presetHospitalId || '',
    labTestName: searchParams.get('test') || POPULAR_LAB_TESTS[0].name,
    sampleType: 'Home Sample Collection',
    age: '',
    gender: 'Male',
    date: '',
    time: '',
    address: '',
    notes: ''
  });

  const [customLabPrice, setCustomLabPrice] = useState(() => {
    const amt = searchParams.get('amount');
    return amt ? Number(amt) : null;
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingDetails, setPaymentBookingDetails] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Time Picker State (Round Watch Style)
  const [timeHour, setTimeHour] = useState(10);
  const [timeMinute, setTimeMinute] = useState(0);
  const [timeAmPm, setTimeAmPm] = useState('AM');

  // Derived time string (HH:MM)
  const selectedTime = useMemo(() => {
    let hour24 = timeHour;
    if (timeAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    if (timeAmPm === 'AM' && hour24 === 12) hour24 = 0;
    return `${String(hour24).padStart(2, '0')}:${String(timeMinute).padStart(2, '0')}`;
  }, [timeHour, timeMinute, timeAmPm]);

  // Sync selected time into active form
  useEffect(() => {
    if (mode === 'consult') {
      setForm((f) => ({ ...f, time: selectedTime }));
    } else {
      setLabForm((f) => ({ ...f, time: selectedTime }));
    }
  }, [selectedTime, mode]);

  // Sync URL parameters
  useEffect(() => {
    const s = searchParams.get('service');
    const t = searchParams.get('test');
    const amt = searchParams.get('amount');
    const doc = searchParams.get('doctor');
    const spec = searchParams.get('specialty');

    if (s === 'lab' || t) {
      setMode('lab');
      if (t) setLabForm((f) => ({ ...f, labTestName: t }));
      if (amt) setCustomLabPrice(Number(amt));
    } else if (doc || spec) {
      setMode('consult');
      if (doc) setForm((f) => ({ ...f, description: `Consultation with ${doc} (${spec || 'Specialist'})` }));
    }
  }, [searchParams]);

  // Auth pre-fill
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        setForm((f) => ({
          ...f,
          patientName: f.patientName || u.name || '',
          patientPhone: f.patientPhone || u.mobile || u.phone || '',
          email: f.email || u.email || '',
          hospitalId: presetHospitalId || f.hospitalId || (hospitals[0]?.id ? String(hospitals[0].id) : '')
        }));
        setLabForm((f) => ({
          ...f,
          patientName: f.patientName || u.name || '',
          patientPhone: f.patientPhone || u.mobile || u.phone || '',
          email: f.email || u.email || '',
          hospitalId: presetHospitalId || f.hospitalId || (hospitals[0]?.id ? String(hospitals[0].id) : '')
        }));
      } else if (presetHospitalId) {
        setForm((f) => ({ ...f, hospitalId: presetHospitalId }));
        setLabForm((f) => ({ ...f, hospitalId: presetHospitalId }));
      }
    } catch { /* ignore */ }
  }, [presetHospitalId, hospitals]);

  // Return callbacks from Stripe or PayU
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const payment = searchParams.get('payment');
    const payu = searchParams.get('payu');
    const txnid = searchParams.get('txnid');
    const apptId = searchParams.get('appointment_id');
    const apptNum = searchParams.get('appointment_number');

    if (sessionId && payment === 'success') {
      (async () => {
        const toastId = toast.loading('Verifying appointment payment with Stripe...');
        try {
          const res = await fetch(
            `${API_URL}/api/payments/verify-appointment-session?session_id=${encodeURIComponent(sessionId)}&appointment_id=${encodeURIComponent(apptId || '')}&payment=success`
          );
          const data = await res.json();
          toast.dismiss(toastId);
          if (res.ok && data.appointment) {
            setConfirmedAppointment(data.appointment);
            setDone(true);
            toast.success('🎉 Stripe Payment Verified & Appointment Confirmed!');
          }
        } catch (e) {
          console.error('Stripe appointment verify error:', e);
        }
      })();
    } else if (payu === 'success' || (txnid && payu)) {
      (async () => {
        const toastId = toast.loading('Loading confirmed appointment details...');
        try {
          let found = null;
          if (apptId) {
            const res = await fetch(`${API_URL}/api/appointments/${apptId}`);
            if (res.ok) found = await res.json();
          }
          if (!found && apptNum) {
            const res = await fetch(`${API_URL}/api/appointments/by-number/${apptNum}`);
            if (res.ok) found = await res.json();
          }
          toast.dismiss(toastId);
          if (found) {
            setConfirmedAppointment(found);
            setDone(true);
            toast.success('🎉 PayU Payment Successful & Appointment Booked!');
          }
        } catch (e) {
          console.error('PayU appointment load error:', e);
        }
      })();
    }
  }, [searchParams]);

  const activeDate = mode === 'consult' ? form.date : labForm.date;
  const activeHospitalId = mode === 'consult' ? form.hospitalId : labForm.hospitalId;

  // Fetch booked slots when date changes
  const fetchBookedSlots = useCallback(async () => {
    if (!activeDate) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/booked-slots?date=${activeDate}&hospitalId=${activeHospitalId || ''}`);
      const data = await res.json();
      setBookedSlots(res.ok && Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
      setAvailableSlots(res.ok && Array.isArray(data.availableSlots) ? data.availableSlots : []);
    } catch (e) {
      console.error('Could not fetch booked slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  }, [activeDate, activeHospitalId]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Real-time slot update listeners
  useWebSocket('appointment_cancelled', (payload) => {
    if (!payload || !payload.date || payload.date === activeDate) fetchBookedSlots();
  });
  useWebSocket('slots_updated', (payload) => {
    if (!payload || !payload.date || payload.date === activeDate) fetchBookedSlots();
  });
  useWebSocket('appointment_created', (payload) => {
    if (!payload || !payload.date || payload.date === activeDate) fetchBookedSlots();
  });

  // Selected Lab Test details
  const selectedLabObj = useMemo(() => {
    return POPULAR_LAB_TESTS.find((t) => t.name === labForm.labTestName) || POPULAR_LAB_TESTS[0];
  }, [labForm.labTestName]);

  const currentLabPrice = customLabPrice || selectedLabObj.price || 499;

  // Calendar helpers
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
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
    if (mode === 'consult') {
      setForm((f) => ({ ...f, date: dateStr }));
    } else {
      setLabForm((f) => ({ ...f, date: dateStr }));
    }
    setErrors((e) => ({ ...e, date: undefined }));
  };

  const updateForm = (k) => (e) => {
    const v = k === 'patientPhone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const updateLabForm = (k) => (e) => {
    const v = k === 'patientPhone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setLabForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (mode === 'consult') {
      if (!form.patientName.trim()) e.patientName = 'Patient / Contact name is required';
      if (!form.patientPhone.trim()) e.patientPhone = 'Mobile number is required';
      else if (!/^\d{10}$/.test(form.patientPhone.trim())) e.patientPhone = 'Enter a valid 10-digit mobile number';
      if (!form.hospitalId) e.hospitalId = 'Please select a hospital';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
      if (!form.date) e.date = 'Please select an appointment date';
      if (!form.time) e.time = 'Please select a time slot';
    } else {
      if (!labForm.patientName.trim()) e.patientName = 'Patient full name is required';
      if (!labForm.patientPhone.trim()) e.patientPhone = '10-digit mobile number is required';
      else if (!/^\d{10}$/.test(labForm.patientPhone.trim())) e.patientPhone = 'Enter a valid 10-digit mobile number';
      if (!labForm.email.trim()) e.email = 'Email address is required for invoice & report';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(labForm.email.trim())) e.email = 'Enter a valid email';
      if (!labForm.hospitalId) e.hospitalId = 'Please select a hospital or diagnostic centre';
      if (!labForm.date) e.date = 'Please select a date for the test';
      if (!labForm.time) e.time = 'Please select a time slot';
      if (labForm.sampleType === 'Home Sample Collection' && !labForm.address.trim()) {
        e.address = 'Please provide home address for sample collection';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please complete the highlighted fields');

    const activeHospId = mode === 'consult' ? form.hospitalId : labForm.hospitalId;
    const hospObj = hospitals.find((h) => String(h.id) === String(activeHospId));
    const hospName = hospObj ? hospObj.name : 'MEDPARK Hospital';

    let payload;
    if (mode === 'consult') {
      payload = {
        ...form,
        hospitalName: hospName,
        appointmentType: 'Consult',
        serviceName: form.description || 'Doctor Consultation',
        amount: 500,
        servicePrice: 500
      };
    } else {
      payload = {
        ...labForm,
        hospitalName: hospName,
        appointmentType: 'Lab Test',
        serviceName: labForm.labTestName,
        doctorName: `Diagnostic Lab (${labForm.labTestName})`,
        serviceCategory: selectedLabObj.category,
        sampleType: labForm.sampleType,
        fastingRequired: selectedLabObj.fasting.includes('Fasting'),
        fastingDetails: selectedLabObj.fasting,
        turnaroundTime: selectedLabObj.turnaround,
        amount: currentLabPrice,
        servicePrice: currentLabPrice,
        reason: labForm.notes || `Diagnostic Lab Test: ${labForm.labTestName}`
      };
    }

    setPendingPayload(payload);
    setPaymentBookingDetails(payload);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    setShowPaymentModal(false);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const finalPayload = {
        ...pendingPayload,
        paymentStatus: 'Paid',
        paymentId: paymentInfo.paymentId,
        paymentMethod: paymentInfo.paymentMethod,
        paymentAmount: paymentInfo.amount || pendingPayload.amount || 500
      };

      const res = await fetch(`${API_URL}/api/appointments/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(finalPayload)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not book appointment');
      const savedAppt = data.appointment || data;
      setConfirmedAppointment(savedAppt);
      setDone(true);
      toast.success('🎉 Appointment confirmed & Single-Page PDF Tax Invoice emailed!');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Confirmation Screen ──────────────────────────────────
  if (done) {
    const appt = confirmedAppointment || pendingPayload || form;
    const hospitalName =
      appt.hospital ||
      appt.hospitalName ||
      hospitals.find((h) => String(h.id) === String(appt.hospitalId || form.hospitalId || labForm.hospitalId))?.name ||
      'MEDPARK Super Specialty Hospital';
    const patientName = appt.patientName || form.patientName || labForm.patientName || 'Patient';
    const patientPhone = appt.patientPhone || form.patientPhone || labForm.patientPhone || '';
    const email = appt.email || form.email || labForm.email || '';
    const apptNumber = appt.appointment_number || appt.appointmentNumber || appt.id || 'CONFIRMED';
    const apptDate = appt.date || form.date || labForm.date;
    const apptTime = appt.time || form.time || labForm.time;
    const serviceTitle = appt.serviceName || appt.reason || 'Medical Appointment';
    const isLab = appt.appointmentType === 'Lab Test' || mode === 'lab';
    const paymentMethod = appt.paymentMethod || 'Online Payment';
    const paymentAmount = appt.paymentAmount || appt.amount || 500;
    const paymentId = appt.paymentId || appt.stripe_session_id || 'Verified';

    const userData = localStorage.getItem('user');
    const isLoggedIn = Boolean(userData);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/25 mb-1 animate-bounce">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
            Booking Confirmed &amp; Verified
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Appointment Confirmed!
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your booking details have been synced with the hospital desk and your automated tax invoice has been generated.
          </p>
        </div>

        {/* Receipt Ticket Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-medical-dark via-slate-900 to-medical-blue p-6 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-sky-300 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> MEDPARK Official Booking
              </span>
              <h3 className="text-lg font-black">{hospitalName}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Appointment Number</span>
              <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">#{apptNumber}</span>
            </div>
          </div>

          <div className="p-6 space-y-5 text-sm divide-y divide-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {isLab ? <FlaskConical className="w-3.5 h-3.5 text-medical-blue" /> : <Stethoscope className="w-3.5 h-3.5 text-medical-blue" />}
                  {isLab ? 'Diagnostic Lab Test' : 'Doctor / Clinic Consultation'}
                </span>
                <p className="font-extrabold text-slate-900 text-base">{serviceTitle}</p>
                {isLab && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <HomeIcon className="w-3 h-3" /> {appt.sampleType || 'Home Sample Collection'}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-medical-blue" /> Patient Name
                </span>
                <p className="font-bold text-slate-900 text-base">{patientName}</p>
                {patientPhone && <p className="text-slate-500 font-mono text-xs">{patientPhone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-medical-blue" /> Scheduled Date
                </span>
                <p className="font-bold text-slate-900">{formatDate(apptDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-medical-blue" /> Time Slot
                </span>
                <p className="font-bold text-medical-blue font-mono text-base">{apptTime}</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl border-t border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Status &amp; Method
                </span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">{paymentMethod}</span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    Txn: {String(paymentId).slice(0, 16)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Amount Paid
                </span>
                <span className="text-2xl font-black text-slate-900">₹{paymentAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Tax Invoice Notice */}
        {email && (
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-medical-blue shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Confirmation Email &amp; Single-Page PDF Tax Invoice Sent</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                An automated receipt and hospital appointment calendar invite have been dispatched to{' '}
                <strong className="font-semibold text-slate-900">{email}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmedAppointment(null);
              setDone(false);
              setSearchParams(new URLSearchParams(), { replace: true });
            }}
            className="btn btn-primary btn-md shadow-md"
          >
            <CalendarPlus className="w-4 h-4" /> Book Another Appointment
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmedAppointment(null);
              setDone(false);
              onManage();
            }}
            className="btn btn-outline btn-md bg-white hover:bg-slate-50"
          >
            <CalendarClock className="w-4 h-4" /> Cancel / Reschedule Visit
          </button>

          {isLoggedIn && (
            <Link to="/dashboard/my-appointments" className="btn btn-secondary btn-md">
              Go to My Appointments <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* ─── Mode Switcher (Doctor vs Diagnostic Lab Test) ─── */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex gap-1.5 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('consult');
            setCustomLabPrice(null);
            setForm((f) => ({
              ...f,
              patientName: f.patientName || labForm.patientName,
              patientPhone: f.patientPhone || labForm.patientPhone,
              email: f.email || labForm.email,
              hospitalId: f.hospitalId || labForm.hospitalId,
              date: f.date || labForm.date
            }));
            setErrors({});
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'consult'
              ? 'bg-white text-medical-blue shadow-md border border-slate-200/60 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Consultation</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('lab');
            setCustomLabPrice(null);
            setLabForm((f) => ({
              ...f,
              patientName: f.patientName || form.patientName,
              patientPhone: f.patientPhone || form.patientPhone,
              email: f.email || form.email,
              hospitalId: f.hospitalId || form.hospitalId,
              date: f.date || form.date
            }));
            setErrors({});
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'lab'
              ? 'bg-white text-medical-blue shadow-md border border-slate-200/60 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-sky-500" />
          <span>Diagnostic Lab Test</span>
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Up to 70% OFF
          </span>
        </button>
      </div>

      {mode === 'consult' ? (
        /* ═════════════════════════════════════════════════════════════
           1. PREVIOUS DOCTOR / CLINIC APPOINTMENT BOOKING FORM
           ═════════════════════════════════════════════════════════════ */
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={User} label="Patient / Contact name *" error={errors.patientName}>
              <input
                value={form.patientName}
                onChange={updateForm('patientName')}
                className="portal-input"
                placeholder="John Doe"
              />
            </Field>

            <Field icon={Phone} label="Mobile number (10-digit) *" error={errors.patientPhone}>
              <input
                value={form.patientPhone}
                onChange={updateForm('patientPhone')}
                inputMode="numeric"
                maxLength={10}
                className="portal-input"
                placeholder="9876543210"
              />
            </Field>

            <Field icon={Building2} label="Select hospital *" error={errors.hospitalId}>
              <select
                value={form.hospitalId}
                onChange={updateForm('hospitalId')}
                className="portal-input"
              >
                <option value="">— Choose a hospital —</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}{h.location ? ` — ${h.location}` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={User} label="Patient Nickname / Reference">
              <input
                value={form.petName}
                onChange={updateForm('petName')}
                className="portal-input"
                placeholder="Self / Family Member"
              />
            </Field>

            <Field icon={Venus} label="Gender">
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="Male"
                    checked={form.sex === 'Male'}
                    onChange={updateForm('sex')}
                    className="w-4 h-4 text-medical-blue"
                  />
                  Male
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="Female"
                    checked={form.sex === 'Female'}
                    onChange={updateForm('sex')}
                    className="w-4 h-4 text-medical-blue"
                  />
                  Female
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="Other"
                    checked={form.sex === 'Other'}
                    onChange={updateForm('sex')}
                    className="w-4 h-4 text-medical-blue"
                  />
                  Other
                </label>
              </div>
            </Field>

            <Field icon={Mail} label="Email Address *" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={updateForm('email')}
                className="portal-input"
                placeholder="you@example.com"
              />
            </Field>
          </div>

          {/* ─── Calendar & Round Clock Time Picker ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Calendar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="font-bold text-medical-dark text-sm">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
                  const isSelected = form.date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isPast = new Date(currentYear, currentMonth, day) < new Date(todayYear, todayMonth, todayDate);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDateSelect(day)}
                      className={`p-1.5 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-medical-blue text-white shadow-md'
                          : isToday
                          ? 'bg-blue-50 text-medical-blue border border-medical-blue font-bold'
                          : 'hover:bg-blue-50 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-2">{errors.date}</p>}
            </div>

            {/* Time Picker (Round Clock with Up/Down Arrows) */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-3 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-bold">SELECT TIME</span>
              </div>

              {/* Clock Face */}
              <div className="flex justify-center py-1">
                <div className="relative w-28 h-28 rounded-full border-2 border-blue-200 bg-white shadow-inner flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="5" fill="#1e40af" />
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                      const isActive = timeHour === num;
                      const rotation = num * 30;
                      return (
                        <g
                          key={num}
                          transform={`rotate(${rotation}, 100, 100)`}
                          onClick={() => {
                            setTimeHour(num);
                            setErrors((p) => ({ ...p, time: undefined }));
                          }}
                          className="cursor-pointer"
                        >
                          {isActive && <circle cx="100" cy="27" r="13" fill="#2563eb" />}
                          <text
                            x="100"
                            y="32"
                            textAnchor="middle"
                            className={`text-xs font-bold select-none ${isActive ? 'fill-white' : 'fill-gray-600'}`}
                          >
                            {num}
                          </text>
                        </g>
                      );
                    })}
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
              <div className="flex justify-center items-end gap-3">
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTimeHour((h) => (h < 12 ? h + 1 : 1))}
                    className="text-blue-500 hover:text-blue-700 transition text-base font-bold cursor-pointer"
                  >
                    ▲
                  </button>
                  <div className="w-8 h-8 border-2 border-blue-200 rounded-lg bg-white flex items-center justify-center text-lg font-bold text-blue-800 shadow-xs">
                    {String(timeHour).padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTimeHour((h) => (h > 1 ? h - 1 : 12))}
                    className="text-blue-500 hover:text-blue-700 transition text-base font-bold cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                <div className="text-2xl font-bold text-blue-300 mb-2">:</div>

                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTimeMinute((m) => (m < 45 ? m + 15 : 0))}
                    className="text-blue-500 hover:text-blue-700 transition text-base font-bold cursor-pointer"
                  >
                    ▲
                  </button>
                  <div className="w-8 h-8 border-2 border-blue-200 rounded-lg bg-white flex items-center justify-center text-lg font-bold text-blue-800 shadow-xs">
                    {String(timeMinute).padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTimeMinute((m) => (m > 0 ? m - 15 : 45))}
                    className="text-blue-500 hover:text-blue-700 transition text-base font-bold cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                <div className="flex flex-col bg-white rounded-lg border-2 border-blue-200 overflow-hidden shadow-xs ml-1">
                  <button
                    type="button"
                    onClick={() => setTimeAmPm('AM')}
                    className={`px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      timeAmPm === 'AM' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeAmPm('PM')}
                    className={`px-3 py-1 text-xs font-bold transition border-t border-blue-200 cursor-pointer ${
                      timeAmPm === 'PM' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {errors.time && <p className="text-red-500 text-xs text-center">{errors.time}</p>}

              {/* Slot Grid inside Time column */}
              {form.date && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1.5">
                    Available Slots {loadingSlots && <Loader size="xs" label="checking calendar…" />}
                  </span>
                  <SlotGrid
                    date={form.date}
                    slots={ALL_BUSINESS_SLOTS}
                    booked={bookedSlots}
                    selected={form.time}
                    onSelect={(slot) => {
                      const [h, m] = slot.split(':').map(Number);
                      const hour12 = h % 12 || 12;
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      setTimeHour(hour12);
                      setTimeMinute(m);
                      setTimeAmPm(ampm);
                      setErrors((p) => ({ ...p, time: undefined }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <Field icon={MessageSquare} label="Reason / description">
            <textarea
              value={form.description}
              onChange={updateForm('description')}
              rows={2}
              className="portal-input resize-none"
              placeholder="Describe the reason for the visit…"
            />
          </Field>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            {submitting ? (<><Loader size="sm" className="text-white" /> Booking…</>) : (<>Book appointment <ArrowRight className="w-4 h-4" /></>)}
          </button>
          <p className="text-center text-xs text-gray-400">Only the hospital you select will see this appointment.</p>
        </form>
      ) : (
        /* ═════════════════════════════════════════════════════════════
           2. DEDICATED DIAGNOSTIC LAB TEST BOOKING FORM
           ═════════════════════════════════════════════════════════════ */
        <form onSubmit={submit} className="space-y-6">
          {/* Lab Package Selection Banner */}
          <div className="bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 p-5 rounded-2xl border border-sky-100 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-medical-blue" /> Diagnostic Lab Package Selection
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-400 line-through">₹{selectedLabObj.originalPrice}</span>
                <span className="text-xl font-black text-slate-900">₹{currentLabPrice}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  {Math.round(((selectedLabObj.originalPrice - currentLabPrice) / selectedLabObj.originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={FlaskConical} label="Select Lab Test / Health Package *">
                <select
                  value={labForm.labTestName}
                  onChange={(e) => {
                    const testName = e.target.value;
                    const found = POPULAR_LAB_TESTS.find((t) => t.name === testName);
                    setLabForm((f) => ({ ...f, labTestName: testName }));
                    if (found) setCustomLabPrice(found.price);
                  }}
                  className="portal-input font-medium"
                >
                  {POPULAR_LAB_TESTS.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} — ₹{t.price} ({t.category})
                    </option>
                  ))}
                </select>
              </Field>

              <Field icon={HomeIcon} label="Sample Collection Preference *">
                <select
                  value={labForm.sampleType}
                  onChange={updateLabForm('sampleType')}
                  className="portal-input font-medium"
                >
                  <option value="Home Sample Collection">🏠 Home Sample Collection (Free Visit)</option>
                  <option value="Lab Centre Walk-in">🏥 Diagnostic Centre Walk-in</option>
                </select>
              </Field>
            </div>

            {/* Test Prep & Fasting info badge */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-sky-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <Info className="w-4 h-4 text-amber-500" />
                <span>Prep: {selectedLabObj.fasting}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Clock className="w-3.5 h-3.5 text-medical-blue" />
                <span>Report in {selectedLabObj.turnaround}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-semibold">✓ Certified NABL Lab</span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-medical-blue" /> Patient Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={User} label="Patient Full Name *" error={errors.patientName}>
                <input
                  value={labForm.patientName}
                  onChange={updateLabForm('patientName')}
                  className="portal-input"
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>

              <Field icon={Phone} label="10-Digit Mobile Number *" error={errors.patientPhone}>
                <input
                  value={labForm.patientPhone}
                  onChange={updateLabForm('patientPhone')}
                  inputMode="numeric"
                  maxLength={10}
                  className="portal-input"
                  placeholder="9876543210"
                />
              </Field>

              <Field icon={Mail} label="Email Address (for PDF Invoice & Calendar Sync) *" error={errors.email}>
                <input
                  type="email"
                  value={labForm.email}
                  onChange={updateLabForm('email')}
                  className="portal-input"
                  placeholder="patient@example.com"
                />
              </Field>

              <Field icon={Building2} label="Select Hospital Branch / Lab Centre *" error={errors.hospitalId}>
                <select
                  value={labForm.hospitalId}
                  onChange={updateLabForm('hospitalId')}
                  className="portal-input"
                >
                  <option value="">— Choose a hospital or centre —</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}{h.location ? ` — ${h.location}` : ''}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field icon={User} label="Age">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={labForm.age}
                    onChange={updateLabForm('age')}
                    className="portal-input"
                    placeholder="32"
                  />
                </Field>

                <Field icon={User} label="Gender">
                  <select value={labForm.gender} onChange={updateLabForm('gender')} className="portal-input">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>

              {labForm.sampleType === 'Home Sample Collection' ? (
                <Field icon={HomeIcon} label="Home Address for Sample Collection *" error={errors.address}>
                  <input
                    value={labForm.address}
                    onChange={updateLabForm('address')}
                    className="portal-input"
                    placeholder="Flat No, Street, Landmark, City..."
                  />
                </Field>
              ) : (
                <Field icon={MessageSquare} label="Notes / Special Instructions (optional)">
                  <input
                    value={labForm.notes}
                    onChange={updateLabForm('notes')}
                    className="portal-input"
                    placeholder="e.g. Fasting sample collection..."
                  />
                </Field>
              )}
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-medical-blue" /> Schedule Date &amp; Time
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Calendar */}
              <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                  {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
                    const isSelected = labForm.date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isPast = new Date(currentYear, currentMonth, day) < new Date(todayYear, todayMonth, todayDate);
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDateSelect(day)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isPast
                            ? 'text-slate-300 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-medical-blue text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-300/60'
                            : isToday
                            ? 'bg-blue-50 text-medical-blue border border-medical-blue font-black'
                            : 'hover:bg-blue-50 text-slate-700 hover:text-medical-blue'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-2 font-medium">{errors.date}</p>}
              </div>

              {/* Time Slots */}
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-medical-blue" /> Select Time Slot
                    </span>
                    {labForm.time && (
                      <span className="text-xs font-extrabold text-medical-blue bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                        Selected: {labForm.time}
                      </span>
                    )}
                  </div>

                  {labForm.date ? (
                    <SlotGrid
                      date={labForm.date}
                      slots={ALL_BUSINESS_SLOTS}
                      booked={bookedSlots}
                      selected={labForm.time}
                      onSelect={(slot) => {
                        setLabForm((f) => ({ ...f, time: slot }));
                        setErrors((p) => ({ ...p, time: undefined }));
                      }}
                    />
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
                      Please select a date from the calendar to view available slots.
                    </div>
                  )}
                </div>

                {errors.time && <p className="text-red-500 text-xs mt-2 font-medium">{errors.time}</p>}
              </div>
            </div>
          </div>

          {/* Total Payable & Submit Button */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">Total Payable Amount</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-white">₹{currentLabPrice}</span>
                <span className="text-xs text-slate-400">including home collection &amp; PDF tax invoice</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-extrabold text-white bg-medical-blue hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader size="sm" className="text-white" /> Securing Slot…</>
              ) : (
                <>Proceed to Secure Payment <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      )}

      <AnimatePresence>
        {submitting && (
          <OverlayLoader label="Booking your appointment…" sub="Reserving your slot and generating PDF invoice" />
        )}
      </AnimatePresence>

      <AppointmentPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingDetails={paymentBookingDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

// ─── Manage Tab (Cancel / Reschedule) ─────────────────────────
function ManageTab({ onBook }) {
  const [creds, setCreds] = useState({ patientPhone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ date: '', time: '', reason: '' });
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState('');

  const updateCred = (k) => (e) => {
    const v = k === 'patientPhone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setCreds((c) => ({ ...c, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validateCreds = () => {
    const er = {};
    if (!creds.patientPhone.trim()) er.patientPhone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(creds.patientPhone.trim())) er.patientPhone = 'Enter a valid 10-digit number';
    if (!creds.email.trim()) er.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creds.email.trim())) er.email = 'Enter a valid email';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const search = async (e) => {
    if (e) e.preventDefault();
    if (!validateCreds()) return;
    setSearching(true);
    setSearched(true);
    setAppointments([]);
    setEditing(null);
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/manage/lookup?patientPhone=${encodeURIComponent(creds.patientPhone.trim())}&email=${encodeURIComponent(creds.email.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Could not find appointments');
        setAppointments([]);
      } else {
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      }
    } catch {
      toast.error('Network error looking up bookings.');
    } finally {
      setSearching(false);
    }
  };

  const openEditor = (appt) => {
    setEditing(appt.id);
    setDraft({
      date: appt.date || '',
      time: appt.time || '',
      reason: appt.reason || appt.description || ''
    });
  };

  const saveReschedule = async (appt) => {
    if (!draft.date || !draft.time) return toast.error('Please pick both date and time slot');
    setBusyId(appt.id);
    setBusyAction('reschedule');
    try {
      const res = await fetch(`${API_URL}/api/appointments/manage/${appt.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientPhone: creds.patientPhone.trim(),
          email: creds.email.trim(),
          date: draft.date,
          time: draft.time,
          reason: draft.reason
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not reschedule');
      toast.success('🎉 Appointment rescheduled successfully!');
      setEditing(null);
      search();
    } catch {
      toast.error('Network error rescheduling appointment.');
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  const confirmCancel = async (appt) => {
    const isPaid = String(appt.paymentStatus).toLowerCase() === 'paid';
    const msg = isPaid
      ? `Are you sure you want to cancel appointment #${appt.appointment_number || appt.id}?\n\nRefund of 90% (₹${Math.round(Number(appt.paymentAmount || 500) * 0.9)}) will be processed automatically to your payment source.`
      : `Are you sure you want to cancel appointment #${appt.appointment_number || appt.id}?`;

    if (!window.confirm(msg)) return;

    setBusyId(appt.id);
    setBusyAction('cancel');
    try {
      const res = await fetch(`${API_URL}/api/appointments/manage/${appt.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientPhone: creds.patientPhone.trim(),
          email: creds.email.trim(),
          reason: 'Cancelled via online patient portal'
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not cancel');
      toast.success('Appointment cancelled. Refund receipt emailed.');
      search();
    } catch {
      toast.error('Network error cancelling appointment.');
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-sm">Find Your Bookings</h3>
          <p className="text-xs text-slate-500">
            Enter the registered mobile number and email used when creating the appointment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={Phone} label="Mobile Number *" error={errors.patientPhone}>
            <input
              value={creds.patientPhone}
              onChange={updateCred('patientPhone')}
              inputMode="numeric"
              maxLength={10}
              className="portal-input"
              placeholder="9876543210"
            />
          </Field>
          <Field icon={Mail} label="Email Address *" error={errors.email}>
            <input
              type="email"
              value={creds.email}
              onChange={updateCred('email')}
              className="portal-input"
              placeholder="patient@example.com"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={searching}
          className="w-full py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-medical-blue hover:bg-blue-600 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {searching ? <><Loader size="sm" className="text-white" /> Searching…</> : <><Search className="w-4 h-4" /> Look Up My Bookings</>}
        </button>
      </form>

      {searching && <ListSkeleton rows={3} />}

      {!searching && searched && appointments.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No appointments found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Please check the mobile number and email. They must match what was entered during booking.
          </p>
          <button
            onClick={onBook}
            className="mt-4 px-5 py-2 rounded-full text-xs font-bold text-medical-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 inline mr-1" /> Book a New Appointment
          </button>
        </div>
      )}

      {!searching && appointments.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            {appointments.length} Appointment{appointments.length === 1 ? '' : 's'} Found
          </p>

          {appointments.map((appt) => {
            const isEditing = editing === appt.id;
            const isBusy = busyId === appt.id;
            const isLab = appt.appointmentType === 'Lab Test' || appt.serviceName?.toLowerCase().includes('test');

            return (
              <motion.div
                key={appt.id}
                layout
                className={`rounded-2xl border bg-white p-5 transition shadow-xs ${
                  appt.canModify ? 'border-slate-200 hover:border-medical-blue/40' : 'border-slate-100 opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-base">{appt.hospital || 'MEDPARK Hospital'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_PILL[appt.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {appt.status}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{appt.appointment_number || appt.id}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-2 font-medium">
                        {isLab ? <FlaskConical className="w-3.5 h-3.5 text-medical-blue" /> : <Stethoscope className="w-3.5 h-3.5 text-medical-blue" />}
                        <span className="font-bold text-slate-800">{appt.serviceName || appt.doctorName || 'Medical Visit'}</span>
                        <span className="text-slate-300">·</span>
                        <span>{appt.appointmentType || 'Consult'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-medical-blue" /> {formatDate(appt.date)}
                        {appt.time && <><span className="text-slate-300">·</span><Clock className="w-3.5 h-3.5 text-medical-blue" /> {appt.time}</>}
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-medical-blue" /> {appt.patientName}
                      </p>
                    </div>
                  </div>

                  {appt.canModify ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditing(null) : openEditor(appt))}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold border border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transition disabled:opacity-50 cursor-pointer"
                      >
                        {isEditing ? <><RotateCcw className="w-3 h-3" /> Close</> : <><CalendarClock className="w-3 h-3" /> Reschedule</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmCancel(appt)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold border border-red-400 text-red-600 hover:bg-red-500 hover:text-white transition disabled:opacity-50 cursor-pointer"
                      >
                        {isBusy && busyAction === 'cancel' ? <Loader size="xs" /> : <XCircle className="w-3 h-3" />} Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 shrink-0">
                      {appt.status === 'Cancelled' ? 'Cancelled' : 'Completed'} — Closed
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field icon={Calendar} label="New Date *">
                            <input
                              type="date"
                              value={draft.date}
                              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value, time: '' }))}
                              className="portal-input"
                            />
                          </Field>

                          <Field icon={MessageSquare} label="Reason for Rescheduling">
                            <input
                              value={draft.reason}
                              onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
                              className="portal-input"
                              placeholder="e.g. Work schedule change..."
                            />
                          </Field>
                        </div>

                        {draft.date && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-medical-blue" /> Pick New Time Slot *</span>
                              {draft.time && (
                                <span className="text-medical-blue font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  Selected: {draft.time}
                                </span>
                              )}
                            </label>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                              <SlotSelector
                                date={draft.date}
                                hospitalId={appt.hospitalId}
                                selectedTime={draft.time || '10:00'}
                                onSelectTime={(slot) => setDraft((d) => ({ ...d, time: slot }))}
                                showClock={true}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveReschedule(appt)}
                            disabled={isBusy}
                            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-medical-blue hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
                          >
                            {isBusy && busyAction === 'reschedule' ? 'Saving…' : 'Confirm Reschedule'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Slot Grid ───────────────────────────────────────────────
function SlotGrid({ slots, booked = [], selected, onSelect, date }) {
  const effectiveSlots = Array.isArray(slots) && slots.length > 0 ? slots : ALL_BUSINESS_SLOTS;

  const isPastSlot = (slot) => {
    if (!date) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) return true;
    if (date === todayStr) {
      const now = new Date();
      const minValid = new Date(now.getTime() + 60 * 60 * 1000);
      const [h, m] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      return slotDate < minValid;
    }
    return false;
  };

  const isSlotBooked = (slot) => {
    if (!booked || !Array.isArray(booked)) return false;
    const s = String(slot).trim().slice(0, 5);
    return booked.some((b) => String(b).trim().slice(0, 5) === s);
  };

  const availableCount = effectiveSlots.filter((s) => !isPastSlot(s) && !isSlotBooked(s)).length;

  return (
    <div className="w-full space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500 font-medium px-0.5">
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 text-[10px]">
          {availableCount} {availableCount === 1 ? 'slot' : 'slots'} open
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Open</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Past</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 w-full">
        {effectiveSlots.map((slot) => {
          const isPast = isPastSlot(slot);
          const bookedMatch = isSlotBooked(slot);
          const isUnavailable = bookedMatch || isPast;
          const isSelected = selected === slot;

          return (
            <button
              key={slot}
              type="button"
              disabled={isUnavailable}
              onClick={() => onSelect(slot)}
              className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center min-h-[46px] cursor-pointer ${
                isPast
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : bookedMatch
                  ? 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed opacity-90 shadow-2xs'
                  : isSelected
                  ? 'bg-gradient-to-br from-medical-blue to-blue-700 text-white border-blue-600 shadow-md ring-2 ring-blue-300/60 font-bold scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-medical-blue hover:bg-blue-50/60 hover:shadow-xs hover:text-medical-blue'
              }`}
            >
              <span className={`text-xs sm:text-sm leading-tight font-extrabold ${
                isPast ? 'line-through text-slate-400' : bookedMatch ? 'line-through text-red-600' : ''
              }`}>
                {slot}
              </span>
              <span className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider leading-none ${
                isPast
                  ? 'text-slate-400'
                  : bookedMatch
                  ? 'text-red-500 font-extrabold'
                  : isSelected
                  ? 'text-blue-100 font-bold'
                  : 'text-slate-400 group-hover:text-medical-blue'
              }`}>
                {isPast ? 'Past' : bookedMatch ? 'Booked' : isSelected ? 'Selected' : 'Open'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Field Component ─────────────────────────────────────────
function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="portal-label text-slate-700 flex items-center gap-1.5 mb-1.5 font-bold text-xs">
        <Icon className="w-3.5 h-3.5 text-medical-blue" /> {label}
      </span>
      {children}
      {error && <span className="field-error text-red-500 text-xs mt-1 block font-medium">{error}</span>}
    </label>
  );
}