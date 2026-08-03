// import { useEffect, useRef, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import {
//   PawPrint,
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   CalendarCheck,
//   Stethoscope,
//   ClipboardList,
//   MessageSquare,
//   BarChart3,
//   ShieldCheck,
//   ArrowRight,
//   Sparkles,
//   ClipboardEdit,
//   CalendarClock,
//   Video,
//   CreditCard,
//   Rocket,
//   Heart,
//   Target,
//   Users,
//   CheckCircle2,
//   Star
// } from 'lucide-react';
// import homeTopVideo from '../../../assets/home top.mp4';
// import heroVideo from '../../../assets/new.mp4';
// import BookDemoSection from '../../components/portal/BookDemoSection';
// import HMSIntegrationAnimation from '../../components/HMSIntegrationAnimation';
// import PortalSpecialties from '../../components/portal/PortalSpecialties';
// import PortalFAQ from '../../components/portal/PortalFAQ';
// import PublicFeedbackForm from '../../components/portal/PublicFeedbackForm';


// /* ── Images (pet / veterinary, same remote-image approach as the existing Home) ── */
// const IMG = {
//   hero: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
//   about: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
//   feat1: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=700&q=80',
//   feat2: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=700&q=80',
//   feat3: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=700&q=80'
// };

// const features = [
//   { icon: CalendarCheck, title: 'Smart Appointment Scheduling', desc: 'Online booking, automated reminders, and a live calendar so no slot is ever double-booked.' },
//   { icon: Stethoscope, title: 'Complete Patient Records', desc: 'Every pet’s history, vaccinations, and visits in one secure, searchable place.' },
//   { icon: ClipboardList, title: 'Multi-Hospital Management', desc: 'Run one clinic or a whole network from a single dashboard with role-based access.' },
//   { icon: MessageSquare, title: 'Calls, Feedback & Transcriptions', desc: 'Log every conversation, capture feedback, and keep transcriptions attached to each case.' },
//   { icon: BarChart3, title: 'Analytics & Insights', desc: 'Bed capacity, appointment trends, and conversion charts that help you grow.' },
//   { icon: ShieldCheck, title: 'Secure by Design', desc: 'Role-based logins for super admins, hospital admins, and staff — data stays protected.' }
// ];

// const stats = [
//   { value: '500+', label: 'Pet hospitals onboarded' },
//   { value: '1M+', label: 'Appointments managed' },
//   { value: '24/7', label: 'Availability' },
//   { value: '4.9/5', label: 'Average rating' }
// ];

// const steps = [
//   { icon: ClipboardEdit, title: 'Tell us about your hospital', desc: 'Fill in a short form with your clinic details. It takes less than a minute.' },
//   { icon: CalendarClock, title: 'Pick a demo time', desc: 'Choose a slot that suits you. You’ll get an instant email confirmation with the details.' },
//   { icon: Video, title: 'Join the live demo', desc: 'Our team walks you through the portal on a video call and answers all your questions.' },
//   { icon: CreditCard, title: 'Choose your plan', desc: 'Liked what you saw? Confirm your interest and complete a secure payment online.' },
//   { icon: Rocket, title: 'Register & go live', desc: 'Complete registration, get approved, and start managing your hospital the same day.' }
// ];

// const values = [
//   { icon: Heart, title: 'Care first', desc: 'Every feature is designed to give vets more time with the animals that need them.' },
//   { icon: Target, title: 'Built for veterinary teams', desc: 'Not a generic tool — workflows shaped by real pet hospitals and their daily reality.' },
//   { icon: Users, title: 'Partners, not vendors', desc: 'We onboard, train, and support your team every step of the way.' }
// ];

// const fade = {
//   hidden: { opacity: 0, y: 24 },
//   show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } })
// };

// // Smooth-scroll helper shared by in-page CTAs
// const scrollTo = (id) => {
//   const el = document.getElementById(id);
//   if (el) el.scrollIntoView({ behavior: 'smooth' });
// };

// export default function PortalHome() {
//   const location = useLocation();
//   const heroVideoRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(true);

//   const togglePlay = () => {
//     if (!heroVideoRef.current) return;
//     if (isPlaying) heroVideoRef.current.pause();
//     else heroVideoRef.current.play();
//     setIsPlaying(!isPlaying);
//   };

//   const toggleMute = () => {
//     if (!heroVideoRef.current) return;
//     heroVideoRef.current.muted = !isMuted;
//     setIsMuted(!isMuted);
//   };

//   // Scroll to the hash section when arriving from another route (e.g. /#about)
//   useEffect(() => {
//     if (location.hash) {
//       const id = location.hash.replace('#', '');
//       // wait a tick for lazy content/images to lay out
//       setTimeout(() => scrollTo(id), 60);
//     } else {
//       window.scrollTo({ top: 0 });
//     }
//   }, [location]);

//   return (
//     <div className="bg-slate-50">
//       {/* ───────────── HERO / FEATURES (background video) ───────────── */}
//       <section id="features" className="scroll-mt-20 relative h-[88vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-slate-950 flex items-center">
//         {/* Background video */}
//         <video
//           ref={heroVideoRef}
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="absolute inset-0 w-full h-full object-cover scale-105"
//         >
//           <source src={heroVideo} type="video/mp4" />
//         </video>

//         {/* Dark overlay gradient */}
//         <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />

//         {/* Floating decorative blobs */}
//         <motion.div aria-hidden className="absolute top-16 right-10 w-40 h-40 rounded-full bg-sky-400/20 blur-2xl z-10"
//           animate={{ y: [0, -22, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
//         <motion.div aria-hidden className="absolute bottom-14 right-1/4 w-56 h-56 rounded-full bg-cyan-300/10 blur-3xl z-10"
//           animate={{ y: [0, 24, 0], scale: [1, 1.12, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
//         <motion.div aria-hidden className="absolute top-1/3 left-1/2 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl z-10"
//           animate={{ x: [0, 22, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />

//         {/* Content */}
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
//           <div className="max-w-2xl text-white">
//             <motion.div variants={fade} initial="hidden" animate="show" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20 shadow-lg">
//               <PawPrint className="w-4 h-4 text-sky-400" /> The all-in-one pet hospital platform
//             </motion.div>
//             <motion.h1 variants={fade} initial="hidden" animate="show" custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
//               Run your pet hospital{' '}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-200">the modern way</span>
//             </motion.h1>
//             <motion.p variants={fade} initial="hidden" animate="show" custom={2} className="mt-5 text-base sm:text-lg text-slate-200 max-w-xl leading-relaxed drop-shadow-sm">
//               Scheduling, patient records, staff, feedback and analytics — unified in one beautiful
//               portal built for veterinary teams. Book a live demo and see it in action.
//             </motion.p>
//             <motion.div variants={fade} initial="hidden" animate="show" custom={3} className="mt-9 flex flex-wrap items-center gap-4">
//               <button onClick={() => scrollTo('book-demo')} className="inline-flex items-center gap-2 bg-medical-blue hover:bg-blue-600 text-white font-bold py-3.5 px-7 rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5">
//                 Book a Demo <ArrowRight className="w-4 h-4" />
//               </button>
//               <button onClick={() => scrollTo('how-it-works')} className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md font-semibold py-3.5 px-6 rounded-full border border-white/30 shadow-md transition-all">
//                 How it works
//               </button>
//             </motion.div>
//           </div>
//         </div>

//         {/* Floating video controls */}
//         <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-xl">
//           <button onClick={togglePlay} className="p-2 text-white hover:text-medical-blue transition cursor-pointer" title={isPlaying ? 'Pause video' : 'Play video'}>
//             {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
//           </button>
//           <button onClick={toggleMute} className="p-2 text-white hover:text-medical-blue transition cursor-pointer" title={isMuted ? 'Unmute audio' : 'Mute audio'}>
//             {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
//           </button>
//         </div>
//       </section>

//       {/* Stats bar */}
//       <section className="bg-white border-b border-gray-100">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
//           <motion.div
//             className="grid grid-cols-2 md:grid-cols-4 gap-6"
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true }}
//             variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
//           >
//             {stats.map((s) => (
//               <motion.div
//                 key={s.label}
//                 className="text-center"
//                 whileHover={{ scale: 1.06 }}
//                 variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
//               >
//                 <p className="text-3xl sm:text-4xl font-extrabold text-medical-dark">{s.value}</p>
//                 <p className="text-sm text-gray-500 mt-1">{s.label}</p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Features grid */}
//       <section className="py-20">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-14">
//             <span className="inline-flex items-center gap-2 text-medical-blue font-semibold text-sm uppercase tracking-wider">
//               <Sparkles className="w-4 h-4" /> Features
//             </span>
//             <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">Everything your clinic needs, in one portal</h2>
//             <p className="text-gray-600 mt-4">Purpose-built modules that replace spreadsheets, sticky notes, and disconnected tools.</p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((f, i) => {
//               const Icon = f.icon;
//               return (
//                 <motion.div key={f.title} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
//                   <div className="w-12 h-12 rounded-xl bg-medical-light text-medical-blue flex items-center justify-center mb-5">
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <h3 className="text-lg font-bold text-medical-dark mb-2">{f.title}</h3>
//                   <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
//                 </motion.div>
//               );
//             })}
//           </div>

//           {/* Image showcase row */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
//             {[
//               { img: IMG.feat1, cap: 'Faster check-ins' },
//               { img: IMG.feat2, cap: 'Confident diagnoses' },
//               { img: IMG.feat3, cap: 'Happier patients' }
//             ].map((c) => (
//               <motion.div key={c.cap} whileHover={{ y: -6 }} className="relative h-56 rounded-3xl overflow-hidden shadow-md border border-gray-200/70">
//                 <img src={c.img} alt={c.cap} className="w-full h-full object-cover" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                 <span className="absolute bottom-4 left-4 text-white font-bold text-lg">{c.cap}</span>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Specialties marquee + HMS integration animation */}
//       <PortalSpecialties />
//       <HMSIntegrationAnimation />


//       {/* ───────────── HOW IT WORKS ───────────── */}
//       <section id="how-it-works" className="scroll-mt-20 py-20 bg-white border-t border-gray-100">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
//           <div className="text-center mb-14">
//             <span className="inline-flex items-center gap-2 text-medical-blue font-semibold text-sm uppercase tracking-wider">
//               <Rocket className="w-4 h-4" /> How it works
//             </span>
//             <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">From first hello to fully onboarded</h2>
//             <p className="text-gray-600 mt-4">Five simple steps.</p>
//           </div>

//           <div className="relative">
//             <div className="hidden sm:block absolute left-8 top-4 bottom-4 w-0.5 bg-medical-light" />
//             <div className="space-y-8">
//               {steps.map((s, i) => {
//                 const Icon = s.icon;
//                 return (
//                   <motion.div key={s.title} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i} className="relative flex gap-5 sm:gap-8 items-start">
//                     <div className="relative z-10 shrink-0 w-16 h-16 rounded-2xl bg-medical-blue text-white flex items-center justify-center shadow-lg">
//                       <Icon className="w-7 h-7" />
//                     </div>
//                     <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
//                       <span className="text-xs font-bold text-medical-blue uppercase tracking-wider">Step {i + 1}</span>
//                       <h3 className="text-lg font-bold text-medical-dark mt-1">{s.title}</h3>
//                       <p className="text-gray-600 text-sm mt-1 leading-relaxed">{s.desc}</p>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="text-center mt-14">
//             <button onClick={() => scrollTo('book-demo')} className="inline-flex items-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all hover:-translate-y-0.5">
//               Start with a demo <ArrowRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ───────────── ABOUT ───────────── */}
//       <section id="about" className="scroll-mt-20 py-20">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
//             <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
//               <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border border-gray-200/70">
//                 <img src={IMG.about} alt="Veterinary team with a cat" className="w-full h-full object-cover" />
//               </div>
//             </motion.div>
//             <div>
//               <span className="inline-flex items-center gap-2 text-medical-blue font-semibold text-sm uppercase tracking-wider">
//                 <PawPrint className="w-4 h-4" /> About us
//               </span>
//               <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">We help pet hospitals run better, so pets get better</h2>
//               <p className="text-gray-600 mt-4 leading-relaxed">
//                 Our platform brings scheduling, records, staff, feedback, and analytics together in one
//                 place — so veterinary teams can spend less time on admin and more time on care.
//               </p>
//               <div className="mt-6 space-y-3">
//                 {['Trusted by 500+ clinics', 'Onboard in a single day', 'Dedicated support team'].map((t) => (
//                   <div key={t} className="flex items-center gap-3 text-sm text-gray-700">
//                     <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {t}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {values.map((v, i) => {
//               const Icon = v.icon;
//               return (
//                 <motion.div key={v.title} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
//                   <div className="w-12 h-12 rounded-xl bg-medical-light text-medical-blue flex items-center justify-center mb-5">
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <h3 className="text-lg font-bold text-medical-dark mb-2">{v.title}</h3>
//                   <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Video banner (UI reference from existing Home) */}
//       <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
//               <video autoPlay loop muted playsInline className="w-full h-full object-cover">
//                 <source src={homeTopVideo} type="video/mp4" />
//               </video>
//               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
//             </div>
//             <div className="space-y-6">
//               <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/30">
//                 See it in action
//               </span>
//               <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">One portal for your whole veterinary team</h2>
//               <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
//                 Front desk, vets, and management all working from the same live data — no more scattered
//                 spreadsheets or missed follow-ups.
//               </p>
//               <div className="space-y-3 pt-2">
//                 {['Real-time appointment calendar', 'Role-based staff access', 'Feedback & analytics built in'].map((t) => (
//                   <div key={t} className="flex items-center gap-3 text-sm text-slate-200">
//                     <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> {t}
//                   </div>
//                 ))}
//               </div>
//               <div className="pt-4 flex items-center gap-1 text-amber-400">
//                 {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
//                 <span className="text-slate-300 text-sm ml-2">Rated 4.9/5 by care teams</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ───────────── BOOK A DEMO ───────────── */}
//       <section id="book-demo" className="scroll-mt-20 py-20 bg-gradient-to-br from-medical-dark to-medical-blue text-white relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="text-center max-w-2xl mx-auto mb-10">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-5 border border-white/20">
//               <PawPrint className="w-4 h-4" /> Book a live demo
//             </div>
//             <h2 className="text-3xl sm:text-4xl font-black tracking-tight">See the Pet Hospital Portal in action</h2>
//             <p className="mt-3 text-blue-100">Share a few details and pick a time. We’ll walk your team through everything.</p>
//           </div>
//           <BookDemoSection />
//         </div>
//       </section>

//       {/* FAQ — last section, just above the footer */}
//       <PortalFAQ />

//       <section id="feedback" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
//         <PublicFeedbackForm />
//       </section>
//     </div>
//   );
// }




import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PawPrint,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CalendarCheck,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ClipboardEdit,
  CalendarClock,
  Video,
  CreditCard,
  Rocket,
  Heart,
  Target,
  Users,
  CheckCircle2,
  Star
} from 'lucide-react';
import homeTopVideo from '../../../assets/home top.mp4';
import heroVideo from '../../../assets/new.mp4';
import BookDemoSection from '../../components/portal/BookDemoSection';
import HMSIntegrationAnimation from '../../components/HMSIntegrationAnimation';
import PortalSpecialties from '../../components/portal/PortalSpecialties';
import PortalFAQ from '../../components/portal/PortalFAQ';
import PublicFeedbackForm from '../../components/portal/PublicFeedbackForm';

/* ── Images (pet / veterinary, same remote-image approach as the existing Home) ── */
const IMG = {
  hero: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
  about: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
  feat1: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=700&q=80',
  feat2: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=700&q=80',
  feat3: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=700&q=80'
};

const features = [
  { icon: CalendarCheck, title: 'Smart Appointment Scheduling', desc: 'Online booking, automated reminders, and a live calendar so no slot is ever double-booked.' },
  { icon: Stethoscope, title: 'Complete Patient Records', desc: 'Every pet’s history, vaccinations, and visits in one secure, searchable place.' },
  { icon: ClipboardList, title: 'Multi-Hospital Management', desc: 'Run one clinic or a whole network from a single dashboard with role-based access.' },
  { icon: MessageSquare, title: 'Calls, Feedback & Transcriptions', desc: 'Log every conversation, capture feedback, and keep transcriptions attached to each case.' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Bed capacity, appointment trends, and conversion charts that help you grow.' },
  { icon: ShieldCheck, title: 'Secure by Design', desc: 'Role-based logins for super admins, hospital admins, and staff — data stays protected.' }
];

const stats = [
  { value: '500+', label: 'Pet hospitals onboarded' },
  { value: '1M+', label: 'Appointments managed' },
  { value: '24/7', label: 'Availability' },
  { value: '4.9/5', label: 'Average rating' }
];

const steps = [
  { icon: ClipboardEdit, title: 'Tell us about your hospital', desc: 'Fill in a short form with your clinic details. It takes less than a minute.' },
  { icon: CalendarClock, title: 'Pick a demo time', desc: 'Choose a slot that suits you. You’ll get an instant email confirmation with the details.' },
  { icon: Video, title: 'Join the live demo', desc: 'Our team walks you through the portal on a video call and answers all your questions.' },
  { icon: CreditCard, title: 'Choose your plan', desc: 'Liked what you saw? Confirm your interest and complete a secure payment online.' },
  { icon: Rocket, title: 'Register & go live', desc: 'Complete registration, get approved, and start managing your hospital the same day.' }
];

const values = [
  { icon: Heart, title: 'Care first', desc: 'Every feature is designed to give vets more time with the animals that need them.' },
  { icon: Target, title: 'Built for veterinary teams', desc: 'Not a generic tool — workflows shaped by real pet hospitals and their daily reality.' },
  { icon: Users, title: 'Partners, not vendors', desc: 'We onboard, train, and support your team every step of the way.' }
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } })
};

// Smooth-scroll helper shared by in-page CTAs
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function PortalHome() {
  const location = useLocation();
  const heroVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!heroVideoRef.current) return;
    if (isPlaying) heroVideoRef.current.pause();
    else heroVideoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!heroVideoRef.current) return;
    heroVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Scroll to the hash section when arriving from another route (e.g. /#about)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // wait a tick for lazy content/images to lay out
      setTimeout(() => scrollTo(id), 60);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location]);

  return (
    <div className="bg-slate-50">
      {/* ───────────── HERO / FEATURES (background video) ───────────── */}
      <section id="features" className="scroll-mt-20 relative h-[88vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-slate-950 flex items-center">
        {/* Background video */}
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />

        {/* Floating decorative blobs */}
        <motion.div
          aria-hidden
          className="absolute top-16 right-10 w-40 h-40 rounded-full bg-sky-400/20 blur-2xl z-10"
          animate={{ y: [0, -22, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-14 right-1/4 w-56 h-56 rounded-full bg-cyan-300/10 blur-3xl z-10"
          animate={{ y: [0, 24, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/3 left-1/2 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl z-10"
          animate={{ x: [0, 22, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-2xl text-white">
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20 shadow-lg"
            >
              <PawPrint className="w-4 h-4 text-sky-400" /> The all-in-one pet hospital platform
            </motion.div>
            <motion.h1
              variants={fade}
              initial="hidden"
              animate="show"
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-md"
            >
              Run your pet hospital{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-200">the modern way</span>
            </motion.h1>
            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 text-base sm:text-lg text-slate-200 max-w-xl leading-relaxed drop-shadow-sm"
            >
              Scheduling, patient records, staff, feedback and analytics — unified in one beautiful
              portal built for veterinary teams. Book a live demo and see it in action.
            </motion.p>
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => scrollTo('book-demo')}
                className="inline-flex items-center gap-2 bg-medical-blue hover:bg-blue-600 text-white font-bold py-3.5 px-7 rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md font-semibold py-3.5 px-6 rounded-full border border-white/30 shadow-md transition-all"
              >
                How it works
              </button>
            </motion.div>
          </div>
        </div>

        {/* Floating video controls */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-xl">
          <button
            onClick={togglePlay}
            className="p-2 text-white hover:text-medical-blue transition cursor-pointer"
            title={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 text-white hover:text-medical-blue transition cursor-pointer"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                className="text-center"
                whileHover={{ scale: 1.06 }}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-medical-dark">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 text-medical-blue font-semibold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">Everything your clinic needs, in one portal</h2>
            <p className="text-gray-600 mt-4">Purpose-built modules that replace spreadsheets, sticky notes, and disconnected tools.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  custom={i}
                  className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-medical-light text-medical-blue flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-medical-dark mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Image showcase row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { img: IMG.feat1, cap: 'Faster check-ins' },
              { img: IMG.feat2, cap: 'Confident diagnoses' },
              { img: IMG.feat3, cap: 'Happier patients' }
            ].map((c) => (
              <motion.div
                key={c.cap}
                whileHover={{ y: -6 }}
                className="relative h-56 rounded-3xl overflow-hidden shadow-md border border-gray-200/70"
              >
                <img src={c.img} alt={c.cap} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-bold text-lg">{c.cap}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties marquee + HMS integration animation */}
      <PortalSpecialties />
      <HMSIntegrationAnimation />

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-medical-blue font-semibold text-sm uppercase tracking-wider">
              <Rocket className="w-4 h-4" /> How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">From first hello to fully onboarded</h2>
            <p className="text-gray-600 mt-4">Five simple steps.</p>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute left-8 top-4 bottom-4 w-0.5 bg-medical-light" />
            <div className="space-y-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    variants={fade}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    custom={i}
                    className="relative flex gap-5 sm:gap-8 items-start"
                  >
                    <div className="relative z-10 shrink-0 w-16 h-16 rounded-2xl bg-medical-blue text-white flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
                      <span className="text-xs font-bold text-medical-blue uppercase tracking-wider">Step {i + 1}</span>
                      <h3 className="text-lg font-bold text-medical-dark mt-1">{s.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-14">
            <button
              onClick={() => scrollTo('book-demo')}
              className="inline-flex items-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all hover:-translate-y-0.5"
            >
              Start with a demo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ───────────── ABOUT ───────────── */}
      <section id="about" className="scroll-mt-20 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border border-gray-200/70">
                <img src={IMG.about} alt="Veterinary team with a cat" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <div>
              <span className="inline-flex items-center gap-2 text-medical-blue font-semibold text-sm uppercase tracking-wider">
                <PawPrint className="w-4 h-4" /> About us
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">We help pet hospitals run better, so pets get better</h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Our platform brings scheduling, records, staff, feedback, and analytics together in one
                place — so veterinary teams can spend less time on admin and more time on care.
              </p>
              <div className="mt-6 space-y-3">
                {['Trusted by 500+ clinics', 'Onboard in a single day', 'Dedicated support team'].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  custom={i}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-medical-light text-medical-blue flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-medical-dark mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video banner (UI reference from existing Home) */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
              <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                <source src={homeTopVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/30">
                See it in action
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">One portal for your whole veterinary team</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Front desk, vets, and management all working from the same live data — no more scattered
                spreadsheets or missed follow-ups.
              </p>
              <div className="space-y-3 pt-2">
                {['Real-time appointment calendar', 'Role-based staff access', 'Feedback & analytics built in'].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> {t}
                  </div>
                ))}
              </div>
              <div className="pt-4 flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
                <span className="text-slate-300 text-sm ml-2">Rated 4.9/5 by care teams</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── BOOK A DEMO ───────────── */}
      <section id="book-demo" className="scroll-mt-20 py-20 bg-gradient-to-br from-medical-dark to-medical-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-5 border border-white/20">
              <PawPrint className="w-4 h-4" /> Book a live demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">See the Pet Hospital Portal in action</h2>
            <p className="mt-3 text-blue-100">Share a few details and pick a time. We’ll walk your team through everything.</p>
          </div>
          <BookDemoSection />
        </div>
      </section>

      {/* FAQ — last section, just above the footer */}
      <PortalFAQ />

      <section id="feedback" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <PublicFeedbackForm />
      </section>
    </div>
  );
}