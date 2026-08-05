import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import homeTopVideo from '../../assets/home top.mp4';

const healthPackages = [
  {
    title: 'Healthy Heart Package',
    desc: 'Heart-focused screening to assess key risk markers and cardiovascular health.',
    img: 'https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/health-packages/January2026/kTxGxHcreRtQkmEspAyE.webp'
  },
  {
    title: 'Wellness 360 Health Check Package',
    desc: 'Full-body health check covering major organ systems and key metabolic markers.',
    img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Special Screening Packages',
    desc: 'Renal/kidney, diabetes, rheumatology, urology, liver, spine and stroke-risk screening packages.',
    img: 'https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/health-packages/January2026/i8AH8LC43wNogsE0xP1N.webp'
  }
];

export default function HomeHealthPackages() {
  return (
    <>
      {/* Health Packages Showcase */}
      <section className="py-20 bg-slate-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3.5 py-1 rounded-full bg-blue-100/80 text-medical-blue text-xs font-bold uppercase tracking-widest mb-3">
              Comprehensive Health Checkups
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark tracking-tight">
              Tailored Packages For Personalized Care
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              Early detection for long-term health and wellbeing across all age groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {healthPackages.map((pkg, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={pkg.img}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-medical-dark mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{pkg.desc}</p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-medical-blue hover:text-medical-dark transition-colors cursor-pointer"
                  >
                    Book Package <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Video Banner Showcase */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={homeTopVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/30">
                Excellence in Action
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                To Learn Exclusive Special Healthcare Services
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Discover our advanced patient care units, robotic surgical suites, and round-the-clock specialized trauma care centers.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>24/7 Dedicated Emergency & Trauma Care</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Robotic & Minimal Access Surgery Center</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Comprehensive Cashless Insurance Approval</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-medical-blue hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all"
                >
                  Contact Us Today <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
