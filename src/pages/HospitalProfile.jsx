import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Mail, BedDouble, Clock4, ShieldPlus, Stethoscope, Video, X,
  ArrowRight, ArrowLeft, Building2, Activity, CalendarCheck, AlertCircle, Share2, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';
import { SectionLoader } from '../components/Loader';

import hospitalVideo from '../../assets/hospital.mp4';
import brainVideo from '../../assets/brain.mp4';
import childCareVideo from '../../assets/child care.mp4';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1600&q=80';

// Same rotation the listing page uses, so a hospital keeps its video between pages.
const VIDEOS = [hospitalVideo, brainVideo, childCareVideo];
const videoFor = (id) => {
  const digits = String(id || '').replace(/\D/g, '');
  const n = digits ? Number(digits.slice(-3)) : 0;
  return VIDEOS[n % VIDEOS.length];
};

export default function HospitalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/hospitals/${id}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data.message || 'Hospital not found');
          return;
        }
        setHospital(data.hospital || data);
      } catch {
        if (!cancelled) setError('Could not reach the server. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: hospital?.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied');
    } catch {
      // User dismissed the share sheet — nothing to report.
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] portal-bg flex items-center justify-center">
        <SectionLoader label="Loading hospital profile…" sub="Fetching facilities, timings and contact details" />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-[70vh] portal-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-medical-dark">Hospital not found</h1>
          <p className="text-gray-600 mt-3">{error || 'We couldn’t find the hospital you’re looking for.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/hospitals" className="btn btn-primary btn-md">
              <ArrowLeft className="w-4 h-4" /> Back to hospitals
            </Link>
            <button onClick={() => navigate(-1)} className="btn btn-outline btn-md">Go back</button>
          </div>
        </div>
      </div>
    );
  }

  // The hospitals table stores facilities as individual columns, not an array.
  const facilities = [hospital.icu, hospital.careType, hospital.specialty].filter(Boolean);
  const heroImage = hospital.imageUrl || FALLBACK_IMG;
  const heroVideo = hospital.videoUrl || videoFor(hospital.id);

  const stats = [
    { label: 'Capacity', value: hospital.beds ? `${String(hospital.beds).replace(/\D/g, '') || hospital.beds} Beds` : '—', icon: BedDouble },
    { label: 'Care Level', value: hospital.careType || 'General Care', icon: Activity },
    { label: 'Specialty', value: hospital.specialty || 'Multi-Specialty', icon: Stethoscope },
    { label: 'Critical Care', value: hospital.icu || 'ICU Available', icon: ShieldPlus }
  ];

  const contactRows = [
    { label: 'Location', value: hospital.location, icon: MapPin, href: hospital.location ? `https://maps.google.com/?q=${encodeURIComponent(hospital.location)}` : null },
    { label: 'Helpline', value: hospital.contact, icon: Phone, href: hospital.contact ? `tel:${hospital.contact}` : null },
    { label: 'Email', value: hospital.email, icon: Mail, href: hospital.email ? `mailto:${hospital.email}` : null }
  ].filter((r) => r.value);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative w-full h-[46vh] min-h-[360px] md:h-[56vh] overflow-hidden bg-slate-950">
        <img src={heroImage} alt={hospital.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.55] scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />

        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              to="/hospitals"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" /> All hospitals
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
            {hospital.emergency && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
                <ShieldPlus className="w-3.5 h-3.5" /> {hospital.emergency}
              </span>
            )}
            {facilities.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
                <Star className="w-3.5 h-3.5 text-amber-300" /> {f}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl"
          >
            {hospital.name}
          </motion.h1>

          {hospital.location && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-3 flex items-center gap-2 text-gray-200 text-sm sm:text-base font-medium"
            >
              <MapPin className="w-4 h-4 text-blue-300" /> {hospital.location}
            </motion.p>
          )}
        </div>
      </section>

      {/* ─── Body ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Stat grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-medical-blue flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1 leading-snug">{s.value}</p>
                  </div>
                );
              })}
            </div>

            {/* About */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-medical-dark flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-medical-blue" /> About this hospital
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {hospital.description ||
                  `${hospital.name} is part of the Medpark network, offering ${(hospital.specialty || 'multi-specialty').toLowerCase()} care with ${(hospital.icu || 'ICU').toLowerCase()} support and experienced clinical teams. Appointments booked here are confirmed directly by the hospital.`}
              </p>

              {facilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Facilities &amp; Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((f) => (
                      <span key={f} className="pill bg-medical-light text-medical-dark">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timings */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-5">
                <Clock4 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Timings &amp; Emergency</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="text-slate-300">OPD / Consultation</span>
                  <span className="font-bold text-white">{hospital.timings || 'Mon - Sat • 8:00 AM - 8:00 PM'}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-slate-300">Emergency</span>
                  <span className="font-bold text-emerald-400">{hospital.emergency || '24/7 Emergency Available'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: sticky action card */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 lg:sticky lg:top-24 space-y-5"
          >
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl">
              <h3 className="text-lg font-bold text-medical-dark mb-1">Book a visit</h3>
              <p className="text-xs text-gray-500 mb-5">
                Choose a slot — {hospital.name} confirms your appointment directly.
              </p>

              <Link to={`/appointment?hospitalId=${encodeURIComponent(hospital.id)}`} className="btn btn-primary btn-md w-full">
                <CalendarCheck className="w-4 h-4" /> Book Appointment
              </Link>

              <button type="button" onClick={() => setShowVideo(true)} className="btn btn-outline btn-md w-full mt-3">
                <Video className="w-4 h-4" /> Watch facility video
              </button>

              <button type="button" onClick={share} className="btn btn-outline btn-md w-full mt-3">
                <Share2 className="w-4 h-4" /> Share profile
              </button>
            </div>

            {contactRows.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact</h3>
                <div className="space-y-3">
                  {contactRows.map((row) => {
                    const Icon = row.icon;
                    const inner = (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">{row.label}</span>
                          <span className="text-sm font-bold text-slate-900 break-words">{row.value}</span>
                        </div>
                      </>
                    );
                    return row.href ? (
                      <a
                        key={row.label}
                        href={row.href}
                        target={row.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-medical-blue transition"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div key={row.label} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200/80">
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              to="/hospitals"
              className="flex items-center justify-center gap-2 text-sm font-bold text-medical-blue hover:text-medical-dark transition py-2"
            >
              Browse other hospitals <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.aside>
        </div>
      </div>

      {/* ─── Video modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-900 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="w-5 h-5 text-blue-400 shrink-0" />
                  <h4 className="text-lg font-bold truncate">{hospital.name} — Virtual Campus Tour</h4>
                </div>
                <button onClick={() => setShowVideo(false)} className="p-1 rounded-full text-gray-400 hover:text-white transition" aria-label="Close">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <video src={heroVideo} autoPlay controls className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
