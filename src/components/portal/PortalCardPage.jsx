import { motion } from 'framer-motion';

// Centered card layout shared by the public funnel pages (schedule / feedback / register).
export default function PortalCardPage({ icon: Icon, title, subtitle, children, wide = false }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] portal-bg py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`mx-auto ${wide ? 'max-w-2xl' : 'max-w-xl'} card-lg p-7 sm:p-10`}
      >
        {(Icon || title) && (
          <div className="text-center mb-7">
            {Icon && (
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 text-medical-blue flex items-center justify-center">
                <Icon className="w-7 h-7" />
              </div>
            )}
            {title && <h1 className="text-2xl font-extrabold text-medical-dark">{title}</h1>}
            {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
