import { motion } from 'framer-motion';

export default function DashboardLayout({ title, subtitle, children, showHeader = true }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 py-3 sm:py-5 md:py-6 px-2.5 sm:px-4 md:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-1"
          >
            <div className="flex flex-col gap-2 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-medical-dark tracking-tight">{title}</h1>
                <p className="mt-1 text-slate-600 max-w-2xl text-xs sm:text-sm md:text-base">{subtitle}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}