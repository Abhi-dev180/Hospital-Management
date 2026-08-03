import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import medicalLogo from '../assets/sign.png';
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-medical-dark text-white pt-5 pb-4 border-t-4 border-medical-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-6">
        {/* Brand & Summary Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5 pb-3 border-b border-gray-700/80"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src={medicalLogo}
              alt="Medpark Hospital Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="font-extrabold text-2xl tracking-tight text-white">
              MEDPARK <span className="text-red-500 text-base align-top">✚</span>
            </span>
          </div>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl">
            Delivering the global standard for precision healthcare. Your health is our top priority, and we are dedicated to saving lives and enhancing community wellness with top medical specialists.
          </p>
        </motion.div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-base md:text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-white flex items-center gap-1.5">
              <span>⚡</span> Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-gray-300">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Home</Link></li>
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Centre of Excellence</Link></li>
              <li><Link to="/doctors" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Doctors</Link></li>
              <li><Link to="/hospitals" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Hospitals Network</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Contact Us</Link></li>
              <li><Link to="/dashboard/book-appointment" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Book Appointment</Link></li>
            </ul>
          </motion.div>

          {/* Departments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-base md:text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-white flex items-center gap-1.5">
              <span>🏥</span> Departments
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-gray-300">
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Cardiology</Link></li>
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Neurology</Link></li>
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Orthopedics</Link></li>
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Pediatrics</Link></li>
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Oncology</Link></li>
              <li><Link to="/excellence" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><span>›</span> Gastroenterology</Link></li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 md:col-span-1 border-t md:border-t-0 border-gray-700/80 pt-6 md:pt-0"
          >
            <h4 className="text-base md:text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-white flex items-center gap-1.5">
              <span>📞</span> Contact Us
            </h4>
            <ul className="space-y-3.5 text-xs md:text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-0.5">📍</span>
                <span>123 Health Avenue, Medical District,<br />Mohali, PB 160055</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400">📞</span>
                <a href="tel:+919876769966" className="hover:text-white transition">+91 98767 69966</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400">✉️</span>
                <a href="mailto:contact@medpark.com" className="hover:text-white transition">contact@medpark.com</a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-3 border-t border-gray-700/80 text-center md:flex md:justify-between md:items-center text-xs md:text-sm text-gray-400">
          <p>&copy; {currentYear} Medpark Hospital. All Rights Reserved.</p>
          <div className="flex justify-center space-x-6 mt-2 md:mt-0">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}