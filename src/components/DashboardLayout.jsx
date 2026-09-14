import { motion } from 'framer-motion';

export default function DashboardLayout({ title, subtitle, children, showHeader = true }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 py-4 px-2 sm:px-3">
      <div className="w-full space-y-4 sm:space-y-6">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-1"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-medical-dark">{title}</h1>
                <p className="mt-1 text-gray-600 max-w-2xl text-sm sm:text-base">{subtitle}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="space-y-6 sm:space-y-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}