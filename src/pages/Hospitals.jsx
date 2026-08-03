// import { useEffect, useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import API_URL from '../config/api';
// import {
//   Building2,
//   MapPin,
//   Phone,
//   Bed,
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   Video,
//   X,
//   ArrowRight,
//   Search,
//   CheckCircle2
// } from 'lucide-react';

// import hospitalVideo from '../../assets/hospital.mp4';
// import brainVideo from '../../assets/brain.mp4';
// import childCareVideo from '../../assets/child care.mp4';

// export default function Hospitals() {
//   const heroVideoRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(true);
//   const [hospitals, setHospitals] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCity, setSelectedCity] = useState('All');
//   const [activeVideoModal, setActiveVideoModal] = useState(null);

//   const togglePlay = () => {
//     if (heroVideoRef.current) {
//       if (isPlaying) {
//         heroVideoRef.current.pause();
//       } else {
//         heroVideoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const toggleMute = () => {
//     if (heroVideoRef.current) {
//       heroVideoRef.current.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   };

//   const sampleHospitals = [
//     {
//       id: 101,
//       name: 'Medpark Central Hospital & Trauma Center',
//       location: 'New Delhi',
//       beds: '500+ Beds',
//       contact: '+91 11 4982 0000',
//       rating: '4.9/5',
//       img: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
//       video: hospitalVideo,
//       description: 'Flagship multi-specialty hospital featuring Level 1 Trauma Center, 12 robotic operation theaters, and 24/7 cardiac ICU.',
//       tags: ['Level 1 Trauma', 'Robotic Surgery', '24/7 Pharmacy', 'Helipad Facility']
//     },
//     {
//       id: 102,
//       name: 'Medpark Institute of Neuro & Spine Excellence',
//       location: 'Mumbai',
//       beds: '350+ Beds',
//       contact: '+91 22 6123 4567',
//       rating: '4.95/5',
//       img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
//       video: brainVideo,
//       description: 'Dedicated neurosciences tertiary care facility equipped with intraoperative MRI, Gamma Knife, and stroke emergency unit.',
//       tags: ['Neuro ICU', 'Gamma Knife', 'Stroke Center', 'Spine Rehab']
//     },
//     {
//       id: 103,
//       name: 'Medpark Women & Children Super Specialty',
//       location: 'Bengaluru',
//       beds: '250+ Beds',
//       contact: '+91 80 4567 8900',
//       rating: '4.98/5',
//       img: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80',
//       video: childCareVideo,
//       description: 'State-of-the-art mother & child care center featuring Level IV NICU, pediatric surgery labs, and birthing suites.',
//       tags: ['Level IV NICU', 'Pediatric ICU', 'Fetal Medicine', '24/7 Emergency']
//     },
//     {
//       id: 104,
//       name: 'Medpark Heart & Cancer Institute',
//       location: 'Hyderabad',
//       beds: '400+ Beds',
//       contact: '+91 40 3344 5566',
//       rating: '4.92/5',
//       img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80',
//       video: hospitalVideo,
//       description: 'Comprehensive oncology and cardiology hospital offering PET-CT, LINAC radiation suites, and heart transplants.',
//       tags: ['Organ Transplants', 'Radiation Suite', 'Bone Marrow Unit', 'Cath Lab']
//     }
//   ];

//   useEffect(() => {
//     const fetchHospitals = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/hospitals`);
//         const data = await res.json();
//         if (Array.isArray(data) && data.length > 0) {
//           const enriched = data.map((h, idx) => ({
//             ...h,
//             video: [hospitalVideo, brainVideo, childCareVideo][idx % 3],
//             img: h.image || sampleHospitals[idx % sampleHospitals.length].img,
//             rating: '4.9/5',
//             tags: ['24/7 ICU', 'Advanced Care', 'Super Specialty']
//           }));
//           setHospitals(enriched);
//         } else {
//           setHospitals(sampleHospitals);
//         }
//       } catch (err) {
//         setHospitals(sampleHospitals);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchHospitals();
//   }, []);

//   const cities = ['All', ...new Set(hospitals.map(h => h.location || 'New Delhi'))];

//   const filteredHospitals = hospitals.filter(h => {
//     const matchesCity = selectedCity === 'All' || h.location === selectedCity;
//     const matchesSearch = (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (h.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (h.description || '').toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCity && matchesSearch;
//   });

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
//       {/* Video Hero Banner matching Home page */}
//       <section className="relative w-full h-[65vh] min-h-[500px] md:h-[75vh] overflow-hidden bg-slate-950">
//         <video
//           ref={heroVideoRef}
//           src={hospitalVideo}
//           autoPlay
//           loop
//           muted={isMuted}
//           playsInline
//           className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] scale-105"
//         />

//         <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 z-10" />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-10" />

//         {/* Video Controls */}
//         <div className="absolute bottom-12 right-6 z-30 flex items-center gap-3">
//           <button
//             onClick={togglePlay}
//             className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors border border-white/30 cursor-pointer"
//             aria-label={isPlaying ? "Pause video" : "Play video"}
//           >
//             {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
//           </button>
//           <button
//             onClick={toggleMute}
//             className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors border border-white/30 cursor-pointer"
//             aria-label={isMuted ? "Unmute video" : "Mute video"}
//           >
//             {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
//           </button>
//         </div>

//         {/* Hero Text Content */}
//         <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-left">
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-md w-max"
//           >
//             <Building2 className="w-4 h-4 text-medical-blue" /> Nationwide Hospital Network
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.1 }}
//             className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl"
//           >
//             Our Premier <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
//               Hospital Network
//             </span>
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.3 }}
//             className="mt-6 text-lg sm:text-xl text-gray-200 max-w-2xl font-normal leading-relaxed drop-shadow"
//           >
//             Explore state-of-the-art medical centers equipped with advanced ICUs, emergency response, and patient-first care.
//           </motion.p>
//         </div>
//       </section>

//       {/* Filter and Search Section */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
//         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//             <div className="relative w-full md:w-1/2">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search hospitals by name, city, or facility..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-medical-blue transition"
//               />
//             </div>

//             <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
//               {cities.map((city) => (
//                 <button
//                   key={city}
//                   onClick={() => setSelectedCity(city)}
//                   className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${selectedCity === city
//                       ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20 font-bold'
//                       : 'bg-slate-100 text-gray-700 hover:bg-slate-200 border border-gray-200'
//                     }`}
//                 >
//                   {city}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Hospitals Cards Grid */}
//       <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
//         {isLoading ? (
//           <div className="text-center py-16 text-gray-500">Loading hospital facilities...</div>
//         ) : (
//           <motion.div
//             layout
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//           >
//             <AnimatePresence>
//               {filteredHospitals.map((h, idx) => (
//                 <motion.div
//                   key={h.id || idx}
//                   layout
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.5, delay: idx * 0.08 }}
//                   whileHover={{ y: -8 }}
//                   className="group relative rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between"
//                 >
//                   {/* Media Banner */}
//                   <div className="relative h-64 overflow-hidden bg-slate-900">
//                     <img
//                       src={h.img}
//                       alt={h.name}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//                     {/* Location Badge */}
//                     <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-medical-blue text-xs font-bold px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-md">
//                       <MapPin className="w-3.5 h-3.5" />
//                       {h.location || 'Super Specialty'}
//                     </span>

//                     {/* Video Tour Button */}
//                     <button
//                       onClick={() => setActiveVideoModal(h)}
//                       className="absolute bottom-4 right-4 bg-medical-blue hover:bg-medical-dark text-white font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
//                     >
//                       <Video className="w-4 h-4" /> Tour Campus
//                     </button>
//                   </div>

//                   {/* Body Content */}
//                   <div className="p-6 flex-1 flex flex-col justify-between">
//                     <div className="space-y-4">
//                       <div>
//                         <h3 className="text-2xl font-extrabold text-medical-dark group-hover:text-medical-blue transition-colors">
//                           {h.name}
//                         </h3>
//                         <p className="mt-2 text-sm text-gray-600 leading-relaxed">
//                           {h.description}
//                         </p>
//                       </div>

//                       {/* Tag list */}
//                       <div className="flex flex-wrap gap-2 pt-1">
//                         {(h.tags || ['24/7 ICU', 'Advanced Care', 'Super Specialty']).map((tag, i) => (
//                           <span
//                             key={i}
//                             className="bg-medical-light text-medical-dark text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200/80 flex items-center gap-1"
//                           >
//                             <CheckCircle2 className="w-3 h-3 text-medical-blue" /> {tag}
//                           </span>
//                         ))}
//                       </div>

//                       {/* Info Pills */}
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
//                         <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/80 flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
//                             <Bed className="w-5 h-5" />
//                           </div>
//                           <div>
//                             <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Capacity</span>
//                             <span className="text-sm font-bold text-slate-900">{h.beds || '300+ Beds'}</span>
//                           </div>
//                         </div>

//                         <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/80 flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
//                             <Phone className="w-5 h-5" />
//                           </div>
//                           <div>
//                             <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Helpline</span>
//                             <span className="text-xs font-bold text-slate-900 leading-tight block">{h.contact || '24/7 Helpline'}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
//                       <button
//                         onClick={() => setActiveVideoModal(h)}
//                         className="text-xs font-bold text-medical-blue hover:text-medical-dark transition flex items-center gap-1 cursor-pointer"
//                       >
//                         <Video className="w-4 h-4" /> Watch Facility Video
//                       </button>
//                       <Link
//                         to="/book-appointment"
//                         className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-medical-blue hover:bg-medical-dark px-5 py-2.5 rounded-xl transition shadow-md shadow-medical-blue/20"
//                       >
//                         Book Appointment <ArrowRight className="w-3.5 h-3.5" />
//                       </Link>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </div>

//       {/* Video Modal Preview */}
//       <AnimatePresence>
//         {activeVideoModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
//             onClick={() => setActiveVideoModal(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl"
//             >
//               <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-900 text-white">
//                 <div className="flex items-center gap-2">
//                   <Video className="w-5 h-5 text-blue-400" />
//                   <h4 className="text-lg font-bold">{activeVideoModal.name} — Virtual Campus Tour</h4>
//                 </div>
//                 <button
//                   onClick={() => setActiveVideoModal(null)}
//                   className="p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <div className="relative aspect-video w-full bg-black">
//                 <video
//                   src={activeVideoModal.video}
//                   autoPlay
//                   controls
//                   className="w-full h-full object-cover"
//                 />
//               </div>

//               <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
//                 <div>
//                   <p className="text-sm text-gray-700 font-medium">{activeVideoModal.description}</p>
//                   <p className="text-xs text-medical-blue mt-1 font-bold">Location: {activeVideoModal.location} • {activeVideoModal.beds}</p>
//                 </div>
//                 <Link
//                   to="/book-appointment"
//                   onClick={() => setActiveVideoModal(null)}
//                   className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-medical-blue hover:bg-medical-dark text-white font-bold text-sm transition shadow-lg shadow-medical-blue/20"
//                 >
//                   Visit & Book <ArrowRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  X,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock4
} from 'lucide-react';

import hospitalVideo from '../../assets/hospital.mp4';
import brainVideo from '../../assets/brain.mp4';
import childCareVideo from '../../assets/child care.mp4';

export default function Hospitals() {
  const heroVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const togglePlay = () => {
    if (heroVideoRef.current) {
      if (isPlaying) heroVideoRef.current.pause();
      else heroVideoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const sampleHospitals = [
    {
      id: 101,
      name: 'Medpark Central Hospital & Trauma Center',
      location: 'New Delhi',
      beds: '500+ Beds',
      contact: '+91 11 4982 0000',
      img: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
      video: hospitalVideo,
      description: 'Flagship multi-specialty hospital featuring Level 1 Trauma Center, 12 robotic operation theaters, and 24/7 cardiac ICU.',
      tags: ['Level 1 Trauma', 'Robotic Surgery', '24/7 Pharmacy', 'Helipad Facility'],
      timings: 'Mon - Sat • 8:00 AM - 8:00 PM',
      emergency: '24/7 Emergency Available'
    },
    {
      id: 102,
      name: 'Medpark Institute of Neuro & Spine Excellence',
      location: 'Mumbai',
      beds: '350+ Beds',
      contact: '+91 22 6123 4567',
      img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      video: brainVideo,
      description: 'Dedicated neurosciences tertiary care facility equipped with intraoperative MRI, Gamma Knife, and stroke emergency unit.',
      tags: ['Neuro ICU', 'Gamma Knife', 'Stroke Center', 'Spine Rehab'],
      timings: 'Mon - Sat • 9:00 AM - 7:00 PM',
      emergency: '24/7 Neuro Emergency'
    }
  ];

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hospitals`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((h, idx) => ({
            ...h,
            video: [hospitalVideo, brainVideo, childCareVideo][idx % 3],
            img: h.image || sampleHospitals[idx % sampleHospitals.length]?.img,
            tags: h.tags || ['24/7 ICU', 'Advanced Care', 'Super Specialty'],
            timings: h.timings || 'Mon - Sat • 8:00 AM - 8:00 PM',
            emergency: h.emergency || '24/7 Emergency Available',
            description:
              h.description ||
              'Advanced care hospital with expert doctors, emergency services and patient-first support.'
          }));
          setHospitals(enriched);
        } else {
          setHospitals(sampleHospitals);
        }
      } catch (err) {
        setHospitals(sampleHospitals);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const cities = ['All', ...new Set(hospitals.map(h => h.location || 'Unknown'))];

  const filteredHospitals = hospitals.filter(h => {
    const matchesCity = selectedCity === 'All' || h.location === selectedCity;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (h.name || '').toLowerCase().includes(q) ||
      (h.location || '').toLowerCase().includes(q) ||
      (h.description || '').toLowerCase().includes(q);
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <section className="relative w-full h-[65vh] min-h-[500px] md:h-[75vh] overflow-hidden bg-slate-950">
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

        <div className="absolute bottom-12 right-6 z-30 flex items-center gap-3">
          <button onClick={togglePlay} className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={toggleMute} className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md w-max"
          >
            <Building2 className="w-4 h-4 text-medical-blue" /> Nationwide Hospital Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight max-w-4xl"
          >
            Our Premier <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
              Hospital Network
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-lg sm:text-xl text-gray-200 max-w-2xl"
          >
            Explore medical centers with advanced ICUs, emergency response, and patient-first care.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals by name, city, or facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap ${
                    selectedCity === city
                      ? 'bg-medical-blue text-white'
                      : 'bg-slate-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Loading hospital facilities...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredHospitals.map((h, idx) => (
                <motion.div
                  key={h.id || idx}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-900">
                    <img src={h.img} alt={h.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-medical-blue text-xs font-bold px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-md">
                      <MapPin className="w-3.5 h-3.5" />
                      {h.location || 'Super Specialty'}
                    </span>

                    <button
                      onClick={() => setActiveVideoModal(h)}
                      className="absolute bottom-4 right-4 bg-medical-blue text-white font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg"
                    >
                      <Video className="w-4 h-4" /> Tour Campus
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-extrabold text-medical-dark group-hover:text-medical-blue transition-colors">
                          {h.name}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{h.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {(h.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className="bg-medical-light text-medical-dark text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200/80 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-medical-blue" /> {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
                            <Bed className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Capacity</span>
                            <span className="text-sm font-bold text-slate-900">{h.beds || '300+ Beds'}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Helpline</span>
                            <span className="text-xs font-bold text-slate-900 leading-tight block">{h.contact || '24/7 Helpline'}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/80 flex items-center gap-3 sm:col-span-2">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center shrink-0">
                            <Clock4 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Hospital Timings</span>
                            <span className="text-sm font-bold text-slate-900 block">{h.timings}</span>
                            <span className="text-xs text-emerald-600 font-semibold">{h.emergency}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setActiveVideoModal(h)}
                        className="text-xs font-bold text-medical-blue flex items-center gap-1"
                      >
                        <Video className="w-4 h-4" /> Watch Facility Video
                      </button>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/hospitals/${h.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-blue border border-medical-blue px-4 py-2.5 rounded-xl hover:bg-medical-blue hover:text-white transition"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/appointment?hospitalId=${encodeURIComponent(h.id)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-medical-blue px-5 py-2.5 rounded-xl transition"
                        >
                          Book Appointment <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-bold">{activeVideoModal.name} — Virtual Campus Tour</h4>
                </div>
                <button onClick={() => setActiveVideoModal(null)} className="p-1 rounded-full text-gray-400 hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <video src={activeVideoModal.video} autoPlay controls className="w-full h-full object-cover" />
              </div>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div>
                  <p className="text-sm text-gray-700 font-medium">{activeVideoModal.description}</p>
                  <p className="text-xs text-medical-blue mt-1 font-bold">
                    Location: {activeVideoModal.location} • {activeVideoModal.beds}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    to={`/hospitals/${activeVideoModal.id}`}
                    onClick={() => setActiveVideoModal(null)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-medical-blue text-medical-blue font-bold text-sm hover:bg-medical-blue hover:text-white transition"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/appointment?hospitalId=${encodeURIComponent(activeVideoModal.id)}`}
                    onClick={() => setActiveVideoModal(null)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-medical-blue text-white font-bold text-sm transition"
                  >
                    Visit &amp; Book <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}