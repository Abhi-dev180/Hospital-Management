import { motion } from 'framer-motion';

// Pet care specialties shown as a continuously scrolling marquee of image cards.
const specialties = [
  { name: 'Vaccinations', img: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=500&q=80' },
  { name: 'Surgery', img: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&w=500&q=80' },
  { name: 'Dental Care', img: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=500&q=80' },
  { name: 'Dermatology', img: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=500&q=80' },
  { name: 'Cardiology', img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=500&q=80' },
  { name: 'Grooming & Spa', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500&q=80' },
  { name: 'Emergency Care', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80' },
  { name: 'Nutrition', img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=500&q=80' }
];

export default function PortalSpecialties() {
  // Duplicate the list so the loop restarts seamlessly.
  const items = specialties.concat(specialties);

  return (
    <section id="specialties" className="scroll-mt-20 py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <span className="eyebrow">Our Specialties</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-medical-dark mt-3">Complete care for every pet</h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
          From routine check-ups to advanced surgery — all managed in one portal.
        </p>
      </div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6 px-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((item, idx) => (
            <div key={idx} className="min-w-[220px] max-w-[220px] flex-shrink-0 rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white">
              <div className="h-36 overflow-hidden">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-medical-dark">{item.name}</h3>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
