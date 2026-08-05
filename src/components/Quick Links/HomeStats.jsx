import { motion } from 'framer-motion';
import { UserCheck, Award, Clock } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function HomeStats() {
  return (
    <section className="py-2 sm:py-3 bg-white relative z-20 -mt-5 sm:-mt-8 mx-3 md:mx-auto max-w-5xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100">
      <div className="container mx-auto px-2 sm:px-4">
        <motion.div
          className="grid grid-cols-3 gap-1 sm:gap-6 text-center divide-x divide-gray-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="py-2.5 px-1 sm:p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-3 rounded-xl sm:rounded-2xl bg-blue-50 text-medical-blue flex items-center justify-center">
              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-4xl font-extrabold text-medical-blue mb-0.5">100+</h2>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-700 leading-tight">Expert Staff</p>
          </motion.div>

          <motion.div variants={fadeUp} className="py-2.5 px-1 sm:p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-3 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-4xl font-extrabold text-medical-blue mb-0.5">99%</h2>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-700 leading-tight">Satisfaction</p>
          </motion.div>

          <motion.div variants={fadeUp} className="py-2.5 px-1 sm:p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-3 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-4xl font-extrabold text-medical-blue mb-0.5">24/7</h2>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-700 leading-tight">Emergency</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
