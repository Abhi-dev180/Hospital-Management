// import { useEffect, useMemo, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Search, RefreshCw, Edit3, X, CheckCircle2, Loader2,
//   CalendarClock, User, PawPrint, Stethoscope, Clock, Hospital, CalendarPlus
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import Pagination from '../../components/Pagination';
// import SlotSelector from '../../components/SlotSelector';
// import { TableSkeleton } from '../../components/Loader';

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
//   const [showBookModal, setShowBookModal] = useState(false);
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
//   const [bookForm, setBookForm] = useState({
//     patientName: '',
//     patientPhone: '',
//     email: '',
//     hospitalId: '',
//     date: '',
//     time: '',
//     petName: '',
//     species: '',
//     description: '',
//     appointmentType: 'Consult'
//   });
//   const [bookErrors, setBookErrors] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [hospitals, setHospitals] = useState([]);

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
//     fetchHospitals();
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

//   const fetchHospitals = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/hospitals`);
//       const data = await res.json();
//       setHospitals(Array.isArray(data) ? data : data.hospitals || []);
//     } catch {
//       setHospitals([]);
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

//   const openBookModal = () => {
//     setBookForm({
//       patientName: '',
//       patientPhone: '',
//       email: '',
//       hospitalId: user?.hospitalId || '',
//       date: '',
//       time: '',
//       petName: '',
//       species: '',
//       description: '',
//       appointmentType: 'Consult'
//     });
//     setBookErrors({});
//     setShowBookModal(true);
//   };

//   const validateBookForm = () => {
//     const errors = {};
//     if (!bookForm.patientName.trim()) errors.patientName = 'Patient name is required';
//     if (!bookForm.patientPhone.trim()) errors.patientPhone = 'Mobile number is required';
//     else if (!/^\d{10}$/.test(bookForm.patientPhone.trim())) errors.patientPhone = 'Enter a valid 10-digit mobile number';
//     if (!bookForm.email.trim()) {
//       errors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookForm.email.trim())) {
//       errors.email = 'Please enter a valid email address';
//     }
//     if (!bookForm.hospitalId) errors.hospitalId = 'Please select a hospital';
//     if (!bookForm.date) errors.date = 'Date is required';
//     if (!bookForm.time) errors.time = 'Time is required';
//     setBookErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const submitBook = async (e) => {
//     e.preventDefault();
//     if (!validateBookForm()) return toast.error('Please fix the booking fields');
//     setSaving(true);
//     try {
//       const res = await fetch(`${API_URL}/api/appointments/public`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(bookForm)
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.message || 'Could not book appointment');
//         return;
//       }
//       toast.success('Appointment booked successfully');
//       setShowBookModal(false);
//       fetchAppointments();
//     } catch (err) {
//       console.error('Admin book appointment failed:', err);
//       toast.error('Network error while booking');
//     } finally {
//       setSaving(false);
//     }
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
//               <button
//                 onClick={openBookModal}
//                 className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition"
//               >
//                 <CalendarPlus size={16} /> Book Appointment
//               </button>

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
//             <TableSkeleton rows={6} cols={7} />
//           ) : (
//             <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
//               <table className="w-full text-left border-collapse min-w-full">
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

//       <AnimatePresence>
//         {showBookModal && (
//           <motion.div
//             className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
//             variants={modalBackdrop}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             onClick={() => setShowBookModal(false)}
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
//                   <h3 className="text-2xl font-bold text-slate-900">Book Appointment</h3>
//                   <p className="text-sm text-slate-500 mt-1">Book an appointment for any user with the same hospital booking flow.</p>
//                 </div>
//                 <button
//                   onClick={() => setShowBookModal(false)}
//                   className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               <form onSubmit={submitBook} className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="sm:col-span-2">
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Select Hospital *</label>
//                     <select
//                       value={bookForm.hospitalId}
//                       onChange={e => setBookForm(f => ({ ...f, hospitalId: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     >
//                       <option value="">Choose hospital</option>
//                       {hospitals.map(h => (
//                         <option key={h.id} value={String(h.id)}>{h.name}</option>
//                       ))}
//                     </select>
//                     {bookErrors.hospitalId && <p className="mt-2 text-xs text-red-600">{bookErrors.hospitalId}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Patient Name *</label>
//                     <input
//                       type="text"
//                       value={bookForm.patientName}
//                       onChange={e => setBookForm(f => ({ ...f, patientName: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                     {bookErrors.patientName && <p className="mt-2 text-xs text-red-600">{bookErrors.patientName}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Mobile Number *</label>
//                     <input
//                       type="tel"
//                       value={bookForm.patientPhone}
//                       onChange={e => setBookForm(f => ({ ...f, patientPhone: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                       placeholder="10-digit number"
//                     />
//                     {bookErrors.patientPhone && <p className="mt-2 text-xs text-red-600">{bookErrors.patientPhone}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
//                     <input
//                       type="email"
//                       required
//                       value={bookForm.email}
//                       onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                       placeholder="Required"
//                     />
//                     {bookErrors.email && <p className="mt-2 text-xs text-red-600">{bookErrors.email}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Date *</label>
//                     <input
//                       type="date"
//                       value={bookForm.date}
//                       onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                     {bookErrors.date && <p className="mt-2 text-xs text-red-600">{bookErrors.date}</p>}
//                   </div>

//                   <div className="sm:col-span-2">
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Time *</label>
//                     <input
//                       type="time"
//                       value={bookForm.time}
//                       onChange={e => setBookForm(f => ({ ...f, time: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                     {bookErrors.time && <p className="mt-2 text-xs text-red-600">{bookErrors.time}</p>}
//                     {bookForm.date && bookForm.hospitalId && (
//                       <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
//                         <SlotSelector
//                           date={bookForm.date}
//                           hospitalId={bookForm.hospitalId}
//                           selectedTime={bookForm.time}
//                           onSelectTime={(slot) => setBookForm((f) => ({ ...f, time: slot }))}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Pet Name</label>
//                     <input
//                       type="text"
//                       value={bookForm.petName}
//                       onChange={e => setBookForm(f => ({ ...f, petName: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Species</label>
//                     <input
//                       type="text"
//                       value={bookForm.species}
//                       onChange={e => setBookForm(f => ({ ...f, species: e.target.value }))}
//                       className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                     />
//                   </div>

//                   <div className="sm:col-span-2">
//                     <label className="block text-sm font-medium mb-1.5 text-slate-700">Description</label>
//                     <textarea
//                       value={bookForm.description}
//                       onChange={e => setBookForm(f => ({ ...f, description: e.target.value }))}
//                       rows={3}
//                       className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
//                       placeholder="Optional booking notes"
//                     />
//                   </div>
//                 </div>

//                 <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
//                   <p className="text-sm text-slate-500">Select a hospital and date to load the shared Google Calendar booked slots picker.</p>
//                 </div>

//                 <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setShowBookModal(false)}
//                     className="px-5 py-2.5 border border-slate-200 rounded-full font-semibold text-slate-600 hover:bg-slate-50 transition"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition"
//                   >
//                     {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
//                     {saving ? 'Booking…' : 'Book Appointment'}
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
  CalendarPlus, Mail, Phone, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import Pagination from '../../components/Pagination';
import SlotSelector from '../../components/SlotSelector';
import { TableSkeleton } from '../../components/Loader';

const PER_PAGE = 6;
const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'];
const APPT_TYPES = ['Consult', 'Follow-up', 'Emergency', 'Surgery', 'Vaccination', 'Other'];

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } }
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
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
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
  const [bookForm, setBookForm] = useState({
    patientName: '',
    patientPhone: '',
    email: '',
    hospitalId: '',
    date: '',
    time: '',
    petName: '',
    species: '',
    description: '',
    appointmentType: 'Consult'
  });
  const [bookErrors, setBookErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [hospitals, setHospitals] = useState([]);

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
    fetchHospitals();
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

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : data.hospitals || []);
    } catch {
      setHospitals([]);
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

  const openBookModal = () => {
    setBookForm({
      patientName: '',
      patientPhone: '',
      email: '',
      hospitalId: user?.hospitalId || '',
      date: '',
      time: '',
      petName: '',
      species: '',
      description: '',
      appointmentType: 'Consult'
    });
    setBookErrors({});
    setShowBookModal(true);
  };

  const validateBookForm = () => {
    const errors = {};
    if (!bookForm.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!bookForm.patientPhone.trim()) errors.patientPhone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(bookForm.patientPhone.trim())) errors.patientPhone = 'Enter a valid 10-digit mobile number';
    if (!bookForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookForm.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!bookForm.hospitalId) errors.hospitalId = 'Please select a hospital';
    if (!bookForm.date) errors.date = 'Date is required';
    if (!bookForm.time) errors.time = 'Time is required';
    setBookErrors(errors);
    return Object.keys(errors).length === 0;
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
      setShowBookModal(false);
      fetchAppointments();
    } catch (err) {
      console.error('Admin book appointment failed:', err);
      toast.error('Network error while booking');
    } finally {
      setSaving(false);
    }
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
      const matchSearch = !q || [a.patientName, a.petName, a.appointmentType, a.email, a.patientPhone].join(' ').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [appointments, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  useEffect(() => setPage(1), [search, statusFilter]);

  const getStatusBadge = (status) => {
    const map = {
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200/80',
      'Confirmed': 'bg-blue-50 text-blue-700 border-blue-200/80',
      'In Progress': 'bg-purple-50 text-purple-700 border-purple-200/80',
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200/80',
      'Rescheduled': 'bg-cyan-50 text-cyan-700 border-cyan-200/80'
    };
    return map[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2"
    >
      <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100">
        
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appointments</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Showing <span className="text-blue-600 font-bold">{filtered.length}</span> of {appointments.length} total entries
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <button
              onClick={openBookModal}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all duration-200 shrink-0"
            >
              <CalendarPlus size={18} /> Book Appointment
            </button>

            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search appointments..."
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
              onClick={fetchAppointments}
              className="p-2.5 border border-slate-200/80 rounded-2xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-300 flex items-center justify-center transition shrink-0"
              title="Refresh Appointments"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/70 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Pet</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginated.map((a, idx) => (
                  <motion.tr
                    key={a.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{a.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {a.email ? (
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Mail size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{a.email}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {a.patientPhone ? (
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Phone size={14} className="text-slate-400 shrink-0" />
                          {a.patientPhone}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{a.petName || '—'}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">{a.date}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{a.time || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.doctorName || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                        {a.appointmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEdit(a)}
                        className="inline-flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition"
                        title="Edit Appointment"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium italic">
                      No appointments matching the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Edit Appointment</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Update schedule details and appointment status.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      value={form.patientName}
                      onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pet Name</label>
                    <input
                      type="text"
                      value={form.petName}
                      onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Appointment Type</label>
                    <select
                      value={form.appointmentType}
                      onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    >
                      {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={form.doctorName}
                      onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="Assigned Doctor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Time</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition"
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

      {/* Book Appointment Modal */}
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
                <button
                  onClick={() => setShowBookModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submitBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Select Hospital *</label>
                    <select
                      value={bookForm.hospitalId}
                      onChange={e => setBookForm(f => ({ ...f, hospitalId: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    >
                      <option value="">Choose hospital</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={String(h.id)}>{h.name}</option>
                      ))}
                    </select>
                    {bookErrors.hospitalId && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.hospitalId}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      value={bookForm.patientName}
                      onChange={e => setBookForm(f => ({ ...f, patientName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                    {bookErrors.patientName && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.patientName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={bookForm.patientPhone}
                      onChange={e => setBookForm(f => ({ ...f, patientPhone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="10-digit number"
                    />
                    {bookErrors.patientPhone && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.patientPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email *</label>
                    <input
                      type="email"
                      value={bookForm.email}
                      onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="Required"
                    />
                    {bookErrors.email && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Date *</label>
                    <input
                      type="date"
                      value={bookForm.date}
                      onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                    {bookErrors.date && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.date}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Time *</label>
                    <input
                      type="time"
                      value={bookForm.time}
                      onChange={e => setBookForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                    {bookErrors.time && <p className="mt-1.5 text-xs text-rose-600 font-medium">{bookErrors.time}</p>}
                    {bookForm.date && bookForm.hospitalId && (
                      <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                        <SlotSelector
                          date={bookForm.date}
                          hospitalId={bookForm.hospitalId}
                          selectedTime={bookForm.time}
                          onSelectTime={(slot) => setBookForm((f) => ({ ...f, time: slot }))}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pet Name</label>
                    <input
                      type="text"
                      value={bookForm.petName}
                      onChange={e => setBookForm(f => ({ ...f, petName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Species</label>
                    <input
                      type="text"
                      value={bookForm.species}
                      onChange={e => setBookForm(f => ({ ...f, species: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Description</label>
                    <textarea
                      value={bookForm.description}
                      onChange={e => setBookForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="Optional booking notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition"
                  >
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
  );
}