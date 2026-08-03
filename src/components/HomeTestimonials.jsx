import { motion } from 'framer-motion';

const marqueeTestimonials = [
  {
    name: 'Priyanka',
    text: 'Best hospital and surgical care in the region. Highly recommend Medpark Hospital for specialized procedures.',
    stars: 5
  },
  {
    name: 'Arun',
    text: 'Doctors at Medpark Hospital are dedicated to their patients. Outstanding emergency and inpatient care.',
    stars: 5
  },
  {
    name: 'Dr. Suresh',
    text: 'Seamless online appointment booking and quick diagnostic lab report processing. Very satisfied.',
    stars: 5
  },
  {
    name: 'Meenakshi',
    text: 'Specialized pediatrics and child care team were extremely caring. Clean facilities and helpful staff.',
    stars: 5
  }
];

export default function HomeTestimonials() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-medical-dark tracking-tight">What Patients Say About Us</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">Trusted feedback from across our medical network.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-slate-50/60 py-8">
          <motion.div
            className="flex gap-6 px-6"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeTestimonials.concat(marqueeTestimonials).map((item, idx) => (
              <div key={idx} className="min-w-[280px] max-w-[320px] bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-medical-dark">{item.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.stars)].map((_, starIndex) => (
                      <span key={starIndex}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">“{item.text}”</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
