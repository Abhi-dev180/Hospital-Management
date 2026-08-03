// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Users, Search, RefreshCw, Plus, Edit3, Trash2, Power, X, Shield, UserCog, User } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';
// import Pagination from '../../components/Pagination';

// const PER_PAGE = 10;

// const ROLE_STYLES = {
//   superadmin: 'bg-purple-100 text-purple-700',
//   admin: 'bg-blue-100 text-blue-700',
//   user: 'bg-emerald-100 text-emerald-700'
// };
// const emptyForm = { name: '', email: '', mobile: '', password: '', role: 'user', hospital: '' };

// export default function SuperAdminUsers() {
//   const [user, setUser] = useState(null);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const navigate = useNavigate();

//   const authHeaders = () => ({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   });

//   useEffect(() => {
//     const u = localStorage.getItem('user');
//     if (!u) return navigate('/login');
//     const parsed = JSON.parse(u);
//     if (parsed.role !== 'superadmin') return navigate('/');
//     setUser(parsed);
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/auth/users`, { headers: authHeaders() });
//       const data = await res.json();
//       if (!res.ok) { toast.error(data.message || 'Failed to load users'); setRows([]); return; }
//       setRows(Array.isArray(data) ? data : []);
//     } catch { toast.error('Unable to reach the server'); } finally { setLoading(false); }
//   };

//   const resetForm = () => { setForm(emptyForm); setEditing(null); };

//   const openEdit = (u) => {
//     setEditing(u);
//     setForm({ name: u.name, email: u.email, mobile: u.mobile || '', password: '', role: u.role, hospital: u.hospital || '' });
//     setShowForm(true);
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.email || (!editing && !form.password) || !form.role) {
//       return toast.error('Name, email, role' + (editing ? '' : ' and password') + ' are required');
//     }
//     if (form.mobile && !/^\d{10}$/.test(form.mobile)) return toast.error('Mobile must be 10 digits');
//     try {
//       const url = editing ? `${API_URL}/api/auth/users/${editing.id}` : `${API_URL}/api/auth/users`;
//       const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(form) });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Save failed');
//       toast.success(editing ? 'User updated' : 'User created');
//       resetForm(); setShowForm(false); load();
//     } catch { toast.error('Save failed'); }
//   };

//   const toggleActive = async (u) => {
//     try {
//       const res = await fetch(`${API_URL}/api/auth/users/${u.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ active: !u.active }) });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Update failed');
//       toast.success(u.active ? 'User deactivated' : 'User activated');
//       load();
//     } catch { toast.error('Update failed'); }
//   };

//   const remove = async (u) => {
//     if (!window.confirm(`Delete user "${u.name}" (${u.email})?`)) return;
//     try {
//       const res = await fetch(`${API_URL}/api/auth/users/${u.id}`, { method: 'DELETE', headers: authHeaders() });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Delete failed');
//       toast.success('User deleted'); load();
//     } catch { toast.error('Delete failed'); }
//   };

//   const counts = useMemo(() => ({
//     total: rows.length,
//     admin: rows.filter((r) => r.role === 'admin').length,
//     user: rows.filter((r) => r.role === 'user').length,
//     superadmin: rows.filter((r) => r.role === 'superadmin').length
//   }), [rows]);

//   const [page, setPage] = useState(1);
//   useEffect(() => { setPage(1); }, [search, roleFilter]);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return rows.filter((r) => {
//       const matchesRole = roleFilter === 'all' || r.role === roleFilter;
//       const matchesSearch = !q || [r.name, r.email, r.mobile, r.hospital].filter(Boolean).some((v) => v.toLowerCase().includes(q));
//       return matchesRole && matchesSearch;
//     });
//   }, [rows, search, roleFilter]);

//   const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

//   const statCards = [
//     { title: 'Total Users', value: counts.total, icon: Users, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
//     { title: 'Admins', value: counts.admin, icon: UserCog, bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-500' },
//     { title: 'Users', value: counts.user, icon: User, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-500' },
//     { title: 'Super Admins', value: counts.superadmin, icon: Shield, bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' }
//   ];

//   return (
//     <DashboardLayout title="Users" subtitle="View and manage every account in the system." user={user}>
//       <DashboardTabs role="superadmin" />

//       <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
//         {statCards.map((c) => {
//           const Icon = c.icon;
//           return (
//             <div key={c.title} className={`bg-white rounded-2xl p-4 sm:p-6 shadow border-b-4 ${c.border}`}>
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

//       <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-medical-dark">All users</h2>
//             <p className="text-sm text-gray-500">{filtered.length} of {rows.length} shown</p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, hospital…"
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue" />
//             </div>
//             <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue bg-white">
//               <option value="all">All roles</option>
//               <option value="user">User</option>
//               <option value="admin">Admin</option>
//               <option value="superadmin">Super Admin</option>
//             </select>
//             <button onClick={load} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition">
//               <RefreshCw size={16} /> Refresh
//             </button>
//             <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold px-5 py-2 rounded-full transition shadow-sm">
//               <Plus size={18} /> {showForm ? 'Close' : 'Add User'}
//             </button>
//           </div>
//         </div>

//         <AnimatePresence>
//           {showForm && (
//             <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
//               onSubmit={submit} className="overflow-hidden">
//               <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Full name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Jane Doe" />
//                 <Input label="Email *" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="jane@example.com" />
//                 <Input label="Mobile" value={form.mobile} onChange={(v) => setForm((f) => ({ ...f, mobile: v.replace(/\D/g, '').slice(0, 10) }))} placeholder="9876543210" />
//                 <Input label={editing ? 'New password (leave blank to keep)' : 'Password *'} type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="••••••••" />
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
//                   <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm bg-white">
//                     <option value="user">User</option>
//                     <option value="admin">Admin</option>
//                     <option value="superadmin">Super Admin</option>
//                   </select>
//                 </div>
//                 <Input label="Hospital (for admins)" value={form.hospital} onChange={(v) => setForm((f) => ({ ...f, hospital: v }))} placeholder="Happy Paws Veterinary" />
//                 <div className="md:col-span-2 flex justify-end">
//                   <button type="submit" className="bg-medical-blue hover:bg-medical-dark text-white font-bold py-2.5 px-6 rounded-full transition text-sm">
//                     {editing ? 'Update User' : 'Create User'}
//                   </button>
//                 </div>
//               </div>
//             </motion.form>
//           )}
//         </AnimatePresence>

//         {loading ? (
//           <div className="py-16 text-center text-gray-500">Loading users…</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[860px]">
//               <thead>
//                 <tr className="bg-medical-blue/10 text-medical-dark text-sm">
//                   <th className="py-3 px-4 font-semibold rounded-tl-lg">Name</th>
//                   <th className="py-3 px-4 font-semibold">Contact</th>
//                   <th className="py-3 px-4 font-semibold">Role</th>
//                   <th className="py-3 px-4 font-semibold">Hospital</th>
//                   <th className="py-3 px-4 font-semibold">Status</th>
//                   <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginated.map((u) => (
//                   <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
//                     className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
//                     <td className="py-4 px-4 font-semibold text-medical-dark">{u.name}</td>
//                     <td className="py-4 px-4">
//                       <div className="text-gray-800">{u.email}</div>
//                       {u.mobile && <div className="text-gray-500 text-xs">{u.mobile}</div>}
//                     </td>
//                     <td className="py-4 px-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
//                     <td className="py-4 px-4 text-gray-600">{u.hospital || '—'}</td>
//                     <td className="py-4 px-4">
//                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{u.active ? 'Active' : 'Inactive'}</span>
//                     </td>
//                     <td className="py-4 px-4">
//                       <div className="flex flex-wrap justify-end gap-2">
//                         <ActionBtn onClick={() => openEdit(u)} className="text-blue-600 hover:bg-blue-50"><Edit3 size={14} /> Edit</ActionBtn>
//                         {u.role !== 'superadmin' && (
//                           <ActionBtn onClick={() => toggleActive(u)} className={u.active ? 'text-gray-600 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'}>
//                             <Power size={14} /> {u.active ? 'Deactivate' : 'Activate'}
//                           </ActionBtn>
//                         )}
//                         {u.role !== 'superadmin' && (
//                           <ActionBtn onClick={() => remove(u)} className="text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</ActionBtn>
//                         )}
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))}
//                 {filtered.length === 0 && (
//                   <tr><td colSpan="6" className="py-12 text-center text-gray-500 italic">No users found.</td></tr>
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

// function Input({ label, value, onChange, type = 'text', placeholder }) {
//   return (
//     <div>
//       <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
//       <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
//         className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm bg-white text-gray-900" />
//     </div>
//   );
// }

// function ActionBtn({ onClick, className = '', children }) {
//   return (
//     <button onClick={onClick} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${className}`}>
//       {children}
//     </button>
//   );
// }




import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, Plus, Edit3, Trash2, Power,
  Shield, UserCog, User, BadgeCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Loader';

const PER_PAGE = 6;

const ROLE_STYLES = {
  superadmin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  user: 'bg-emerald-100 text-emerald-700'
};

const REG_STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-200 text-gray-600'
};

const emptyForm = { name: '', email: '', mobile: '', password: '', role: 'user', hospital: '' };

export default function SuperAdminUsers() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);            // all users from /api/auth/users
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) return navigate('/login');
    const parsed = JSON.parse(u);
    if (parsed.role !== 'superadmin') return navigate('/');
    setUser(parsed);
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, regRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/users`, { headers: authHeaders() }),
        fetch(`${API_URL}/api/registrations`, { headers: authHeaders() })
      ]);

      const usersData = await usersRes.json();
      if (!usersRes.ok) {
        toast.error(usersData.message || 'Failed to load users');
        setRows([]);
      } else {
        setRows(Array.isArray(usersData) ? usersData : []);
      }

      const regData = await regRes.json();
      if (regRes.ok) {
        setRegistrations(regData.registrations || []);
      }
    } catch {
      toast.error('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  };

  // Map adminUserId → registration (string keys to avoid type mismatch)
  const regByAdminId = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      if (r.adminUserId) {
        map[String(r.adminUserId)] = r;
      }
    });
    return map;
  }, [registrations]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, mobile: u.mobile || '', password: '', role: u.role, hospital: u.hospital || '' });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editing && !form.password) || !form.role) {
      return toast.error('Name, email, role' + (editing ? '' : ' and password') + ' are required');
    }
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) return toast.error('Mobile must be 10 digits');
    try {
      const url = editing ? `${API_URL}/api/auth/users/${editing.id}` : `${API_URL}/api/auth/users`;
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Save failed');
      toast.success(editing ? 'User updated' : 'User created');
      resetForm(); setShowForm(false); loadAll();
    } catch { toast.error('Save failed'); }
  };

  const toggleActive = async (u) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${u.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ active: !u.active }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Update failed');
      toast.success(u.active ? 'User deactivated' : 'User activated');
      loadAll();
    } catch { toast.error('Update failed'); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete user "${u.name}" (${u.email})?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${u.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Delete failed');
      toast.success('User deleted'); loadAll();
    } catch { toast.error('Delete failed'); }
  };

  // Count only the users visible under current filter
  const counts = useMemo(() => {
    const base = showRegisteredOnly
      ? rows.filter((r) => r.role === 'admin' && regByAdminId[String(r.id)])
      : rows;
    return {
      total: base.length,
      admin: base.filter((r) => r.role === 'admin').length,
      user: base.filter((r) => r.role === 'user').length,
      superadmin: base.filter((r) => r.role === 'superadmin').length
    };
  }, [rows, showRegisteredOnly, regByAdminId]);

  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [search, roleFilter, showRegisteredOnly]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;

    if (showRegisteredOnly) {
      list = list.filter((r) => r.role === 'admin' && regByAdminId[String(r.id)]);
    }

    return list.filter((r) => {
      const matchesRole = roleFilter === 'all' || r.role === roleFilter;
      const matchesSearch = !q || [r.name, r.email, r.mobile, r.hospital].filter(Boolean).some((v) => v.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [rows, showRegisteredOnly, regByAdminId, roleFilter, search]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

  const statCards = [
    { title: 'Registered Admins', value: counts.total, icon: BadgeCheck, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
    { title: 'Admins', value: counts.admin, icon: UserCog, bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-500' },
    { title: 'Users', value: counts.user, icon: User, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-500' },
    { title: 'Super Admins', value: counts.superadmin, icon: Shield, bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' }
  ];

  return (
    <DashboardLayout title="Users" subtitle="View and manage every account, especially registered hospital admins." user={user}>
      <DashboardTabs role="superadmin" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className={`bg-white rounded-2xl p-4 sm:p-6 shadow border-b-4 ${c.border}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">{c.title}</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-medical-dark mt-2">{c.value}</p>
                </div>
                <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-medical-dark">All users</h2>
            <p className="text-sm text-gray-500">
              {filtered.length} of {showRegisteredOnly ? rows.filter(r => r.role === 'admin' && regByAdminId[String(r.id)]).length : rows.length} shown
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, hospital…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue bg-white">
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <button onClick={loadAll} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition">
              <RefreshCw size={16} /> Refresh
            </button>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold px-5 py-2 rounded-full transition shadow-sm">
              <Plus size={18} /> {showForm ? 'Close' : 'Add User'}
            </button>
          </div>
        </div>

        {/* Toggle and informative message */}
        <div className="mb-4 flex flex-col gap-3">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={showRegisteredOnly} onChange={(e) => setShowRegisteredOnly(e.target.checked)} className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-blue"></div>
            <span className="ml-2 text-sm font-medium text-gray-700">Show only registered demo admins</span>
          </label>

          {/* Explanation when no registered admins found */}
          {showRegisteredOnly && filtered.length === 0 && !loading && registrations.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">No approved admin accounts yet.</p>
                <p className="mt-1">
                  These registrations exist, but their admin users haven’t been created because they are still pending or need activation. 
                  Go to the <span className="font-bold text-medical-blue">Registrations tab</span>, click <strong>Approve</strong> (or <strong>Activate</strong>) on a registration. 
                  An admin account will be automatically created and will then appear in this list.
                </p>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={submit} className="overflow-hidden">
              <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Jane Doe" />
                <Input label="Email *" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="jane@example.com" />
                <Input label="Mobile" value={form.mobile} onChange={(v) => setForm((f) => ({ ...f, mobile: v.replace(/\D/g, '').slice(0, 10) }))} placeholder="9876543210" />
                <Input label={editing ? 'New password (leave blank to keep)' : 'Password *'} type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="••••••••" />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm bg-white">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <Input label="Hospital (for admins)" value={form.hospital} onChange={(v) => setForm((f) => ({ ...f, hospital: v }))} placeholder="Happy Paws Veterinary" />
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-medical-blue hover:bg-medical-dark text-white font-bold py-2.5 px-6 rounded-full transition text-sm">
                    {editing ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-medical-blue/10 text-medical-dark text-sm">
                  <th className="py-3 px-4 font-semibold rounded-tl-lg">Name</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Registered Hospital</th>
                  <th className="py-3 px-4 font-semibold">Reg. Status</th>
                  <th className="py-3 px-4 font-semibold">Assigned Hospital</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => {
                  const reg = regByAdminId[String(u.id)];
                  return (
                    <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                      <td className="py-4 px-4 font-semibold text-medical-dark">{u.name}</td>
                      <td className="py-4 px-4">
                        <div className="text-gray-800">{u.email}</div>
                        {u.mobile && <div className="text-gray-500 text-xs">{u.mobile}</div>}
                      </td>
                      <td className="py-4 px-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                      <td className="py-4 px-4 text-gray-600">
                        {reg ? reg.hospitalName : '—'}
                      </td>
                      <td className="py-4 px-4">
                        {reg ? (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${REG_STATUS_STYLES[reg.status] || 'bg-gray-100 text-gray-600'}`}>
                            {reg.status}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {u.hospital || (reg ? reg.hospitalId || '—' : '—')}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <ActionBtn onClick={() => openEdit(u)} className="text-blue-600 hover:bg-blue-50"><Edit3 size={14} /> Edit</ActionBtn>
                          {u.role !== 'superadmin' && (
                            <ActionBtn onClick={() => toggleActive(u)} className={u.active ? 'text-gray-600 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'}>
                              <Power size={14} /> {u.active ? 'Deactivate' : 'Activate'}
                            </ActionBtn>
                          )}
                          {u.role !== 'superadmin' && (
                            <ActionBtn onClick={() => remove(u)} className="text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</ActionBtn>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" className="py-12 text-center text-gray-500 italic">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
      </div>
    </DashboardLayout>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm bg-white text-gray-900" />
    </div>
  );
}

function ActionBtn({ onClick, className = '', children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${className}`}>
      {children}
    </button>
  );
}