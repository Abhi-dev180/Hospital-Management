// import { useEffect, useMemo, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Search, RefreshCw, Edit3, X, CheckCircle2, Loader2,
//   CalendarClock, User, PawPrint, Stethoscope, Clock, Hospital
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import Pagination from '../../components/Pagination';

// const PER_PAGE = 6;
// const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'];
// const APPT_TYPES = ['Consult', 'Follow-up', 'Emergency', 'Surgery', 'Vaccination', 'Other'];

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

// export default function AdminAppointments() {
//   const [user, setUser] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [page, setPage] = useState(1);

//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({
//     patientName: '',
//     petName: '',
//     appointmentType: 'Consult',
//     date: '',
//     time: '',
//     doctorName: '',
//     status: 'Pending'
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
//     fetchAppointments();
//   }, []);

//   const fetchAppointments = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/appointments`, { headers: authHeaders() });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Failed to load appointments');
//       setAppointments(Array.isArray(data) ? data : []);
//     } catch {
//       toast.error('Network error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEdit = (appt) => {
//     setEditing(appt);
//     setForm({
//       patientName: appt.patientName || '',
//       petName: appt.petName || '',
//       appointmentType: appt.appointmentType || 'Consult',
//       date: appt.date || '',
//       time: appt.time || '',
//       doctorName: appt.doctorName || '',
//       status: appt.status || 'Pending'
//     });
//     setShowModal(true);
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!form.patientName || !form.date) return toast.error('Patient name and date are required');
//     setSaving(true);
//     try {
//       const res = await fetch(`${API_URL}/api/appointments/${editing.id}`, {
//         method: 'PUT',
//         headers: authHeaders(),
//         body: JSON.stringify(form)
//       });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Update failed');
//       toast.success('Appointment updated successfully');
//       setShowModal(false);
//       fetchAppointments();
//     } catch {
//       toast.error('Update error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return appointments.filter(a => {
//       const matchStatus = statusFilter === 'all' || a.status === statusFilter;
//       const matchSearch = !q || [a.patientName, a.petName, a.appointmentType].join(' ').toLowerCase().includes(q);
//       return matchStatus && matchSearch;
//     });
//   }, [appointments, search, statusFilter]);

//   const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
//   useEffect(() => setPage(1), [search, statusFilter]);

//   const getStatusBadge = (status) => {
//     const map = {
//       'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
//       'Confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
//       'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
//       'Completed': 'bg-green-100 text-green-700 border-green-200',
//       'Cancelled': 'bg-red-100 text-red-700 border-red-200',
//       'Rescheduled': 'bg-cyan-100 text-cyan-700 border-cyan-200'
//     };
//     return map[status] || 'bg-gray-100 text-gray-700';
//   };

//   return (
//     <DashboardLayout user={user}>
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
//               <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Appointments</h2>
//               <p className="text-sm text-slate-500 mt-1">{filtered.length} of {appointments.length} records</p>
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
//                 onClick={fetchAppointments}
//                 className="bg-white border border-slate-200 px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 hover:shadow-sm transition"
//               >
//                 <RefreshCw size={16} />
//                 Refresh
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
//               <table className="w-full text-left border-collapse min-w-[1000px]">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-slate-50 to-blue-50 text-slate-700 text-sm">
//                     <th className="py-4 px-4 font-semibold">Patient</th>
//                     <th className="py-4 px-4 font-semibold">Pet</th>
//                     <th className="py-4 px-4 font-semibold">Date</th>
//                     <th className="py-4 px-4 font-semibold">Time</th>
//                     <th className="py-4 px-4 font-semibold">Doctor</th>
//                     <th className="py-4 px-4 font-semibold">Type</th>
//                     <th className="py-4 px-4 font-semibold">Status</th>
//                     <th className="py-4 px-4 font-semibold text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginated.map((a, idx) => (
//                     <motion.tr
//                       key={a.id}
//                       variants={rowVariants}
//                       initial="hidden"
//                       animate="visible"
//                       transition={{ delay: idx * 0.03 }}
//                       className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm"
//                     >
//                       <td className="py-4 px-4 font-medium text-slate-900">{a.patientName}</td>
//                       <td className="py-4 px-4 text-slate-700">{a.petName || '—'}</td>
//                       <td className="py-4 px-4 text-slate-700">{a.date}</td>
//                       <td className="py-4 px-4 text-slate-700">{a.time || '—'}</td>
//                       <td className="py-4 px-4 text-slate-700">{a.doctorName || '—'}</td>
//                       <td className="py-4 px-4">
//                         <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-semibold">
//                           {a.appointmentType}
//                         </span>
//                       </td>
//                       <td className="py-4 px-4">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(a.status)}`}>
//                           {a.status}
//                         </span>
//                       </td>
//                       <td className="py-4 px-4 text-right">
//                         <button
//                           onClick={() => openEdit(a)}
//                           className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-xl transition"
//                         >
//                           <Edit3 size={15} />
//                         </button>
//                       </td>
//                     </motion.tr>
//                   ))}

//                   {filtered.length === 0 && (
//                     <tr>
//                       <td colSpan={8} className="py-14 text-center text-slate-500 italic">
//                         No appointments found
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
//                   <h3 className="text-2xl font-bold text-slate-900">Edit Appointment</h3>
//                   <p className="text-sm text-slate-500 mt-1">Update patient, pet, date, time, or status.</p>
//                 </div>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

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
//                     <select
//                       value={form.appointmentType}
//                       onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     >
//                       {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Doctor Name</label>
//                     <input
//                       type="text"
//                       value={form.doctorName}
//                       onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                       placeholder="Any Available Doctor"
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

//                   <div className="sm:col-span-2">
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Status</label>
//                     <select
//                       value={form.status}
//                       onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     >
//                       {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
//                     </select>
//                   </div>
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
//                     {saving ? 'Updating…' : 'Update Appointment'}
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


import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Edit3, X, CheckCircle2, Loader2,
  CalendarClock, User, PawPrint, Stethoscope, Clock, Hospital
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Loader';

const PER_PAGE = 6;
const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'];
const APPT_TYPES = ['Consult', 'Follow-up', 'Emergency', 'Surgery', 'Vaccination', 'Other'];

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

export default function AdminAppointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    petName: '',
    appointmentType: 'Consult',
    date: '',
    time: '',
    doctorName: '',
    status: 'Pending'
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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to load appointments');
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (appt) => {
    setEditing(appt);
    setForm({
      patientName: appt.patientName || '',
      petName: appt.petName || '',
      appointmentType: appt.appointmentType || 'Consult',
      date: appt.date || '',
      time: appt.time || '',
      doctorName: appt.doctorName || '',
      status: appt.status || 'Pending'
    });
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patientName || !form.date) return toast.error('Patient name and date are required');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/${editing.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Update failed');
      toast.success('Appointment updated successfully');
      setShowModal(false);
      fetchAppointments();
    } catch {
      toast.error('Update error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter(a => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchSearch = !q || [a.patientName, a.petName, a.appointmentType].join(' ').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [appointments, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  useEffect(() => setPage(1), [search, statusFilter]);

  const getStatusBadge = (status) => {
    const map = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
      'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200',
      'Rescheduled': 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout user={user}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 sm:p-6"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white/95 backdrop-blur-xl p-5 sm:p-8 rounded-3xl shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] border border-white/70 ring-1 ring-slate-100"
        >
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Appointments</h2>
              <p className="text-sm text-slate-500 mt-1">{filtered.length} of {appointments.length} records</p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search patient, pet…"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full bg-slate-50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-full bg-slate-50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
              >
                <option value="all">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <button
                onClick={fetchAppointments}
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 hover:shadow-sm transition"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50 text-slate-700 text-sm">
                    <th className="py-4 px-4 font-semibold">Patient</th>
                    <th className="py-4 px-4 font-semibold">Pet</th>
                    <th className="py-4 px-4 font-semibold">Date</th>
                    <th className="py-4 px-4 font-semibold">Time</th>
                    <th className="py-4 px-4 font-semibold">Doctor</th>
                    <th className="py-4 px-4 font-semibold">Type</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a, idx) => (
                    <motion.tr
                      key={a.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm"
                    >
                      <td className="py-4 px-4 font-medium text-slate-900">{a.patientName}</td>
                      <td className="py-4 px-4 text-slate-700">{a.petName || '—'}</td>
                      <td className="py-4 px-4 text-slate-700">{a.date}</td>
                      <td className="py-4 px-4 text-slate-700">{a.time || '—'}</td>
                      <td className="py-4 px-4 text-slate-700">{a.doctorName || '—'}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {a.appointmentType}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openEdit(a)}
                          className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-xl transition"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-500 italic">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5">
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-white/70"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Edit Appointment</h3>
                  <p className="text-sm text-slate-500 mt-1">Update patient, pet, date, time, or status.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Patient Name *</label>
                    <input
                      type="text"
                      value={form.patientName}
                      onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Pet Name</label>
                    <input
                      type="text"
                      value={form.petName}
                      onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Appointment Type</label>
                    <select
                      value={form.appointmentType}
                      onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                    >
                      {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Doctor Name</label>
                    <input
                      type="text"
                      value={form.doctorName}
                      onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                      placeholder="Any Available Doctor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-full font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-60 hover:shadow-blue-500/30 transition"
                  >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {saving ? 'Updating…' : 'Update Appointment'}
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