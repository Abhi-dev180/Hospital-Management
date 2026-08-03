import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  PhoneCall,
  FileText,
  MessageSquare,
  Send,
  Loader2,
  Star,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import SlotSelector from '../../components/SlotSelector';
import Pagination from '../../components/Pagination';
import { ListSkeleton } from '../../components/Loader';

const APPOINTMENTS_PER_PAGE = 3;

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [transcriptions, setTranscriptions] = useState([]);
  const [formData, setFormData] = useState({
    hospitalId: '',
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    email: '',
    reason: ''
  });

  const [feedbackData, setFeedbackData] = useState({
    hospitalId: '',
    rating: 5,
    message: ''
  });

  // ─── Pagination state ──────────────────────────────────────
  const [page, setPage] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({ ...prev, email: parsedUser.email || '' }));
      fetchHospitals();
      fetchAppointments(token);
      fetchTranscriptions(token);
    }
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(data || []);
    } catch {
      toast.error('Failed to load hospitals');
    }
  };

  const fetchAppointments = async (token) => {
    setLoadingAppointments(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAppointments(data || []);
    } catch {
      toast.error('Failed to load appointments');
    }
    finally {
      setLoadingAppointments(false);
    }
  };

  const fetchTranscriptions = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/calls/transcriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTranscriptions(data || []);
    } catch {
      toast.error('Failed to load transcriptions');
    }
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientPhone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFeedbackChange = (e) => {
    setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value });
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!formData.hospitalId || !formData.date || !formData.time || !formData.patientName || !formData.patientPhone) {
      return toast.error('Please fill all required fields');
    }

    if (!/^\d{10}$/.test(formData.patientPhone.trim())) {
      return toast.error('Mobile number must be exactly 10 digits');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return toast.error('Please enter a valid email address');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || user?.email || ''
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchAppointments(token);
        setFormData({
          hospitalId: '',
          date: '',
          time: '',
          patientName: '',
          patientPhone: '',
          email: user?.email || '',
          reason: ''
        });
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  // const handleSubmitFeedback = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const token = localStorage.getItem('token');
  //     const res = await fetch(`${API_URL}/api/feedback`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`
  //       },
  //       body: JSON.stringify(feedbackData)
  //     });

  //     const data = await res.json();
  //     if (res.ok) {
  //       toast.success(data.message);
  //       setFeedbackData({ hospitalId: '', rating: 5, message: '' });
  //     } else {
  //       toast.error(data.message || 'Failed to submit feedback');
  //     }
  //   } catch {
  //     toast.error('Failed to submit feedback');
  //   }
  // };

  const handleSubmitFeedback = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    // ✅ Updated endpoint: /api/feedback (not /api/feedbacks)
    const res = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setFeedbackData({ hospitalId: '', rating: 5, message: '' });
    } else {
      toast.error(data.message || 'Failed to submit feedback');
    }
  } catch {
    toast.error('Failed to submit feedback');
  }
};

  const handleCallHospital = async () => {
    if (!formData.hospitalId || !formData.patientName || !formData.patientPhone) {
      return toast.error('Select hospital and enter patient details first');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitalId: formData.hospitalId,
          patientName: formData.patientName,
          patientPhone: formData.patientPhone,
          notes: formData.reason || 'Patient requested a hospital callback'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchTranscriptions(token);
      } else {
        toast.error(data.message || 'Failed to log call');
      }
    } catch {
      toast.error('Failed to create call');
    }
  };

  // ─── Paginated appointments ──────────────────────────────
  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * APPOINTMENTS_PER_PAGE;
    return appointments.slice(start, start + APPOINTMENTS_PER_PAGE);
  }, [appointments, page]);

  const totalPages = Math.ceil(appointments.length / APPOINTMENTS_PER_PAGE);

  return (
    <DashboardLayout
      title="Patient Healthcare Dashboard"
      subtitle="Book appointments, view your schedule, and manage feedback."
      user={user}
    >
      {/* ─── Booking & Appointments Row ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Book Appointment Form ──────────────────────────── */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-medical-blue w-6 h-6" />
            <h2 className="text-2xl font-bold">Book Appointment</h2>
          </div>

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <select
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleAppointmentChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} - {h.location}
                </option>
              ))}
            </select>

            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleAppointmentChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Time</label>
              <input
                name="time"
                type="time"
                value={formData.time}
                onChange={handleAppointmentChange}
                className="w-full px-4 py-3 border rounded-xl"
                required
              />
              {formData.date && (
                <SlotSelector
                  date={formData.date}
                  hospitalId={formData.hospitalId}
                  selectedTime={formData.time}
                  onSelectTime={(slot) => setFormData((f) => ({ ...f, time: slot }))}
                />
              )}
            </div>

            <input
              name="patientName"
              type="text"
              placeholder="Patient Name"
              value={formData.patientName}
              onChange={handleAppointmentChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
            />
            <input
              name="patientPhone"
              type="text"
              placeholder="Phone Number (10 digits)"
              value={formData.patientPhone}
              onChange={handleAppointmentChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
              maxLength={10}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleAppointmentChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
            />
            <textarea
              name="reason"
              placeholder="Reason"
              value={formData.reason}
              onChange={handleAppointmentChange}
              className="w-full px-4 py-3 border rounded-xl"
              rows="3"
            />

            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-medical-blue text-white font-bold py-3 rounded-xl">
                Confirm Appointment
              </button>
              <button
                type="button"
                onClick={handleCallHospital}
                className="px-4 bg-green-600 text-white font-bold rounded-xl inline-flex items-center gap-2"
              >
                <PhoneCall size={16} /> Call
              </button>
            </div>
          </form>
        </div>

        {/* ─── My Appointments with Pagination ────────────────── */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-medical-blue w-5 h-5" />
              <h2 className="text-2xl font-bold">My Appointments</h2>
            </div>
            <span className="text-sm text-gray-500">{appointments.length} total</span>
          </div>

          {loadingAppointments ? (
            <ListSkeleton rows={3} />
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 italic text-center py-10">No appointments booked yet.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {paginatedAppointments.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-medical-dark">{app.patientName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            app.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{app.date} at {app.time}</p>
                        <p className="text-sm text-gray-600">Hospital: {app.hospital}</p>
                        {app.reason && <p className="text-sm italic text-gray-500 mt-1">{app.reason}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    page={page}
                    total={appointments.length}
                    perPage={APPOINTMENTS_PER_PAGE}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Feedback & Transcriptions Row ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* ─── Feedback Card ──────────────────────────────────── */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-medical-blue w-6 h-6" />
            <h2 className="text-2xl font-bold">Post Feedback</h2>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <select
              name="hospitalId"
              value={feedbackData.hospitalId}
              onChange={handleFeedbackChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Rating:</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFeedbackData(f => ({ ...f, rating: r }))}
                    className="text-2xl"
                  >
                    <Star
                      size={24}
                      className={r <= feedbackData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              name="message"
              rows="3"
              placeholder="Write your feedback"
              value={feedbackData.message}
              onChange={handleFeedbackChange}
              className="w-full px-4 py-3 border rounded-xl"
              required
            />

            <button type="submit" className="w-full bg-medical-blue text-white font-bold py-3 rounded-xl inline-flex justify-center items-center gap-2">
              <Send size={16} /> Submit Feedback
            </button>
          </form>
        </div>

        {/* ─── Transcriptions Card ────────────────────────────── */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-medical-blue w-6 h-6" />
            <h2 className="text-2xl font-bold">Call Transcriptions</h2>
          </div>

          {transcriptions.length === 0 ? (
            <p className="text-gray-500 italic text-center py-10">No transcriptions available.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {transcriptions.map((t) => (
                <div key={t.id} className="border rounded-2xl p-4">
                  <p className="text-sm text-gray-700">{t.transcript}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}