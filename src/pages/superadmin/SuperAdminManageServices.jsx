import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  Loader2,
  Activity,
  Droplet,
  TestTube,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
  Eye,
  ShieldCheck,
  Check,
  Tag,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import { TableSkeleton } from '../../components/Loader';

const ITEMS_PER_PAGE = 6;

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

const SPECIES_LIST = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Horse', 'All Animals'];
const SAMPLE_TYPES = ['Blood Sample', 'Urine Sample', 'Stool Sample', 'Tissue / Swab', 'X-Ray / Scan', 'Ultrasound Scan', 'Physical Examination'];

const initialFormData = {
  name: '',
  category: 'Blood Test',
  description: '',
  price: '',
  currency: 'INR',
  duration: '30 mins',
  turnaroundTime: 'Same Day (2-4 Hours)',
  sampleType: 'Blood Sample',
  fastingRequired: false,
  fastingDetails: '',
  targetSpecies: ['Dog', 'Cat', 'All Animals'],
  hospitalIds: [],
  isActive: true,
  imageUrl: ''
};

export default function SuperAdminManageServices() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const navigate = useNavigate();

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(parsed);
        loadData();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resServices, resHospitals, resCats] = await Promise.all([
        fetch(`${API_URL}/api/services`),
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

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      ...initialFormData,
      hospitalIds: hospitals.map((h) => String(h.id)) // Default: all hospitals selected
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      category: service.category || 'Blood Test',
      description: service.description || '',
      price: service.price !== undefined ? String(service.price) : '',
      currency: service.currency || 'INR',
      duration: service.duration || '30 mins',
      turnaroundTime: service.turnaroundTime || 'Same Day (2-4 Hours)',
      sampleType: service.sampleType || 'Blood Sample',
      fastingRequired: Boolean(service.fastingRequired),
      fastingDetails: service.fastingDetails || '',
      targetSpecies: Array.isArray(service.targetSpecies) ? service.targetSpecies : ['All Animals'],
      hospitalIds: Array.isArray(service.hospitalIds)
        ? (service.hospitalIds.includes('all') ? hospitals.map(h => String(h.id)) : service.hospitalIds.map(String))
        : [],
      isActive: service.isActive !== false,
      imageUrl: service.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleToggleSpecies = (spec) => {
    setFormData((prev) => {
      const current = prev.targetSpecies || [];
      if (spec === 'All Animals') {
        return {
          ...prev,
          targetSpecies: current.includes('All Animals') ? ['Dog', 'Cat'] : ['All Animals']
        };
      }
      const filtered = current.filter((s) => s !== 'All Animals');
      if (filtered.includes(spec)) {
        const next = filtered.filter((s) => s !== spec);
        return { ...prev, targetSpecies: next.length ? next : ['Dog'] };
      }
      return { ...prev, targetSpecies: [...filtered, spec] };
    });
  };

  const handleToggleHospital = (hospitalId) => {
    setFormData((prev) => {
      const current = prev.hospitalIds || [];
      const strId = String(hospitalId);
      if (current.includes(strId)) {
        return { ...prev, hospitalIds: current.filter((id) => id !== strId) };
      }
      return { ...prev, hospitalIds: [...current, strId] };
    });
  };

  const handleSelectAllHospitals = () => {
    if (formData.hospitalIds.length === hospitals.length) {
      setFormData((prev) => ({ ...prev, hospitalIds: [] }));
    } else {
      setFormData((prev) => ({ ...prev, hospitalIds: hospitals.map((h) => String(h.id)) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Service / Test name is required');
    if (!formData.category.trim()) return toast.error('Category is required');

    setSaving(true);
    try {
      const endpoint = editingService
        ? `${API_URL}/api/services/${editingService.id}`
        : `${API_URL}/api/services`;
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Failed to save diagnostic service');
      }

      toast.success(data.message || 'Diagnostic service saved successfully');
      setShowModal(false);
      loadData();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not delete service');

      toast.success('Service deleted successfully');
      setServices((prev) => prev.filter((s) => String(s.id) !== String(id)));
    } catch {
      toast.error('Network error. Failed to delete service.');
    }
  };

  const handleToggleActive = async (service) => {
    const nextStatus = !service.isActive;
    try {
      const res = await fetch(`${API_URL}/api/services/${service.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ isActive: nextStatus })
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: nextStatus } : s))
        );
        toast.success(`Service is now ${nextStatus ? 'Active' : 'Inactive'}`);
      }
    } catch {
      toast.error('Could not update status');
    }
  };

  // ─── Filter & Search Logic ────────────────────────────────────
  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchCat = categoryFilter === 'all' || (s.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const matchHosp =
        hospitalFilter === 'all' ||
        !s.hospitalIds ||
        s.hospitalIds.length === 0 ||
        s.hospitalIds.includes('all') ||
        s.hospitalIds.map(String).includes(String(hospitalFilter));

      const matchSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.sampleType || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q);

      return matchCat && matchHosp && matchSearch;
    });
  }, [services, search, categoryFilter, hospitalFilter]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, hospitalFilter]);

  // Quick stats
  const activeCount = services.filter((s) => s.isActive !== false).length;
  const bloodCount = services.filter((s) => s.category === 'Blood Test').length;
  const urineCount = services.filter((s) => s.category === 'Urine Test').length;

  return (
    <DashboardLayout
      title="Diagnostic & Test Services"
      subtitle="Configure laboratory tests and animal diagnostics offered across hospitals."
      user={user}
      showHeader={false}
    >
      <DashboardTabs role="superadmin" />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Services</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{services.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Services</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Blood Tests</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{bloodCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <TestTube className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Urine & Labs</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{urineCount}</p>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Animal Lab & Diagnostic Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Add new medical tests (Blood, Urine, Imaging, Organ Profiles) and select which hospitals offer them.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              <Plus size={18} /> Add Diagnostic Service
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition text-slate-600 disabled:opacity-50"
              title="Refresh Services"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests, sample type, disease..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white"
            >
              <option value="all">All Test Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="mb-4 text-xs font-semibold text-slate-500">
          Showing {paginatedServices.length} of {filteredServices.length} tests
          {search && ` (filtered from ${services.length} total)`}
        </div>

        {/* Services Table */}
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl">
            <TestTube className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Diagnostic Services Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first animal diagnostic service using the "Add Diagnostic Service" button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[950px] text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Test & Service Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Sample / Fasting</th>
                  <th className="py-3.5 px-4">Turnaround</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Offered By</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedServices.map((srv) => {
                  const CatIcon = CATEGORY_ICONS[srv.category] || Activity;
                  const catClass = CATEGORY_COLORS[srv.category] || 'bg-slate-100 text-slate-800 border-slate-200';
                  const hospCount = (srv.hospitalIds && srv.hospitalIds.length > 0)
                    ? (srv.hospitalIds.includes('all') ? hospitals.length : srv.hospitalIds.length)
                    : hospitals.length;

                  return (
                    <motion.tr
                      key={srv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name & Species */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{srv.name}</span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {(srv.targetSpecies || ['All Animals']).map((sp) => (
                              <span
                                key={sp}
                                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                              >
                                {sp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catClass}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                          {srv.category}
                        </span>
                      </td>

                      {/* Sample & Fasting */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-xs">
                          <p className="font-medium text-slate-700">{srv.sampleType || 'Sample Exam'}</p>
                          {srv.fastingRequired ? (
                            <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                              ⚡ Fasting Required
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px]">
                              No Fasting
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Turnaround */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{srv.turnaroundTime || 'Same Day'}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₹{srv.price || 0}
                        </span>
                      </td>

                      {/* Hospitals Offering */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50/70 px-2.5 py-1 rounded-xl w-fit">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{hospCount} {hospCount === 1 ? 'Hospital' : 'Hospitals'}</span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(srv)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                            srv.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {srv.isActive !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(srv)}
                            className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-600 hover:text-blue-800 font-semibold transition inline-flex items-center gap-1"
                            title="Edit Service"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(srv.id, srv.name)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-700 font-semibold transition"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {editingService ? 'Edit Diagnostic Service' : 'Add New Diagnostic Service'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define test parameters, sample guidelines, pricing, and hospital availability.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Test Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Test / Service Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC) Panel, Urinalysis, Digital X-Ray"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Other Diagnostic Test</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Price (INR ₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 850"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  {/* Sample Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sample / Test Procedure
                    </label>
                    <select
                      value={formData.sampleType}
                      onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition bg-white"
                    >
                      {SAMPLE_TYPES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Turnaround Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Report Delivery Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Same Day (2-4 Hours), 24 Hours"
                      value={formData.turnaroundTime}
                      onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                {/* Target Animals / Species Multi-Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Target Animals / Species
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIES_LIST.map((spec) => {
                      const isSelected = (formData.targetSpecies || []).includes(spec);
                      return (
                        <button
                          type="button"
                          key={spec}
                          onClick={() => handleToggleSpecies(spec)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && '✓ '} {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fasting Toggle & Details */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Fasting Required Before Test?
                      </p>
                      <p className="text-xs text-slate-500">
                        Instruct pet owners to withhold food prior to blood or ultrasound exams.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.fastingRequired}
                        onChange={(e) => setFormData({ ...formData, fastingRequired: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {formData.fastingRequired && (
                    <input
                      type="text"
                      placeholder="e.g. 8-12 hours fasting required before test. Water is allowed."
                      value={formData.fastingDetails}
                      onChange={(e) => setFormData({ ...formData, fastingDetails: e.target.value })}
                      className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-xs outline-none bg-white focus:border-amber-500"
                    />
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Description / What it detects
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly explain what parameters this test examines and how it helps the pet..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition resize-none"
                  />
                </div>

                {/* Hospital Provisioning / Assignment */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Assign Hospitals Offering This Service
                      </p>
                      <p className="text-xs text-blue-700/80">
                        Selected hospitals will have this test listed in user bookings and receive appointments.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAllHospitals}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-2xs"
                    >
                      {formData.hospitalIds.length === hospitals.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pt-1">
                    {hospitals.map((h) => {
                      const isChecked = formData.hospitalIds.includes(String(h.id));
                      return (
                        <label
                          key={h.id}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium cursor-pointer transition border ${
                            isChecked
                              ? 'bg-blue-600/10 border-blue-300 text-blue-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleHospital(h.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="truncate">{h.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 disabled:opacity-60 transition"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
