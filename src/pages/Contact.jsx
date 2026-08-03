import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API_URL from '../config/api';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Headphones
} from 'lucide-react';

import hospitalVideo from '../../assets/hospital.mp4';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const heroVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const [form, setForm] = useState({ name: '', email: '', subject: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const togglePlay = () => {
    if (heroVideoRef.current) {
      if (isPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const validate = () => {
    const validation = {};
    if (!form.name.trim()) validation.name = 'Name is required';
    if (!form.email.trim()) validation.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) validation.email = 'Enter a valid email address';
    if (!form.message.trim()) validation.message = 'Message is required';

    if (form.phone && form.phone.trim()) {
      const cleanedPhone = form.phone.replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        validation.phone = 'Phone number must be exactly 10 digits';
      }
    }
    setErrors(validation);
    return Object.keys(validation).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, phone: cleaned }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit contact form');
      }

      toast.success(data.message || 'Message sent successfully!');
      setForm({ name: '', email: '', subject: '', phone: '', message: '' });
      setErrors({});
    } catch (error) {
      toast.error(error.message || 'Error submitting message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Video Hero Section */}
      <section className="relative w-full h-[55vh] min-h-[420px] md:h-[65vh] overflow-hidden bg-slate-950">
        <video
          ref={heroVideoRef}
          src={hospitalVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-10" />

        {/* Video Controls */}
        <div className="absolute bottom-8 right-6 z-30 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors border border-white/30 cursor-pointer"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors border border-white/30 cursor-pointer"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-md w-max"
          >
            <Headphones className="w-4 h-4 text-medical-blue" /> 24/7 Patient Support & Inquiry
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-white leading-tight drop-shadow-2xl max-w-3xl"
          >
            Get in Touch <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
              With Medpark Team
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 text-base sm:text-lg text-gray-200 max-w-2xl font-normal leading-relaxed drop-shadow"
          >
            Share your queries, appointment requests, or emergency help requests. Our dedicated patient care team is available 24/7.
          </motion.p>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Contact Cards & Info (Mobile Friendly 12 cols, Desktop 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl space-y-6">
              <h3 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-medical-blue" /> Direct Contact
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Reach our emergency response, administrative offices, or patient desk directly via telephone or email.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-medical-light border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-medical-blue text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-medical-dark">Hospital Location</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      123 Health Avenue, Medical District, Mohali, Punjab 160055
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-medical-light border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-medical-blue text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-medical-dark">24/7 Helpline</h4>
                    <a href="tel:+919876769966" className="text-xs font-semibold text-medical-blue hover:underline mt-1 block">
                      +91 9876769966
                    </a>
                    <span className="text-[10px] text-gray-500">Emergency & Ambulance Line</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-medical-light border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-medical-blue text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-medical-dark">Email Support</h4>
                    <a href="mailto:contact@medpark.com" className="text-xs font-semibold text-medical-blue hover:underline mt-1 block">
                      contact@medpark.com
                    </a>
                    <span className="text-[10px] text-gray-500">Response within 2 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timings Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h4 className="text-lg font-bold">OPD & Consultation Hours</h4>
              </div>
              <div className="space-y-2 text-xs md:text-sm text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Emergency & Trauma</span>
                  <span className="font-bold text-emerald-400">24 Hours / 7 Days</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2 pt-1">
                  <span>Outpatient OPD</span>
                  <span className="font-semibold text-white">08:00 AM - 08:00 PM</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Visiting Hours</span>
                  <span className="font-semibold text-white">04:00 PM - 07:00 PM</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Form (Mobile Friendly 12 cols, Desktop 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-xl"
          >
            <h3 className="text-2xl font-black text-medical-dark mb-2">Send Us a Message</h3>
            <p className="text-sm text-gray-600 mb-6">
              Fill out the details below and our team will connect with you promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${errors.name
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-slate-50 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20'
                      }`}
                    placeholder="Your Full Name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${errors.email
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-slate-50 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20'
                      }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                    <span className="text-[10px] text-gray-400 font-medium">{form.phone.length}/10 digits</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${errors.phone
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-slate-50 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20'
                      }`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 transition"
                    placeholder="Inquiry Subject"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${errors.message
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-slate-50 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20'
                    }`}
                  placeholder="How can our clinical team assist you today?"
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-medical-blue hover:bg-medical-dark px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-medical-blue/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
