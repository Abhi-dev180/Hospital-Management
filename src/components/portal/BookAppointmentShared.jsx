import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Building2, Mail, Calendar, Clock, MessageSquare, PawPrint,
  ArrowRight, CheckCircle2, Stethoscope, Search, CalendarClock, XCircle,
  Inbox, ShieldCheck, AlertTriangle, RotateCcw, CalendarPlus,
  ChevronLeft, ChevronRight, Venus, Mars, Dog, Cat, Bird, Rabbit, CreditCard, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import Loader, { ListSkeleton, OverlayLoader } from '../../components/Loader';
import AppointmentPaymentModal from '../AppointmentPaymentModal';
import SlotSelector from '../SlotSelector';
import { useWebSocket } from '../../hooks/useWebSocket';

// ─── Constants ────────────────────────────────────────────────
const initialForm = {
  patientName: '',
  patientPhone: '',
  hospitalId: '',
  email: '',
  date: '',
  time: '',
  petName: '',
  species: '',
  sex: '',
  breed: '',
  description: ''
};

const ALL_BUSINESS_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const STATUS_PILL = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const formatDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ─── Main component ──────────────────────────────────────────
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
      <div className="flex flex-wrap justify-center gap-2.5 mb-7">
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
          <motion.div key="book" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            <BookTab hospitals={hospitals} presetHospitalId={presetHospitalId} onManage={() => setTab('manage')} />
          </motion.div>
        ) : (
          <motion.div key="manage" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
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
  const [form, setForm] = useState({ ...initialForm, hospitalId: presetHospitalId });
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
  const [pendingForm, setPendingForm] = useState(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Time picker state (watch style)
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

  useEffect(() => {
    setForm(f => ({ ...f, time: selectedTime }));
  }, [selectedTime]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        setForm(f => ({
          ...f,
          patientName: f.patientName || u.name || '',
          patientPhone: f.patientPhone || u.mobile || u.phone || '',
          email: f.email || u.email || '',
          hospitalId: presetHospitalId || f.hospitalId || ''
        }));
      } else if (presetHospitalId) {
        setForm(f => ({ ...f, hospitalId: presetHospitalId }));
      }
    } catch (e) {}
  }, [presetHospitalId]);

  // ─── Handle Return Callbacks from Stripe or PayU Gateway ───
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const payment = searchParams.get('payment');
    const payu = searchParams.get('payu');
    const txnid = searchParams.get('txnid');
    const apptId = searchParams.get('appointment_id');
    const apptNum = searchParams.get('appointment_number');

    // Case 1: Stripe Return Callback
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
      // Case 2: PayU Hosted Gateway Return Callback
      (async () => {
        const toastId = toast.loading('Loading your confirmed appointment details...');
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
          } else {
            setConfirmedAppointment({
              id: apptId || txnid,
              appointment_number: apptNum || Math.floor(1000 + Math.random() * 9000),
              paymentStatus: 'Paid',
              paymentMethod: 'PayU Test Mode',
              paymentAmount: 500,
              paymentId: txnid,
              date: new Date().toISOString().split('T')[0],
              hospital: 'MEDPARK Hospital'
            });
            setDone(true);
          }
        } catch (e) {
          console.error('PayU appointment load error:', e);
        }
      })();
    }
  }, [searchParams]);

  // Listen for global custom event if verified by header verifier
  useEffect(() => {
    const handleApptVerified = (e) => {
      if (e.detail) {
        setConfirmedAppointment(e.detail);
        setDone(true);
      }
    };
    window.addEventListener('appointment_payment_verified', handleApptVerified);
    return () => window.removeEventListener('appointment_payment_verified', handleApptVerified);
  }, []);

  // Fetch booked slots when date changes
  const fetchBookedSlots = useCallback(async () => {
    if (!form.date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/booked-slots?date=${form.date}&hospitalId=${form.hospitalId || ''}`);
      const data = await res.json();
      setBookedSlots(res.ok && Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
      setAvailableSlots(res.ok && Array.isArray(data.availableSlots) ? data.availableSlots : []);
    } catch (e) {
      console.error('Could not fetch booked slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  }, [form.date, form.hospitalId]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Real-time slot update listeners
  useWebSocket('appointment_cancelled', (payload) => {
    if (!payload || !payload.date || payload.date === form.date) {
      fetchBookedSlots();
    }
  });

  useWebSocket('slots_updated', (payload) => {
    if (!payload || !payload.date || payload.date === form.date) {
      fetchBookedSlots();
    }
  });

  useWebSocket('appointment_created', (payload) => {
    if (!payload || !payload.date || payload.date === form.date) {
      fetchBookedSlots();
    }
  });

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
    setForm(f => ({ ...f, date: dateStr }));
    setErrors(e => ({ ...e, date: undefined }));
  };

  // Validate time: must be at least 1 hour from now
  const validateTime = () => {
    if (!form.date || !form.time) return true;
    const [year, month, day] = form.date.split('-').map(Number);
    const [hours, minutes] = form.time.split(':').map(Number);
    const apptDate = new Date(year, month - 1, day, hours, minutes);
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return apptDate >= oneHourFromNow;
  };

  const update = (k) => (e) => {
    const v = k === 'patientPhone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.patientName.trim()) e.patientName = 'Patient name is required';
    if (!form.patientPhone.trim()) e.patientPhone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.patientPhone.trim())) e.patientPhone = 'Enter a valid 10-digit mobile number';
    if (!form.hospitalId) e.hospitalId = 'Please select a hospital';

    if (!form.email) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email';
    }

    if (!form.species) e.species = 'Please select a species';
    if (!form.sex) e.sex = 'Please select sex';

    if (!form.date) e.date = 'Please select a date';
    if (!form.time) e.time = 'Please select a time';

    if (form.time && availableSlots.length > 0 && !availableSlots.includes(form.time)) {
      e.time = 'Selected time is outside business hours.';
    }

    if (form.time && bookedSlots.includes(form.time)) {
      e.time = 'That slot is already booked. Please choose another time.';
    }
    if (!validateTime()) {
      e.time = 'Time must be at least 1 hour from now.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix the highlighted fields');

    const hospObj = hospitals.find((h) => String(h.id) === String(form.hospitalId));
    setPendingForm(form);
    setPaymentBookingDetails({
      ...form,
      hospitalName: hospObj ? hospObj.name : 'Selected Hospital',
      patientName: form.patientName,
      patientPhone: form.patientPhone,
      petName: form.petName,
      serviceName: form.description || 'Veterinary Consultation',
      appointmentType: 'Consult',
      date: form.date,
      time: form.time,
      amount: 500,
      email: form.email || ''
    });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    setShowPaymentModal(false);
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const finalPayload = {
        ...pendingForm,
        paymentStatus: 'Paid',
        paymentId: paymentInfo.paymentId,
        paymentMethod: paymentInfo.paymentMethod,
        paymentAmount: paymentInfo.amount
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
      toast.success('🎉 Appointment booked & payment verified! 🐾');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const appt = confirmedAppointment || form;
    const hospitalName =
      appt.hospital ||
      appt.hospitalName ||
      hospitals.find((h) => String(h.id) === String(appt.hospitalId || form.hospitalId))?.name ||
      'MEDPARK Hospital';
    const patientName = appt.patientName || form.patientName || 'Patient';
    const patientPhone = appt.patientPhone || form.patientPhone || '';
    const email = appt.email || form.email || '';
    const apptNumber = appt.appointment_number || appt.appointmentNumber || appt.id || 'CONFIRMED';
    const apptDate = appt.date || form.date;
    const apptTime = appt.time || form.time;
    const serviceTitle = appt.serviceName || appt.reason || appt.appointmentType || 'Veterinary Consultation';
    const petName = appt.petName || form.petName;
    const species = appt.species || form.species;
    const breed = appt.breed || form.breed;
    const paymentMethod = appt.paymentMethod || 'Online Payment';
    const paymentAmount = appt.paymentAmount || appt.amount || 500;
    const paymentId = appt.paymentId || appt.stripe_session_id || 'Verified';

    const userData = localStorage.getItem('user');
    const isLoggedIn = Boolean(userData);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto py-4 space-y-6 text-left"
      >
        {/* Hero Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            Payment Confirmed • Appointment Booked
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            You're all set, {patientName}! 🎉
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your appointment has been successfully scheduled. The hospital care team has been notified.
          </p>
        </div>

        {/* Detailed Booking Ticket */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 p-5 text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider">
                Booking Reference
              </div>
              <div className="text-xl font-black font-mono tracking-wide">
                #{apptNumber}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Confirmed &amp; Paid
              </span>
            </div>
          </div>

          {/* Ticket Body Grid */}
          <div className="p-6 space-y-5 divide-y divide-slate-100 text-xs">
            {/* Row 1: Hospital & Doctor/Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Hospital / Clinic
                </span>
                <p className="text-sm font-bold text-slate-900">{hospitalName}</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Service / Consultation
                </span>
                <p className="text-sm font-bold text-slate-900">{serviceTitle}</p>
              </div>
            </div>

            {/* Row 2: Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" /> Scheduled Date
                </span>
                <p className="text-sm font-bold text-slate-900">{formatDate(apptDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <Clock className="w-3.5 h-3.5 text-teal-600" /> Appointment Time
                </span>
                <p className="text-sm font-bold text-teal-700 font-mono">{apptTime}</p>
              </div>
            </div>

            {/* Row 3: Patient & Pet Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <User className="w-3.5 h-3.5 text-teal-600" /> Patient Contact
                </span>
                <p className="font-semibold text-slate-900">{patientName}</p>
                {patientPhone && <p className="text-slate-500 font-mono">{patientPhone}</p>}
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <PawPrint className="w-3.5 h-3.5 text-teal-600" /> Pet Information
                </span>
                <p className="font-semibold text-slate-900">
                  {petName || 'Patient / Pet'} {species ? `(${species}${breed ? ` • ${breed}` : ''})` : ''}
                </p>
              </div>
            </div>

            {/* Row 4: Payment Summary */}
            <div className="pt-4 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Payment Mode
                </span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">{paymentMethod}</span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    Txn: {String(paymentId).slice(0, 18)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Amount Paid
                </span>
                <span className="text-xl font-extrabold text-emerald-700">₹{paymentAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email & Tax Invoice Notice */}
        {email && (
          <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950 space-y-1">
              <p className="font-bold">Confirmation Email &amp; PDF Tax Invoice Sent</p>
              <p className="text-teal-800 text-[11px] leading-relaxed">
                An official receipt and appointment schedule have been dispatched to{' '}
                <strong className="font-semibold text-teal-950">{email}</strong>. You can use your mobile number and email on the “Cancel / Reschedule” tab to manage this booking.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setForm({ ...initialForm, hospitalId: presetHospitalId });
              setConfirmedAppointment(null);
              setDone(false);
              const clean = new URLSearchParams();
              if (presetHospitalId) clean.set('hospitalId', presetHospitalId);
              setSearchParams(clean, { replace: true });
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
            <Link
              to="/dashboard/my-appointments"
              className="btn btn-secondary btn-md"
            >
              Go to My Appointments <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  // Species options
  const speciesOptions = ['', 'Cat', 'Dog', 'Horse', 'Bird', 'Rabbit', 'Other'];

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={User} label="Patient / Pet owner name *" error={errors.patientName}>
            <input value={form.patientName} onChange={update('patientName')} className="portal-input" placeholder="John Doe" />
          </Field>
          <Field icon={Phone} label="Mobile number (10-digit) *" error={errors.patientPhone}>
            <input value={form.patientPhone} onChange={update('patientPhone')} inputMode="numeric" maxLength={10} className="portal-input" placeholder="9876543210" />
          </Field>

          <Field icon={Building2} label="Select hospital *" error={errors.hospitalId}>
            <select value={form.hospitalId} onChange={update('hospitalId')} className="portal-input">
              <option value="">— Choose a hospital —</option>
              {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}{h.location ? ` — ${h.location}` : ''}</option>)}
            </select>
          </Field>

          <Field icon={PawPrint} label="Pet name*">
            <input value={form.petName} onChange={update('petName')} className="portal-input" placeholder="Bruno" />
          </Field>

          <Field icon={Dog} label="Species *" error={errors.species}>
            <select value={form.species} onChange={update('species')} className="portal-input">
              {speciesOptions.map(s => <option key={s} value={s}>{s || '— Select —'}</option>)}
            </select>
          </Field>

          <Field icon={Venus} label="Sex *" error={errors.sex}>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  name="sex"
                  value="Male"
                  checked={form.sex === 'Male'}
                  onChange={update('sex')}
                  className="w-4 h-4 text-medical-blue"
                />
                Male
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  name="sex"
                  value="Female"
                  checked={form.sex === 'Female'}
                  onChange={update('sex')}
                  className="w-4 h-4 text-medical-blue"
                />
                Female
              </label>
            </div>
          </Field>

          <Field icon={PawPrint} label="Breed (optional)">
            <input value={form.breed} onChange={update('breed')} className="portal-input" placeholder="Golden Retriever" />
          </Field>

          <Field icon={Mail} label="Email *" error={errors.email}>
            <input type="email" value={form.email} onChange={update('email')} className="portal-input" placeholder="you@example.com" />
          </Field>
        </div>


        {/* ─── Calendar & Time Picker ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3">
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-3 h-3 text-gray-600" />
              </button>
              <span className="font-semibold text-medical-dark">
                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
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
                    className={`p-1.5 rounded-full text-sm font-medium transition ${
                      isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : isSelected
                        ? 'bg-medical-blue text-white shadow-md'
                        : isToday
                        ? 'bg-blue-50 text-medical-blue border border-medical-blue'
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

          {/* ─── Time Picker (Round Clock with Up/Down Arrows) ── */}
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
                          setErrors((p) => ({ ...p, time: undefined }));
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

            <p className="text-center text-[10px] text-blue-400 font-medium">Must be at least 1 hour from now.</p>

            {errors.time && <p className="text-red-500 text-xs text-center -mt-2">{errors.time}</p>}

            {/*  Slot Grid (Now correctly inside the Time Picker column) */}
            {form.date && (
              <div className="mt-4 pt-4 border-t border-blue-200">
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
          <textarea value={form.description} onChange={update('description')} rows={3} className="portal-input resize-none" placeholder="Describe the reason for the visit…" />
        </Field>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
          {submitting ? (<><Loader size="sm" className="text-white" /> Booking…</>) : (<>Book appointment <ArrowRight className="w-4 h-4" /></>)}
        </button>
        <p className="text-center text-xs text-gray-400">Only the hospital you select will see this appointment.</p>
      </form>

      <AnimatePresence>
        {submitting && <OverlayLoader label="Booking your appointment…" sub="Reserving the slot and sending confirmations" />}
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

// ─── Manage Tab (unchanged) ──────────────────────────────────
function ManageTab({ onBook }) {
  const [creds, setCreds] = useState({ patientPhone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ date: '', time: '', petName: '', reason: '' });
  const [slots, setSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState('');

  const updateCred = (k) => (e) => {
    const v = k === 'patientPhone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setCreds((c) => ({ ...c, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validateCreds = () => {
    const e = {};
    if (!/^\d{10}$/.test(creds.patientPhone.trim())) e.patientPhone = 'Enter the 10-digit mobile number you booked with';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creds.email.trim())) e.email = 'Enter the email you booked with';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const search = async (e) => {
    e?.preventDefault();
    if (!validateCreds()) return toast.error('Please fix the highlighted fields');

    setSearching(true);
    setEditing(null);
    try {
      const res = await fetch(`${API_URL}/api/appointments/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientPhone: creds.patientPhone.trim(), email: creds.email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Could not find your appointments');
        return;
      }
      setAppointments(data.appointments || []);
      setSearched(true);
      if ((data.appointments || []).length === 0) {
        toast('No appointments found for those details', { icon: '🔍' });
      } else {
        toast.success(`Found ${data.count} appointment${data.count === 1 ? '' : 's'}`);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const openEditor = (appt) => {
    setEditing(appt.id);
    setDraft({ date: appt.date || '', time: appt.time || '', petName: appt.petName || '', reason: appt.reason || '' });
  };

  useEffect(() => {
    if (!editing || !draft.date) return;
    const appt = appointments.find((a) => a.id === editing);
    if (!appt) return;

    (async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`${API_URL}/api/appointments/booked-slots?date=${draft.date}&hospitalId=${appt.hospitalId || ''}`);
        const data = await res.json();
        const booked = res.ok && Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
        setSlots(draft.date === appt.date ? booked.filter((s) => s !== appt.time) : booked);
        setAvailableSlots(res.ok && Array.isArray(data.availableSlots) ? data.availableSlots : []);
      } catch (e) {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [editing, draft.date, appointments]);

  const saveReschedule = async (appt) => {
    if (!draft.date || !draft.time) return toast.error('Pick both a new date and a time');
    if (slots.includes(draft.time)) return toast.error('That slot is already booked. Please pick another time.');

    setBusyId(appt.id);
    setBusyAction('reschedule');
    try {
      const res = await fetch(`${API_URL}/api/appointments/public/${appt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientPhone: creds.patientPhone.trim(),
          email: creds.email.trim(),
          date: draft.date,
          time: draft.time,
          petName: draft.petName,
          reason: draft.reason
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not reschedule');

      setAppointments((prev) => prev.map((a) => (a.id === appt.id ? data.appointment : a)));
      setEditing(null);
      toast.success('Appointment rescheduled 📅');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  const confirmCancel = (appt) => {
    toast((t) => (
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200 max-w-sm mx-auto text-sm">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-gray-900">
            Cancel your appointment at <span className="font-bold">{appt.hospital}</span>
            {appt.date ? ` on ${formatDate(appt.date)}` : ''}?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 font-bold transition"
            onClick={() => { doCancel(appt); toast.dismiss(t.id); }}
          >
            Yes, cancel it
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-4 py-2 font-bold transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Keep it
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const doCancel = async (appt) => {
    setBusyId(appt.id);
    setBusyAction('cancel');
    try {
      const res = await fetch(`${API_URL}/api/appointments/public/${appt.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientPhone: creds.patientPhone.trim(),
          email: creds.email.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not cancel');

      setAppointments((prev) => prev.map((a) => (a.id === appt.id ? data.appointment : a)));
      setEditing(null);
      toast.success('Appointment cancelled');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="rounded-2xl border border-gray-200 bg-slate-50 p-5 space-y-4">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-medical-blue shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            For your security we only show bookings that match <strong>both</strong> the mobile number and the email address
            used when booking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={Phone} label="Mobile number (10-digit) *" error={errors.patientPhone}>
            <input
              value={creds.patientPhone}
              onChange={updateCred('patientPhone')}
              inputMode="numeric"
              maxLength={10}
              className="portal-input"
              placeholder="9876543210"
            />
          </Field>
          <Field icon={Mail} label="Email address *" error={errors.email}>
            <input
              type="email"
              value={creds.email}
              onChange={updateCred('email')}
              className="portal-input"
              placeholder="you@example.com"
            />
          </Field>
        </div>

        <button type="submit" disabled={searching} className="btn btn-primary btn-md w-full">
          {searching ? <><Loader size="sm" className="text-white" /> Searching…</> : <><Search className="w-4 h-4" /> Find my appointments</>}
        </button>
      </form>

      {searching && <ListSkeleton rows={3} />}

      {!searching && searched && appointments.length === 0 && (
        <div className="text-center py-10">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-700">No appointments found</p>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
            Double-check the mobile number and email — they must match exactly what you entered when booking.
          </p>
          <button onClick={onBook} className="btn btn-outline btn-md mt-6">
            <CalendarPlus className="w-4 h-4" /> Book a new appointment
          </button>
        </div>
      )}

      {!searching && appointments.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700">
            {appointments.length} appointment{appointments.length === 1 ? '' : 's'} found
          </p>

          {appointments.map((appt) => {
            const isEditing = editing === appt.id;
            const isBusy = busyId === appt.id;

            return (
              <motion.div
                key={appt.id}
                layout
                className={`rounded-2xl border bg-white p-5 transition ${
                  appt.canModify ? 'border-gray-200 hover:border-medical-blue/40' : 'border-gray-100 opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-medical-dark">{appt.hospital || 'Hospital'}</h3>
                      <span className={`pill ${STATUS_PILL[appt.status] || 'bg-gray-100 text-gray-700'}`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-medical-blue" /> {formatDate(appt.date)}
                        {appt.time && <><span className="text-gray-300">·</span><Clock className="w-3.5 h-3.5 text-medical-blue" /> {appt.time}</>}
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-medical-blue" /> {appt.patientName}
                        {appt.petName && <><span className="text-gray-300">·</span><PawPrint className="w-3.5 h-3.5 text-medical-blue" /> {appt.petName}</>}
                      </p>
                      {appt.reason && (
                        <p className="flex items-start gap-2 text-xs text-gray-500">
                          <MessageSquare className="w-3.5 h-3.5 text-medical-blue shrink-0 mt-0.5" /> {appt.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {appt.canModify ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditing(null) : openEditor(appt))}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white transition disabled:opacity-50"
                      >
                        {isEditing ? <><RotateCcw className="w-3.5 h-3.5" /> Close</> : <><CalendarClock className="w-3.5 h-3.5" /> Reschedule</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmCancel(appt)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                      >
                        {isBusy && busyAction === 'cancel'
                          ? <Loader size="xs" />
                          : <XCircle className="w-3.5 h-3.5" />} Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 shrink-0">
                      {appt.status === 'Cancelled' ? 'Cancelled' : 'Completed'} — no changes possible
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
                      <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field icon={Calendar} label="New date *">
                            <input
                              type="date"
                              value={draft.date}
                              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value, time: '' }))}
                              className="portal-input"
                            />
                          </Field>
                          <Field icon={PawPrint} label="Pet name">
                            <input
                              value={draft.petName}
                              onChange={(e) => setDraft((d) => ({ ...d, petName: e.target.value }))}
                              className="portal-input"
                              placeholder="Bruno"
                            />
                          </Field>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-medical-blue" /> New time *</span>
                            {draft.time && (
                              <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                Selected: {draft.time}
                              </span>
                            )}
                          </label>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                            <SlotSelector
                              date={draft.date}
                              hospitalId={activeAppt?.hospitalId}
                              selectedTime={draft.time || '10:00'}
                              onSelectTime={(slot) => setDraft((d) => ({ ...d, time: slot }))}
                              showClock={true}
                            />
                          </div>
                        </div>

                        <Field icon={MessageSquare} label="Reason / description">
                          <textarea
                            value={draft.reason}
                            onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
                            rows={2}
                            className="portal-input resize-none"
                            placeholder="Anything the hospital should know…"
                          />
                        </Field>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => saveReschedule(appt)}
                            disabled={isBusy}
                            className="btn btn-primary btn-md flex-1"
                          >
                            {isBusy && busyAction === 'reschedule'
                              ? <><Loader size="sm" className="text-white" /> Saving…</>
                              : <><CalendarClock className="w-4 h-4" /> Confirm new slot</>}
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="btn btn-outline btn-md">
                            Cancel edit
                          </button>
                        </div>

                        <p className="text-xs text-gray-400">
                          Rescheduling sets the booking back to <strong>Pending</strong> so the hospital can confirm the new slot.
                          You’ll get an email either way.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          <button onClick={search} disabled={searching} className="btn btn-outline btn-md w-full">
            <RotateCcw className="w-4 h-4" /> Refresh list
          </button>
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
      // Require at least 1 hour in advance
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
      {/* Legend & Availability counter */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500 font-medium px-0.5">
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 text-[10px]">
          {availableCount} {availableCount === 1 ? 'slot' : 'slots'} open
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Open</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Past</span>
        </div>
      </div>

      {/* Grid of Slots */}
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
              className={`group flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border transition-all text-center min-h-[44px] ${
                isPast
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : bookedMatch
                  ? 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed opacity-90 shadow-xs'
                  : isSelected
                  ? 'bg-gradient-to-br from-medical-blue to-blue-700 text-white border-blue-600 shadow-md ring-2 ring-blue-300/60 font-bold scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-medical-blue hover:bg-blue-50/60 hover:shadow-xs hover:text-medical-blue'
              }`}
              title={
                isPast
                  ? 'Time slot has already passed'
                  : bookedMatch
                  ? 'This slot is already booked in the hospital calendar'
                  : `Click to select ${slot}`
              }
            >
              <span className={`text-xs sm:text-sm leading-tight font-bold ${
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
      <span className="portal-label"><Icon className="w-4 h-4 text-medical-blue" /> {label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}