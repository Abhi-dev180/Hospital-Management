import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How do I get started with the portal?',
    a: 'Book a free demo from this page. Pick a time, join the call, and our team will walk you through everything. If you like it, you can register your hospital right after.'
  },
  {
    q: 'Can I manage more than one hospital?',
    a: 'Yes. Super admins can add and manage a whole network of hospitals, each with its own admin login, appointments, feedback, and records.'
  },
  {
    q: 'How does appointment scheduling work?',
    a: 'Pet owners book online by choosing a hospital and a time. Only the selected hospital sees that appointment, and they can confirm, reschedule, or complete it from their dashboard.'
  },
  {
    q: 'Is my hospital data secure?',
    a: 'Every account is role-based (super admin, hospital admin, staff), so people only see what they should. Data is stored in a secure database, not on local files.'
  },
  {
    q: 'What happens after a demo?',
    a: 'You get a feedback email. If you are interested, you continue to a secure payment and then register your hospital. A super admin approves it and your login is created automatically.'
  }
];

export default function PortalFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 py-20 bg-slate-50 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/80 text-medical-blue text-xs font-bold uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-medical-dark">Got questions? We have answers</h2>
          <p className="text-gray-600 mt-3 text-sm sm:text-base">
            Everything you need to know about the Pet Hospital Portal.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className="font-bold text-base md:text-lg text-medical-dark flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-50 text-medical-blue text-xs flex items-center justify-center font-extrabold shrink-0">
                    0{idx + 1}
                  </span>
                  {faq.q}
                </span>
                <ChevronDown className={`w-5 h-5 text-medical-blue shrink-0 transition-transform duration-300 ${open === idx ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {open === idx && (
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
