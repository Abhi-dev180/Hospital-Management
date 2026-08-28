import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, Search, RefreshCw, Trash2, Send, X, MessageSquare,
  Inbox, Clock3, CheckCircle2, Archive, ChevronLeft, ChevronRight, CalendarDays, User,
  Paperclip, ExternalLink, FileText, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import Loader, { TableSkeleton, StatSkeleton, OverlayLoader } from '../../components/Loader';
import { useWebSocket } from '../../hooks/useWebSocket';

const STATUS_META = {
  new: { label: 'New', pill: 'bg-amber-100 text-amber-800', icon: Inbox },
  in_progress: { label: 'In Progress', pill: 'bg-blue-100 text-blue-800', icon: Clock3 },
  resolved: { label: 'Resolved', pill: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  closed: { label: 'Closed', pill: 'bg-slate-200 text-slate-700', icon: Archive }
};
const STATUS_OPTIONS = Object.keys(STATUS_META);
const ITEMS_PER_PAGE = 6;

const formatDate = (v) =>
  v ? new Date(v).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function SuperAdminContacts() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceTab, setSourceTab] = useState('all');
  const [page, setPage] = useState(1);

  // Bulk selection & deletion
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Respond drawer & attachments
  const [active, setActive] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in_progress');
  const [draftFeedback, setDraftFeedback] = useState('');
  const [draftFiles, setDraftFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginated.map((c) => String(c.id));
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected support message(s)?`)) return;

    setBulkDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contacts/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Bulk delete failed');

      setContacts((prev) => prev.filter((c) => !selectedIds.includes(String(c.id))));
      setSelectedIds([]);
      toast.success(`🗑️ ${data.message || 'Selected messages deleted.'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete selected messages.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleOpenAttachment = (att) => {
    const fileUrl = typeof att === 'string'
      ? att
      : (att?.url || att?.link || att?.path || att?.data || att?.href || att?.secure_url);

    if (!fileUrl) {
      toast.error('Attachment file link is unavailable.');
      return;
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (fileUrl.startsWith('data:')) {
      const win = window.open();
      if (!win) {
        toast.error('Pop-up blocked by browser. Please allow pop-ups for this site.');
        return;
      }
      if (fileUrl.startsWith('data:image')) {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>${att.filename || 'Image Attachment'}</title></head>
            <body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;">
              <img src="${fileUrl}" style="max-width:95vw; max-height:95vh; object-fit:contain; border-radius:12px; shadow:0 25px 50px -12px rgba(0,0,0,0.5);" />
            </body>
          </html>
        `);
      } else if (fileUrl.startsWith('data:application/pdf')) {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>${att.filename || 'PDF Document'}</title></head>
            <body style="margin:0; height:100vh; overflow:hidden; background:#1e293b;">
              <iframe src="${fileUrl}" frameborder="0" style="width:100%; height:100vh; border:none;"></iframe>
            </body>
          </html>
        `);
      } else {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = att.filename || 'attachment';
        a.click();
      }
    } else {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderClickableMessage = (text) => {
    if (!text) return null;

    const urlMatches = Array.from(text.matchAll(/(\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|https?:\/\/[^\s]+|www\.[^\s]+)/g));

    if (urlMatches.length === 0) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    const parts = [];
    let lastIdx = 0;

    urlMatches.forEach((match, index) => {
      const matchText = match[0];
      const matchIdx = match.index;

      if (matchIdx > lastIdx) {
        parts.push(<span key={`text-${index}`}>{text.slice(lastIdx, matchIdx)}</span>);
      }

      let linkTitle = '📁 Download / View File';
      let href = matchText;

      if (matchText.startsWith('[')) {
        linkTitle = match[2] || '📁 Download / View File';
        href = match[3];
      } else {
        href = matchText.startsWith('www.') ? `https://${matchText}` : matchText;
        const isImage = /\.(jpeg|jpg|gif|png|webp|svg)/i.test(href) || href.includes('cloudinary');
        linkTitle = isImage ? '📷 View Attached Image / File' : '📁 Download / View File';
      }

      parts.push(
        <a
          key={`link-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all shadow-2xs my-1 cursor-pointer"
        >
          <Paperclip size={13} className="text-blue-600 shrink-0" />
          <span>{linkTitle}</span>
          <ExternalLink size={11} className="shrink-0 text-blue-500" />
        </a>
      );

      lastIdx = matchIdx + matchText.length;
    });

    if (lastIdx < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIdx)}</span>);
    }

    return <div className="whitespace-pre-wrap">{parts}</div>;
  };

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
    } catch (err) {
      toast.error(err.message || 'Unable to load contact messages.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useWebSocket("contact_created", (newContact) => {
    setContacts((prev) => {
      if (prev.some(c => String(c.id) === String(newContact.id))) return prev;
      return [newContact, ...prev];
    });
    toast.success(`📩 New inquiry from ${newContact.name}`);
  });

  useWebSocket("contact_updated", (updatedContact) => {
    setContacts((prev) => prev.map(c => String(c.id) === String(updatedContact.id) ? updatedContact : c));
  });

  useWebSocket("contact_deleted", ({ id }) => {
    setContacts((prev) => prev.filter((c) => String(c.id) !== String(id)));
  });

  // ─── Filtering ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      const src = c.source || (String(c.id).startsWith('gmail_') ? 'support_email' : 'contact_form');
      if (sourceTab !== 'all' && src !== sourceTab) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.name, c.email, c.phone, c.subject, c.message].some((f) =>
        String(f || '').toLowerCase().includes(q)
      );
    });
  }, [contacts, search, statusFilter, sourceTab]);

  const sourceCounts = useMemo(() => {
    return contacts.reduce(
      (acc, c) => {
        acc.all += 1;
        const src = c.source || (String(c.id).startsWith('gmail_') ? 'support_email' : 'contact_form');
        if (src === 'support_email') acc.support_email += 1;
        else acc.contact_form += 1;
        return acc;
      },
      { all: 0, support_email: 0, contact_form: 0 }
    );
  }, [contacts]);

  const counts = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.total += 1;
        const st = c.status || 'new';
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      },
      { total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0 }
    );
  }, [filtered]);

  useEffect(() => setPage(1), [search, statusFilter, sourceTab]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ─── Respond Drawer & Attachment Handling ───────────────
  const openDrawer = (contact) => {
    setActive(contact);
    setDraftStatus(contact.status === 'new' ? 'resolved' : contact.status);
    setDraftFeedback(contact.feedback || '');
    setDraftFiles([]);
  };

  const closeDrawer = () => {
    setActive(null);
    setDraftFeedback('');
    setDraftFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDraftFiles((prev) => [
          ...prev,
          { filename: file.name, data: event.target.result }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDraftFile = (index) => {
    setDraftFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const saveResponse = async () => {
    if (!active) return;
    if (!draftFeedback || !draftFeedback.trim()) {
      return toast.error('Please enter a reply message before sending.');
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/contacts/${active.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          replyMessage: draftFeedback,
          status: draftStatus,
          attachments: draftFiles
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not send reply');

      setContacts((prev) => prev.map((c) => (String(c.id) === String(active.id) ? data.contact : c)));
      toast.success(data.emailed ? `Reply & attachments sent to ${active.email} 📧` : 'Reply saved successfully');
      closeDrawer();
      loadContacts({ silent: true });
    } catch (err) {
      toast.error(err.message || 'Unable to send reply email.');
    } finally {
      setSaving(false);
    }
  };

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
      setContacts((prev) => prev.map((c) => (String(c.id) === String(contact.id) ? data.contact : c)));
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
      setContacts((prev) => prev.filter((c) => String(c.id) !== String(id)));
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
    // title="Support Email Inbox (rajdevfree@gmail.com)"
    // subtitle="All inquiries sent to rajdevfree@gmail.com appear here in real-time via Pub/Sub. Admin can view messages, attach files, and send replies directly to recipient's email."
    >
      {/* Support Mail Live Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Mail className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Support Email Inbox</h2>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold px-3 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Pub/Sub Active
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Official Support Address: <strong className="text-white font-mono underline decoration-blue-400">rajdevfree@gmail.com</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs text-blue-100">
          <span>Replies sent automatically from <strong>rajdevfree@gmail.com</strong> with Cloudinary attachments</span>
        </div>
      </div>

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
                className={`text-left bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between transition hover:shadow-md cursor-pointer ${isActive ? 'border-medical-blue ring-2 ring-medical-blue/15' : 'border-gray-100'
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

        {/* Section Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setSourceTab('all')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${sourceTab === 'all'
                ? 'border-medical-blue text-medical-blue font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            <MessageSquare size={16} /> All Inquiries
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{sourceCounts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceTab('support_email')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${sourceTab === 'support_email'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            <Mail size={16} className="text-indigo-600" /> Support Emails (rajdevfree@gmail.com)
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">{sourceCounts.support_email}</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceTab('contact_form')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${sourceTab === 'contact_form'
                ? 'border-emerald-600 text-emerald-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            <Globe size={16} className="text-emerald-600" /> Contact Us Web Form
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs">{sourceCounts.contact_form}</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {sourceTab === 'support_email' && <Mail className="w-6 h-6 text-indigo-600" />}
              {sourceTab === 'contact_form' && <Globe className="w-6 h-6 text-emerald-600" />}
              {sourceTab === 'all' && <MessageSquare className="w-6 h-6 text-medical-blue" />}
              {sourceTab === 'support_email' && 'Support Emails (rajdevfree@gmail.com)'}
              {sourceTab === 'contact_form' && 'Contact Us Web Form Submissions'}
              {sourceTab === 'all' && 'All Inbound Queries'}
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filtered.length} query message{filtered.length === 1 ? '' : 's'}
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
              className="px-4 py-2 border border-gray-300 rounded-full bg-white text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-medical-blue/20 cursor-pointer"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadContacts()}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold transition text-sm cursor-pointer"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg mb-5 animate-fade-in border border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Selected <span className="bg-blue-600/50 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full font-mono text-xs">{selectedIds.length}</span> message{selectedIds.length === 1 ? '' : 's'}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {bulkDeleting ? <Loader size="xs" /> : <Trash2 size={14} />} Delete Selected ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-medical-blue/10 text-medical-dark">
                    <th className="py-3.5 px-4 font-semibold rounded-tl-lg w-10 text-center">
                      <input
                        type="checkbox"
                        checked={paginated.length > 0 && paginated.every((c) => selectedIds.includes(String(c.id)))}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-medical-blue focus:ring-medical-blue cursor-pointer"
                        title="Select/Deselect all on this page"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-semibold">From</th>
                    <th className="py-3.5 px-4 font-semibold">Subject &amp; Inquiry</th>
                    <th className="py-3.5 px-4 font-semibold">Received</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => {
                    const meta = STATUS_META[c.status] || STATUS_META.new;
                    const atts = c.attachments || [];
                    const isSupportMail = c.source === 'support_email' || String(c.id).startsWith('gmail_');
                    const isChecked = selectedIds.includes(String(c.id));

                    return (
                      <tr key={c.id} className={`border-b border-gray-100 transition-colors align-top ${isChecked ? 'bg-blue-50/70' : 'hover:bg-gray-50/80'}`}>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectOne(String(c.id))}
                            className="w-4 h-4 rounded border-gray-300 text-medical-blue focus:ring-medical-blue cursor-pointer"
                          />
                        </td>
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
                          {isSupportMail ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5">
                              <Mail size={10} /> Support Email (rajdevfree@gmail.com)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5">
                              <Globe size={10} /> Contact Us Web Form
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-md">
                          <div className="font-semibold text-gray-800">{c.subject}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {renderClickableMessage(c.message)}
                          </div>

                          {/* Attachments listing */}
                          {atts.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {atts.map((att, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleOpenAttachment(att)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 transition cursor-pointer"
                                >
                                  <Paperclip size={11} /> {att.filename || 'Attached File'} <ExternalLink size={10} />
                                </button>
                              ))}
                            </div>
                          )}

                          {c.feedback && (
                            <p className="text-xs text-emerald-800 mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2 leading-relaxed">
                              <strong>Reply Sent:</strong> {c.feedback}
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
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 transition cursor-pointer"
                            >
                              <Send size={13} /> Reply Email
                            </button>
                            <button
                              onClick={() => confirmDelete(c)}
                              disabled={deletingId === c.id}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === c.id ? <Loader size="xs" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-14 text-center">
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
                    className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 font-bold text-gray-700">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer"
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
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    <Mail size={12} /> Support Email Reply
                  </span>
                  <h3 className="text-lg font-bold">Reply from rajdevfree@gmail.com</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sending to <strong className="text-white font-mono">{active.email}</strong>
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer" aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Sender card */}
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
                    <CalendarDays size={14} /> Received: {formatDate(active.createdAt)}
                  </div>
                </div>

                {/* Original message */}
                <div>
                  <span className="portal-label"><MessageSquare className="w-4 h-4 text-medical-blue" /> Inquiry Subject &amp; Message</span>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-bold text-gray-900 mb-1.5">{active.subject}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{active.message}</p>

                    {active.attachments && active.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-1.5">User Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {active.attachments.map((att, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleOpenAttachment(att)}
                              className="text-xs text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1 border border-blue-100 font-semibold cursor-pointer"
                            >
                              <Paperclip size={12} /> {att.filename} <ExternalLink size={10} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <span className="portal-label"><Clock3 className="w-4 h-4 text-medical-blue" /> Set Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((s) => {
                      const Icon = STATUS_META[s].icon;
                      const selected = draftStatus === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraftStatus(s)}
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition cursor-pointer ${selected
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

                {/* Response Message Textarea */}
                <div>
                  <span className="portal-label"><Send className="w-4 h-4 text-medical-blue" /> Your Reply Message</span>
                  <textarea
                    value={draftFeedback}
                    onChange={(e) => setDraftFeedback(e.target.value)}
                    rows={6}
                    className="portal-input resize-none"
                    placeholder="Write your response message here. The recipient will receive an attractive HTML email…"
                    required
                  />
                </div>

                {/* File Attachment Uploader for Admin */}
                <div>
                  <span className="portal-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-medical-blue" /> Attach Files to Email
                    </span>
                    <span className="text-xs text-gray-400 font-normal">Cloudinary Auto-Upload</span>
                  </span>

                  <input
                    type="file"
                    multiple
                    id="admin-reply-file-input"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-reply-file-input"
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-medical-blue bg-slate-50/50 hover:bg-blue-50/30 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Paperclip size={15} className="text-medical-blue" />
                    <span>Upload Documents / Images (PDF, DOC, JPG)</span>
                  </label>

                  {draftFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {draftFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs font-semibold text-slate-800">
                          <span className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-blue-600 shrink-0" />
                            <span className="truncate">{file.filename}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDraftFile(idx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveResponse}
                    disabled={saving}
                    className="btn btn-primary btn-md flex-1 cursor-pointer"
                  >
                    {saving ? (
                      <><Loader size="sm" className="text-white" /> Sending HTML Email…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Reply &amp; Email Sender</>
                    )}
                  </button>
                  <button type="button" onClick={closeDrawer} className="btn btn-outline btn-md cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saving && (
          <OverlayLoader
            label="Sending attractive HTML email…"
            sub="Uploading attachments to Cloudinary & dispatching email to recipient"
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
