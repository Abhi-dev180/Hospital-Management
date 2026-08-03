import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How do I book an appointment with a specialist?',
    a: 'You can book an appointment online through our portal by clicking "Book Appointment", selecting your desired doctor or specialty, picking a time slot, and confirming. You can also call our 24/7 helpline at +91 98767 69966.'
  },
  {
    q: 'Are emergency and ambulance services available 24/7?',
    a: 'Yes, our Trauma Center, Emergency Response Units, ICUs, and 24/7 ambulance dispatch services operate round-the-clock without interruption across all Medpark hospital network locations.'
  },
  {
    q: 'Which insurance providers and health packages are accepted?',
    a: 'We accept cashless payments and claims from all major health insurance providers. Additionally, we offer custom cashless packages for heart checkups, full-body wellness, and surgery procedures.'
  },
  {
    q: 'What should I bring for my first consultation?',
    a: 'Please carry a valid photo ID, any previous medical records or test reports, current prescription details, and your health insurance card (if applicable).'
  },
  {
    q: 'Can I view or reschedule my booked appointments online?',
    a: 'Yes! Simply log in to your patient account dashboard to view upcoming appointment status, reschedule date and time, or download digital consultation receipts.'
  }
];

export default function HomeFAQ() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="py-20 bg-slate-50 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/80 text-medical-blue text-xs font-bold uppercase tracking-widest mb-3"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-medical-dark"
          >
            Got Questions? We Have Answers
          </motion.h2>
          <p className="text-gray-600 mt-3 text-sm sm:text-base">
            Everything you need to know about booking appointments, emergency care, insurance, and medical services at Medpark.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
              >
                <span className="font-bold text-base md:text-lg text-medical-dark flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-50 text-medical-blue text-xs flex items-center justify-center font-extrabold shrink-0">
                    0{idx + 1}
                  </span>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-medical-blue shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pl-16">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
