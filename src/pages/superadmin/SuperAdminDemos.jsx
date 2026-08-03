
// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import {
//   RefreshCw,
//   CalendarClock,
//   CheckCircle2,
//   Trash2,
//   Link2,
//   Video,
//   Search,
//   CalendarDays,
//   Clock,
//   XCircle,
//   Send
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';
// import Pagination from '../../components/Pagination';

// const PER_PAGE = 6;

// const STATUS_STYLES = {
//   requested: 'bg-amber-100 text-amber-700',
//   invited: 'bg-purple-100 text-purple-700',
//   scheduled: 'bg-blue-100 text-blue-700',
//   completed: 'bg-green-100 text-green-700',
//   cancelled: 'bg-red-100 text-red-700'
// };

// const fmt = (iso) =>
//   iso
//     ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
//     : '—';

// const emptyCounts = { total: 0, requested: 0, invited: 0, scheduled: 0, completed: 0, cancelled: 0 };

// export default function SuperAdminDemos() {
//   const [user, setUser] = useState(null);
//   const [bookings, setBookings] = useState([]);
//   const [counts, setCounts] = useState(emptyCounts);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (!userData) return navigate('/login');
//     const parsed = JSON.parse(userData);
//     if (parsed.role !== 'superadmin') return navigate('/');
//     setUser(parsed);
//     fetchBookings();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const authHeaders = () => ({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   });

//   const fetchBookings = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/demos`, { headers: authHeaders() });
//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.message || 'Failed to load demo bookings');
//         setBookings([]);
//         setCounts(emptyCounts);
//         return;
//       }
//       setBookings(Array.isArray(data.bookings) ? data.bookings : []);
//       setCounts(data.counts || emptyCounts);
//     } catch (err) {
//       toast.error('Unable to reach the server');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const patchBooking = async (id, body, successMsg) => {
//     try {
//       const res = await fetch(`${API_URL}/api/demos/${id}`, {
//         method: 'PATCH',
//         headers: authHeaders(),
//         body: JSON.stringify(body)
//       });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Update failed');
//       toast.success(successMsg || 'Updated');
//       fetchBookings();
//     } catch (err) {
//       toast.error('Update failed');
//     }
//   };

//   const handleInvite = async (b) => {
//     try {
//       const res = await fetch(`${API_URL}/api/demos/${b.id}/invite`, {
//         method: 'POST',
//         headers: authHeaders()
//       });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Could not send invite');
//       toast.success('Scheduling invite emailed');
//       fetchBookings();
//     } catch (err) {
//       toast.error('Could not send invite');
//     }
//   };

//   const handleReschedule = (b) => {
//     const current = b.scheduled_at ? new Date(b.scheduled_at).toISOString().slice(0, 16) : '';
//     const input = window.prompt(
//       'New date & time (YYYY-MM-DDTHH:mm, e.g. 2026-08-01T14:30):',
//       current
//     );
//     if (input === null) return;
//     const iso = new Date(input);
//     if (Number.isNaN(iso.getTime())) return toast.error('Invalid date/time');
//     patchBooking(b.id, { scheduledAt: iso.toISOString(), status: 'scheduled' }, 'Demo rescheduled');
//   };

//   const handleEditLink = (b) => {
//     const input = window.prompt('Meeting link:', b.meeting_link || '');
//     if (input === null) return;
//     patchBooking(b.id, { meetingLink: input.trim() }, 'Meeting link updated');
//   };

//   const handleComplete = async (b) => {
//     try {
//       const res = await fetch(`${API_URL}/api/demos/${b.id}/complete`, {
//         method: 'POST',
//         headers: authHeaders()
//       });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Could not complete');
//       toast.success('Marked completed');
//       fetchBookings();
//     } catch (err) {
//       toast.error('Could not complete');
//     }
//   };

//   const handleCancel = (b) =>
//     patchBooking(b.id, { status: 'cancelled' }, 'Demo cancelled');

//   const handleDelete = async (b) => {
//     if (!window.confirm(`Delete the demo booking for "${b.hospital_name}"?`)) return;
//     try {
//       const res = await fetch(`${API_URL}/api/demos/${b.id}`, {
//         method: 'DELETE',
//         headers: authHeaders()
//       });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Delete failed');
//       toast.success('Booking deleted');
//       fetchBookings();
//     } catch (err) {
//       toast.error('Delete failed');
//     }
//   };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return bookings.filter((b) => {
//       const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
//       const matchesSearch =
//         !q ||
//         [b.hospital_name, b.contact_name, b.email, b.city]
//           .filter(Boolean)
//           .some((v) => v.toLowerCase().includes(q));
//       return matchesStatus && matchesSearch;
//     });
//   }, [bookings, search, statusFilter]);

//   const [page, setPage] = useState(1);
//   useEffect(() => { setPage(1); }, [search, statusFilter]);
//   const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

//   const statCards = [
//     { title: 'Total Bookings', value: counts.total, icon: CalendarDays, color: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
//     { title: 'Requested', value: counts.requested, icon: Clock, color: 'border-amber-500', bg: 'bg-amber-100', text: 'text-amber-600' },
//     { title: 'Scheduled', value: counts.scheduled, icon: CalendarClock, color: 'border-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-600' },
//     { title: 'Completed', value: counts.completed, icon: CheckCircle2, color: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' }
//   ];

//   return (
//     <DashboardLayout
//       title="Demo Bookings"
//       subtitle="Manage demo requests from prospective hospitals — reschedule, complete, or remove."
//       user={user}
//     >
//       <DashboardTabs role="superadmin" />

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
//         {statCards.map((c) => {
//           const Icon = c.icon;
//           return (
//             <div key={c.title} className={`bg-white rounded-2xl p-4 sm:p-6 shadow border-b-4 ${c.color}`}>
//               <div className="flex items-center justify-between gap-3">
//                 <div className="min-w-0">
//                   <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">{c.title}</p>
//                   <p className="text-2xl sm:text-3xl font-extrabold text-medical-dark mt-2">{c.value}</p>
//                 </div>
//                 <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
//                   <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Table card */}
//       <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-medical-dark">All demo requests</h2>
//             <p className="text-sm text-gray-500">{filtered.length} of {bookings.length} shown</p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search hospital, name, email…"
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue"
//               />
//             </div>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue bg-white"
//             >
//               <option value="all">All statuses</option>
//               <option value="requested">Requested</option>
//               <option value="invited">Invited</option>
//               <option value="scheduled">Scheduled</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//             <button
//               onClick={fetchBookings}
//               className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition"
//             >
//               <RefreshCw size={16} /> Refresh
//             </button>
//           </div>
//         </div>

//         {loading ? (
//           <div className="py-16 text-center text-gray-500">Loading demo bookings…</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[1200px]">
//               <thead>
//                 <tr className="bg-medical-blue/10 text-medical-dark text-sm">
//                   <th className="py-3 px-4 font-semibold rounded-tl-lg">Hospital</th>
//                   <th className="py-3 px-4 font-semibold">Contact</th>
//                   <th className="py-3 px-4 font-semibold">Scheduled</th>
//                   <th className="py-3 px-4 font-semibold">Status</th>
//                   <th className="py-3 px-4 font-semibold">Plan</th>
//                   <th className="py-3 px-4 font-semibold">Amount</th>
//                   <th className="py-3 px-4 font-semibold">Payment Status</th>
//                   <th className="py-3 px-4 font-semibold">Meeting</th>
//                   <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginated.map((b) => (
//                   <motion.tr
//                     key={b.id}
//                     initial={{ opacity: 0, y: 8 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.2 }}
//                     className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm"
//                   >
//                     <td className="py-4 px-4">
//                       <div className="font-semibold text-medical-dark">{b.hospital_name}</div>
//                       <div className="text-gray-500 text-xs flex items-center gap-1">
//                         {b.city || '—'}
//                       </div>
//                     </td>
//                     <td className="py-4 px-4">
//                       <div className="text-gray-800">{b.contact_name}</div>
//                       <div className="text-gray-500 text-xs">{b.email}</div>
//                       {b.phone && <div className="text-gray-500 text-xs">{b.phone}</div>}
//                     </td>
//                     <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{fmt(b.scheduled_at)}</td>
//                     <td className="py-4 px-4">
//                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
//                         {b.status}
//                       </span>
//                     </td>

//                     {/* ─── New Payment Details Columns ─── */}
//                     <td className="py-4 px-4">
//                       {b.payment ? (
//                         <span className="font-medium text-gray-800">
//                           {b.payment.plan || '—'}
//                           <span className="text-gray-400 text-xs block">
//                             {b.payment.interval || ''}
//                           </span>
//                         </span>
//                       ) : '—'}
//                     </td>
//                     <td className="py-4 px-4">
//                       {b.payment ? (
//                         <span className="font-medium">
//                           ${(b.payment.amount / 100).toFixed(2)}
//                           <span className="text-gray-400 text-xs block">
//                             {b.payment.currency?.toUpperCase()}
//                           </span>
//                         </span>
//                       ) : '—'}
//                     </td>
//                     <td className="py-4 px-4">
//                       {b.payment ? (
//                         <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
//                           b.payment.status === 'paid' ? 'bg-green-100 text-green-700' :
//                           b.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                           'bg-red-100 text-red-700'
//                         }`}>
//                           {b.payment.status}
//                         </span>
//                       ) : '—'}
//                     </td>
//                     {/* ─── End Payment Details ─── */}

//                     <td className="py-4 px-4">
//                       {b.meeting_link ? (
//                         <a
//                           href={b.meeting_link}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="inline-flex items-center gap-1 text-medical-blue hover:underline text-xs font-medium"
//                         >
//                           <Video size={14} /> Join
//                         </a>
//                       ) : (
//                         <span className="text-gray-400 text-xs">No link</span>
//                       )}
//                     </td>
//                     <td className="py-4 px-4">
//                       <div className="flex flex-wrap justify-end gap-2">
//                         {(b.status === 'requested' || b.status === 'invited') && (
//                           <ActionBtn onClick={() => handleInvite(b)} className="text-purple-600 hover:bg-purple-50">
//                             <Send size={14} /> {b.status === 'invited' ? 'Resend invite' : 'Send invite'}
//                           </ActionBtn>
//                         )}
//                         <ActionBtn onClick={() => handleReschedule(b)} className="text-indigo-600 hover:bg-indigo-50">
//                           <CalendarClock size={14} /> Reschedule
//                         </ActionBtn>
//                         <ActionBtn onClick={() => handleEditLink(b)} className="text-slate-600 hover:bg-slate-50">
//                           <Link2 size={14} /> Link
//                         </ActionBtn>
//                         {b.status !== 'completed' && (
//                           <ActionBtn onClick={() => handleComplete(b)} className="text-green-600 hover:bg-green-50">
//                             <CheckCircle2 size={14} /> Complete
//                           </ActionBtn>
//                         )}
//                         {b.status !== 'cancelled' && b.status !== 'completed' && (
//                           <ActionBtn onClick={() => handleCancel(b)} className="text-amber-600 hover:bg-amber-50">
//                             <XCircle size={14} /> Cancel
//                           </ActionBtn>
//                         )}
//                         <ActionBtn onClick={() => handleDelete(b)} className="text-red-600 hover:bg-red-50">
//                           <Trash2 size={14} /> Delete
//                         </ActionBtn>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))}
//                 {filtered.length === 0 && (
//                   <tr>
//                     <td colSpan="9" className="py-12 text-center text-gray-500 italic">
//                       No demo bookings found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//         <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
//       </div>
//     </DashboardLayout>
//   );
// }

// function ActionBtn({ onClick, className = '', children }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${className}`}
//     >
//       {children}
//     </button>
//   );
// }


import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  CalendarClock,
  CheckCircle2,
  Trash2,
  Link2,
  Video,
  Search,
  CalendarDays,
  Clock,
  XCircle,
  Send,
  X,
  CreditCard,
  Building2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Filter,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import { SectionLoader } from '../../components/Loader';

const PER_PAGE = 6;

const STATUS_CONFIG = {
  requested: {
    label: 'Requested',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-amber-500/5',
    dot: 'bg-amber-400'
  },
  invited: {
    label: 'Invited',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80 shadow-purple-500/5',
    dot: 'bg-purple-400'
  },
  scheduled: {
    label: 'Scheduled',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-blue-500/5',
    dot: 'bg-blue-400'
  },
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-emerald-500/5',
    dot: 'bg-emerald-400'
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-rose-500/5',
    dot: 'bg-rose-400'
  }
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

const emptyCounts = { total: 0, requested: 0, invited: 0, scheduled: 0, completed: 0, cancelled: 0 };

const pageAnimation = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.06 }
  }
};

const cardAnimation = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
};

const rowAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
};

export default function SuperAdminDemos() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Active Dropdown Menu Row ID State
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null, datetime: '' });
  const [rescheduling, setRescheduling] = useState(false);
  const [linkModal, setLinkModal] = useState({ open: false, booking: null, link: '' });
  const [savingLink, setSavingLink] = useState(false);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return navigate('/login');
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'superadmin') return navigate('/');
    setUser(parsed);
    fetchBookings();
  }, [navigate]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/demos`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to load demo bookings');
        setBookings([]);
        setCounts(emptyCounts);
        return;
      }
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      setCounts(data.counts || emptyCounts);
    } catch {
      toast.error('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  };

  const patchBooking = async (id, body, successMsg) => {
    try {
      const res = await fetch(`${API_URL}/api/demos/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Update failed');
      toast.success(successMsg || 'Updated');
      fetchBookings();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleInvite = async (b) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`${API_URL}/api/demos/${b.id}/invite`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not send invite');
      toast.success('Scheduling invite emailed successfully');
      fetchBookings();
    } catch {
      toast.error('Could not send invite');
    }
  };

  const openRescheduleModal = (b) => {
    setActiveMenuId(null);
    const current = b.scheduled_at ? new Date(b.scheduled_at).toISOString().slice(0, 16) : '';
    setRescheduleModal({ open: true, booking: b, datetime: current });
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    const { booking, datetime } = rescheduleModal;
    if (!datetime) return toast.error('Please select a valid date & time');
    const iso = new Date(datetime);
    if (Number.isNaN(iso.getTime())) return toast.error('Invalid date/time');

    setRescheduling(true);
    await patchBooking(booking.id, { scheduledAt: iso.toISOString(), status: 'scheduled' }, 'Demo rescheduled successfully');
    setRescheduling(false);
    setRescheduleModal({ open: false, booking: null, datetime: '' });
  };

  const openLinkModal = (b) => {
    setActiveMenuId(null);
    setLinkModal({ open: true, booking: b, link: b.meeting_link || '' });
  };

  const submitLink = async (e) => {
    e.preventDefault();
    const { booking, link } = linkModal;
    setSavingLink(true);
    await patchBooking(booking.id, { meetingLink: link.trim() }, 'Meeting link updated successfully');
    setSavingLink(false);
    setLinkModal({ open: false, booking: null, link: '' });
  };

  const handleComplete = async (b) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`${API_URL}/api/demos/${b.id}/complete`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not complete');
      toast.success('Demo marked as completed');
      fetchBookings();
    } catch {
      toast.error('Could not complete');
    }
  };

  const handleCancel = (b) => {
    setActiveMenuId(null);
    patchBooking(b.id, { status: 'cancelled' }, 'Demo cancelled');
  };

  const handleDelete = async (b) => {
    setActiveMenuId(null);
    if (!window.confirm(`Delete the demo booking for "${b.hospital_name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/demos/${b.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Delete failed');
      toast.success('Booking deleted');
      fetchBookings();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesSearch =
        !q ||
        [b.hospital_name, b.contact_name, b.email, b.city]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [search, statusFilter]);
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

  const statCards = [
    { title: 'Total Bookings', value: counts.total, icon: CalendarDays, gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent', border: 'border-blue-500/20', iconBg: 'bg-blue-500 text-white shadow-blue-500/30' },
    { title: 'Requested', value: counts.requested, icon: Clock, gradient: 'from-amber-500/10 via-orange-500/5 to-transparent', border: 'border-amber-500/20', iconBg: 'bg-amber-500 text-white shadow-amber-500/30' },
    { title: 'Scheduled', value: counts.scheduled, icon: CalendarClock, gradient: 'from-violet-500/10 via-purple-500/5 to-transparent', border: 'border-violet-500/20', iconBg: 'bg-violet-500 text-white shadow-violet-500/30' },
    { title: 'Completed', value: counts.completed, icon: CheckCircle2, gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30' }
  ];

  return (
    <DashboardLayout
      title="Demo Bookings"
      subtitle="Manage prospective hospital inquiries, configure meeting links, and track status pipelines."
      user={user}
    >
      <motion.div initial="hidden" animate="visible" variants={pageAnimation} className="space-y-8 pb-12">
        <DashboardTabs role="superadmin" />

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                variants={cardAnimation}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.07)] border ${c.border}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} pointer-events-none`} />
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{c.title}</p>
                    <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{c.value}</p>
                  </div>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${c.iconBg}`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Data Container */}
        <motion.div
          variants={cardAnimation}
          className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.55rem] shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)] border border-slate-100/80 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Table Toolbar Header */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Inquiries</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {filtered.length} Active
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Real-time scheduling metrics and institutional conversions.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hospital, name, email…"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-inner"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Filter size={15} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-8 py-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition text-sm font-semibold text-slate-700 appearance-none shadow-inner cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  <option value="requested">Requested</option>
                  <option value="invited">Invited</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={fetchBookings}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition active:scale-95"
              >
                <RefreshCw size={16} className="text-slate-500" /> Refresh
              </button>
            </div>
          </div>

          {/* Table View */}
          {loading ? (
            <SectionLoader label="Syncing booking data…" sub="Fetching the latest demo bookings" minHeight="min-h-[380px]" />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200/70 shadow-sm relative z-10 min-h-[380px]">
              <table className="w-full text-left border-collapse min-w-[1250px]">
                <thead>
                  <tr className="bg-slate-50/90 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-4 px-5">Hospital Profile</th>
                    <th className="py-4 px-5">Contact Details</th>
                    <th className="py-4 px-5">Scheduled Slot</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Plan</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Payment</th>
                    <th className="py-4 px-5">Meeting</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-sm">
                  {paginated.map((b, idx) => {
                    const statusData = STATUS_CONFIG[b.status] || { label: b.status, badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
                    const isMenuOpen = activeMenuId === b.id;

                    return (
                      <motion.tr
                        key={b.id}
                        variants={rowAnimation}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                              <Building2 size={16} />
                            </div>
                            {b.hospital_name}
                          </div>
                          <div className="text-slate-400 text-xs flex items-center gap-1 mt-1 font-normal pl-10">
                            <MapPin size={12} /> {b.city || 'Location unspecified'}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="text-slate-900 font-semibold">{b.contact_name}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="text-slate-400" /> {b.email}
                          </div>
                          {b.phone && (
                            <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                              <Phone size={12} className="text-slate-400" /> {b.phone}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{fmt(b.scheduled_at)}</div>
                        </td>

                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm capitalize ${statusData.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusData.dot}`} />
                            {statusData.label}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          {b.payment ? (
                            <span className="font-bold text-slate-800">
                              {b.payment.plan || '—'}
                              <span className="text-slate-400 text-xs block font-normal capitalize">
                                {b.payment.interval || ''}
                              </span>
                            </span>
                          ) : <span className="text-slate-400 font-normal">—</span>}
                        </td>

                        <td className="py-4 px-5">
                          {b.payment ? (
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <CreditCard size={13} className="text-slate-400" />
                              ${(b.payment.amount / 100).toFixed(2)}
                              <span className="text-slate-400 text-xs font-normal">
                                {b.payment.currency?.toUpperCase()}
                              </span>
                            </span>
                          ) : <span className="text-slate-400 font-normal">—</span>}
                        </td>

                        <td className="py-4 px-5">
                          {b.payment ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${b.payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                b.payment.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                              <ShieldCheck size={12} />
                              {b.payment.status}
                            </span>
                          ) : <span className="text-slate-400 font-normal">—</span>}
                        </td>

                        <td className="py-4 px-5">
                          {b.meeting_link ? (
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              <Video size={13} /> Join <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs font-normal italic">No meeting link</span>
                          )}
                        </td>

                        {/* ─── Hamburger / Three-Dot Dropdown Menu ─── */}
                        <td className="py-4 px-5 text-right relative">
                          <div className="inline-block action-menu-container">
                            <button
                              onClick={() => setActiveMenuId(isMenuOpen ? null : b.id)}
                              className={`p-2 rounded-xl border transition shadow-sm ${isMenuOpen
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              title="Actions"
                            >
                              <MoreVertical size={16} />
                            </button>

                            <AnimatePresence>
                              {isMenuOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-5 top-14 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-left overflow-hidden"
                                >
                                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manage Booking</p>
                                  </div>

                                  {(b.status === 'requested' || b.status === 'invited') && (
                                    <button
                                      onClick={() => handleInvite(b)}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 transition"
                                    >
                                      <Send size={14} /> {b.status === 'invited' ? 'Resend Invite' : 'Send Invite'}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => openRescheduleModal(b)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50 transition"
                                  >
                                    <CalendarClock size={14} /> Reschedule Slot
                                  </button>

                                  <button
                                    onClick={() => openLinkModal(b)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                  >
                                    <Link2 size={14} /> Configure Link
                                  </button>

                                  {b.status !== 'completed' && (
                                    <button
                                      onClick={() => handleComplete(b)}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
                                    >
                                      <CheckCircle2 size={14} /> Mark Completed
                                    </button>
                                  )}

                                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                                    <button
                                      onClick={() => handleCancel(b)}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition"
                                    >
                                      <XCircle size={14} /> Cancel Demo
                                    </button>
                                  )}

                                  <div className="border-t border-slate-100 mt-1 pt-1">
                                    <button
                                      onClick={() => handleDelete(b)}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
                                    >
                                      <Trash2 size={14} /> Delete Record
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="9" className="py-16 text-center text-slate-400 italic font-normal">
                        No matching demo bookings found. Try altering your filter criteria.
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
        </motion.div>
      </motion.div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleModal.open && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRescheduleModal({ open: false, booking: null, datetime: '' })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.25rem] shadow-2xl w-full max-w-md p-6 sm:p-8 border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Reschedule Demo</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{rescheduleModal.booking?.hospital_name}</p>
                </div>
                <button
                  onClick={() => setRescheduleModal({ open: false, booking: null, datetime: '' })}
                  className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitReschedule} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">New Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={rescheduleModal.datetime}
                    onChange={e => setRescheduleModal(m => ({ ...m, datetime: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition text-sm font-semibold text-slate-800 shadow-inner"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleModal({ open: false, booking: null, datetime: '' })}
                    className="px-5 py-2.5 rounded-full font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rescheduling}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-60 transition active:scale-95"
                  >
                    {rescheduling ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {rescheduling ? 'Saving Slot…' : 'Confirm Schedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting Link Modal */}
      <AnimatePresence>
        {linkModal.open && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLinkModal({ open: false, booking: null, link: '' })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.25rem] shadow-2xl w-full max-w-md p-6 sm:p-8 border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Configure Meeting Link</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{linkModal.booking?.hospital_name}</p>
                </div>
                <button
                  onClick={() => setLinkModal({ open: false, booking: null, link: '' })}
                  className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitLink} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Meeting URL (Zoom / Meet / Teams)</label>
                  <input
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={linkModal.link}
                    onChange={e => setLinkModal(m => ({ ...m, link: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition text-sm font-semibold text-slate-800 shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLinkModal({ open: false, booking: null, link: '' })}
                    className="px-5 py-2.5 rounded-full font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingLink}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-60 transition active:scale-95"
                  >
                    {savingLink ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {savingLink ? 'Updating Link…' : 'Save URL'}
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