import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Building2, Mail, Calendar, Clock, MessageSquare, PawPrint,
  ArrowRight, CheckCircle2, Stethoscope, Search, CalendarClock, XCircle,
  Inbox, ShieldCheck, AlertTriangle, RotateCcw, CalendarPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import PortalCardPage from '../../components/portal/PortalCardPage';
import Loader, { ListSkeleton, OverlayLoader } from '../../components/Loader';

const initial = { patientName: '', patientPhone: '', hospitalId: '', email: '', date: '', time: '', petName: '', description: '' };
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const STATUS_PILL = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const formatDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  // Deep links from a hospital profile arrive as /appointment?hospitalId=…
  const presetHospitalId = searchParams.get('hospitalId') || '';

  const [tab, setTab] = useState(searchParams.get('tab') === 'manage' ? 'manage' : 'book');
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
    <PortalCardPage
      icon={Stethoscope}
      title={tab === 'book' ? 'Book an Appointment' : 'Manage Your Appointment'}
      subtitle={
        tab === 'book'
          ? 'Fill in the details and the hospital you choose will confirm your visit.'
          : 'Enter the mobile number and email you booked with to reschedule or cancel.'
      }
      wide
    >
      {/* ─── Tabs ─────────────────────────────────────────── */}
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
    </PortalCardPage>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — Book a new appointment
   ═══════════════════════════════════════════════════════════ */
function BookTab({ hospitals, presetHospitalId, onManage }) {
  const [form, setForm] = useState({ ...initial, hospitalId: presetHospitalId });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const update = (k) => (e) => {
    const v = k === 'patientPhone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  useEffect(() => {
    if (!form.date) return;
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`${API_URL}/api/appointments/booked-slots?date=${form.date}&hospitalId=${form.hospitalId || ''}`);
        const data = await res.json();
        setBookedSlots(res.ok && Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
      } catch (e) {
        console.error('Could not fetch booked slots:', e);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [form.date, form.hospitalId]);

  const validate = () => {
    const e = {};
    if (!form.patientName.trim()) e.patientName = 'Patient name is required';
    if (!form.patientPhone.trim()) e.patientPhone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.patientPhone.trim())) e.patientPhone = 'Enter a valid 10-digit mobile number';
    if (!form.hospitalId) e.hospitalId = 'Please select a hospital';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.time && bookedSlots.includes(form.time)) e.time = 'That slot is already booked. Please choose an available time.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix the highlighted fields');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not book appointment');
      setDone(true);
      toast.success('Appointment booked! 🐾');
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
          <button onClick={() => { setForm({ ...initial, hospitalId: presetHospitalId }); setDone(false); }} className="btn btn-primary btn-md">
            Book another appointment
          </button>
          <button onClick={onManage} className="btn btn-outline btn-md">
            <CalendarClock className="w-4 h-4" /> Manage bookings
          </button>
        </div>
      </motion.div>
    );
  }

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
          <Field icon={PawPrint} label="Pet name">
            <input value={form.petName} onChange={update('petName')} className="portal-input" placeholder="Bruno" />
          </Field>

          <Field icon={Mail} label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={update('email')} className="portal-input" placeholder="you@example.com" />
          </Field>
          <Field icon={Calendar} label="Preferred date">
            <input type="date" value={form.date} onChange={update('date')} className="portal-input" />
          </Field>

          <Field icon={Clock} label="Preferred time *" error={errors.time}>
            <input type="time" value={form.time} onChange={update('time')} className="portal-input mb-2" />
            {form.date && (
              <div className="mt-2">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1.5">
                  Available Slots {loadingSlots && <Loader size="xs" label="checking calendar…" />}
                </span>
                <SlotGrid
                  slots={SLOTS}
                  booked={bookedSlots}
                  selected={form.time}
                  onSelect={(slot) => {
                    setForm((f) => ({ ...f, time: slot }));
                    setErrors((p) => ({ ...p, time: undefined }));
                  }}
                />
              </div>
            )}
          </Field>
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
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — Look up, reschedule and cancel existing bookings
   ═══════════════════════════════════════════════════════════ */
function ManageTab({ onBook }) {
  const [creds, setCreds] = useState({ patientPhone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appointments, setAppointments] = useState([]);

  // Reschedule editor
  const [editing, setEditing] = useState(null); // appointment id
  const [draft, setDraft] = useState({ date: '', time: '', petName: '', reason: '' });
  const [slots, setSlots] = useState([]);
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

  // ─── Fetch every booking for this phone + email ───────────
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

  // ─── Reschedule ───────────────────────────────────────────
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
        // The slot this booking already holds isn't a conflict for itself.
        const booked = res.ok && Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
        setSlots(draft.date === appt.date ? booked.filter((s) => s !== appt.time) : booked);
      } catch {
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

  // ─── Cancel ───────────────────────────────────────────────
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
      {/* Lookup form */}
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

      {/* Results */}
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
                {/* Summary */}
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

                  {/* Actions */}
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

                {/* Reschedule editor */}
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
                                slots={SLOTS}
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

/* ─── Shared bits ───────────────────────────────────────── */
function SlotGrid({ slots, booked, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {slots.map((slot) => {
        const isBooked = booked.includes(slot);
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            type="button"
            disabled={isBooked}
            onClick={() => onSelect(slot)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              isBooked
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                : isSelected
                ? 'bg-medical-blue text-white border-medical-blue shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-medical-blue'
            }`}
            title={isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
          >
            {slot} {isBooked ? '(Booked)' : ''}
          </button>
        );
      })}
    </div>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="portal-label"><Icon className="w-4 h-4 text-medical-blue" /> {label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
