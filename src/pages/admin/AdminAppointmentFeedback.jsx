
// import { useEffect, useMemo, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Search, RefreshCw, Edit3, X, CheckCircle2, Loader2,
//   Phone, PhoneOff, Plus
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import Pagination from '../../components/Pagination';

// const PER_PAGE = 6;
// const STATUSES = ['Pending', 'Completed'];

// const pageVariants = {
//   hidden: { opacity: 0, y: 18 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.35, ease: 'easeOut', staggerChildren: 0.06 }
//   }
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 14, scale: 0.99 },
//   visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28 } }
// };

// const rowVariants = {
//   hidden: { opacity: 0, y: 8 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
// };

// const modalBackdrop = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.22 } },
//   exit: { opacity: 0, transition: { duration: 0.18 } }
// };

// const modalPanel = {
//   hidden: { opacity: 0, scale: 0.96, y: 20 },
//   visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
//   exit: { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.18 } }
// };

// export default function AdminAppointmentFeedback() {
//   const [user, setUser] = useState(null);
//   const [rows, setRows] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [page, setPage] = useState(1);

//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({
//     patientName: '', petName: '', appointmentType: 'Consult',
//     date: '', time: '', feedbackStatus: 'Pending',
//     feedbackGiven: false, callAttempted: false, callPicked: false, feedbackText: ''
//   });
//   const [saving, setSaving] = useState(false);

//   const authHeaders = () => ({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   });

//   useEffect(() => {
//     const u = localStorage.getItem('user');
//     if (!u) return;
//     const parsed = JSON.parse(u);
//     if (parsed.role !== 'admin' && parsed.role !== 'superadmin') return;
//     setUser(parsed);
//     fetchRows();
//     fetchAppointments();
//   }, []);

//   const fetchRows = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/appointment-feedbacks`, { headers: authHeaders() });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Failed to load');
//       setRows(Array.isArray(data) ? data : []);
//     } catch {
//       toast.error('Network error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAppointments = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/appointments`, { headers: authHeaders() });
//       const data = await res.json();
//       if (res.ok) setAppointments(Array.isArray(data) ? data : []);
//     } catch {
//     }
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm({
//       patientName: '', petName: '', appointmentType: 'Consult',
//       date: '', time: '', feedbackStatus: 'Pending',
//       feedbackGiven: false, callAttempted: false, callPicked: false, feedbackText: ''
//     });
//     setShowModal(true);
//   };

//   const openEdit = (fb) => {
//     setEditing(fb);
//     setForm({
//       patientName: fb.patientName || '',
//       petName: fb.petName || '',
//       appointmentType: fb.appointmentType || 'Consult',
//       date: fb.date || '',
//       time: fb.time || '',
//       feedbackStatus: fb.feedbackStatus || 'Pending',
//       feedbackGiven: fb.feedbackGiven || false,
//       callAttempted: fb.callAttempted || false,
//       callPicked: fb.callPicked || false,
//       feedbackText: fb.feedbackText || ''
//     });
//     setShowModal(true);
//   };

//   const handlePrefill = (appointmentId) => {
//     const app = appointments.find(a => a.id === appointmentId);
//     if (!app) return;
//     setForm({
//       patientName: app.patientName || '',
//       petName: app.petName || '',
//       appointmentType: app.appointmentType || 'Consult',
//       date: app.date || '',
//       time: app.time || '',
//       feedbackStatus: 'Pending',
//       feedbackGiven: false,
//       callAttempted: false,
//       callPicked: false,
//       feedbackText: ''
//     });
//     toast.success('Form prefilled from appointment');
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!form.patientName || !form.date) return toast.error('Patient name and date required');
//     setSaving(true);
//     try {
//       const method = editing ? 'PUT' : 'POST';
//       const url = editing
//         ? `${API_URL}/api/appointment-feedbacks/${editing.id}`
//         : `${API_URL}/api/appointment-feedbacks`;
//       const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Save failed');
//       toast.success(editing ? 'Updated' : 'Created');
//       setShowModal(false);
//       fetchRows();
//     } catch {
//       toast.error('Save error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return rows.filter(r => {
//       const matchStatus = statusFilter === 'all' || r.feedbackStatus === statusFilter;
//       const matchSearch = !q || [r.patientName, r.petName, r.appointmentType].join(' ').toLowerCase().includes(q);
//       return matchStatus && matchSearch;
//     });
//   }, [rows, search, statusFilter]);

//   const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
//   useEffect(() => setPage(1), [search, statusFilter]);

//   return (
//     <DashboardLayout >
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={pageVariants}
//         className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 sm:p-6"
//       >
//         <motion.div
//           variants={cardVariants}
//           className="bg-white/95 backdrop-blur-xl p-5 sm:p-8 rounded-3xl shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] border border-white/70 ring-1 ring-slate-100"
//         >
//           <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Feedback</h2>
//               <p className="text-sm text-slate-500 mt-1">{filtered.length} of {rows.length} records</p>
//             </div>

//             <div className="flex flex-wrap gap-3 items-center">
//               <div className="relative w-full sm:w-72">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   placeholder="Search patient, pet…"
//                   className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full bg-slate-50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
//                 />
//               </div>

//               <select
//                 value={statusFilter}
//                 onChange={e => setStatusFilter(e.target.value)}
//                 className="px-4 py-2.5 border border-slate-200 rounded-full bg-slate-50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
//               >
//                 <option value="all">All Status</option>
//                 {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>

//               <button
//                 onClick={fetchRows}
//                 className="bg-white border border-slate-200 px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 hover:shadow-sm transition"
//               >
//                 <RefreshCw size={16} />
//                 Refresh
//               </button>

//               <button
//                 onClick={openCreate}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
//               >
//                 <Plus size={16} />
//                 Add Feedback
//               </button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="py-20 text-center text-slate-500">
//               <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-blue-500" />
//               Loading…
//             </div>
//           ) : (
//             <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
//               <table className="w-full text-left border-collapse min-w-[900px]">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-slate-50 to-blue-50 text-slate-700 text-sm">
//                     <th className="py-4 px-4 font-semibold">ID</th>
//                     <th className="py-4 px-4 font-semibold">Patient</th>
//                     <th className="py-4 px-4 font-semibold">Pet</th>
//                     <th className="py-4 px-4 font-semibold">Appt Type</th>
//                     <th className="py-4 px-4 font-semibold">Date</th>
//                     <th className="py-4 px-4 font-semibold">Time</th>
//                     <th className="py-4 px-4 font-semibold">Status</th>
//                     <th className="py-4 px-4 font-semibold">Feedback Given</th>
//                     <th className="py-4 px-4 font-semibold">Call</th>
//                     <th className="py-4 px-4 font-semibold text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginated.map((r, idx) => (
//                     <motion.tr
//                       key={r.id}
//                       variants={rowVariants}
//                       initial="hidden"
//                       animate="visible"
//                       transition={{ delay: idx * 0.03 }}
//                       className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm"
//                     >
//                       <td className="py-4 px-4 text-slate-500 font-mono">{r.id}</td>
//                       <td className="py-4 px-4 font-medium text-slate-900">{r.patientName}</td>
//                       <td className="py-4 px-4 text-slate-700">{r.petName || '—'}</td>
//                       <td className="py-4 px-4">
//                         <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-semibold">
//                           {r.appointmentType}
//                         </span>
//                       </td>
//                       <td className="py-4 px-4 text-slate-700">{r.date}</td>
//                       <td className="py-4 px-4 text-slate-700">{r.time || '—'}</td>
//                       <td className="py-4 px-4">
//                         <span
//                           className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
//                             r.feedbackStatus === 'Completed'
//                               ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
//                               : 'bg-amber-50 text-amber-700 border border-amber-100'
//                           }`}
//                         >
//                           {r.feedbackStatus}
//                         </span>
//                       </td>
//                       <td className="py-4 px-4 text-slate-700">{r.feedbackGiven ? '✔ Yes' : '✘ No'}</td>
//                       <td className="py-4 px-4">
//                         {r.callAttempted ? (
//                           <span className="flex items-center gap-1.5 text-blue-600 font-medium">
//                             <Phone size={14} />
//                             Yes
//                           </span>
//                         ) : (
//                           <span className="flex items-center gap-1.5 text-slate-400 font-medium">
//                             <PhoneOff size={14} />
//                             No
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-4 px-4 text-right">
//                         <button
//                           onClick={() => openEdit(r)}
//                           className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-xl transition"
//                         >
//                           <Edit3 size={15} />
//                         </button>
//                       </td>
//                     </motion.tr>
//                   ))}

//                   {filtered.length === 0 && (
//                     <tr>
//                       <td colSpan={10} className="py-14 text-center text-slate-500 italic">
//                         No feedback records
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           <div className="mt-5">
//             <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
//           </div>
//         </motion.div>
//       </motion.div>

//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
//             variants={modalBackdrop}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               variants={modalPanel}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               onClick={e => e.stopPropagation()}
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-white/70"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-2xl font-bold text-slate-900">
//                     {editing ? 'Edit Feedback' : 'New Feedback'}
//                   </h3>
//                   <p className="text-sm text-slate-500 mt-1">
//                     Update appointment feedback details smoothly.
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               {!editing && (
//                 <div className="mb-5">
//                   <label className="block text-sm font-medium mb-2 text-slate-700">Prefill from existing appointment</label>
//                   <select
//                     onChange={e => handlePrefill(e.target.value)}
//                     defaultValue=""
//                     className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                   >
//                     <option value="">Select an appointment…</option>
//                     {appointments.map(app => (
//                       <option key={app.id} value={app.id}>
//                         {app.patientName} – {app.date} {app.time}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <form onSubmit={submit} className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Patient Name *</label>
//                     <input
//                       type="text"
//                       value={form.patientName}
//                       onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Pet Name</label>
//                     <input
//                       type="text"
//                       value={form.petName}
//                       onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Appointment Type</label>
//                     <input
//                       type="text"
//                       value={form.appointmentType}
//                       onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Date *</label>
//                     <input
//                       type="date"
//                       value={form.date}
//                       onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Time</label>
//                     <input
//                       type="time"
//                       value={form.time}
//                       onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Feedback Status</label>
//                     <select
//                       value={form.feedbackStatus}
//                       onChange={e => setForm(f => ({ ...f, feedbackStatus: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     >
//                       {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   <Toggle label="Feedback Given" checked={form.feedbackGiven} onChange={v => setForm(f => ({ ...f, feedbackGiven: v }))} />
//                   <Toggle label="Call Attempted" checked={form.callAttempted} onChange={v => setForm(f => ({ ...f, callAttempted: v }))} />
//                   <Toggle label="Call Picked" checked={form.callPicked} onChange={v => setForm(f => ({ ...f, callPicked: v }))} />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1.5 text-slate-700">Feedback Notes</label>
//                   <textarea
//                     rows={3}
//                     value={form.feedbackText}
//                     onChange={e => setForm(f => ({ ...f, feedbackText: e.target.value }))}
//                     placeholder="Any additional comments…"
//                     className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                   />
//                 </div>

//                 <div className="flex justify-end gap-3 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="px-5 py-2.5 border border-slate-200 rounded-full font-semibold text-slate-600 hover:bg-slate-50 transition"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-60 hover:shadow-blue-500/30 transition"
//                   >
//                     {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
//                     {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </DashboardLayout>
//   );
// }

// function Toggle({ label, checked, onChange }) {
//   return (
//     <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-2xl">
//       <span className="text-sm font-medium text-slate-700">{label}</span>
//       <label className="relative inline-flex items-center cursor-pointer">
//         <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
//         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
//       </label>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Edit3, X, CheckCircle2, Loader2,
  Phone, PhoneOff, Plus, MessageSquareText, Calendar, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Loader';

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

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
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
      const matchSearch = !q || [r.patientName, r.petName, r.appointmentType].join(' ').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [rows, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  useEffect(() => setPage(1), [search, statusFilter]);

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="min-h-screen bg-gradient-to-br from-slate-100/70 via-indigo-50/30 to-blue-50/50 p-3 sm:p-6 rounded-3xl"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white/90 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-slate-200/80"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                  <MessageSquareText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Feedback</h2>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">Manage and track client responses seamlessly</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search patient, pet, type…"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <button
                onClick={fetchRows}
                className="bg-white border border-slate-200 p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                title="Refresh Records"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>

              <button
                onClick={openCreate}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto sm:ml-0"
              >
                <Plus size={18} />
                <span>Add Feedback</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200/60">
                    <th className="py-4 px-5">ID</th>
                    <th className="py-4 px-5">Patient Details</th>
                    <th className="py-4 px-5">Pet Name</th>
                    <th className="py-4 px-5">Type</th>
                    <th className="py-4 px-5">Schedule</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Feedback</th>
                    <th className="py-4 px-5">Call Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((r, idx) => (
                    <motion.tr
                      key={r.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-blue-50/30 transition-colors group text-sm"
                    >
                      <td className="py-4 px-5 text-slate-400 font-mono text-xs font-semibold">#{r.id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{r.patientName}</td>
                      <td className="py-4 px-5 font-medium text-slate-600">{r.petName || <span className="text-slate-300">—</span>}</td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/60 shadow-sm">
                          {r.appointmentType}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col text-xs font-medium text-slate-600 gap-0.5">
                          <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" />{r.date}</span>
                          {r.time && <span className="flex items-center gap-1 text-slate-400"><Clock size={12} />{r.time}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        {/* Reduced top/bottom margin context inside table cells using inline-flex */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${
                          r.feedbackStatus === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          {r.feedbackStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700">
                        {r.feedbackGiven ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs"><CheckCircle2 size={14} /> Given</span>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {r.callAttempted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                            <Phone size={12} /> Attempted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                            <PhoneOff size={12} /> Not called
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => openEdit(r)}
                          className="inline-flex items-center justify-center bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 p-2.5 rounded-xl shadow-sm transition-all"
                          title="Edit Feedback"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400 italic font-medium">
                        No feedback records found matching your query.
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
      </motion.div>

      {/* Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-white/80"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editing ? 'Edit Feedback Record' : 'Create New Feedback'}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Fill out the required information accurately below.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {!editing && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-100/60">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">Quick Prefill From Appointment</label>
                  <select
                    onChange={e => handlePrefill(e.target.value)}
                    defaultValue=""
                    className="w-full px-4 py-2.5 border border-blue-200/80 rounded-xl bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">Select an existing appointment…</option>
                    {appointments.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.patientName} – {app.date} {app.time}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Patient Name *</label>
                    <input
                      type="text"
                      value={form.patientName}
                      onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Pet Name</label>
                    <input
                      type="text"
                      value={form.petName}
                      onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="e.g. Max"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Appointment Type</label>
                    <input
                      type="text"
                      value={form.appointmentType}
                      onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      placeholder="e.g. Consult"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Feedback Status</label>
                    <select
                      value={form.feedbackStatus}
                      onChange={e => setForm(f => ({ ...f, feedbackStatus: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Toggle label="Feedback Given" checked={form.feedbackGiven} onChange={v => setForm(f => ({ ...f, feedbackGiven: v }))} />
                  <Toggle label="Call Attempted" checked={form.callAttempted} onChange={v => setForm(f => ({ ...f, callAttempted: v }))} />
                  <Toggle label="Call Picked" checked={form.callPicked} onChange={v => setForm(f => ({ ...f, callPicked: v }))} />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Feedback Notes</label>
                  <textarea
                    rows={3}
                    value={form.feedbackText}
                    onChange={e => setForm(f => ({ ...f, feedbackText: e.target.value }))}
                    placeholder="Enter explicit feedback details or comments…"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-full font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 disabled:opacity-60 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : editing ? 'Update Changes' : 'Save Record'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-50/70 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
      </label>
    </div>
  );
}