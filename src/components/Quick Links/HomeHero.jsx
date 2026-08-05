import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ArrowRight, HeartPulse } from 'lucide-react';
import newVideo from '../../assets/new.mp4';

export default function HomeHero() {
  const heroVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <section className="relative h-[85vh] min-h-[550px] max-h-[750px] w-full overflow-hidden bg-slate-950 flex items-center">
      {/* Background Video */}
      <video
        ref={heroVideoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source src={newVideo} type="video/mp4" />
      </video>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-2xl text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20 shadow-lg"
          >
            <HeartPulse className="w-4 h-4 text-medical-blue animate-pulse" />
            Leading Healthcare Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-md text-white"
          >
            The Global Standard for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Precision Healthcare
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-200 mt-4 leading-relaxed max-w-xl font-normal drop-shadow-sm"
          >
            Empowering patient lives with world-class specialist doctors, robotic surgeries, 24/7 trauma emergency response, and state-of-the-art diagnostic facilities.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-medical-blue hover:bg-blue-600 text-white font-bold py-3.5 px-7 rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Book Appointment <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/excellence"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold py-3.5 px-6 rounded-full border border-white/30 shadow-md transition-all"
            >
              Explore Specialties
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Video Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-xl">
        <button
          onClick={togglePlay}
          className="p-2 text-white hover:text-medical-blue transition cursor-pointer"
          title={isPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleMute}
          className="p-2 text-white hover:text-medical-blue transition cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </section>
  );
}
