import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function FloatingScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 280);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 15 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-4 sm:bottom-8 sm:left-8 z-40 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-slate-900 via-medical-dark to-medical-blue text-white rounded-full shadow-lg shadow-blue-500/25 border border-white/20 backdrop-blur-md cursor-pointer flex items-center justify-center group focus:outline-none transition-all duration-200"
          title="Scroll back to top"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span className="sr-only">Scroll to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
