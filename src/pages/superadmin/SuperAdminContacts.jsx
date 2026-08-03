import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, Search, RefreshCw, Trash2, Send, X, MessageSquare,
  Inbox, Clock3, CheckCircle2, Archive, ChevronLeft, ChevronRight, CalendarDays, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import Loader, { TableSkeleton, StatSkeleton, OverlayLoader } from '../../components/Loader';

const STATUS_META = {
  new: { label: 'New', pill: 'bg-amber-100 text-amber-800', icon: Inbox },
  in_progress: { label: 'In Progress', pill: 'bg-blue-100 text-blue-800', icon: Clock3 },
  resolved: { label: 'Resolved', pill: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  closed: { label: 'Closed', pill: 'bg-slate-200 text-slate-700', icon: Archive }
};
const STATUS_OPTIONS = Object.keys(STATUS_META);
const ITEMS_PER_PAGE = 8;

const formatDate = (v) =>
  v ? new Date(v).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function SuperAdminContacts() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Respond drawer
  const [active, setActive] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in_progress');
  const [draftFeedback, setDraftFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ─── Auth gate ────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return navigate('/login');
    try {
      if (JSON.parse(stored).role !== 'superadmin') return navigate('/');
    } catch {
      return navigate('/login');
    }
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadContacts = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load messages');
      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      toast.error(err.message || 'Unable to load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtering ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.name, c.email, c.phone, c.subject, c.message].some((f) =>
        String(f || '').toLowerCase().includes(q)
      );
    });
  }, [contacts, search, statusFilter]);

  useEffect(() => setPage(1), [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ─── Respond ──────────────────────────────────────────────
  const openDrawer = (contact) => {
    setActive(contact);
    setDraftStatus(contact.status === 'new' ? 'in_progress' : contact.status);
    setDraftFeedback(contact.feedback || '');
  };

  const closeDrawer = () => {
    setActive(null);
    setDraftFeedback('');
  };

  const saveResponse = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contacts/${active.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: draftStatus, feedback: draftFeedback })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update this message');

      setContacts((prev) => prev.map((c) => (c.id === active.id ? data.contact : c)));
      toast.success(data.emailed ? 'Saved — the sender has been emailed 📧' : 'Message updated');
      closeDrawer();
      loadContacts({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Unable to update the message.');
    } finally {
      setSaving(false);
    }
  };

  // Quick status change straight from the table (still emails the sender).
  const quickStatus = async (contact, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update status');
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? data.contact : c)));
      toast.success(`Marked as ${STATUS_META[status]?.label || status}`);
      loadContacts({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Unable to update status.');
    }
  };

  const confirmDelete = (contact) => {
    toast((t) => (
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200 max-w-sm mx-auto text-sm">
        <p className="text-gray-900 mb-4">
          Delete the message from <span className="font-bold">{contact.name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 font-bold transition"
            onClick={() => {
              doDelete(contact.id);
              toast.dismiss(t.id);
            }}
          >
            Yes, delete
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-4 py-2 font-bold transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const doDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not delete');
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success('Message deleted');
      loadContacts({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Unable to delete the message.');
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    { key: 'total', title: 'Total Messages', value: counts.total, color: 'text-medical-blue', bg: 'bg-blue-50', icon: MessageSquare },
    { key: 'new', title: 'New / Unread', value: counts.new, color: 'text-amber-600', bg: 'bg-amber-50', icon: Inbox },
    { key: 'in_progress', title: 'In Progress', value: counts.in_progress, color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock3 },
    { key: 'resolved', title: 'Resolved', value: counts.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 }
  ];

  return (
    <DashboardLayout
      title="Contact Enquiries"
      subtitle="Review messages from the contact form, respond with feedback and keep senders updated by email."
    >
      {/* KPI cards */}
      {loading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((c) => {
            const Icon = c.icon;
            const isActive = statusFilter === c.key || (c.key === 'total' && statusFilter === 'all');
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setStatusFilter(c.key === 'total' ? 'all' : c.key)}
                className={`text-left bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between transition hover:shadow-md cursor-pointer ${
                  isActive ? 'border-medical-blue ring-2 ring-medical-blue/15' : 'border-gray-100'
                }`}
              >
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.title}</h3>
                  <p className={`text-3xl font-extrabold ${c.color}`}>{c.value ?? 0}</p>
                  <span className="text-xs font-bold text-gray-400 mt-1 block">Click to filter</span>
                </div>
                <div className={`p-3.5 rounded-2xl ${c.bg} ${c.color}`}>
                  <Icon size={22} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Enquiries</h2>
            <p className="text-sm text-gray-500">
              {filtered.length} message{filtered.length === 1 ? '' : 's'}
              {statusFilter !== 'all' ? ` · ${STATUS_META[statusFilter]?.label}` : ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, subject…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full bg-white text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-medical-blue/20"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadContacts()}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold transition text-sm"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-medical-blue/10 text-medical-dark">
                    <th className="py-3.5 px-4 font-semibold rounded-tl-lg">From</th>
                    <th className="py-3.5 px-4 font-semibold">Subject &amp; Message</th>
                    <th className="py-3.5 px-4 font-semibold">Received</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => {
                    const meta = STATUS_META[c.status] || STATUS_META.new;
                    return (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors align-top">
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-900">{c.name}</div>
                          <a href={`mailto:${c.email}`} className="text-xs text-medical-blue hover:underline flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {c.email}
                          </a>
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone size={12} /> {c.phone}
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-md">
                          <div className="font-semibold text-gray-800">{c.subject}</div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.message}</p>
                          {c.feedback && (
                            <p className="text-xs text-emerald-700 mt-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 line-clamp-2">
                              <strong>Replied:</strong> {c.feedback}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600 whitespace-nowrap text-xs">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} /> {formatDate(c.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={c.status}
                            onChange={(e) => quickStatus(c, e.target.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 outline-none cursor-pointer ${meta.pill}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-3">
                            <button
                              onClick={() => openDrawer(c)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition"
                            >
                              <Send size={15} /> Respond
                            </button>
                            <button
                              onClick={() => confirmDelete(c)}
                              disabled={deletingId === c.id}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition disabled:opacity-50"
                            >
                              {deletingId === c.id ? <Loader size="xs" /> : <Trash2 size={15} />} Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-14 text-center">
                        <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 italic">No contact messages found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
                <span className="text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-700">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-bold text-gray-700">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of{' '}
                  <span className="font-bold text-gray-700">{filtered.length}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 font-bold text-gray-700">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Respond drawer */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end"
            onClick={closeDrawer}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Respond to enquiry</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Saving emails <strong>{active.email}</strong> with the status and your feedback.
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-white/10 transition" aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Sender */}
                <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-800 font-bold">
                    <User size={15} className="text-medical-blue" /> {active.name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-medical-blue" /> {active.email}
                  </div>
                  {active.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="text-medical-blue" /> {active.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <CalendarDays size={14} /> {formatDate(active.createdAt)}
                  </div>
                </div>

                {/* Original message */}
                <div>
                  <span className="portal-label"><MessageSquare className="w-4 h-4 text-medical-blue" /> Their message</span>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-bold text-gray-900 mb-1.5">{active.subject}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{active.message}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="portal-label"><Clock3 className="w-4 h-4 text-medical-blue" /> Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((s) => {
                      const Icon = STATUS_META[s].icon;
                      const selected = draftStatus === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraftStatus(s)}
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                            selected
                              ? 'bg-medical-blue text-white border-medical-blue shadow-md shadow-medical-blue/20'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-medical-blue hover:text-medical-blue'
                          }`}
                        >
                          <Icon size={15} /> {STATUS_META[s].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <span className="portal-label"><Send className="w-4 h-4 text-medical-blue" /> Your feedback / reply</span>
                  <textarea
                    value={draftFeedback}
                    onChange={(e) => setDraftFeedback(e.target.value)}
                    rows={6}
                    className="portal-input resize-none"
                    placeholder="Write the reply the sender will receive by email…"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Leave blank to only update the status — the sender is still notified of the change.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveResponse}
                    disabled={saving}
                    className="btn btn-primary btn-md flex-1"
                  >
                    {saving ? <><Loader size="sm" className="text-white" /> Sending…</> : <><Send className="w-4 h-4" /> Save &amp; email sender</>}
                  </button>
                  <button type="button" onClick={closeDrawer} className="btn btn-outline btn-md">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saving && <OverlayLoader label="Sending your reply…" sub="Updating the record and emailing the sender" />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
