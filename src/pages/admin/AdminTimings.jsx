
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Building2, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import API_URL from '../../config/api';
import DashboardTabs from '../../components/DashboardTabs';
import { SectionLoader } from '../../components/Loader';

// ─── Default Days ─────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatTime = (timeStr) => {
  if (!timeStr) return '--';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

// Helper to parse old string format into an array (if needed)
const parseTimingsString = (timingsStr) => {
  if (!timingsStr) return DAYS.map(day => ({ day, start: '09:00', end: '17:00', status: 'Open' }));
  // Simple fallback logic if your API returns "Mon - Sat 09:00 - 18:00"
  // We return a default structure and let the user edit it.
  return DAYS.map(day => ({ 
    day, 
    start: '09:00', 
    end: '17:00', 
    status: day === 'Sunday' ? 'Closed' : 'Open' 
  }));
};

export default function AdminTimings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Store the 7-day schedule
  const [schedule, setSchedule] = useState(DAYS.map(day => ({ day, start: '09:00', end: '17:00', status: 'Open' })));
  
  // Editing state
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({ start: '09:00', end: '17:00', status: 'Open' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const loadTimings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hospitals`);
        const hospitalsData = res.ok ? await res.json() : [];
        const ownHospital = (Array.isArray(hospitalsData) ? hospitalsData : []).find(
          (h) => h.id === parsedUser?.hospitalId
        );
        
        if (ownHospital) {
          // If backend returns a string, try parsing it. Otherwise use default.
          const parsedSchedule = parseTimingsString(ownHospital.timings);
          setSchedule(parsedSchedule);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load hospital timings');
      } finally {
        setLoading(false);
      }
    };

    loadTimings();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────
  const handleEdit = (dayObj) => {
    setEditingDay(dayObj.day);
    setEditForm({ start: dayObj.start, end: dayObj.end, status: dayObj.status });
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
  };

  const handleSaveEdit = () => {
    if (!editForm.start || !editForm.end) {
      return toast.error('Please select both start and end times.');
    }
    setSchedule(prev => prev.map(item => 
      item.day === editingDay ? { ...item, start: editForm.start, end: editForm.end, status: editForm.status } : item
    ));
    setEditingDay(null);
    toast.success('Timing updated locally. Click "Save Changes" to apply.');
  };

  const handleToggleStatus = (day) => {
    if (editingDay === day) return;
    setSchedule(prev => prev.map(item => 
      item.day === day ? { ...item, status: item.status === 'Open' ? 'Closed' : 'Open' } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Transforms the array into a user-friendly string for your current backend
      // e.g., "Monday 09:00 - 17:00, Tuesday 09:00 - 17:00, Sunday Closed"
      const timingsString = schedule
        .map(item => {
          if (item.status === 'Closed') return `${item.day} Closed`;
          return `${item.day} ${formatTime(item.start)} - ${formatTime(item.end)}`;
        })
        .join(', ');

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/hospitals/admin/update-timings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ timings: timingsString, emergency: '24/7 Emergency' })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Hospital timings updated');
      } else {
        toast.error(data.message || 'Failed to update timings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while updating timings');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full px-2 sm:px-3 py-4 space-y-4">
      <DashboardTabs role="admin" />
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Building2 className="w-6 h-6 text-medical-blue" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Hospital Business Hours</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage the operational schedule for your hospital</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving || loading}
          className="btn btn-primary btn-md w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <SectionLoader label="Loading schedule…" sub="Fetching business hours" minHeight="min-h-[300px]" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50/50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-blue-100">
                <th className="py-4 px-6">DAY</th>
                <th className="py-4 px-6">HOURS</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {schedule.map((item) => {
                const isEditing = editingDay === item.day;
                return (
                  <tr 
                    key={item.day} 
                    className={`group hover:bg-gray-50/80 transition-colors ${isEditing ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Day */}
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {item.day}
                    </td>

                    {/* Hours */}
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={editForm.start} 
                            onChange={(e) => setEditForm(f => ({ ...f, start: e.target.value }))}
                            className="px-2 py-1 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-medical-blue outline-none"
                            required
                          />
                          <span className="text-gray-400">—</span>
                          <input 
                            type="time" 
                            value={editForm.end} 
                            onChange={(e) => setEditForm(f => ({ ...f, end: e.target.value }))}
                            className="px-2 py-1 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-medical-blue outline-none"
                            required
                          />
                        </div>
                      ) : (
                        <div className={`inline-block px-3 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-blue-700 font-medium text-xs`}>
                          {item.status === 'Closed' ? '—' : `${formatTime(item.start)} — ${formatTime(item.end)}`}
                        </div>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <select 
                          value={editForm.status} 
                          onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                          className="px-2 py-1 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-medical-blue outline-none font-medium"
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(item.day)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            item.status === 'Open' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Open' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {item.status}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={handleSaveEdit}
                            className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition shadow-sm"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                            title="Edit timing"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {item.status === 'Closed' ? (
                            <button 
                              onClick={() => handleToggleStatus(item.day)}
                              className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
                              title="Open this day"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(item.day)}
                              className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition"
                              title="Close this day"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <p className="text-[10px] text-gray-400 mt-4">
        * Click the Status pill to quickly toggle a day Open/Closed. Click the Edit (pencil) icon to adjust the time range for a specific day.
      </p>
    </motion.div>
  </div>
  );
}