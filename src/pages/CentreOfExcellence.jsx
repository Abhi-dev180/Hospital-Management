import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Video, 
  X, 
  ArrowRight,
  Microscope
} from 'lucide-react';

import homeTopVideo from '../../assets/home top.mp4';
import brainVideo from '../../assets/brain.mp4';
import childCareVideo from '../../assets/child care.mp4';
import hospitalVideo from '../../assets/hospital.mp4';

export default function CentreOfExcellence() {
  const heroVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const centers = [
    {
      id: 'cardiology',
      title: 'Heart & Vascular Institute',
      category: 'Cardiology',
      icon: Heart,
      img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      video: hospitalVideo,
      tag: 'Ranked #1 Cardiac Unit',
      desc: 'Advanced cath labs, minimally invasive valve replacements, and 24/7 emergency cardiac care unit.',
      features: ['Robotic Heart Surgery', 'TAVI Procedure', '24/7 Chest Pain Unit', 'Electrophysiology'],
      stats: { success: '99.4%', surgeries: '12,000+' }
    },
    {
      id: 'neuroscience',
      title: 'Neurosciences & Brain Surgery',
      category: 'Neurology',
      icon: Brain,
      img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
      video: brainVideo,
      tag: 'Comprehensive Stroke Center',
      desc: 'State-of-the-art neuro-navigation, deep brain stimulation, and complex spinal reconstruction.',
      features: ['CyberKnife Radiosurgery', 'Brain Tumor Center', 'Epilepsy Monitoring', 'Stroke Response Team'],
      stats: { success: '98.9%', surgeries: '8,500+' }
    },
    {
      id: 'pediatrics',
      title: 'Pediatric Care & Neonatology',
      category: 'Pediatrics',
      icon: Sparkles,
      img: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
      video: childCareVideo,
      tag: 'Level IV NICU Facility',
      desc: 'Dedicated round-the-clock pediatric ICU, congenital heart surgery, and child neurology care.',
      features: ['Neonatal Intensive Care', 'Pediatric Surgery', 'Child Psychology', 'Growth & Development'],
      stats: { success: '99.7%', surgeries: '15,000+' }
    },
    {
      id: 'orthopedics',
      title: 'Orthopedics & Joint Replacement',
      category: 'Orthopedics',
      icon: Activity,
      img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      video: hospitalVideo,
      tag: 'Robotic Surgery Pioneer',
      desc: 'Computer-guided knee & hip replacement, complex trauma surgery, and sports medicine rehabilitation.',
      features: ['Mako Robotic Surgery', 'Arthroscopy Clinic', 'Spine Rehabilitation', 'Sports Injury Unit'],
      stats: { success: '99.1%', surgeries: '20,000+' }
    },
    {
      id: 'oncology',
      title: 'Comprehensive Cancer Center',
      category: 'Oncology',
      icon: ShieldCheck,
      img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80',
      video: brainVideo,
      tag: 'Immunotherapy Center',
      desc: 'Targeted radiation therapy, personalized chemotherapy suites, and multi-disciplinary tumor boards.',
      features: ['PET-CT Imaging', 'Bone Marrow Transplant', 'Proton Therapy', 'Surgical Oncology'],
      stats: { success: '97.8%', surgeries: '9,200+' }
    },
    {
      id: 'gastroenterology',
      title: 'Gastroenterology & Liver Sciences',
      category: 'Gastroenterology',
      icon: Microscope,
      img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
      video: hospitalVideo,
      tag: 'Advanced Endoscopy Suite',
      desc: 'Comprehensive liver transplant care, advanced diagnostic endoscopy, and metabolic wellness.',
      features: ['Liver Transplant Unit', 'Endoscopic Ultrasound', 'IBD Special Care', 'Bariatric Surgery'],
      stats: { success: '98.5%', surgeries: '7,400+' }
    }
  ];

  const categories = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Oncology'];

  const filteredCenters = selectedCategory === 'All' 
    ? centers 
    : centers.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Hero Video Banner Section matching Home page */}
      <section className="relative w-full h-[70vh] min-h-[500px] md:h-[80vh] overflow-hidden bg-slate-950">
        <video
          ref={heroVideoRef}
          src={homeTopVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] scale-105"
        />
        
        {/* Sleek Gradient Overlay matching Home page */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-10" />

        {/* Video Controls */}
        <div className="absolute bottom-12 right-6 z-30 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-medical-blue animate-ping"></span>
            <span className="font-semibold">Live Excellence Video Tour</span>
          </div>
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
            <Award className="w-4 h-4 text-medical-blue" /> World-Class Healthcare Infrastructure
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl"
          >
            Centres of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
              Medical Excellence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-gray-200 max-w-2xl font-normal leading-relaxed drop-shadow"
          >
            Combining cutting-edge medical technology, world-renowned clinical experts, and patient-first compassionate care.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area in Light Theme */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-medical-blue font-bold mb-2">Specialized Departments</p>
          <h2 className="text-3xl sm:text-4xl font-black text-medical-dark">Comprehensive Clinical Specialties</h2>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/30 scale-105'
                  : 'bg-white text-gray-700 hover:text-medical-blue hover:bg-slate-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Center Cards Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredCenters.map((center, idx) => {
              const IconComp = center.icon;
              return (
                <motion.div
                  key={center.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between"
                >
                  {/* Card Image Header */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={center.img}
                      alt={center.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    
                    {/* Badge */}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-medical-blue text-xs font-bold px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-md">
                      <IconComp className="w-3.5 h-3.5" />
                      {center.tag}
                    </span>

                    {/* Video Tour Button */}
                    <button
                      onClick={() => setActiveModalVideo(center)}
                      className="absolute bottom-4 right-4 bg-medical-blue hover:bg-medical-dark text-white font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Video className="w-4 h-4" /> Watch Tour
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-medical-dark group-hover:text-medical-blue transition-colors">
                        {center.title}
                      </h3>
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                        {center.desc}
                      </p>

                      {/* Feature Pills */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {center.features.map((feat, i) => (
                          <span
                            key={i}
                            className="bg-medical-light text-medical-dark text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200/80"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats & Action */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-500 block">Surgeries Done</span>
                        <span className="text-lg font-extrabold text-medical-blue">{center.stats.surgeries}</span>
                      </div>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-medical-blue px-4 py-2.5 rounded-xl hover:bg-medical-dark transition shadow-md shadow-medical-blue/20"
                      >
                        Book <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Video Modal Preview */}
      <AnimatePresence>
        {activeModalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModalVideo(null)}
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
                  <h4 className="text-lg font-bold">{activeModalVideo.title} — Virtual Facility Tour</h4>
                </div>
                <button
                  onClick={() => setActiveModalVideo(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <video
                  src={activeModalVideo.video}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div>
                  <p className="text-sm text-gray-700 font-medium">{activeModalVideo.desc}</p>
                  <p className="text-xs text-medical-blue mt-1 font-bold">Success Rate: {activeModalVideo.stats.success}</p>
                </div>
                <Link
                  to="/contact"
                  onClick={() => setActiveModalVideo(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-medical-blue hover:bg-medical-dark text-white font-bold text-sm transition shadow-lg shadow-medical-blue/20"
                >
                  Consult Specialist Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
