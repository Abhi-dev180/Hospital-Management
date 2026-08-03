import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

export default function AdminManageHospitals() {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    beds: '',
    contact: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate('/');
      } else {
        setUser(parsedUser);
        loadHospitals();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadHospitals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(data);
      setFilteredHospitals(data);
    } catch (err) {
      toast.error('Unable to load hospitals.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      icu: '24/7 ICU',
      careType: 'Advanced Care',
      specialty: 'Super Specialty',
      beds: '300+',
      contact: '+91 91225-56789',
      videoUrl: '',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    });
    setEditingHospital(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const query = value.toLowerCase();
    setFilteredHospitals(
      hospitals.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(query) ||
          hospital.location.toLowerCase().includes(query)
      )
    );
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name || '',
      location: hospital.location || '',
      icu: hospital.icu || '24/7 ICU',
      careType: hospital.careType || 'Advanced Care',
      specialty: hospital.specialty || 'Super Specialty',
      beds: hospital.beds || '300+',
      contact: hospital.contact || '+91 91225-56789',
      videoUrl: hospital.videoUrl || '',
      adminName: '',
      adminEmail: hospital.email || '',
      adminPassword: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/hospitals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Unable to delete hospital');
      }
      const updated = hospitals.filter((h) => h.id !== id);
      setHospitals(updated);
      setFilteredHospitals(
        updated.filter(
          (hospital) =>
            hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      toast.success('Hospital deleted successfully');
    } catch (err) {
      toast.error('Unable to delete hospital.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      return toast.error('Name and location are required');
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingHospital ? 'PUT' : 'POST';
      const endpoint = editingHospital
        ? `${API_URL}/api/hospitals/${editingHospital.id}`
        : `${API_URL}/api/hospitals`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Unable to save hospital');
      }

      await loadHospitals();
      resetForm();
      setShowForm(false);
      toast.success(data.message || 'Hospital saved successfully');
    } catch (err) {
      toast.error('Unable to save hospital.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark">Manage Hospitals</h2>
          <p className="text-gray-500 mt-1">
            Add, update, and remove hospitals that users can book appointments with.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search hospitals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue focus:border-medical-blue outline-none"
            />
          </div>
          <button
            onClick={loadHospitals}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold px-5 py-2 rounded-full transition-shadow shadow-sm"
          >
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add Hospital'}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue bg-white"
                placeholder="Medpark Hospital Mohali"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue bg-white"
                placeholder="Phase 8, Mohali"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bed Capacity</label>
              <input
                type="text"
                name="beds"
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue bg-white"
                placeholder="500+"
              />
            </div>
          </div>

          {!editingHospital && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-bold text-medical-dark uppercase tracking-wider mb-2">
                Mandatory: Set Hospital Admin Login Credentials
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    placeholder="Dr. Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Login Email *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required={!editingHospital}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    placeholder="admin.mohali@medpark.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Login Password *</label>
                  <input
                    type="text"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required={!editingHospital}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    placeholder="Set Admin Password (e.g. 123456)"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-medical-blue hover:bg-medical-dark text-white font-bold py-2.5 px-6 rounded-md transition-colors text-sm cursor-pointer shadow-md"
            >
              {editingHospital ? 'Update Hospital' : 'Save Hospital & Admin Credentials'}
            </button>
          </div>
        </motion.form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-medical-blue/10 text-medical-dark">
              <th className="py-3 px-4 font-semibold rounded-tl-lg">Name</th>
              <th className="py-3 px-4 font-semibold">Location</th>
              <th className="py-3 px-4 font-semibold">Beds</th>
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHospitals.map((hospital) => (
              <motion.tr
                key={hospital.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <td className="py-4 px-4 font-medium text-medical-dark">{hospital.name}</td>
                <td className="py-4 px-4 text-gray-600">{hospital.location}</td>
                <td className="py-4 px-4 text-gray-600">{hospital.beds}</td>
                <td className="py-4 px-4 text-gray-600">{hospital.contact}</td>
                <td className="py-4 px-4 text-right flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
                  <button
                    onClick={() => handleEdit(hospital)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hospital.id)}
                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </motion.tr>
            ))}
            {filteredHospitals.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 italic">
                  No hospitals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
