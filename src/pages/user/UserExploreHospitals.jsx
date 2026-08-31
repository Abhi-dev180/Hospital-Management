import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Star,
  CalendarPlus,
  ExternalLink,
  X,
  Stethoscope,
  Sparkles,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import { ListSkeleton } from '../../components/Loader';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80'
];

export default function UserExploreHospitals() {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedHospitalModal, setSelectedHospitalModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHospitals(data);
      } else {
        toast.error('Failed to load hospitals');
      }
    } catch {
      toast.error('Network error loading hospitals');
    } finally {
      setLoading(false);
    }
  };

  // Derive unique cities
  const cities = useMemo(() => {
    const set = new Set();
    hospitals.forEach((h) => {
      if (h.location) {
        // Extract city from location string (e.g., "South Extension, New Delhi" -> "New Delhi")
        const parts = h.location.split(',').map((s) => s.trim());
        const city = parts[parts.length - 1] || parts[0];
        set.add(city);
      }
    });
    return ['All', ...Array.from(set)];
  }, [hospitals]);

  // Derive specialties
  const specialties = [
    'All',
    'Super Specialty',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Trauma & Emergency',
    'Pediatrics',
    'Oncology'
  ];

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        search === '' ||
        (h.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (h.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (h.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
        (h.careType || '').toLowerCase().includes(search.toLowerCase());

      const matchesCity =
        selectedCity === 'All' ||
        (h.location || '').toLowerCase().includes(selectedCity.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All' ||
        (h.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
        (h.careType || '').toLowerCase().includes(selectedSpecialty.toLowerCase());

      return matchesSearch && matchesCity && matchesSpecialty;
    });
  }, [hospitals, search, selectedCity, selectedSpecialty]);

  const handleBookAtHospital = (h) => {
    navigate('/dashboard/book-appointment', {
      state: {
        preselectedHospitalId: h.id,
        preselectedHospitalName: h.name
      }
    });
  };

  return (
    <DashboardLayout
      title="Explore Hospitals & Medical Centers"
      subtitle="Discover top accredited hospitals, browse departments, and book instant appointments."
      user={user}
    >
      <DashboardTabs role="user" />

      {/* Hero Search & Filter Panel */}
      <div className="bg-gradient-to-r from-medical-dark via-slate-900 to-medical-blue text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-medical-blue/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Healthcare Network • {hospitals.length} Centers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find the right hospital for your care
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 mb-6">
            Search multi-specialty hospitals, trauma centers, and advanced clinics. Book directly with real-time slot availability.
          </p>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital name, location, or specialty (e.g., Apollo, Delhi, Cardiology)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-400/30 text-sm sm:text-base font-medium placeholder-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mr-1">
            City:
          </span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCity === city
                  ? 'bg-teal-400 text-slate-950 shadow-md font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Specialty Filter Row */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Specialty:
          </span>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedSpecialty === spec
                  ? 'bg-medical-blue text-white border-medical-blue shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredHospitals.length}</span> hospitals
        </p>
      </div>

      {/* Hospitals Grid */}
      {loading ? (
        <ListSkeleton rows={4} />
      ) : filteredHospitals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Hospitals Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            We couldn't find any hospitals matching "{search || selectedCity || selectedSpecialty}". Try resetting your filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCity('All');
              setSelectedSpecialty('All');
            }}
            className="mt-4 px-4 py-2 bg-medical-blue text-white font-semibold text-xs rounded-xl shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((h, idx) => {
            const hospitalImg =
              h.imageUrl ||
              h.img ||
              FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all flex flex-col group"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={hospitalImg}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 shadow">
                      <ShieldCheck className="w-3 h-3" /> Accredited
                    </span>
                    <span className="bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Bed className="w-3 h-3 text-teal-300" /> {h.beds || '300+ Beds'}
                    </span>
                  </div>

                  {/* Bottom Image Overlay text */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1 text-xs text-teal-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{h.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-medical-blue transition-colors line-clamp-1">
                      {h.name}
                    </h3>

                    {/* Specialties & Tags */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-medical-blue border border-blue-100">
                        {h.specialty || h.careType || 'Multi-Specialty'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {h.emergency || '24/7 Emergency'}
                      </span>
                    </div>

                    {/* Info list */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      {h.timings && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{h.timings}</span>
                        </div>
                      )}
                      {h.contact && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{h.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedHospitalModal(h)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition inline-flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => handleBookAtHospital(h)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-medical-blue to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-medical-blue/20 transition inline-flex items-center justify-center gap-1.5"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> Book Appointment
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Hospital Quick Details Modal */}
      <AnimatePresence>
        {selectedHospitalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <div className="relative h-48 bg-slate-900">
                <img
                  src={
                    selectedHospitalModal.imageUrl ||
                    selectedHospitalModal.img ||
                    FALLBACK_IMAGES[0]
                  }
                  alt={selectedHospitalModal.name}
                  className="w-full h-full object-cover opacity-70"
                />
                <button
                  onClick={() => setSelectedHospitalModal(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-400 text-slate-950 mb-2 inline-block">
                    {selectedHospitalModal.careType || 'Super Specialty Center'}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight drop-shadow">
                    {selectedHospitalModal.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Location & Contact
                  </h4>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-medical-blue" />
                    {selectedHospitalModal.location}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    {selectedHospitalModal.contact || '+91 91225-56789'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Total Beds</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedHospitalModal.beds || '350+ Beds'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">ICU & Emergency</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {selectedHospitalModal.icu || '24/7 Level 1 ICU'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    OPD Timings
                  </h4>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {selectedHospitalModal.timings || 'Monday to Saturday • 8:00 AM - 8:00 PM'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Key Specialties & Services
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      selectedHospitalModal.specialty,
                      'Emergency Medicine',
                      'Diagnostic Imaging',
                      'Pharmacy 24/7',
                      'Intensive Care Unit',
                      'Surgical Center'
                    ]
                      .filter(Boolean)
                      .map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-xl border border-teal-100"
                        >
                          ✓ {item}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedHospitalModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const h = selectedHospitalModal;
                    setSelectedHospitalModal(null);
                    handleBookAtHospital(h);
                  }}
                  className="px-5 py-2.5 bg-medical-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-1.5"
                >
                  <CalendarPlus className="w-4 h-4" /> Book Appointment Here
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
