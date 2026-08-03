import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, ArrowRight } from 'lucide-react';
import brainVideo from '../../assets/brain.mp4';
import childCareVideo from '../../assets/child care.mp4';

const practiceAreas = [
  {
    title: "Neurology & Brain Surgery",
    img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80",
    video: brainVideo,
    hasVideo: true,
    desc: "Advanced brain, spine & nervous system treatments with facility video tour."
  },
  {
    title: "Orthopedics & Joint Care",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
    video: null,
    hasVideo: false,
    desc: "State-of-the-art robotic bone & joint replacements."
  },
  {
    title: "Pediatrics & Child Care",
    img: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=400&q=80",
    video: childCareVideo,
    hasVideo: true,
    desc: "Specialized 24/7 child health care & neonatal ICU facility tour."
  },
  {
    title: "Oncology & Cancer Center",
    img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80",
    video: null,
    hasVideo: false,
    desc: "Comprehensive cancer diagnosis, chemotherapy & radiation therapy."
  }
];

export default function HomePracticeAreas() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const practiceStep = 320;

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark tracking-tight">Our Practice Areas & Specialties</h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
          Comprehensive medical treatments delivering high precision & dedicated clinical care.
        </p>
      </div>

      <div className="w-full relative max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden py-4">
          <div
            className="flex gap-8 px-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${practiceIndex * practiceStep}px)`,
              width: `${practiceAreas.length * practiceStep}px`
            }}
          >
            {practiceAreas.map((area, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -8 }}
                className="min-w-[300px] max-w-[300px] bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200/80 flex-shrink-0 transition-shadow hover:shadow-2xl group"
              >
                {area.hasVideo ? (
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                    >
                      <source src={area.video} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <button 
                      onClick={() => setActiveVideoModal(area)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </button>
                    <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-white/20">
                      Video Tour Available
                    </span>
                  </div>
                ) : (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={area.img} 
                      alt={area.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-medical-dark group-hover:text-medical-blue transition-colors mb-2">
                    {area.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {area.desc}
                  </p>

                  <button 
                    onClick={() => area.hasVideo && setActiveVideoModal(area)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-medical-blue hover:text-medical-dark transition-colors cursor-pointer"
                  >
                    {area.hasVideo ? 'Watch Video Tour' : 'Learn More'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            disabled={practiceIndex === 0}
            onClick={() => setPracticeIndex(prev => Math.max(0, prev - 1))}
            className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer shadow-sm"
          >
            ←
          </button>
          <button 
            disabled={practiceIndex >= practiceAreas.length - 2}
            onClick={() => setPracticeIndex(prev => Math.min(practiceAreas.length - 1, prev + 1))}
            className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer shadow-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Video Modal Popup */}
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
              className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            >
              <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-medical-blue fill-medical-blue" />
                  {activeVideoModal.title} — Video Tour
                </h3>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black">
                <video
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                >
                  <source src={activeVideoModal.video} type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
