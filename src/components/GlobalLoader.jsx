import { motion } from 'framer-motion';
import { PawPrint, Heart, Sparkles } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-medical-dark via-medical-blue to-blue-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 8 + 2,
              height: Math.random() * 8 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <motion.div
            className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl"
            animate={{
              boxShadow: [
                '0 0 40px rgba(56, 189, 248, 0.2)',
                '0 0 80px rgba(56, 189, 248, 0.4)',
                '0 0 40px rgba(56, 189, 248, 0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <PawPrint className="w-14 h-14 text-white" />
            </motion.div>
          </motion.div>

          {/* Sparkle decorations */}
          <motion.div
            className="absolute -top-3 -right-3"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Heart className="w-5 h-5 text-rose-400" />
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pet Hospital Portal
          </h1>
          <p className="text-blue-200/80 text-sm mt-1 font-medium tracking-wider">
            Modern care for veterinary teams
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Animated dots */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </div>

          <div className="relative w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <p className="text-white/70 text-xs font-medium tracking-widest uppercase mt-1">
            Loading
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </p>
        </motion.div>
      </div>

      {/* Bottom decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}