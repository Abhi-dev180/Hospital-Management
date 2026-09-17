import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Star,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  PlusCircle,
  Search,
  Filter,
  User,
  ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import AppointmentFeedbackModal from '../../components/portal/AppointmentFeedbackModal';
import { ListSkeleton } from '../../components/Loader';

export default function UserFeedbacks() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'submitted'
  const [search, setSearch] = useState('');
  const [selectedAppointmentForModal, setSelectedAppointmentForModal] = useState(null);

  // Quick form state
  const [selectedApptId, setSelectedApptId] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser(JSON.parse(userData));
      loadData(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadData = async (token) => {
    setLoading(true);
    try {
      // Fetch user's appointments
      const apptRes = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (apptRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
        return;
      }
      const apptData = apptRes.ok ? await apptRes.json() : [];
      setAppointments(Array.isArray(apptData) ? apptData : []);

      // Fetch user's feedbacks
      const fbRes = await fetch(`${API_URL}/api/appointment-feedbacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (fbRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
        return;
      }
      const fbData = fbRes.ok ? await fbRes.json() : [];
      setFeedbacks(Array.isArray(fbData) ? fbData : []);
    } catch {
      toast.error('Failed to load feedback records');
    } finally {
      setLoading(false);
    }
  };

  // Determine which appointments have feedback
  const feedbackApptIds = useMemo(() => {
    const set = new Set();
    feedbacks.forEach((f) => {
      if (f.appointmentId) set.add(String(f.appointmentId));
      if (f.appointmentNumber) set.add(String(f.appointmentNumber));
    });
    return set;
  }, [feedbacks]);

  // Appointments pending feedback (strictly Completed visits only)
  const pendingAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const isRecorded =
        feedbackApptIds.has(String(a.id)) ||
        feedbackApptIds.has(String(a.appointment_number));
      return !isRecorded && a.status === 'Completed';
    });
  }, [appointments, feedbackApptIds]);

  const handleModalFeedbackSubmitted = (newFeedback) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
    const token = localStorage.getItem('token');
    if (token) loadData(token);
  };

  const handleDirectFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      return toast.error('Please select an appointment');
    }
    if (!message.trim()) {
      return toast.error('Please enter your feedback comments');
    }

    const appt = appointments.find((a) => String(a.id) === String(selectedApptId));
    if (!appt) return toast.error('Selected appointment not found');
    if (appt.status !== 'Completed') {
      return toast.error('Feedback can only be given after the appointment is marked as Completed by the hospital admin.');
    }

    setSubmittingForm(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        appointmentId: appt.id,
        appointmentNumber: appt.appointment_number,
        rating: Number(rating),
        feedbackText: message.trim(),
        message: message.trim(),
        hospitalId: appt.hospitalId,
        patientName: appt.patientName,
        petName: appt.petName,
        date: appt.date,
        time: appt.time
      };

      const res = await fetch(`${API_URL}/api/appointment-feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Feedback posted successfully!');
        setMessage('');
        setSelectedApptId('');
        loadData(token);
      } else {
        toast.error(data.message || 'Failed to submit feedback');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    if (!search) return feedbacks;
    const term = search.toLowerCase();
    return feedbacks.filter(
      (f) =>
        (f.patientName || '').toLowerCase().includes(term) ||
        (f.feedbackText || '').toLowerCase().includes(term) ||
        (f.date || '').toLowerCase().includes(term) ||
        String(f.appointmentNumber || '').includes(term)
    );
  }, [feedbacks, search]);

  return (
    <DashboardLayout
      title="Appointment Feedback & Reviews"
      subtitle="Share your medical experience, rate your doctors, and help us maintain premium healthcare standards."
      user={user}
    >
      <DashboardTabs role="user" />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-medical-blue rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <MessageSquare className="w-24 h-24" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Feedbacks Given</p>
          <p className="text-3xl font-extrabold mt-2">{feedbacks.length}</p>
          <p className="text-xs text-blue-100 mt-1">Verified patient reviews</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Clock className="w-24 h-24" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-100">Awaiting Feedback</p>
          <p className="text-3xl font-extrabold mt-2">{pendingAppointments.length}</p>
          <p className="text-xs text-amber-100 mt-1">Appointments ready for review</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Star className="w-24 h-24" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-100">Average Rating</p>
          <p className="text-3xl font-extrabold mt-2">
            {feedbacks.length > 0
              ? (
                  feedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
                  feedbacks.length
                ).toFixed(1) + ' ★'
              : '5.0 ★'}
          </p>
          <p className="text-xs text-teal-100 mt-1">Overall experience score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tabbed Feedbacks List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-tab Navigation */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-medical-blue text-white shadow-md'
                  : 'text-slate-600 hover:text-medical-blue hover:bg-slate-50'
              }`}
            >
              <span>Awaiting Feedback</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {pendingAppointments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'submitted'
                  ? 'bg-medical-blue text-white shadow-md'
                  : 'text-slate-600 hover:text-medical-blue hover:bg-slate-50'
              }`}
            >
              <span>My Submitted Reviews</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'submitted' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {feedbacks.length}
              </span>
            </button>
          </div>

          {/* Pending Appointments Tab */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Appointments Awaiting Your Review
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {pendingAppointments.length} pending
                </span>
              </div>

              {loading ? (
                <ListSkeleton rows={3} />
              ) : pendingAppointments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-slate-800">No Pending Reviews</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You have reviewed all completed appointments, or you have no completed appointments yet. Feedback is unlocked once the hospital marks your appointment as Completed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.map((appt) => (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {appt.hospital || 'Hospital Visit'}
                          </span>
                          {appt.appointment_number && (
                            <span className="bg-medical-blue/10 text-medical-blue text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                              #{appt.appointment_number}
                            </span>
                          )}
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            Pending Review
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {appt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {appt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {appt.patientName}
                          </span>
                        </div>
                        {appt.reason && (
                          <p className="text-xs text-slate-600 italic">
                            Reason: {appt.reason}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedAppointmentForModal(appt)}
                        className="px-4 py-2.5 bg-gradient-to-r from-medical-blue to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-medical-blue/20 transition whitespace-nowrap inline-flex items-center justify-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        Give Feedback
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submitted Reviews Tab */}
          {activeTab === 'submitted' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Your Past Reviews & Ratings
                </h3>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-blue/20"
                  />
                </div>
              </div>

              {loading ? (
                <ListSkeleton rows={3} />
              ) : filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-slate-800">No Feedback Submitted Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When you review your doctor consultations and hospital visits, they will show up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedbacks.map((fb) => (
                    <motion.div
                      key={fb.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {fb.patientName || 'Patient'}
                            </span>
                            {fb.appointmentNumber && (
                              <span className="bg-medical-blue/10 text-medical-blue text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                                Appt #{fb.appointmentNumber}
                              </span>
                            )}
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              {fb.feedbackStatus || 'Published'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            {fb.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Visit: {fb.date}
                              </span>
                            )}
                            {fb.created_at && (
                              <span>
                                Reviewed on {new Date(fb.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-900">
                            {fb.rating ? `${fb.rating}.0` : '5.0'}
                          </span>
                        </div>
                      </div>

                      {/* Review text */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
                        {fb.feedbackText || 'No comments provided.'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Feedback Box */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-medical-blue" />
              <h3 className="text-lg font-bold text-slate-900">Post Quick Feedback</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select an appointment from your booking history and submit your rating and suggestions.
            </p>

            <form onSubmit={handleDirectFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select Appointment
                </label>
                <select
                  value={selectedApptId}
                  onChange={(e) => setSelectedApptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-medical-blue outline-none"
                  required
                >
                  <option value="">-- Choose a completed visit --</option>
                  {appointments
                    .filter((a) => a.status === 'Completed')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.date} - {a.hospital || 'Hospital'} (#{a.appointment_number || a.id})
                      </option>
                    ))}
                </select>
                {appointments.filter((a) => a.status === 'Completed').length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    * Feedback is enabled once the hospital marks your visit as Completed.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-auto">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Your Review
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How was the doctor consultation, treatment explanation, and hospital cleanliness?"
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-medical-blue outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingForm}
                className="w-full py-3 bg-medical-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-medical-blue/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingForm ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Appointment Feedback Modal */}
      <AppointmentFeedbackModal
        isOpen={Boolean(selectedAppointmentForModal)}
        onClose={() => setSelectedAppointmentForModal(null)}
        appointment={selectedAppointmentForModal}
        onFeedbackSubmitted={handleModalFeedbackSubmitted}
      />
    </DashboardLayout>
  );
}
