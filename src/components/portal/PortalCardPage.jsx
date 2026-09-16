import { motion } from 'framer-motion';

export default function PortalCardPage({ icon: Icon, title, subtitle, children, wide = false, size = null, className = '' }) {
  let maxWidthClass = 'max-w-xl';
  if (size === '5xl' || size === 'full' || wide === '5xl' || wide === 'full') {
    maxWidthClass = 'max-w-6xl w-full';
  } else if (size === '4xl' || wide === '4xl') {
    maxWidthClass = 'max-w-4xl w-full';
  } else if (size === '2xl' || wide === true || wide === '2xl') {
    maxWidthClass = 'max-w-2xl w-full';
  } else if (size === '3xl') {
    maxWidthClass = 'max-w-3xl w-full';
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] portal-bg py-5 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`mx-auto ${maxWidthClass} card-lg p-4 sm:p-7 md:p-10 ${className}`}
      >
        {(Icon || title) && (
          <div className="text-center mb-5 sm:mb-7">
            {Icon && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-2xl bg-blue-50 text-medical-blue flex items-center justify-center shadow-xs">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            )}
            {title && <h1 className="text-xl sm:text-2xl font-extrabold text-medical-dark">{title}</h1>}
            {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">{subtitle}</p>}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
