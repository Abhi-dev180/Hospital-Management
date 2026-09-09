
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Building2, Mail, Calendar, Clock, MessageSquare, PawPrint,
  ArrowRight, CheckCircle2, Stethoscope, Search, CalendarClock, XCircle,
  Inbox, ShieldCheck, AlertTriangle, RotateCcw, CalendarPlus,
  ChevronLeft, ChevronRight, Venus, Mars, Dog, Cat, Bird, Rabbit
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import Loader, { ListSkeleton, OverlayLoader } from '../../components/Loader';
import AppointmentPaymentModal from '../AppointmentPaymentModal';

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
  const [form, setForm] = useState({ ...initialForm, hospitalId: presetHospitalId });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
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

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!form.date) return;
    (async () => {
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
    })();
  }, [form.date, form.hospitalId]);

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
    const dateTime = new Date(`${form.date}T${form.time}:00`);
    const now = new Date();
    const diffMs = dateTime - now;
    return diffMs >= 3600000;
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

  // ─── Email validation (now required) ──────────────────────
  if (!form.email) {
    e.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    e.email = 'Enter a valid email';
  }

  // ─── Species & Sex (required) ─────────────────────────────
  if (!form.species) e.species = 'Please select a species';
  if (!form.sex) e.sex = 'Please select sex';
  // petName is optional – no validation needed

  // ─── Date / Time ───────────────────────────────────────────
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
      setDone(true);
      toast.success('Appointment booked & paid! 🐾');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const hospitalName = hospitals.find((h) => String(h.id) === String(form.hospitalId))?.name;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-5" />
        <h2 className="text-2xl font-extrabold text-medical-dark">Appointment booked! 🎉</h2>
        <p className="text-gray-600 mt-3">
          Thanks, {form.patientName}! Your request for <strong>{hospitalName}</strong> has been sent.
          The hospital will confirm your appointment shortly.
        </p>
        {form.email && (
          <p className="text-sm text-gray-500 mt-3">
            A confirmation has been emailed to <strong>{form.email}</strong>. Use that email and your mobile number on the
            “Cancel / Reschedule” tab any time you need to change this visit.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button onClick={() => { setForm({ ...initialForm, hospitalId: presetHospitalId }); setDone(false); }} className="btn btn-primary btn-md">
            Book another appointment
          </button>
          <button onClick={onManage} className="btn btn-outline btn-md">
            <CalendarClock className="w-4 h-4" /> Manage bookings
          </button>
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
                  slots={availableSlots}
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

                        <Field icon={Clock} label="New time *">
                          <input
                            type="time"
                            value={draft.time}
                            onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                            className="portal-input mb-2"
                          />
                          {draft.date && (
                            <div className="mt-2">
                              <span className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1.5">
                                Available Slots {loadingSlots && <Loader size="xs" label="checking…" />}
                              </span>
                              <SlotGrid
                                date={draft.date}
                                slots={availableSlots}
                                booked={slots}
                                selected={draft.time}
                                onSelect={(slot) => setDraft((d) => ({ ...d, time: slot }))}
                              />
                            </div>
                          )}
                        </Field>

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
// function SlotGrid({ slots, booked, selected, onSelect }) {
//   return (
//     <div className="flex flex-wrap gap-1.5">
//       {slots.map((slot) => {
//         const isBooked = booked.includes(slot);
//         const isSelected = selected === slot;
//         return (
//           <button
//             key={slot}
//             type="button"
//             disabled={isBooked}
//             onClick={() => onSelect(slot)}
//             className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
//               isBooked
//                 ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through'
//                 : isSelected
//                 ? 'bg-green-600 text-white border-green-600 shadow-md'
//                 : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50'
//             }`}
//             title={isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
//           >
//             {slot}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// function SlotGrid({ slots, booked, selected, onSelect }) {
//   return (
//     <div className="grid grid-cols-5 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
//       {slots.map((slot) => {
//         const isBooked = booked.includes(slot);
//         const isSelected = selected === slot;
//         return (
//           <button
//             key={slot}
//             type="button"
//             disabled={isBooked}
//             onClick={() => onSelect(slot)}
//             className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
//               isBooked
//                 ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through'
//                 : isSelected
//                 ? 'bg-green-600 text-white border-green-600 shadow-md'
//                 : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50'
//             }`}
//             title={isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
//           >
//             {slot}
//           </button>
//         );
//       })}
//     </div>
//   );
// }


// ─── Slot Grid ───────────────────────────────────────────────
function SlotGrid({ slots, booked, selected, onSelect, date }) {
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

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-1.5 w-full">
      {slots.map((slot) => {
        const isPast = isPastSlot(slot);
        const isBooked = (booked && booked.includes(slot)) || isPast;
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            type="button"
            disabled={isBooked}
            onClick={() => onSelect(slot)}
            className={`px-1.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition whitespace-nowrap ${
              isPast
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through opacity-50'
                : isBooked
                ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through'
                : isSelected
                ? 'bg-green-600 text-white border-green-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
            title={isPast ? 'Slot has already passed' : isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
          >
            {slot}
          </button>
        );
      })}
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