import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Star, 
  Calendar, 
  Video, 
  X, 
  ArrowRight,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';

import childCareVideo from '../../assets/child care.mp4';
import brainVideo from '../../assets/brain.mp4';
import hospitalVideo from '../../assets/hospital.mp4';

export default function Doctors() {
  const heroVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [activeDoctorModal, setActiveDoctorModal] = useState(null);

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

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Oncology'];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Jenkins',
      title: 'Senior Cardiologist & Surgical Director',
      spec: 'Cardiology',
      exp: '15+ Years Experience',
      degree: 'MD, DM (Cardiology), FACC',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
      video: hospitalVideo,
      rating: 4.9,
      reviews: 320,
      availability: 'Mon, Wed, Fri',
      fee: '$120',
      highlights: ['Specialist in TAVI', 'Over 3,000 Heart Surgeries', 'Former Johns Hopkins Fellow']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      title: 'Chief Neurosurgeon & Spine Specialist',
      spec: 'Neurology',
      exp: '12+ Years Experience',
      degree: 'MD, MCh (Neurosurgery)',
      img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80',
      video: brainVideo,
      rating: 4.95,
      reviews: 410,
      availability: 'Tue, Thu, Sat',
      fee: '$150',
      highlights: ['Robotic Spine Surgery', 'Minimally Invasive Tumor Removal', 'International Speaker']
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      title: 'Head of Pediatric & Neonatal Medicine',
      spec: 'Pediatrics',
      exp: '10+ Years Experience',
      degree: 'MD (Pediatrics), Fellowship in Neonatology',
      img: 'https://res.cloudinary.com/alumniimages/image/upload/v1781590474/alumni/rpjckqjnewnv20ybakzs.jpg',
      video: childCareVideo,
      rating: 4.98,
      reviews: 512,
      availability: 'Mon - Sat',
      fee: '$90',
      highlights: ['Critical Pediatric ICU Care', 'Child Growth & Nutrition Specialist', 'Compassionate Care Excellence']
    },
    {
      id: 4,
      name: 'Dr. Robert Smith',
      title: 'Senior Orthopedic & Joint Replacement Surgeon',
      spec: 'Orthopedics',
      exp: '20+ Years Experience',
      degree: 'MS (Orthopedics), FRCS',
      img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80',
      video: hospitalVideo,
      rating: 4.88,
      reviews: 290,
      availability: 'Mon, Tue, Thu',
      fee: '$130',
      highlights: ['Mako Robotic Knee Replacement', 'Sports Arthroscopy Expert', 'Top Regional Specialist']
    },
    {
      id: 5,
      name: 'Dr. Aris Thorne',
      title: 'Consultant Medical Oncologist',
      spec: 'Oncology',
      exp: '14+ Years Experience',
      degree: 'MD, DM (Medical Oncology)',
      img: 'https://images.unsplash.com/photo-1594824813572-c0e66a3d6014?w=800&q=80',
      video: brainVideo,
      rating: 4.92,
      reviews: 185,
      availability: 'Wed, Fri, Sat',
      fee: '$140',
      highlights: ['Targeted Immunotherapy', 'Precision Cancer Medicine', 'Molecular Biomarker Expert']
    },
    {
      id: 6,
      name: 'Dr. Sophia Martinez',
      title: 'Pediatric Cardiac Surgeon',
      spec: 'Pediatrics',
      exp: '11+ Years Experience',
      degree: 'MD, MCh (Pediatric Cardiac)',
      img: 'https://images.unsplash.com/photo-1594824813571-24a698377cde?w=800&q=80',
      video: childCareVideo,
      rating: 4.96,
      reviews: 230,
      availability: 'Mon, Wed, Sat',
      fee: '$135',
      highlights: ['Congenital Heart Repair', 'Minimally Invasive Pediatric Surgery', 'NICU Care Leader']
    }
  ];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSpec = selectedSpecialty === 'All' || doc.spec === selectedSpecialty;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Video Hero Banner matching Home page */}
      <section className="relative w-full h-[65vh] min-h-[500px] md:h-[75vh] overflow-hidden bg-slate-950">
        <video
          ref={heroVideoRef}
          src={childCareVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-10" />

        {/* Video Controls */}
        <div className="absolute bottom-12 right-6 z-30 flex items-center gap-3">
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

        {/* Hero Text Content */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-md w-max"
          >
            <Stethoscope className="w-4 h-4 text-medical-blue" /> Leading Medical Specialists
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl"
          >
            Meet Our Eminent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
              Specialist Doctors
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-gray-200 max-w-2xl font-normal leading-relaxed drop-shadow"
          >
            World-renowned consultants and surgical experts dedicated to delivering compassionate clinical care.
          </motion.p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-medical-blue transition"
              />
            </div>

            {/* Specialty Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    selectedSpecialty === spec
                      ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20 font-bold'
                      : 'bg-slate-100 text-gray-700 hover:bg-slate-200 border border-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredDoctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between"
              >
                {/* Doctor Avatar / Image */}
                <div className="relative h-72 overflow-hidden bg-slate-900">
                  <img
                    src={doc.img}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Rating Tag */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-amber-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.rating} ({doc.reviews})</span>
                  </div>

                  {/* Video Intro Badge */}
                  <button
                    onClick={() => setActiveDoctorModal(doc)}
                    className="absolute top-4 right-4 bg-medical-blue hover:bg-medical-dark text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    title="Watch Video Spotlight"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs uppercase tracking-widest text-sky-300 font-semibold">{doc.spec}</span>
                    <h3 className="text-2xl font-extrabold mt-0.5">{doc.name}</h3>
                    <p className="text-xs text-gray-200 font-medium">{doc.degree}</p>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {doc.title}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-1.5">
                      {doc.highlights.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-medical-blue shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-medical-light p-2.5 rounded-2xl border border-gray-200/80 text-center">
                        <span className="text-[10px] uppercase text-gray-500 block">Experience</span>
                        <span className="text-xs font-bold text-medical-dark">{doc.exp}</span>
                      </div>
                      <div className="bg-medical-light p-2.5 rounded-2xl border border-gray-200/80 text-center">
                        <span className="text-[10px] uppercase text-gray-500 block">Availability</span>
                        <span className="text-xs font-bold text-medical-dark">{doc.availability}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setActiveDoctorModal(doc)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-medical-blue bg-medical-light hover:bg-slate-200 transition cursor-pointer"
                    >
                      Profile & Video
                    </button>
                    <Link
                      to="/book-appointment"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-medical-blue hover:bg-medical-dark transition shadow-md shadow-medical-blue/20"
                    >
                      Book Consult <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Doctor Video Modal */}
      <AnimatePresence>
        {activeDoctorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveDoctorModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-lg font-bold">{activeDoctorModal.name}</h4>
                    <p className="text-xs text-gray-300">{activeDoctorModal.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDoctorModal(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <video
                  src={activeDoctorModal.video}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div>
                  <p className="text-xs text-medical-blue font-bold uppercase">{activeDoctorModal.spec} • {activeDoctorModal.degree}</p>
                  <p className="text-sm text-gray-700 mt-1">Consultation Fee: <span className="text-medical-dark font-extrabold">{activeDoctorModal.fee}</span></p>
                </div>
                <Link
                  to="/book-appointment"
                  onClick={() => setActiveDoctorModal(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-medical-blue hover:bg-medical-dark text-white font-bold text-sm transition shadow-lg shadow-medical-blue/20"
                >
                  Book Appointment Now <Calendar className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
