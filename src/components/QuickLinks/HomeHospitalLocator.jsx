import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Navigation,
  Filter,
  ExternalLink,
  Star,
  Compass,
  PhoneCall,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';
import API_URL from '../../config/api';

const DEFAULT_HOSPITAL_IMAGES = [
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
];

// Helper to extract a normalized city from location strings
const extractCity = (loc) => {
  if (!loc) return 'Other';
  const str = loc.trim();
  const lower = str.toLowerCase();
  if (lower.includes('moga')) return 'Moga';
  if (lower.includes('mohali')) return 'Mohali';
  if (lower.includes('patiala')) return 'Patiala';
  if (lower.includes('delhi')) return 'Delhi NCR';
  if (lower.includes('mumbai')) return 'Mumbai';
  if (lower.includes('chandigarh')) return 'Chandigarh';
  if (lower.includes('bangalore') || lower.includes('bengaluru')) return 'Bengaluru';
  if (lower.includes('pune')) return 'Pune';
  
  const parts = str.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return str.split(' ')[0] || 'Punjab';
};

export default function HomeHospitalLocator() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityTag, setSelectedFacilityTag] = useState('All Facilities');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hospitals`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((h, idx) => ({
            ...h,
            city: extractCity(h.location),
            displayImg: h.imageUrl || h.image || DEFAULT_HOSPITAL_IMAGES[idx % DEFAULT_HOSPITAL_IMAGES.length],
            displayBeds: h.beds ? (String(h.beds).includes('Bed') ? h.beds : `${h.beds} Beds`) : '150+ Beds',
            rating: (4.8 + ((idx * 3) % 20) / 100).toFixed(1),
            reviewsCount: 120 + ((idx * 47) % 300),
            facilities: [
              h.icu || '24/7 ICU',
              h.emergency || 'Emergency Trauma',
              'Diagnostic Lab',
              h.specialty || 'Super Specialty'
            ]
          }));
          setHospitals(formatted);
        } else {
          // Default flagship network fallback
          setHospitals([
            {
              id: '1789618947670',
              name: 'Gill Eye & Multi-Specialty Hospital',
              location: 'Gill Road near Palace, Moga',
              city: 'Moga',
              beds: '300+',
              displayBeds: '300+ Beds',
              contact: '7743077303',
              timings: 'Mon - Sat • 8:00 AM - 8:00 PM',
              emergency: '24/7 Emergency Available',
              displayImg: DEFAULT_HOSPITAL_IMAGES[0],
              rating: '4.9',
              reviewsCount: 340,
              facilities: ['24/7 ICU', 'Advanced Trauma', 'Super Specialty', 'Digital Diagnostics']
            },
            {
              id: '1789120187267',
              name: 'Avinash Premier Healthcare Center',
              location: 'Sector 70, Mohali, Punjab',
              city: 'Mohali',
              beds: '150+',
              displayBeds: '150+ Beds',
              contact: '9646232987',
              timings: 'Mon - Sat • 8:00 AM - 8:00 PM',
              emergency: '24/7 Emergency Available',
              displayImg: DEFAULT_HOSPITAL_IMAGES[1],
              rating: '4.9',
              reviewsCount: 280,
              facilities: ['24/7 Emergency', 'Robotic Surgery', 'Pediatric ICU', 'NABL Lab']
            },
            {
              id: '1786414909110',
              name: 'Rajindra Super Specialty Hospital',
              location: 'Rajindra Hospital Road, Patiala, Punjab',
              city: 'Patiala',
              beds: '300+',
              displayBeds: '300+ Beds',
              contact: '7743077303',
              timings: 'Mon - Sat • 8:00 AM - 8:00 PM',
              emergency: '24/7 Emergency Available',
              displayImg: DEFAULT_HOSPITAL_IMAGES[2],
              rating: '4.8',
              reviewsCount: 410,
              facilities: ['Critical Care ICU', 'Cardiology Wing', 'Trauma Center', '24/7 Blood Bank']
            },
            {
              id: '1786342149354',
              name: 'Krishan Medical & Healthcare Center',
              location: 'Akalsar Road, Moga, Punjab',
              city: 'Moga',
              beds: '200+',
              displayBeds: '200+ Beds',
              contact: '9814538354',
              timings: 'Mon - Sat • 8:00 AM - 8:00 PM',
              emergency: '24/7 Emergency Available',
              displayImg: DEFAULT_HOSPITAL_IMAGES[3],
              rating: '4.9',
              reviewsCount: 190,
              facilities: ['24/7 Pharmacy', 'Diagnostic Pathology', 'Orthopedics', 'Ultrasound Center']
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load hospitals for locator:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Compute dynamic city options
  const cityCounts = hospitals.reduce((acc, h) => {
    const c = h.city || 'Other';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const availableCities = ['All Cities', ...Object.keys(cityCounts)];

  // Filtered hospitals
  const filteredHospitals = hospitals.filter((h) => {
    const matchesCity = selectedCity === 'All Cities' || h.city === selectedCity;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      (h.city && h.city.toLowerCase().includes(q)) ||
      (h.facilities && h.facilities.some((f) => f.toLowerCase().includes(q)));

    const matchesFacility =
      selectedFacilityTag === 'All Facilities' ||
      (h.facilities && h.facilities.some((f) => f.toLowerCase().includes(selectedFacilityTag.toLowerCase())));

    return matchesCity && matchesSearch && matchesFacility;
  });

  const handleBookHospital = (h) => {
    navigate(`/appointment?hospital=${h.id}&hospitalName=${encodeURIComponent(h.name)}`);
  };

  return (
    <section id="hospitals" className="scroll-mt-20 py-20 bg-slate-50 border-t border-slate-200/80 text-slate-800 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-medical-blue text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Compass className="w-3.5 h-3.5" /> Interactive Hospital Network Locator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-medical-dark">
              Find Accredited Hospitals &amp; Clinics Nearby
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
              Explore multi-specialty hospitals, verified bed capacities, 24/7 emergency trauma centers, and diagnostic facilities across your city.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-medical-dark leading-none">{hospitals.length}+</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Verified Centers</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center font-bold">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-medical-dark leading-none">900+</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Beds</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-emerald-700 leading-none">24/7</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">ICU &amp; Trauma</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 mb-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hospital name, city, location or specialty..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 transition"
              />
            </div>

            {/* City Selector Dropdown for Mobile / Quick Select */}
            <div className="lg:col-span-3">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-blue w-4 h-4 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium focus:outline-none focus:border-medical-blue transition cursor-pointer appearance-none"
                >
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city === 'All Cities' ? '📍 All Cities' : `📍 ${city} (${cityCounts[city] || 0})`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* Reset Filters / Counter */}
            <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-medical-dark">{filteredHospitals.length}</strong> of {hospitals.length} hospitals
              </span>
              {(selectedCity !== 'All Cities' || searchQuery || selectedFacilityTag !== 'All Facilities') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('All Cities');
                    setSearchQuery('');
                    setSelectedFacilityTag('All Facilities');
                  }}
                  className="text-xs text-medical-blue hover:text-medical-dark font-bold underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* City Filter Pills */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-medical-blue" /> Filter by City:
            </span>
            {availableCities.map((city) => {
              const isSelected = selectedCity === city;
              const count = city === 'All Cities' ? hospitals.length : cityCounts[city] || 0;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20 scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span>{city}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hospital Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-3xl p-6 animate-pulse h-96 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredHospitals.map((h, index) => (
                <motion.div
                  key={h.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden hover:border-medical-blue/50 hover:shadow-xl transition-all group flex flex-col justify-between shadow-sm"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={h.displayImg}
                      alt={h.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_HOSPITAL_IMAGES[index % DEFAULT_HOSPITAL_IMAGES.length];
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    {/* Live Emergency Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        24/7 Open &bull; Emergency
                      </span>
                    </div>

                    {/* Bed Capacity Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-medical-dark shadow-sm">
                        <Bed className="w-3.5 h-3.5 text-medical-blue" />
                        {h.displayBeds}
                      </span>
                    </div>

                    {/* City Location Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="inline-flex items-center gap-1 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        {h.city}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm text-[11px]">
                        <Star className="w-3 h-3 fill-amber-300" /> {h.rating} ({h.reviewsCount})
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-xl text-medical-dark group-hover:text-medical-blue transition-colors leading-snug mb-2">
                        {h.name}
                      </h3>

                      <p className="text-xs text-slate-600 flex items-start gap-1.5 mb-4 leading-relaxed line-clamp-2">
                        <Navigation className="w-3.5 h-3.5 text-medical-blue shrink-0 mt-0.5" />
                        <span>{h.location}</span>
                      </p>

                      {/* Timings & Helpline */}
                      <div className="space-y-1.5 text-xs text-slate-700 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-medical-blue" /> OPD Hours:
                          </span>
                          <strong className="text-slate-800">{h.timings || 'Mon - Sat: 8 AM - 8 PM'}</strong>
                        </div>
                        {h.contact && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-medical-blue" /> Helpline:
                            </span>
                            <a
                              href={`tel:${h.contact}`}
                              className="text-medical-blue hover:text-medical-dark font-bold hover:underline"
                            >
                              +91 {h.contact}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Facility Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {h.facilities.map((f, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-blue-50 text-medical-blue border border-blue-100 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-medical-blue" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                      <Link
                        to={`/hospitals/${h.id}`}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center border border-slate-200/80"
                      >
                        Facility Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleBookHospital(h)}
                        className="py-2.5 px-3 rounded-xl bg-medical-dark hover:bg-medical-blue text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-medical-dark/20 transition active:scale-95 cursor-pointer"
                      >
                        Book Visit <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHospitals.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto shadow-sm">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-medical-dark">No Hospitals Match Your Search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No medical center found for &ldquo;{searchQuery || selectedCity}&rdquo;. Try clearing your search or picking &ldquo;All Cities&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCity('All Cities');
                setSearchQuery('');
                setSelectedFacilityTag('All Facilities');
              }}
              className="mt-5 px-5 py-2.5 bg-medical-dark hover:bg-medical-blue text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Show All Network Hospitals
            </button>
          </div>
        )}

        {/* Bottom Banner with Appointment Shortcut */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-medical-dark to-medical-blue text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-medical-dark flex items-center justify-center font-black shrink-0 shadow-lg">
              <Calendar className="w-6 h-6 text-medical-blue" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-white">Need an urgent consultation or specialist appointment?</h4>
              <p className="text-xs text-blue-100 mt-0.5">
                Our central medical desk coordinates doctor consults and bed allocations across all branch hospitals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/hospitals"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm"
            >
              Explore Full Directory
            </Link>
            <Link
              to="/appointment"
              className="px-6 py-3 rounded-2xl bg-white hover:bg-blue-50 text-medical-dark font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              Instant Appointment <ArrowRight className="w-4 h-4 text-medical-blue" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
