import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  X,
  Send,
  Building2,
  Calendar,
  Clock,
  User,
  Heart,
  CheckCircle2,
  Loader2,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

const RATING_LABELS = {
  1: 'Poor - Needs Improvement',
  2: 'Fair - Below Expectations',
  3: 'Good - Met Expectations',
  4: 'Very Good - Highly Satisfied',
  5: 'Exceptional - Outstanding Care!'
};

const ASPECT_TAGS = [
  'Doctor Expertise',
  'Prompt & On-Time',
  'Friendly Staff',
  'Clean & Hygienic',
  'Clear Consultation',
  'Emergency Ready'
];

export default function AppointmentFeedbackModal({
  isOpen,
  onClose,
  appointment,
  onFeedbackSubmitted
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const apptNum = appointment.appointment_number || appointment.appointmentNumber;
  const hospitalTitle = appointment.hospital || appointment.hospitalName || 'Hospital';

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (appointment.status && appointment.status !== 'Completed') {
      return toast.error('Feedback can only be given after the appointment is marked as Completed by the hospital.');
    }
    if (!rating) {
      return toast.error('Please select a star rating');
    }
    if (!message.trim()) {
      return toast.error('Please share a brief review of your experience');
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formattedMessage = selectedTags.length > 0
        ? `[Highlights: ${selectedTags.join(', ')}] ${message.trim()}`
        : message.trim();

      const payload = {
        appointmentId: appointment.id,
        appointmentNumber: apptNum,
        rating: Number(rating),
        feedbackText: formattedMessage,
        message: formattedMessage,
        hospitalId: appointment.hospitalId || appointment.hospital_id,
        patientName: appointment.patientName,
        petName: appointment.petName,
        date: appointment.date,
        time: appointment.time
      };

      const res = await fetch(`${API_URL}/api/appointment-feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Thank you! Your feedback has been submitted.');
        if (onFeedbackSubmitted) onFeedbackSubmitted(data.feedback || data);
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-medical-blue to-teal-600 px-6 py-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Appointment Feedback</h3>
                <p className="text-xs text-teal-100">Help us improve your healthcare experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Appointment Context Strip */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-medical-dark">
              <Building2 className="w-4 h-4 text-medical-blue" />
              <span>{hospitalTitle}</span>
            </div>
            {apptNum && (
              <span className="bg-medical-blue/10 text-medical-blue px-2.5 py-0.5 rounded-full font-mono font-bold">
                Appt #{apptNum}
              </span>
            )}
            <div className="flex items-center gap-3">
              {appointment.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {appointment.date}
                </span>
              )}
              {appointment.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {appointment.time}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Star Rating */}
            <div className="text-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                How would you rate your appointment?
              </label>
              <div className="flex justify-center items-center gap-2 mb-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-semibold text-medical-blue">
                {RATING_LABELS[hoverRating || rating]}
              </p>
            </div>

            {/* Service Highlights / Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                What went well? (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-medical-blue text-white border-medical-blue shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {selected && '✓ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Your Review & Comments
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share details about the doctor consultation, staff support, wait time, or any suggestions..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none text-sm text-slate-800 placeholder-slate-400 resize-none transition"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-medical-blue to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-medical-blue/20 inline-flex items-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
