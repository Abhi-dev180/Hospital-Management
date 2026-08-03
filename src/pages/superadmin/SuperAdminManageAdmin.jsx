import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Edit3, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import { TableSkeleton } from '../../components/Loader';

export default function SuperAdminManageAdmin() {
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', hospital: '' });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(parsedUser);
        fetchAdmins();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(data);
        setFilteredAdmins(data);
      } else {
        toast.error(data.message || 'Failed to load admins');
      }
    } catch (err) {
      toast.error('Unable to load admins.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', hospital: '' });
    setEditingAdmin(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const query = value.toLowerCase();
    setFilteredAdmins(admins.filter((admin) =>
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.hospital || '').toLowerCase().includes(query)
    ));
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, hospital: admin.hospital || '' });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Unable to delete admin');
      }
      const updatedAdmins = admins.filter((a) => a.id !== id);
      setAdmins(updatedAdmins);
      setFilteredAdmins(updatedAdmins.filter((admin) =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Admin deleted successfully');
    } catch (err) {
      toast.error('Unable to delete admin. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error('Please fill required fields');

    try {
      const token = localStorage.getItem('token');
      let res;
      let data;
      if (editingAdmin) {
        res = await fetch(`${API_URL}/api/auth/admins/${editingAdmin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch(`${API_URL}/api/auth/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Unable to save admin');
      }
      const updatedAdmins = editingAdmin ? admins.map((a) => (a.id === editingAdmin.id ? data : a)) : [...admins, data];
      setAdmins(updatedAdmins);
      setFilteredAdmins(updatedAdmins.filter((admin) =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
      ));
      resetForm();
      setShowAddForm(false);
      toast.success(editingAdmin ? 'Admin updated successfully' : 'Admin added successfully');
    } catch (err) {
      toast.error(editingAdmin ? 'Unable to update admin. Please try again.' : 'Unable to add admin. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Super Admin Dashboard" subtitle="System-wide overview and management." user={user} showHeader={false}>
      <DashboardTabs role="superadmin" />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-medical-dark">Manage Admins</h2>
            <p className="text-sm text-gray-500">Add, edit, and remove hospital admins quickly.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search admins..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue focus:border-medical-blue outline-none"
              />
            </div>
            <button
              type="button"
              onClick={fetchAdmins}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={() => {
                if (showAddForm) resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold py-2 px-5 rounded-full transition-colors shadow-sm"
            >
              <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Admin'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue"
                placeholder="Jane Doe"
              />
            </div>
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue"
                placeholder="jane@hospital.com"
              />
            </div>
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Hospital</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-medical-blue"
                placeholder="Medpark West"
              />
            </div>
            <div className="md:col-span-1 lg:col-span-1">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                {editingAdmin ? 'Update Admin' : 'Save Admin'}
              </button>
            </div>
          </form>
        )}

        {isLoading ? <TableSkeleton rows={5} cols={4} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-medical-blue/10 text-medical-dark">
                <th className="py-3 px-4 font-semibold rounded-tl-lg">Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Hospital</th>
                <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <motion.tr
                  key={admin.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <td className="py-4 px-4 font-medium text-medical-dark">{admin.name}</td>
                  <td className="py-4 px-4 text-gray-600">{admin.email}</td>
                  <td className="py-4 px-4 text-gray-600">{admin.hospital || 'Unassigned'}</td>
                  <td className="py-4 px-4 text-right flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
                    <button onClick={() => handleEdit(admin)} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                      <Edit3 size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(admin.id)} className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-medium">
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 italic">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
