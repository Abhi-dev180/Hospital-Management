import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  X,
  Stethoscope
} from 'lucide-react';

const FALLBACK_DOCTOR_IMG = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80';

const DOCTORS = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    title: 'Senior Cardiologist & Cardiac Surgery Director',
    spec: 'Cardiology',
    exp: '15+ Years Exp.',
    degree: 'MD, DM (Cardiology), FACC',
    hospital: 'Apollo Multi-Specialty Hospital, Delhi',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    reviews: 340,
    fee: '₹800',
    originalFee: '₹1,500',
    nextSlot: 'Today, 04:30 PM',
    badges: ['Top Rated', 'Robotic Surgery Specialist'],
    highlights: ['3,500+ Successful Heart Procedures', 'Former Johns Hopkins Fellow', 'TAVI Specialist']
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    title: 'Chief Neurosurgeon & Spine Specialist',
    spec: 'Neurology',
    exp: '12+ Years Exp.',
    degree: 'MD, MCh (Neurosurgery)',
    hospital: 'Fortis Super Specialty Hospital, Mumbai',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    rating: 4.92,
    reviews: 410,
    fee: '₹1,000',
    originalFee: '₹1,800',
    nextSlot: 'Tomorrow, 10:00 AM',
    badges: ['Spine Surgery Lead', 'Minimally Invasive'],
    highlights: ['Micro-neurosurgery Expert', 'Over 2,200 Brain Surgeries', 'Global Neuro Award 2024']
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    title: 'Senior Pediatrician & Neonatal Care Expert',
    spec: 'Pediatrics',
    exp: '10+ Years Exp.',
    degree: 'MD (Pediatrics), DCH',
    hospital: 'Max Super Specialty Hospital, Mohali',
    img: 'https://images.unsplash.com/photo-1594824813587-8e68434778d9?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 280,
    fee: '₹600',
    originalFee: '₹1,200',
    nextSlot: 'Today, 06:15 PM',
    badges: ['Child Health Lead', 'Vaccination Specialist'],
    highlights: ['NICU Critical Care Director', 'Child Development Specialist', '10,000+ Happy Families']
  },
  {
    id: 4,
    name: 'Dr. Rajesh Sharma',
    title: 'Lead Orthopedic & Joint Replacement Surgeon',
    spec: 'Orthopedics',
    exp: '18+ Years Exp.',
    degree: 'MS (Ortho), MCh, Fellow Joint Replacement',
    hospital: 'Medanta - The Medicity, Gurugram',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
    rating: 4.94,
    reviews: 520,
    fee: '₹900',
    originalFee: '₹1,600',
    nextSlot: 'Tomorrow, 02:00 PM',
    badges: ['Robotic Knee Expert', 'Sports Injury Lead'],
    highlights: ['5,000+ Knee & Hip Replacements', 'Pioneer in Fast-Track Recovery', 'Olympian Consultant']
  },
  {
    id: 5,
    name: 'Dr. Priya Nair',
    title: 'Consultant Medical & Radiation Oncologist',
    spec: 'Oncology',
    exp: '14+ Years Exp.',
    degree: 'MD (Radiotherapy), DNB (Medical Oncology)',
    hospital: 'Manipal Hospital, Bengaluru',
    img: 'https://images.unsplash.com/photo-1594824813572-c0e66a3d6014?auto=format&fit=crop&w=800&q=80',
    rating: 4.98,
    reviews: 390,
    fee: '₹1,200',
    originalFee: '₹2,200',
    nextSlot: 'Wed, 11:30 AM',
    badges: ['Precision Oncology', 'Immunotherapy Lead'],
    highlights: ['Targeted Molecular Therapy', 'ESMO Certified Oncologist', 'Compassionate Cancer Care']
  },
  {
    id: 6,
    name: 'Dr. Vikram Malhotra',
    title: 'Senior Gastroenterologist & Liver Specialist',
    spec: 'Gastroenterology',
    exp: '16+ Years Exp.',
    degree: 'MD, DM (Gastroenterology)',
    hospital: 'Apollo Hospital, New Delhi',
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    reviews: 310,
    fee: '₹850',
    originalFee: '₹1,500',
    nextSlot: 'Today, 05:00 PM',
    badges: ['Endoscopy Expert', 'Hepatology Care'],
    highlights: ['Therapeutic Endoscopy Specialist', 'Fatty Liver Reversal Program', 'Leading Researcher']
  },
  {
    id: 7,
    name: 'Dr. Ananya Sengupta',
    title: 'Chief Dermatologist & Aesthetic Laser Surgeon',
    spec: 'Dermatology',
    exp: '12+ Years Exp.',
    degree: 'MD (Dermatology, AIIMS), Fellow Aesthetic Medicine',
    hospital: 'Max Healthcare, Saket, New Delhi',
    img: 'https://images.unsplash.com/photo-1594824813571-24a698377cde?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    reviews: 460,
    fee: '₹700',
    originalFee: '₹1,300',
    nextSlot: 'Today, 03:00 PM',
    badges: ['AIIMS Gold Medalist', 'Laser & Hair Specialist'],
    highlights: ['12+ Years Clinical & Cosmetic Practice', 'Advanced PRP & Laser Therapy Lead', 'Acne & Anti-Aging Specialist']
  },
  {
    id: 8,
    name: 'Dr. Meenakshi Sundaram',
    title: 'Senior Obstetrician, Gynecologist & IVF Lead',
    spec: 'Gynecology',
    exp: '16+ Years Exp.',
    degree: 'MS (OBG), FRCOG (London), Fellowship in IVF',
    hospital: 'Cloudnine Specialty Hospital, Chennai',
    img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80',
    rating: 4.97,
    reviews: 580,
    fee: '₹850',
    originalFee: '₹1,600',
    nextSlot: 'Tomorrow, 11:15 AM',
    badges: ['High-Risk Pregnancy Lead', 'IVF Pioneer'],
    highlights: ['16+ Years in Women’s Health', 'Over 4,500 Deliveries & IVF Cycles', 'Certified Robotic Laparoscopy Surgeon']
  },
  {
    id: 9,
    name: 'Dr. Arvind Swaminathan',
    title: 'Senior Ophthalmologist & Refractive Laser Lead',
    spec: 'Ophthalmology',
    exp: '14+ Years Exp.',
    degree: 'MS (Ophthalmology), FICO (UK), Cornea Fellow',
    hospital: 'Sankara Nethralaya Eye Care, Chennai',
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
    rating: 4.93,
    reviews: 375,
    fee: '₹650',
    originalFee: '₹1,200',
    nextSlot: 'Today, 05:45 PM',
    badges: ['Blade-Free Lasik Expert', 'Cataract Specialist'],
    highlights: ['15,000+ Successful Lasik & Cataract Surgeries', 'Micro-Incision Phaco Pioneer', 'Glaucoma Management Lead']
  },
  {
    id: 10,
    name: 'Dr. Kavita Desai',
    title: 'Consultant Pulmonologist & Critical Care Specialist',
    spec: 'Pulmonology',
    exp: '13+ Years Exp.',
    degree: 'MD (Pulmonary Medicine), FCCP (USA)',
    hospital: 'Fortis Memorial Research Institute, Gurugram',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    rating: 4.91,
    reviews: 295,
    fee: '₹800',
    originalFee: '₹1,400',
    nextSlot: 'Tomorrow, 03:30 PM',
    badges: ['Asthma & Allergy Lead', 'Sleep Apnea Expert'],
    highlights: ['Advanced Bronchoscopy Director', 'Post-COVID Pulmonary Rehab Lead', 'Sleep Medicine Certification']
  },
  {
    id: 11,
    name: 'Dr. Alok Verma',
    title: 'Director of Nephrology & Renal Transplant',
    spec: 'Nephrology',
    exp: '17+ Years Exp.',
    degree: 'MD, DM (Nephrology, SGPGI)',
    hospital: 'Narayana Health City, Bengaluru',
    img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    reviews: 440,
    fee: '₹950',
    originalFee: '₹1,700',
    nextSlot: 'Wed, 09:30 AM',
    badges: ['Kidney Transplant Director', 'Dialysis Lead'],
    highlights: ['Over 800 Successful Renal Transplants', 'Diabetic Nephropathy & CKD Lead', 'National Nephrology Award']
  },
  {
    id: 12,
    name: 'Dr. Rohan Kapoor',
    title: 'Senior ENT & Head-Neck / Cochlear Implant Surgeon',
    spec: 'ENT',
    exp: '11+ Years Exp.',
    degree: 'MS (ENT), DNB, Fellowship in Cochlear Implant',
    hospital: 'Sir Ganga Ram Hospital, New Delhi',
    img: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    reviews: 320,
    fee: '₹750',
    originalFee: '₹1,350',
    nextSlot: 'Today, 02:30 PM',
    badges: ['Endoscopic Sinus Expert', 'Cochlear Implant Lead'],
    highlights: ['1,800+ Sinus & Micro-Ear Surgeries', 'Snoring & Voice Disorder Specialist', 'Skull Base Surgery Fellow']
  }
];

const SPECIALTY_TABS = [
  'All',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Gastroenterology',
  'Dermatology',
  'Gynecology',
  'Ophthalmology',
  'Pulmonology',
  'Nephrology',
  'ENT'
];

export default function HomeDoctorsCarousel() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const filteredDoctors = selectedSpecialty === 'All'
    ? DOCTORS
    : DOCTORS.filter((d) => d.spec === selectedSpecialty);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, filteredDoctors.length - itemsPerPage);

  // Reset slide index if filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSpecialty]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Auto scroll every 5 seconds if not hovered and more than itemsPerPage
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, maxIndex]);

  const handleBookDoctor = (doc) => {
    navigate(`/appointment?specialty=${encodeURIComponent(doc.spec)}&doctor=${encodeURIComponent(doc.name)}`);
  };

  return (
    <section
      id="doctors"
      className="scroll-mt-20 py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-medical-blue text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> 12+ Super Specialties
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Top Specialist Doctors
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl text-sm sm:text-base leading-relaxed">
              Consult with India’s leading senior consultants and surgical experts across super-specialty departments.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={prevSlide}
              disabled={maxIndex === 0}
              className={`p-3 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer ${
                maxIndex === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-medical-blue hover:text-white hover:border-medical-blue'
              }`}
              aria-label="Previous Doctors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={maxIndex === 0}
              className={`p-3 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer ${
                maxIndex === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-medical-blue hover:text-white hover:border-medical-blue'
              }`}
              aria-label="Next Doctors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              to="/doctors"
              className="ml-2 hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-medical-blue hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-4 py-3 rounded-full border border-blue-200/60 transition"
            >
              View All Doctors <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Specialty Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          {SPECIALTY_TABS.map((tab) => {
            const isSelected = selectedSpecialty === tab;
            const count = tab === 'All' ? DOCTORS.length : DOCTORS.filter((d) => d.spec === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedSpecialty(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-medical-blue text-white shadow-md shadow-blue-500/25 scale-102'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-medical-blue hover:text-medical-blue hover:bg-blue-50/30'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Doctors Carousel Track */}
        <div className="overflow-hidden">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 text-sm">No specialist doctors currently listed under this specialty.</p>
            </div>
          ) : (
            <motion.div
              className="flex gap-6"
              animate={{
                x: `calc(-${currentIndex * (100 / itemsPerPage)}% - ${currentIndex * (24 / itemsPerPage)}px)`
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            >
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex"
                >
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col w-full overflow-hidden group">
                    {/* Doctor Image & Badges */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <img
                        src={doc.img}
                        alt={doc.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_DOCTOR_IMG;
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Specialty Pill */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-white/40">
                          {doc.spec}
                        </span>
                      </div>

                      {/* Rating Pill */}
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-slate-700 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-300" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal text-[11px]">({doc.reviews})</span>
                      </div>

                      {/* Bottom overlay in image */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="font-bold text-lg leading-snug drop-shadow-md">{doc.name}</h3>
                        <p className="text-xs text-sky-200 truncate mt-0.5">{doc.degree}</p>
                      </div>
                    </div>

                    {/* Doctor Details Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Hospital Location */}
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-medical-blue shrink-0 mt-0.5" />
                          <span className="truncate">{doc.hospital}</span>
                        </div>

                        {/* Key highlights / experience */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-medical-blue rounded-md border border-blue-100">
                            {doc.exp}
                          </span>
                          {doc.badges.map((b) => (
                            <span
                              key={b}
                              className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                            >
                              {b}
                            </span>
                          ))}
                        </div>

                        {/* Next slot highlight */}
                        <div className="bg-emerald-50/70 border border-emerald-100/90 rounded-xl px-3 py-2 flex items-center justify-between text-xs mb-4">
                          <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Next Available Slot
                          </span>
                          <span className="font-bold text-emerald-700">{doc.nextSlot}</span>
                        </div>
                      </div>

                      {/* Pricing and Book Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">Consultation Fee</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-slate-900">{doc.fee}</span>
                            <span className="text-xs text-slate-400 line-through">{doc.originalFee}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDoctor(doc)}
                            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-medical-blue bg-slate-100 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                          >
                            View Bio
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookDoctor(doc)}
                            className="px-4 py-2 text-xs font-bold text-white bg-medical-blue hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                          >
                            Book Slot <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Carousel Indicator Dots */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex ? 'w-8 bg-medical-blue' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Doctor Bio Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedDoctor.img}
                  alt={selectedDoctor.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_DOCTOR_IMG;
                  }}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 shadow-md"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-medical-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {selectedDoctor.spec}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedDoctor.name}</h3>
                  <p className="text-xs text-slate-500">{selectedDoctor.degree}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-semibold text-slate-800 mb-2">Key Highlights & Expertise:</p>
                  <ul className="space-y-1.5">
                    {selectedDoctor.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Consultation Fee</span>
                    <span className="text-base font-black text-slate-900">{selectedDoctor.fee}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Hospital Branch</span>
                    <span className="font-semibold text-slate-800">{selectedDoctor.hospital}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="w-1/3 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const doc = selectedDoctor;
                    setSelectedDoctor(null);
                    handleBookDoctor(doc);
                  }}
                  className="w-2/3 py-3 bg-medical-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition"
                >
                  Confirm &amp; Book Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
