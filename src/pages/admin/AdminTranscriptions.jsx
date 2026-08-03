import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, Plus, Edit3, Trash2, X } from 'lucide-react';
import API_URL from '../../config/api';
import Pagination from '../../components/Pagination';
import { TableSkeleton } from '../../components/Loader';

const emptyForm = { patientName: '', transcript: '' };
const PER_PAGE = 10;

export default function AdminTranscriptions() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const paginated = transcriptions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/calls/transcriptions`, { headers: authHeaders() });
      const data = res.ok ? await res.json() : [];
      setTranscriptions(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load transcriptions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t) => { setEditing(t); setForm({ patientName: t.patientName || '', transcript: t.transcript || '' }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.transcript.trim()) return toast.error('Transcript is required');
    try {
      const url = editing ? `${API_URL}/api/calls/transcriptions/${editing.id}` : `${API_URL}/api/calls/transcriptions`;
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Save failed');
      toast.success(editing ? 'Transcription updated' : 'Transcription added');
      setShowForm(false); setForm(emptyForm); setEditing(null); load();
    } catch { toast.error('Save failed'); }
  };

  const remove = async (t) => {
    if (!window.confirm('Delete this transcription?')) return;
    try {
      const res = await fetch(`${API_URL}/api/calls/transcriptions/${t.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Delete failed');
      toast.success('Transcription deleted'); load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-600" /> Transcriptions
        </h3>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold px-4 py-2 rounded-full text-sm transition">
          <Plus size={18} /> Add Transcription
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
            <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-medical-dark">{editing ? 'Edit' : 'Add'} Transcription</h4>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Patient / caller name</label>
              <input value={form.patientName} onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))} placeholder="Jane Doe" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm mb-4 outline-none focus:border-medical-blue" />
              <label className="block text-sm font-semibold text-gray-700 mb-1">Transcript *</label>
              <textarea value={form.transcript} onChange={(e) => setForm((f) => ({ ...f, transcript: e.target.value }))} rows={5} placeholder="Type or paste the conversation transcript…" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm mb-5 outline-none focus:border-medical-blue resize-none" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-medical-dark hover:bg-medical-blue text-white font-semibold">{editing ? 'Update' : 'Add'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : transcriptions.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <p>No transcriptions available.</p>
          </div>
        ) : (
          paginated.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {item.patientName && <p className="font-semibold text-medical-dark text-sm mb-1">{item.patientName}</p>}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.transcript}</p>
                  <p className="text-xs text-gray-400 mt-2">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold"><Edit3 size={14} /> Edit</button>
                  <button onClick={() => remove(item)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Pagination page={page} total={transcriptions.length} perPage={PER_PAGE} onChange={setPage} />
    </div>
  );
}
