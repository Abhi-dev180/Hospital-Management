// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, Plus, Edit3, Trash2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';
// import AddressAutocomplete from '../../components/AddressAutocomplete';

// export default function SuperAdminManageHospitals() {
//   const [user, setUser] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [filteredHospitals, setFilteredHospitals] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showForm, setShowForm] = useState(false);
//   const [editingHospital, setEditingHospital] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     location: '',
//     icu: '24/7 ICU',
//     careType: 'Advanced Care',
//     specialty: 'Super Specialty',
//     beds: '300+',
//     contact: '+91 91225-56789',
//     videoUrl: '',
//     imageUrl: '',
//     adminName: '',
//     adminEmail: '',
//     adminPassword: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [registrations, setRegistrations] = useState([]);
//   const [matchedReg, setMatchedReg] = useState(null); // registration the form was autofilled from
//   const navigate = useNavigate();

//   const authHeaders = () => ({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${localStorage.getItem('token')}`
//   });

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       if (parsedUser.role !== 'superadmin') {
//         navigate('/');
//       } else {
//         setUser(parsedUser);
//         loadHospitals();
//         loadRegistrations();
//       }
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const loadHospitals = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/hospitals`);
//       const data = await res.json();
//       setHospitals(data);
//       setFilteredHospitals(data);
//     } catch (err) {
//       toast.error('Unable to load hospitals.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Registrations power the "type a hospital name → autofill from DB" behaviour.
//   const loadRegistrations = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/registrations`, { headers: authHeaders() });
//       const data = await res.json();
//       if (res.ok) setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
//     } catch { /* non-blocking */ }
//   };

//   // Fill the form from a registration record (used by both the dropdown and name-match).
//   const applyRegistration = (reg) => {
//     setMatchedReg(reg);
//     setFormData((f) => ({
//       ...f,
//       name: reg.hospitalName || f.name,
//       location: reg.address || reg.city || f.location,
//       beds: reg.beds ? String(reg.beds) : f.beds,
//       contact: reg.phone || f.contact
//     }));
//     // The admin login is created from the registration when it's approved (with the
//     // registrant's own password); we just link the hospital via auto-assign on save.
//   };

//   // Prefill dropdown: pick a registration by id.
//   const handlePrefill = (regId) => {
//     const reg = registrations.find((r) => String(r.id) === String(regId));
//     if (reg) applyRegistration(reg);
//     else { setMatchedReg(null); }
//   };

//   // When the typed hospital name matches a registration, pull the rest from the DB.
//   const handleNameChange = (value) => {
//     setFormData((f) => ({ ...f, name: value }));
//     const match = registrations.find(
//       (r) => (r.hospitalName || '').trim().toLowerCase() === value.trim().toLowerCase()
//     );
//     if (match) applyRegistration(match);
//     else setMatchedReg(null);
//   };

//   const resetForm = () => {
//     setMatchedReg(null);
//     setFormData({
//       name: '',
//       location: '',
//       icu: '24/7 ICU',
//       careType: 'Advanced Care',
//       specialty: 'Super Specialty',
//       beds: '300+',
//       contact: '+91 91225-56789',
//       videoUrl: '',
//       imageUrl: '',
//       adminName: '',
//       adminEmail: '',
//       adminPassword: ''
//     });
//     setEditingHospital(null);
//   };

//   const [saving, setSaving] = useState(false);

//   // Upload a hospital image to Supabase Storage and keep the returned URL in the form.
//   const [uploading, setUploading] = useState(false);
//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setUploading(true);
//     try {
//       const body = new FormData();
//       body.append('image', file);
//       const res = await fetch(`${API_URL}/api/uploads`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         body
//       });
//       const data = await res.json();
//       if (!res.ok) return toast.error(data.message || 'Upload failed');
//       setFormData((f) => ({ ...f, imageUrl: data.url }));
//       toast.success('Image uploaded');
//     } catch {
//       toast.error('Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     const query = value.toLowerCase();
//     setFilteredHospitals(hospitals.filter((hospital) =>
//       hospital.name.toLowerCase().includes(query) ||
//       hospital.location.toLowerCase().includes(query)
//     ));
//   };

//   const handleEdit = (hospital) => {
//     setEditingHospital(hospital);
//     setFormData({
//       name: hospital.name || '',
//       location: hospital.location || '',
//       icu: hospital.icu || '24/7 ICU',
//       careType: hospital.careType || 'Advanced Care',
//       specialty: hospital.specialty || 'Super Specialty',
//       beds: hospital.beds || '300+',
//       contact: hospital.contact || '+91 91225-56789',
//       videoUrl: hospital.videoUrl || '',
//       imageUrl: hospital.imageUrl || '',
//       adminName: hospital.adminName || `${hospital.name} Admin`,
//       adminEmail: hospital.email || '',
//       adminPassword: ''
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/hospitals/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         return toast.error(data.message || 'Unable to delete hospital');
//       }
//       const updated = hospitals.filter((h) => h.id !== id);
//       setHospitals(updated);
//       setFilteredHospitals(updated.filter((hospital) =>
//         hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
//       ));
//       toast.success('Hospital deleted successfully');
//     } catch (err) {
//       toast.error('Unable to delete hospital.');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.name || !formData.location) return toast.error('Name and location are required');

//     setSaving(true);
//     try {
//       const token = localStorage.getItem('token');
//       const method = editingHospital ? 'PUT' : 'POST';
//       const endpoint = editingHospital ? `${API_URL}/api/hospitals/${editingHospital.id}` : `${API_URL}/api/hospitals`;
//       const res = await fetch(endpoint, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         return toast.error(data.message || 'Unable to save hospital');
//       }

//     //   const updated = editingHospital ? hospitals.map((h) => (h.id === data.id ? data : h)) : [...hospitals, data];
//     //   setHospitals(updated);
//     //   setFilteredHospitals(updated.filter((hospital) =>
//     //     hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     //     hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
//     //   ));
//     //   resetForm();
//     //   setShowForm(false);
//     //   toast.success(editingHospital ? 'Hospital updated successfully' : 'Hospital added successfully');
//       // Link the newly created hospital back to its registration (connects the funnel).
//       if (!editingHospital && matchedReg && data.hospital?.id) {
//         try {
//           await fetch(`${API_URL}/api/registrations/${matchedReg.id}/assign-hospital`, {
//             method: 'POST',
//             headers: authHeaders(),
//             body: JSON.stringify({ hospitalId: data.hospital.id })
//           });
//           toast.success(`Assigned to ${matchedReg.hospitalName}'s registration`);
//         } catch { /* non-blocking */ }
//       }

//     await loadHospitals();

// resetForm();
// setShowForm(false);
// toast.success(data.message || "Hospital saved successfully");
// } catch (err) {
//       toast.error('Unable to save hospital.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <DashboardLayout title="Super Admin Dashboard" subtitle="Add and manage hospital branches across the network." user={user} showHeader={false}>
//       <DashboardTabs role="superadmin" />
//       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
//         <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-medical-dark">Manage Hospital Network</h2>
//             <p className="text-gray-500 mt-1">Create new hospital branches and assign admin login credentials.</p>
//           </div>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-72">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search hospitals..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue focus:border-medical-blue outline-none text-sm"
//               />
//             </div>
//             <button onClick={loadHospitals} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition text-sm">
//               <RefreshCw size={16} /> Refresh
//             </button>
//             <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold px-5 py-2 rounded-full transition-shadow shadow-sm text-sm">
//               <Plus size={18} /> {showForm ? 'Cancel' : 'Add Hospital'}
//             </button>
//           </div>
//         </div>

//         {showForm && (
//           <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
//             {registrations.length > 0 && !editingHospital && (
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Prefill from a registration</label>
//                 <select onChange={(e) => handlePrefill(e.target.value)} value={matchedReg?.id || ''}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm bg-white">
//                   <option value="">— Select a registered hospital —</option>
//                   {registrations.map((r) => (
//                     <option key={r.id} value={r.id}>{r.hospitalName} — {r.contactName} ({r.email})</option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-400 mt-1">Auto-fills name, address, beds and contact from the registration.</p>
//               </div>
//             )}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name</label>
//               <input type="text" name="name" list="registration-names" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm" placeholder="Type or pick a registered hospital…" />
//               <datalist id="registration-names">
//                 {registrations.map((r) => <option key={r.id} value={r.hospitalName} />)}
//               </datalist>
//               <AnimatePresence>
//                 {matchedReg && (
//                   <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//                     className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-medical-blue bg-blue-50 px-2.5 py-1 rounded-full">
//                     <Sparkles className="w-3.5 h-3.5" /> Auto-filled from {matchedReg.contactName}&apos;s registration
//                   </motion.p>
//                 )}
//               </AnimatePresence>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
//               <AddressAutocomplete value={formData.location} onChange={(v) => setFormData((f) => ({ ...f, location: v }))} placeholder="Search address…" />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Bed Capacity</label>
//               <input type="text" name="beds" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm" placeholder="300+" />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
//               <input type="text" name="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm" placeholder="+91 91234 56789" />
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Image</label>
//               <div className="flex items-center gap-4">
//                 {formData.imageUrl ? (
//                   <img src={formData.imageUrl} alt="Hospital" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
//                 ) : (
//                   <div className="w-20 h-20 rounded-xl bg-slate-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">No image</div>
//                 )}
//                 <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
//                   {uploading ? 'Uploading…' : 'Upload image'}
//                   <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
//                 </label>
//               </div>
//             </div>

//             <div className="flex items-end md:col-span-2 justify-end">
//               <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-medical-blue hover:bg-medical-dark disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-full transition-colors text-sm">
//                 {saving && <Loader2 className="w-4 h-4 animate-spin" />}
//                 {saving ? 'Saving…' : editingHospital ? 'Update Hospital' : 'Save Hospital'}
//               </button>
//             </div>
//           </motion.form>
//         )}

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-medical-blue/10 text-medical-dark">
//                 <th className="py-3.5 px-4 font-semibold rounded-tl-lg text-sm">Hospital</th>
//                 <th className="py-3.5 px-4 font-semibold text-sm">Location</th>
//                 <th className="py-3.5 px-4 font-semibold text-sm">Beds</th>
//                 <th className="py-3.5 px-4 font-semibold text-sm">Contact</th>
//                 <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg text-sm">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredHospitals.map((hospital) => (
//                 <tr key={hospital.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                   <td className="py-4 px-4 text-sm">
//                     <div className="flex items-center gap-3">
//                       {hospital.imageUrl ? (
//                         <img src={hospital.imageUrl} alt={hospital.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
//                       ) : (
//                         <div className="w-10 h-10 rounded-lg bg-slate-100 border border-gray-200 shrink-0" />
//                       )}
//                       <span className="font-bold text-medical-dark">{hospital.name}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4 text-gray-600 text-sm">{hospital.location}</td>
//                   <td className="py-4 px-4 text-gray-600 text-sm">{hospital.beds || 'N/A'}</td>
//                   <td className="py-4 px-4 text-gray-600 text-sm">{hospital.contact || '—'}</td>
//                   <td className="py-4 px-4 text-right flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 text-sm">
//                     <button onClick={() => handleEdit(hospital)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold">
//                       <Edit3 size={16} /> Edit
//                     </button>
//                     <button onClick={() => handleDelete(hospital.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold">
//                       <Trash2 size={16} /> Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredHospitals.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="py-8 text-center text-gray-500 italic">No hospitals found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit3, Trash2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import { TableSkeleton } from '../../components/Loader';

const ITEMS_PER_PAGE = 5;

export default function SuperAdminManageHospitals() {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    icu: '24/7 ICU',
    careType: 'Advanced Care',
    specialty: 'Super Specialty',
    beds: '300+',
    contact: '+91 91225-56789',
    videoUrl: '',
    imageUrl: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [matchedReg, setMatchedReg] = useState(null);
  const navigate = useNavigate();

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(parsedUser);
        loadHospitals();
        loadRegistrations();
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

  const loadRegistrations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/registrations`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
    } catch { /* non-blocking */ }
  };

  const applyRegistration = (reg) => {
    setMatchedReg(reg);
    setFormData((f) => ({
      ...f,
      name: reg.hospitalName || f.name,
      location: reg.address || reg.city || f.location,
      beds: reg.beds ? String(reg.beds) : f.beds,
      contact: reg.phone || f.contact
    }));
  };

  const handlePrefill = (regId) => {
    const reg = registrations.find((r) => String(r.id) === String(regId));
    if (reg) applyRegistration(reg);
    else { setMatchedReg(null); }
  };

  const handleNameChange = (value) => {
    setFormData((f) => ({ ...f, name: value }));
    const match = registrations.find(
      (r) => (r.hospitalName || '').trim().toLowerCase() === value.trim().toLowerCase()
    );
    if (match) applyRegistration(match);
    else setMatchedReg(null);
  };

  const resetForm = () => {
    setMatchedReg(null);
    setFormData({
      name: '',
      location: '',
      icu: '24/7 ICU',
      careType: 'Advanced Care',
      specialty: 'Super Specialty',
      beds: '300+',
      contact: '+91 91225-56789',
      videoUrl: '',
      imageUrl: '',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    });
    setEditingHospital(null);
  };

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Upload failed');
      setFormData((f) => ({ ...f, imageUrl: data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const query = value.toLowerCase();
    setFilteredHospitals(hospitals.filter((hospital) =>
      hospital.name.toLowerCase().includes(query) ||
      hospital.location.toLowerCase().includes(query)
    ));
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
      imageUrl: hospital.imageUrl || '',
      adminName: hospital.adminName || `${hospital.name} Admin`,
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
      setFilteredHospitals(updated.filter((hospital) =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Hospital deleted successfully');
    } catch (err) {
      toast.error('Unable to delete hospital.');
    }
  };

  // 🔒 Client‑side duplicate check before submitting
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return toast.error('Name and location are required');

    // Prevent duplicate name
    const nameLower = formData.name.trim().toLowerCase();
    const duplicate = hospitals.some(
      (h) => h.name.trim().toLowerCase() === nameLower &&
           (!editingHospital || h.id !== editingHospital.id)
    );
    if (duplicate) {
      return toast.error(`Hospital "${formData.name}" already exists.`);
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingHospital ? 'PUT' : 'POST';
      const endpoint = editingHospital ? `${API_URL}/api/hospitals/${editingHospital.id}` : `${API_URL}/api/hospitals`;
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

      if (!editingHospital && matchedReg && data.hospital?.id) {
        try {
          await fetch(`${API_URL}/api/registrations/${matchedReg.id}/assign-hospital`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ hospitalId: data.hospital.id })
          });
          toast.success(`Linked to ${matchedReg.hospitalName}'s registration`);
        } catch { /* non-blocking */ }
      }

      await loadHospitals();
      resetForm();
      setShowForm(false);
      toast.success(data.message || 'Hospital saved successfully');
    } catch (err) {
      toast.error('Unable to save hospital.');
    } finally {
      setSaving(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE);
  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHospitals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHospitals, currentPage]);

  // Reset page when search or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, hospitals.length]);

  return (
    <DashboardLayout title="Super Admin Dashboard" subtitle="Add and manage hospital branches across the network." user={user} showHeader={false}>
      <DashboardTabs role="superadmin" />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-medical-dark">Manage Hospital Network</h2>
            <p className="text-gray-500 mt-1">Create new hospital branches and assign admin login credentials.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search hospitals..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue focus:border-medical-blue outline-none text-sm"
              />
            </div>
            <button onClick={loadHospitals} disabled={isLoading} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition text-sm disabled:opacity-50">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold px-5 py-2 rounded-full transition-shadow shadow-sm text-sm">
              <Plus size={18} /> {showForm ? 'Cancel' : 'Add Hospital'}
            </button>
          </div>
        </div>

        {/* Hospital count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {paginatedHospitals.length} of {filteredHospitals.length} hospitals
          {searchTerm && ` (filtered from ${hospitals.length} total)`}
        </div>

        {showForm && (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.length > 0 && !editingHospital && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prefill from a registration</label>
                <select onChange={(e) => handlePrefill(e.target.value)} value={matchedReg?.id || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm bg-white">
                  <option value="">— Select a registered hospital —</option>
                  {registrations.map((r) => (
                    <option key={r.id} value={r.id}>{r.hospitalName} — {r.contactName} ({r.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Auto-fills name, address, beds and contact from the registration.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name</label>
              <input type="text" name="name" list="registration-names" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm" placeholder="Type or pick a registered hospital…" />
              <datalist id="registration-names">
                {registrations.map((r) => <option key={r.id} value={r.hospitalName} />)}
              </datalist>
              <AnimatePresence>
                {matchedReg && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-medical-blue bg-blue-50 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> Auto-filled from {matchedReg.contactName}&apos;s registration
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <AddressAutocomplete value={formData.location} onChange={(v) => setFormData((f) => ({ ...f, location: v }))} placeholder="Search address…" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bed Capacity</label>
              <input type="text" name="beds" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm" placeholder="300+" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input type="text" name="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue text-sm" placeholder="+91 91234 56789" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Image</label>
              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Hospital" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">No image</div>
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex items-end md:col-span-2 justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-medical-blue hover:bg-medical-dark disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-full transition-colors text-sm">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving…' : editingHospital ? 'Update Hospital' : 'Save Hospital'}
              </button>
            </div>
          </motion.form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-medical-blue/10 text-medical-dark">
                <th className="py-3.5 px-4 font-semibold rounded-tl-lg text-sm">Hospital</th>
                <th className="py-3.5 px-4 font-semibold text-sm">Location</th>
                <th className="py-3.5 px-4 font-semibold text-sm">Beds</th>
                <th className="py-3.5 px-4 font-semibold text-sm">Contact</th>
                <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : paginatedHospitals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 italic">No hospitals found.</td>
                </tr>
              ) : (
                paginatedHospitals.map((hospital) => (
                  <tr key={hospital.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center gap-3">
                        {hospital.imageUrl ? (
                          <img src={hospital.imageUrl} alt={hospital.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-gray-200 shrink-0" />
                        )}
                        <span className="font-bold text-medical-dark">{hospital.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{hospital.location}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{hospital.beds || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{hospital.contact || '—'}</td>
                    <td className="py-4 px-4 text-right flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 text-sm">
                      <button onClick={() => handleEdit(hospital)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold">
                        <Edit3 size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(hospital.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold">
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-medical-blue text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}