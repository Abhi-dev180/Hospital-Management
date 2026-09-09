import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Building2,
  Phone,
  User,
  PawPrint,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Droplet,
  TestTube,
  Activity,
  FileText,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import SlotSelector from '../../components/SlotSelector';
import AppointmentPaymentModal from '../../components/AppointmentPaymentModal';
import { TableSkeleton } from '../../components/Loader';

const CATEGORY_ICONS = {
  'Blood Test': Droplet,
  'Urine Test': TestTube,
  'Diagnostic Imaging': Activity,
  'Pathology & Biopsy': FileText,
  'Preventive Health Checkup': Stethoscope,
  'Microbiology & Culture': TestTube,
  'Cardiac & ECG': Activity
};

const CATEGORY_COLORS = {
  'Blood Test': 'bg-rose-50 text-rose-700 border-rose-200',
  'Urine Test': 'bg-amber-50 text-amber-700 border-amber-200',
  'Diagnostic Imaging': 'bg-blue-50 text-blue-700 border-blue-200',
  'Pathology & Biopsy': 'bg-purple-50 text-purple-700 border-purple-200',
  'Preventive Health Checkup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Microbiology & Culture': 'bg-teal-50 text-teal-700 border-teal-200',
  'Cardiac & ECG': 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const SPECIES_FILTERS = ['All Pets', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Horse'];

export default function UserServices() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('All Pets');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [search, setSearch] = useState('');

  // Booking Modal State
  const [bookingService, setBookingService] = useState(null);
  const [bookForm, setBookForm] = useState({
    hospitalId: '',
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    email: '',
    petName: '',
    species: 'Dog',
    sex: 'Male',
    breed: '',
    reason: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingDetails, setPaymentBookingDetails] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData && token) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setBookForm((prev) => ({
        ...prev,
        patientName: parsed.name || '',
        patientPhone: parsed.mobile || parsed.phone || '',
        email: parsed.email || ''
      }));
      loadServices();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const [resServices, resHospitals, resCats] = await Promise.all([
        fetch(`${API_URL}/api/services?activeOnly=true`),
        fetch(`${API_URL}/api/hospitals`),
        fetch(`${API_URL}/api/services/categories`)
      ]);

      const dataServices = await resServices.json();
      const dataHospitals = await resHospitals.json();
      const dataCats = await resCats.json();

      setServices(Array.isArray(dataServices) ? dataServices : []);
      setHospitals(Array.isArray(dataHospitals) ? dataHospitals : []);
      setCategories(Array.isArray(dataCats) ? dataCats : []);
    } catch {
      toast.error('Unable to load diagnostic services.');
    } finally {
      setLoading(false);
    }
  };

  // Open booking modal for a selected service
  const handleOpenBooking = (service) => {
    setBookingService(service);
    setBookingSuccess(null);

    // Filter hospitals offering this service
    const availableHospitals = hospitals.filter((h) => {
      if (!service.hospitalIds || service.hospitalIds.length === 0 || service.hospitalIds.includes('all')) return true;
      return service.hospitalIds.map(String).includes(String(h.id));
    });

    const defaultHospitalId = availableHospitals.length > 0 ? String(availableHospitals[0].id) : '';

    setBookForm((prev) => ({
      ...prev,
      hospitalId: defaultHospitalId,
      date: '',
      time: '',
      patientName: user?.name || '',
      patientPhone: user?.mobile || user?.phone || '',
      email: user?.email || '',
      species: (service.targetSpecies && service.targetSpecies.length > 0 && service.targetSpecies[0] !== 'All Animals')
        ? service.targetSpecies[0]
        : 'Dog',
      reason: `Test: ${service.name}`
    }));
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();

    if (!bookForm.hospitalId || !bookForm.date || !bookForm.time || !bookForm.patientName || !bookForm.patientPhone || !bookForm.petName) {
      return toast.error('Please fill all required booking fields');
    }

    if (!/^\d{10}$/.test(bookForm.patientPhone.trim())) {
      return toast.error('Mobile number must be exactly 10 digits');
    }

    const payload = {
      ...bookForm,
      appointmentType: 'Lab Test',
      serviceId: bookingService?.id,
      serviceName: bookingService?.name,
      serviceCategory: bookingService?.category,
      servicePrice: bookingService?.price || 500,
      sampleType: bookingService?.sampleType,
      fastingRequired: bookingService?.fastingRequired,
      fastingDetails: bookingService?.fastingDetails,
      turnaroundTime: bookingService?.turnaroundTime
    };

    const hospObj = hospitals.find((h) => String(h.id) === String(bookForm.hospitalId));

    setPendingPayload(payload);
    setPaymentBookingDetails({
      ...payload,
      hospitalName: hospObj ? hospObj.name : 'Selected Hospital',
      patientName: bookForm.patientName,
      patientPhone: bookForm.patientPhone,
      petName: bookForm.petName,
      serviceName: bookingService?.name || 'Lab Diagnostic Test',
      appointmentType: 'Lab Test',
      date: bookForm.date,
      time: bookForm.time,
      amount: bookingService?.price || 500,
      email: bookForm.email || user?.email || '',
      userId: user?.id || null
    });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    setShowPaymentModal(false);
    setBookingLoading(true);

    try {
      const token = localStorage.getItem('token');
      const finalPayload = {
        ...pendingPayload,
        paymentStatus: 'Paid',
        paymentId: paymentInfo.paymentId,
        paymentMethod: paymentInfo.paymentMethod,
        paymentAmount: paymentInfo.amount
      };

      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Lab test appointment booked & paid for ${bookForm.petName}! 🎉`);
        setBookingSuccess(data.appointment);
      } else {
        toast.error(data.message || 'Failed to book test appointment');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ─── Filtered Services ────────────────────────────────────────
  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchCat = selectedCategory === 'all' || (s.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const matchSpec =
        selectedSpecies === 'All Pets' ||
        !s.targetSpecies ||
        s.targetSpecies.includes('All Animals') ||
        s.targetSpecies.some((sp) => sp.toLowerCase() === selectedSpecies.toLowerCase());

      const matchHosp =
        selectedHospital === 'all' ||
        !s.hospitalIds ||
        s.hospitalIds.length === 0 ||
        s.hospitalIds.includes('all') ||
        s.hospitalIds.map(String).includes(String(selectedHospital));

      const matchSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.sampleType || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q);

      return matchCat && matchSpec && matchHosp && matchSearch;
    });
  }, [services, selectedCategory, selectedSpecies, selectedHospital, search]);

  return (
    <DashboardLayout
      title="Pet Lab & Diagnostic Services 🐾"
      subtitle="Book animal blood tests, urine analysis, digital X-rays, ultrasounds, and health panels at certified hospitals."
      user={user}
    >
      <DashboardTabs role="user" />

      {/* Hero Spotlight Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Veterinary Laboratories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Fast, Accurate Animal Diagnostics for Your Pet
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Book routine blood work, urine tests, organ profiles, and digital imaging. Samples are analyzed by accredited veterinary pathologists with same-day reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedCategory('Blood Test');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <Droplet className="w-4 h-4 text-rose-400" /> Blood Tests
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Urine Test');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <TestTube className="w-4 h-4 text-amber-400" /> Urine Tests
            </button>
            <Link
              to="/dashboard/my-appointments?tab=lab"
              className="px-5 py-2.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-extrabold shadow-lg transition inline-flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> My Test Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 space-y-4">
        {/* Search & Hospital Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests by name, sample type, or symptoms (e.g. CBC, Urinalysis, Kidney)..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white"
            >
              <option value="all">🏥 All Participating Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Diagnostic Tests ({services.length})
          </button>
          {categories.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] || Activity;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Species Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">For Pet:</span>
          {SPECIES_FILTERS.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSpecies(sp)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSpecies === sp
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <TestTube className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Matching Diagnostic Tests</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try resetting your search query or selecting a different category or animal filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSpecies('All Pets');
              setSelectedHospital('all');
              setSearch('');
            }}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => {
            const CatIcon = CATEGORY_ICONS[srv.category] || Activity;
            const catClass = CATEGORY_COLORS[srv.category] || 'bg-slate-100 text-slate-800 border-slate-200';

            // Calculate matching hospitals count
            const offeredHospitals = hospitals.filter((h) => {
              if (!srv.hospitalIds || srv.hospitalIds.length === 0 || srv.hospitalIds.includes('all')) return true;
              return srv.hospitalIds.map(String).includes(String(h.id));
            });

            return (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Category badge & Price */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catClass}`}>
                      <CatIcon className="w-3.5 h-3.5" />
                      {srv.category}
                    </span>
                    <span className="text-lg font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-2xl border border-slate-100">
                      ₹{srv.price || 0}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {srv.name}
                  </h3>

                  {/* Target Animals */}
                  <div className="flex flex-wrap items-center gap-1 mt-2 mb-3">
                    {(srv.targetSpecies || ['All Animals']).map((sp) => (
                      <span
                        key={sp}
                        className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full"
                      >
                        🐾 {sp}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {srv.description || 'Comprehensive laboratory diagnostics with professional analysis.'}
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400 font-medium">Sample Type:</span>
                      <span className="font-bold text-slate-800">{srv.sampleType || 'Sample Exam'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-400 font-medium">Report Delivery:</span>
                      <span className="font-bold text-blue-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {srv.turnaroundTime || 'Same Day'}
                      </span>
                    </div>

                    {srv.fastingRequired ? (
                      <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/80 text-[11px] font-semibold mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{srv.fastingDetails || 'Fasting required before test'}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No fasting needed
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {offeredHospitals.length} {offeredHospitals.length === 1 ? 'Hospital' : 'Hospitals'}
                  </span>

                  <button
                    onClick={() => handleOpenBooking(srv)}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Book Diagnostic Test Modal ──────────────────────────── */}
      <AnimatePresence>
        {bookingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => {
              if (!bookingLoading) setBookingService(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-slate-100"
            >
              {bookingSuccess ? (
                /* Success Confirmation View */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Test Appointment Confirmed! 🎉
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your test booking for <strong>{bookingService.name}</strong> has been scheduled at{' '}
                    <strong>{bookingSuccess.hospital}</strong>.
                  </p>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-md mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Appointment #:</span>
                      <span className="font-mono font-bold text-blue-600">#{bookingSuccess.appointment_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time:</span>
                      <span className="font-bold text-slate-800">{bookingSuccess.date} at {bookingSuccess.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pet Name:</span>
                      <span className="font-bold text-slate-800">{bookingSuccess.petName} ({bookingSuccess.species})</span>
                    </div>
                    {bookingService.fastingRequired && (
                      <div className="mt-2 pt-2 border-t border-amber-200 bg-amber-50 p-2 rounded-xl text-amber-900">
                        <strong>⚠️ Fasting Reminder:</strong> {bookingService.fastingDetails || 'Please fast pet before visit'}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => {
                        setBookingService(null);
                        setBookingSuccess(null);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Book Another Test
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/my-appointments?tab=lab')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                    >
                      View in My Appointments →
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <>
                  <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-1 border border-blue-100">
                        <span>🧪 Diagnostic Test Booking</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {bookingService.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Fee: <span className="font-bold text-slate-800">₹{bookingService.price}</span> • Turnaround:{' '}
                        <span className="font-bold text-blue-600">{bookingService.turnaroundTime}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setBookingService(null)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                    >
                      <XCircle size={22} />
                    </button>
                  </div>

                  {bookingService.fastingRequired && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Important Test Preparation:</p>
                        <p>{bookingService.fastingDetails || 'Please ensure pet is fasted prior to test collection.'}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleBookSubmit} className="space-y-4">
                    {/* Select Hospital */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Select Providing Hospital *
                      </label>
                      <select
                        value={bookForm.hospitalId}
                        onChange={(e) => setBookForm({ ...bookForm, hospitalId: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white"
                      >
                        <option value="">-- Choose Hospital --</option>
                        {hospitals
                          .filter((h) => {
                            if (!bookingService.hospitalIds || bookingService.hospitalIds.length === 0 || bookingService.hospitalIds.includes('all')) return true;
                            return bookingService.hospitalIds.map(String).includes(String(h.id));
                          })
                          .map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name} ({h.location})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Pet Details */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <PawPrint className="w-4 h-4 text-blue-600" /> Pet Information
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Pet Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Bruno, Bella"
                            value={bookForm.petName}
                            onChange={(e) => setBookForm({ ...bookForm, petName: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Species *</label>
                          <select
                            value={bookForm.species}
                            onChange={(e) => setBookForm({ ...bookForm, species: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white focus:border-blue-500 font-medium"
                          >
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="Horse">Horse</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Breed (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Golden Retriever"
                            value={bookForm.breed}
                            onChange={(e) => setBookForm({ ...bookForm, breed: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date & Time Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Test Date *
                        </label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={bookForm.date}
                          onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                          required
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Time Slot *
                        </label>
                        <input
                          type="time"
                          value={bookForm.time}
                          onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                          required
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Slot Selector Helper */}
                    {bookForm.date && bookForm.hospitalId && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <SlotSelector
                          date={bookForm.date}
                          hospitalId={bookForm.hospitalId}
                          selectedTime={bookForm.time}
                          onSelectTime={(slot) => setBookForm((f) => ({ ...f, time: slot }))}
                        />
                      </div>
                    )}

                    {/* Owner Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Owner / Contact Name *
                        </label>
                        <input
                          type="text"
                          value={bookForm.patientName}
                          onChange={(e) => setBookForm({ ...bookForm, patientName: e.target.value })}
                          required
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Phone (10 Digits) *
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          value={bookForm.patientPhone}
                          onChange={(e) => setBookForm({ ...bookForm, patientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          required
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Reason / Symptoms / Notes for Laboratory
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Routine checkup, loss of appetite, pre-surgery evaluation..."
                        value={bookForm.reason}
                        onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBookingService(null)}
                        disabled={bookingLoading}
                        className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 disabled:opacity-60 transition flex items-center gap-2 cursor-pointer"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Scheduling Test...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Confirm & Book Test (₹{bookingService.price})
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppointmentPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingDetails={paymentBookingDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </DashboardLayout>
  );
}
