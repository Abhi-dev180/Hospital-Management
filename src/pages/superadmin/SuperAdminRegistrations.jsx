import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Search, Trash2, CheckCircle2, XCircle, Building2, Power,
  ClipboardList, Clock, UserCheck, Ban, Link2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Loader';

const PER_PAGE = 6;

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-200 text-gray-600',
  denied: 'bg-red-100 text-red-700'
};

const emptyCounts = { total: 0, pending: 0, approved: 0, denied: 0, active: 0, inactive: 0 };
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function SuperAdminRegistrations() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hospitals, setHospitals] = useState([]);
  const [assignFor, setAssignFor] = useState(null); // registration being assigned
  const [assignChoice, setAssignChoice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return navigate('/login');
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'superadmin') return navigate('/');
    setUser(parsed);
    fetchRows();
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registrations`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Failed to load registrations'); setRows([]); setCounts(emptyCounts); return; }
      setRows(Array.isArray(data.registrations) ? data.registrations : []);
      setCounts(data.counts || emptyCounts);
    } catch {
      toast.error('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : data.hospitals || []);
    } catch { /* non-blocking */ }
  };

  const setStatus = async (r, status) => {
    if ((status === 'denied' || status === 'inactive') && !window.confirm(`Set "${r.hospitalName}" to ${status}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/registrations/${r.id}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Update failed');
      toast.success(data.message || 'Updated');
      fetchRows();
    } catch {
      toast.error('Update failed');
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the registration for "${r.hospitalName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/registrations/${r.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Delete failed');
      toast.success('Registration deleted');
      fetchRows();
    } catch {
      toast.error('Delete failed');
    }
  };

  const openAssign = (r) => { setAssignFor(r); setAssignChoice(r.hospitalId || ''); };

  const confirmAssign = async () => {
    if (!assignChoice) return toast.error('Pick a hospital');
    try {
      const res = await fetch(`${API_URL}/api/registrations/${assignFor.id}/assign-hospital`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ hospitalId: assignChoice })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Assign failed');
      toast.success('Hospital assigned');
      setAssignFor(null);
      fetchRows();
    } catch {
      toast.error('Assign failed');
    }
  };

  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch = !q || [r.hospitalName, r.contactName, r.email, r.city, r.username]
        .filter(Boolean).some((v) => v.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

  const statCards = [
    { title: 'Total', value: counts.total, icon: ClipboardList, color: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
    { title: 'Pending', value: counts.pending, icon: Clock, color: 'border-amber-500', bg: 'bg-amber-100', text: 'text-amber-600' },
    { title: 'Active', value: counts.active, icon: UserCheck, color: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
    { title: 'Denied', value: counts.denied, icon: Ban, color: 'border-red-500', bg: 'bg-red-100', text: 'text-red-600' }
  ];

  const hospitalName = (id) => hospitals.find((h) => String(h.id) === String(id))?.name;

  return (
    <DashboardLayout title="Registrations" subtitle="Review hospital registrations — approve, deny, activate, and assign a hospital." user={user}>
      <DashboardTabs role="superadmin" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className={`bg-white rounded-2xl p-4 sm:p-6 shadow border-b-4 ${c.color}`}>
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
            <h2 className="text-xl font-bold text-medical-dark">All registrations</h2>
            <p className="text-sm text-gray-500">{filtered.length} of {rows.length} shown</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hospital, name, email…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-medical-blue bg-white">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="denied">Denied</option>
            </select>
            <button onClick={fetchRows} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-medical-blue/10 text-medical-dark text-sm">
                  <th className="py-3 px-4 font-semibold rounded-tl-lg">Hospital</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold">Assigned</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-medical-dark">{r.hospitalName}</div>
                      <div className="text-gray-500 text-xs">{[r.city, r.beds ? `${r.beds} beds` : null].filter(Boolean).join(' · ') || '—'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-800">{r.contactName}</div>
                      <div className="text-gray-500 text-xs">{r.email}</div>
                      {r.phone && <div className="text-gray-500 text-xs">{r.phone}</div>}
                    </td>
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{fmt(r.createdAt)}</td>
                    <td className="py-4 px-4">
                      {r.hospitalId
                        ? <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium"><Building2 size={14} /> {hospitalName(r.hospitalId) || r.hospitalId}</span>
                        : <span className="text-gray-400 text-xs">Not assigned</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {/* Assign a hospital — available at any status */}
                        <ActionBtn onClick={() => openAssign(r)} className="text-medical-blue hover:bg-blue-50">
                          <Link2 size={14} /> {r.hospitalId ? 'Reassign' : 'Assign'}
                        </ActionBtn>

                        {/* Approve → creates the admin login (pending or previously denied) */}
                        {(r.status === 'pending' || r.status === 'denied') && (
                          <ActionBtn onClick={() => setStatus(r, 'approved')} className="text-green-600 hover:bg-green-50"><CheckCircle2 size={14} /> Approve</ActionBtn>
                        )}
                        {/* Activate / Deactivate */}
                        {r.status === 'inactive' && (
                          <ActionBtn onClick={() => setStatus(r, 'active')} className="text-green-600 hover:bg-green-50"><Power size={14} /> Activate</ActionBtn>
                        )}
                        {r.status === 'active' && (
                          <ActionBtn onClick={() => setStatus(r, 'inactive')} className="text-gray-600 hover:bg-gray-100"><Power size={14} /> Deactivate</ActionBtn>
                        )}
                        {/* Deny — available unless already denied */}
                        {r.status !== 'denied' && (
                          <ActionBtn onClick={() => setStatus(r, 'denied')} className="text-red-600 hover:bg-red-50"><XCircle size={14} /> Deny</ActionBtn>
                        )}
                        <ActionBtn onClick={() => remove(r)} className="text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</ActionBtn>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="py-12 text-center text-gray-500 italic">No registrations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
      </div>

      {/* Assign-hospital modal */}
      <AnimatePresence>
        {assignFor && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssignFor(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-medical-dark">Assign a hospital</h3>
                <button onClick={() => setAssignFor(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Link <strong>{assignFor.hospitalName}</strong> to a hospital in the system. The linked admin ({assignFor.email}) will manage it.</p>
              <select value={assignChoice} onChange={(e) => setAssignChoice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-medical-blue bg-white mb-5">
                <option value="">Select a hospital…</option>
                {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssignFor(null)} className="px-5 py-2 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmAssign} className="px-5 py-2 rounded-full bg-medical-dark hover:bg-medical-blue text-white font-semibold">Assign</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function ActionBtn({ onClick, className = '', children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${className}`}>
      {children}
    </button>
  );
}
