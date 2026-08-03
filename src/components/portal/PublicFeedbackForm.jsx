import { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

export default function PublicFeedbackForm() {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({
    hospitalId: '',
    rating: 5,
    message: '',
    patientName: '',        // new
    appointmentDate: '',    // new
    petName: ''             // new
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/hospitals`)
      .then(res => res.json())
      .then(data => setHospitals(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load hospitals'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hospitalId) return toast.error('Please select a hospital');
    if (!form.message.trim()) return toast.error('Please enter your feedback');

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)   // send all fields
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to submit');
      toast.success('Feedback submitted successfully!');
      setForm({
        hospitalId: '',
        rating: 5,
        message: '',
        patientName: '',
        appointmentDate: '',
        petName: ''
      });
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-medical-dark mb-2">Share Your Feedback</h2>
      <p className="text-gray-500 mb-6">Let us know about your experience at our hospitals.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hospital dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Hospital *</label>
          <select value={form.hospitalId} onChange={e => setForm(f => ({ ...f, hospitalId: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-medical-blue" required>
            <option value="">Choose a hospital</option>
            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        {/* New fields: Patient Name, Appointment Date, Pet Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name (optional)</label>
            <input type="text" value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date (optional)</label>
            <input type="date" value={form.appointmentDate}
              onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name (optional)</label>
          <input type="text" value={form.petName}
            onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
            placeholder="Your pet's name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button type="button" key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}>
                <Star className={`w-8 h-8 ${form.rating >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Feedback *</label>
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            rows={4} placeholder="Share your experience..." className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none outline-none focus:ring-2 focus:ring-medical-blue" required />
        </div>

        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 bg-medical-blue hover:bg-medical-dark text-white font-bold px-6 py-3 rounded-full disabled:opacity-60">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}