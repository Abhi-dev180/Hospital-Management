
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Edit3, X, CheckCircle2, Loader2,
  Phone, PhoneOff, Plus, MessageSquareText, Calendar, Clock,
  Link2, Hash, Mail, Phone as PhoneIcon, User, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Loader';
import { useWebSocket } from '../../hooks/useWebSocket';

const PER_PAGE = 6;
const STATUSES = ['Pending', 'Completed'];

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', staggerChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28 } }
};

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } }
};

const modalPanel = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.18 } }
};

export default function AdminAppointmentFeedback() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    patientName: '', petName: '', appointmentType: 'Consult',
    date: '', time: '', feedbackStatus: 'Pending',
    feedbackGiven: false, callAttempted: false, callPicked: false, feedbackText: ''
  });
  const [saving, setSaving] = useState(false);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) return;
    const parsed = JSON.parse(u);
    if (parsed.role !== 'admin' && parsed.role !== 'superadmin') return;
    setUser(parsed);
    fetchRows();
    fetchAppointments();
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/appointment-feedbacks`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to load');
      setRows(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setAppointments(Array.isArray(data) ? data : []);
    } catch {}
  };

  // ─── Real-Time WebSocket Updates ─────────────────────────────
  useWebSocket("feedback_created", (newFeedback) => {
    if (user?.role === 'admin' && String(newFeedback.hospitalId) !== String(user.hospitalId)) return;
    setRows((prev) => {
      if (prev.some(r => r.id === newFeedback.id)) return prev;
      return [newFeedback, ...prev];
    });
    toast.success(`New feedback from ${newFeedback.patientName}`);
  });

  useWebSocket("feedback_updated", (updatedFeedback) => {
    if (user?.role === 'admin' && String(updatedFeedback.hospitalId) !== String(user.hospitalId)) return;
    setRows((prev) => prev.map(r => r.id === updatedFeedback.id ? updatedFeedback : r));
  });

  useWebSocket("feedback_deleted", ({ id }) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      patientName: '', petName: '', appointmentType: 'Consult',
      date: '', time: '', feedbackStatus: 'Pending',
      feedbackGiven: false, callAttempted: false, callPicked: false, feedbackText: ''
    });
    setShowModal(true);
  };

  const openEdit = (fb) => {
    setEditing(fb);
    setForm({
      patientName: fb.patientName || '',
      petName: fb.petName || '',
      appointmentType: fb.appointmentType || 'Consult',
      date: fb.date || '',
      time: fb.time || '',
      feedbackStatus: fb.feedbackStatus || 'Pending',
      feedbackGiven: fb.feedbackGiven || false,
      callAttempted: fb.callAttempted || false,
      callPicked: fb.callPicked || false,
      feedbackText: fb.feedbackText || ''
    });
    setShowModal(true);
  };

  const handlePrefill = (appointmentId) => {
    const app = appointments.find(a => a.id === appointmentId);
    if (!app) return;
    setForm({
      patientName: app.patientName || '',
      petName: app.petName || '',
      appointmentType: app.appointmentType || 'Consult',
      date: app.date || '',
      time: app.time || '',
      feedbackStatus: 'Pending',
      feedbackGiven: false,
      callAttempted: false,
      callPicked: false,
      feedbackText: ''
    });
    toast.success('Form prefilled from appointment');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.date) return toast.error('Patient name and date required');
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing
        ? `${API_URL}/api/appointment-feedbacks/${editing.id}`
        : `${API_URL}/api/appointment-feedbacks`;
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Save failed');
      toast.success(editing ? 'Updated successfully' : 'Created successfully');
      setShowModal(false);
      fetchRows();
    } catch {
      toast.error('Save error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      const matchStatus = statusFilter === 'all' || r.feedbackStatus === statusFilter;
      const matchSearch = !q || [r.patientName, r.petName, r.appointmentType, r.email, r.patientPhone].join(' ').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [rows, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  useEffect(() => setPage(1), [search, statusFilter]);

  return (
    <div className="w-full px-2 sm:px-3 py-4 space-y-4">
      <DashboardTabs role="admin" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="w-full bg-white/90 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
      >
      {/* Header Section - Fully responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30">
            <MessageSquareText size={22} className="sm:size-[26px]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Appointment Feedback</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage and track client responses seamlessly</p>
          </div>
        </div>

        {/* Action Bar - Fully responsive stack on mobile */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 w-full min-w-[140px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient, pet..."
              className="w-full pl-9 pr-3 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl bg-white text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={fetchRows}
            className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 shadow-sm transition-all active:scale-95"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Feedback</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Table Container - Responsive Overflow */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        // ✅ REMOVED 'min-w-[1200px]' and added 'overflow-x-auto' for seamless mobile scrolling
        <div className="w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-50/50 text-slate-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">ID</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">Appt #</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap min-w-[150px]">Patient Details</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">Pet Name</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">Type</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap min-w-[100px]">Schedule</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">Status</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">Feedback</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 whitespace-nowrap">Call Status</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((r, idx) => (
                <motion.tr
                  key={r.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
                  }}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="py-3 px-3 sm:py-4 sm:px-6 text-slate-400 font-mono text-[10px] sm:text-xs font-semibold">#{r.id}</td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    {r.appointmentNumber ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] sm:text-xs font-semibold font-mono">
                        <Hash size={10} />
                        {r.appointmentNumber}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{r.patientName}</span>
                      {r.email && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px]">
                          <Mail size={10} className="text-slate-400 shrink-0" />
                          {r.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      {r.petName ? (
                        <>
                          <User size={12} className="text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700 text-xs sm:text-sm">{r.petName}</span>
                        </>
                      ) : (
                        <span className="text-slate-300 text-xs sm:text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <span className="inline-flex px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                      {r.appointmentType}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <div className="flex flex-col text-[10px] sm:text-xs font-medium text-slate-600 gap-0.5">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar size={11} className="text-slate-400" />
                        {r.date}
                      </span>
                      {r.time && (
                        <span className="flex items-center gap-1 text-slate-400 whitespace-nowrap">
                          <Clock size={11} />
                          {r.time}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <span className={`inline-flex px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${
                      r.feedbackStatus === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {r.feedbackStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    {r.feedbackGiven ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px] sm:text-xs whitespace-nowrap">
                        <CheckCircle2 size={12} /> Given
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[10px] sm:text-xs whitespace-nowrap">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    {r.callAttempted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md sm:rounded-lg border border-blue-100 whitespace-nowrap">
                        <Phone size={10} /> Attempted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md sm:rounded-lg whitespace-nowrap">
                        <PhoneOff size={10} /> Not called
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="inline-flex items-center justify-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shadow-sm transition-all"
                      title="Edit"
                    >
                      <Edit3 size={14} className="sm:size-[16px]" />
                    </button>
                  </td>
                </motion.tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 sm:py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText size={32} className="sm:size-[48px] opacity-30" />
                      <p className="text-sm font-medium">No feedback records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6">
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
      </div>
    </motion.div>

    {/* Modal Popup - Fully Responsive */}
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl sm:max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-8 border border-white/50"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {editing ? 'Edit Feedback Record' : 'Create New Feedback'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                  Fill out the information below
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
              >
                <X size={16} className="sm:size-[18px]" />
              </button>
            </div>

            {!editing && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1.5 sm:mb-2">
                  <Link2 size={12} className="sm:size-[14px] inline mr-1" /> Quick Prefill From Appointment
                </label>
                <select
                  onChange={e => handlePrefill(e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-blue-200 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="">Select an existing appointment…</option>
                  {appointments.map(app => (
                    <option key={app.id} value={app.id}>
                      #{app.appointment_number || '—'} – {app.patientName} – {app.date} {app.time}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3 sm:space-y-4">
              {/* ✅ Changed to 1 column on mobile, 2 columns on tablet/desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Pet Name</label>
                  <input
                    type="text"
                    value={form.petName}
                    onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="e.g. Max"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Appointment Type</label>
                  <input
                    type="text"
                    value={form.appointmentType}
                    onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="e.g. Consult"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Feedback Status</label>
                  <select
                    value={form.feedbackStatus}
                    onChange={e => setForm(f => ({ ...f, feedbackStatus: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Toggle label="Feedback Given" checked={form.feedbackGiven} onChange={v => setForm(f => ({ ...f, feedbackGiven: v }))} />
                <Toggle label="Call Attempted" checked={form.callAttempted} onChange={v => setForm(f => ({ ...f, callAttempted: v }))} />
                <Toggle label="Call Picked" checked={form.callPicked} onChange={v => setForm(f => ({ ...f, callPicked: v }))} />
              </div>

              <div className="pt-1 sm:pt-2">
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Feedback Notes</label>
                <textarea
                  rows={3}
                  value={form.feedbackText}
                  onChange={e => setForm(f => ({ ...f, feedbackText: e.target.value }))}
                  placeholder="Enter feedback details or comments…"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 border border-slate-200 rounded-full font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 disabled:opacity-60 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {saving ? <Loader2 className="animate-spin w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span>{saving ? 'Saving...' : editing ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-sm">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
      </label>
    </div>
  );
}