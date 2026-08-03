
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Calendar,
  Clock,
  Hospital,
  Phone,
  Loader2,
  X,
  CheckCircle2,
  Trash2,
  CalendarClock
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import Pagination from '../../components/Pagination';
import SlotSelector from '../../components/SlotSelector';
import { ListSkeleton } from '../../components/Loader';

const PER_PAGE = 5;

export default function UserMyAppointmentsList() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // ─── Modal state for reschedule ─────────────────────────────
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchAppointments();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        toast.error('Failed to load appointments');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Cancel appointment ──────────────────────────────────────
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const token = localStorage.getItem('token');
      // Use the full update endpoint (users can update their own)
      const res = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ─── Open reschedule modal ──────────────────────────────────
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.date || '');
    setNewTime(appointment.time || '');
    setShowRescheduleModal(true);
  };

  // ─── Submit reschedule ──────────────────────────────────────
  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      return toast.error('Please select both date and time');
    }

    // Check if the selected slot is booked (optional frontend check)
    // The backend will validate anyway

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      // Use the full update endpoint
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          status: 'Rescheduled'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Appointment rescheduled successfully');
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to reschedule');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter((app) => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (app.patientName || '').toLowerCase().includes(q) ||
      (app.hospital || '').toLowerCase().includes(q) ||
      (app.date || '').includes(q);
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  useEffect(() => setPage(1), [search, statusFilter]);

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
      Rescheduled: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout
      title="My Appointments"
      subtitle="View all your booked appointments and their status."
      user={user}
      showHeader={false}
    >
      <DashboardTabs role="user" />

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
        {/* Header with search & filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-medical-dark">Your Appointments</h2>
            <p className="text-sm text-gray-500">{filtered.length} of {appointments.length} records</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by patient, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-60 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-medical-blue focus:border-medical-blue outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full bg-white focus:ring-2 focus:ring-medical-blue focus:border-medical-blue outline-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Appointments list */}
        {loading ? (
          <ListSkeleton rows={4} className="py-4" />
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-semibold">No appointments found</p>
            <p className="text-sm">Book your first appointment from the dashboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-medical-dark">{app.patientName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Hospital size={15} className="text-medical-blue" />
                        <span>{app.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-medical-blue" />
                        <span>{app.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-medical-blue" />
                        <span>{app.time}</span>
                      </div>
                      {app.patientPhone && (
                        <div className="flex items-center gap-2">
                          <Phone size={15} className="text-medical-blue" />
                          <span>{app.patientPhone}</span>
                        </div>
                      )}
                    </div>
                    {app.reason && (
                      <p className="text-sm text-gray-500 mt-2 italic">"{app.reason}"</p>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                      <>
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} /> Cancel
                        </button>
                        <button
                          onClick={() => openRescheduleModal(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition"
                        >
                          <CalendarClock size={13} /> Reschedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PER_PAGE && (
          <div className="mt-6">
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        )}
      </div>

      {/* ─── Reschedule Modal with Slot Selector ──────────────── */}
      <AnimatePresence>
        {showRescheduleModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-medical-dark">Reschedule Appointment</h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReschedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Patient: <span className="font-normal">{selectedAppointment.patientName}</span>
                  </label>
                  <label className="block text-sm text-gray-500">
                    Current: {selectedAppointment.date} at {selectedAppointment.time}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">New Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">New Time *</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue outline-none"
                    required
                  />
                </div>

                {/* ─── Slot Selector ───────────────────────────── */}
                {newDate && selectedAppointment?.hospitalId && (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Available Slots</label>
                    <SlotSelector
                      date={newDate}
                      hospitalId={selectedAppointment.hospitalId}
                      selectedTime={newTime}
                      onSelectTime={(slot) => setNewTime(slot)}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-medical-blue text-white rounded-full font-semibold hover:bg-medical-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
                    {submitting ? 'Saving...' : 'Reschedule'}
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