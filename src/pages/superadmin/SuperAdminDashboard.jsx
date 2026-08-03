// import { useEffect, useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import API_URL from '../../config/api';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import { Search, RefreshCw, Edit3, Trash2, Plus, Bell, ShieldCheck, Server, AlertCircle, CalendarDays, CalendarClock, CheckCircle2, ClipboardList, ArrowRight } from 'lucide-react';
// import toast from 'react-hot-toast';
// import DashboardLayout from '../../components/DashboardLayout';

// // Dummy Data for Graphs
// const systemGrowthData = [
//   { name: 'Jan', patients: 4000, hospitals: 2, admins: 2 },
//   { name: 'Feb', patients: 4500, hospitals: 3, admins: 3 },
//   { name: 'Mar', patients: 5200, hospitals: 4, admins: 4 },
//   { name: 'Apr', patients: 6100, hospitals: 5, admins: 5 },
//   { name: 'May', patients: 7500, hospitals: 8, admins: 8 },
//   { name: 'Jun', patients: 8900, hospitals: 10, admins: 10 },
//   { name: 'Jul', patients: 11000, hospitals: 12, admins: 14 },
// ];

// const resourceData = [
//   { name: 'Hospitals', value: 12 },
//   { name: 'Admins', value: 14 },
//   { name: 'Doctors', value: 145 },
//   { name: 'Staff', value: 530 },
// ];

// const systemLogs = [
//   { time: '10 mins ago', event: 'SuperAdmin updated system-wide HL7 endpoints', status: 'Success' },
//   { time: '30 mins ago', event: 'New Admin "Dr. Rajesh Sharma" onboarded to Mohali West', status: 'Success' },
//   { time: '2 hours ago', event: 'Automated Database Backup completed successfully', status: 'Success' },
//   { time: '5 hours ago', event: 'Security Audit: All 12 Hospital Nodes HIPAA Compliant', status: 'Verified' },
// ];

// const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'];
// const appointmentStatusOptions = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

// export default function SuperAdminDashboard() {
//   const [user, setUser] = useState(null);
//   const [admins, setAdmins] = useState([]);
//   const [filteredAdmins, setFilteredAdmins] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editingAdmin, setEditingAdmin] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [formData, setFormData] = useState({ name: '', email: '', hospital: '' });
//   const [demoCounts, setDemoCounts] = useState({ total: 0, requested: 0, scheduled: 0, completed: 0, cancelled: 0 });

//   const navigate = useNavigate();

//   const fetchDemoStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/demos`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (!res.ok) return; // demo storage may not be configured yet — fail quietly
//       const data = await res.json();
//       if (data.counts) setDemoCounts(data.counts);
//     } catch (err) {
//       // non-fatal for the overview
//     }
//   };

//   const fetchAdmins = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/auth/admins`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setAdmins(data);
//         setFilteredAdmins(data);
//       } else {
//         toast.error(data.message || 'Failed to load admins');
//       }
//     } catch (err) {
//       toast.error('Unable to load admins.');
//     }
//   };

//   const fetchHospitals = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/hospitals`);
//       const data = await res.json();
//       if (res.ok) {
//         setHospitals(data);
//       }
//     } catch (err) {
//       toast.error('Unable to load hospitals.');
//     }
//   };

//   const resetForm = () => {
//     setFormData({ name: '', email: '', hospital: '' });
//     setEditingAdmin(null);
//   };

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     const query = value.toLowerCase();
//     setFilteredAdmins(admins.filter((admin) =>
//       admin.name.toLowerCase().includes(query) ||
//       admin.email.toLowerCase().includes(query) ||
//       (admin.hospital || '').toLowerCase().includes(query)
//     ));
//   };

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       if (parsedUser.role !== 'superadmin') {
//         navigate('/');
//       } else {
//         setUser(parsedUser);
//         fetchAdmins();
//         fetchHospitals();
//         loadAppointments();
//         fetchDemoStats();
//       }
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const loadAppointments = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setAppointments(data);
//       }
//     } catch (err) {
//       toast.error('Unable to load appointments.');
//     }
//   };

//   const changeAppointmentStatus = async (id, status) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ status })
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         return toast.error(data.message || 'Unable to update appointment');
//       }
//       const updated = appointments.map((appointment) => appointment.id === id ? data.appointment || data : appointment);
//       setAppointments(updated);
//       toast.success('Appointment status updated');
//     } catch (err) {
//       toast.error('Unable to update appointment status.');
//     }
//   };

//   const handleDeleteConfirm = async (id) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/auth/admins/${id}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         return toast.error(data.message || 'Unable to delete admin');
//       }

//       const updatedAdmins = admins.filter(a => a.id !== id);
//       setAdmins(updatedAdmins);
//       setFilteredAdmins(updatedAdmins.filter((admin) =>
//         admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
//       ));
//       toast.success('Admin deleted successfully');
//     } catch (err) {
//       toast.error('Unable to delete admin. Please try again.');
//     }
//   };

//   const handleDelete = (admin) => {
//     toast((t) => (
//       <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 max-w-sm mx-auto text-sm">
//         <p className="text-gray-900 mb-4">Are you sure you want to delete <span className="font-bold">{admin.name}</span>?</p>
//         <div className="flex gap-3">
//           <button
//             type="button"
//             className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 font-bold"
//             onClick={() => {
//               handleDeleteConfirm(admin.id);
//               toast.dismiss(t.id);
//             }}
//           >
//             Yes, delete
//           </button>
//           <button
//             type="button"
//             className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-4 py-2 font-bold"
//             onClick={() => toast.dismiss(t.id)}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ));
//   };

//   const handleEdit = (admin) => {
//     setEditingAdmin(admin);
//     setFormData({ name: admin.name, email: admin.email, hospital: admin.hospital || '' });
//     setShowAddForm(true);
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     if(!formData.name || !formData.email) return toast.error('Please fill required fields');

//     try {
//       const token = localStorage.getItem('token');
//       let res;
//       let data;

//       if (editingAdmin) {
//         res = await fetch(`${API_URL}/api/auth/admins/${editingAdmin.id}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             name: formData.name,
//             email: formData.email,
//             hospital: formData.hospital
//           })
//         });
//         data = await res.json();

//         if (!res.ok) {
//           return toast.error(data.message || 'Unable to update admin');
//         }

//         const updatedAdmins = admins.map(a => a.id === editingAdmin.id ? data : a);
//         setAdmins(updatedAdmins);
//         setFilteredAdmins(updatedAdmins.filter((admin) =>
//           admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
//         ));
//         toast.success('Admin updated successfully');
//       } else {
//         res = await fetch(`${API_URL}/api/auth/admins`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             name: formData.name,
//             email: formData.email,
//             hospital: formData.hospital
//           })
//         });
//         data = await res.json();

//         if (!res.ok) {
//           return toast.error(data.message || 'Unable to add admin');
//         }

//         const updatedAdmins = [...admins, data];
//         setAdmins(updatedAdmins);
//         setFilteredAdmins(updatedAdmins.filter((admin) =>
//           admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
//         ));
//         toast.success('New Admin added successfully');
//       }

//       resetForm();
//       setShowAddForm(false);
//     } catch (err) {
//       toast.error(editingAdmin ? 'Unable to update admin. Please try again.' : 'Unable to add admin. Please try again.');
//     }
//   };

//   const broadcastAlert = () => {
//     toast.success("Broadcast alert sent to all active hospital administrators!");
//   };

//   return (
//     <DashboardLayout
//       title="Super Admin Master Control Center"
//       subtitle="System-wide management, global hospital statistics, and admin access control."
//       user={user}
//     >
//       {/* SuperAdmin Action Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8">
//         <div>
//           <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/30">
//             <ShieldCheck size={14} /> Master Privileges Active
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-black">Global Hospital System Overview</h1>
//           <p className="text-gray-300 text-sm mt-1">Manage global admins, monitor database uptime, and issue system alerts.</p>
//         </div>
//         <button
//           onClick={broadcastAlert}
//           className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md transition"
//         >
//           <Bell size={16} /> Broadcast System Notice
//         </button>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         {[
//           { title: 'Total Hospitals', value: '12', trend: '+2 this month', color: 'text-medical-blue', icon: Server },
//           { title: 'Active Admins', value: admins.length.toString(), trend: 'Updated live', color: 'text-emerald-600', icon: ShieldCheck },
//           { title: 'Total Patients', value: '11,000+', trend: '+15% growth', color: 'text-purple-600', icon: Server },
//           { title: 'System Uptime', value: '99.99%', trend: 'HL7 Network Healthy', color: 'text-blue-600', icon: Server }
//         ].map((kpi, idx) => {
//           const IconComp = kpi.icon;
//           return (
//             <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
//               <div>
//                 <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{kpi.title}</h3>
//                 <p className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
//                 <span className="text-xs font-bold text-gray-400 mt-1 block">{kpi.trend}</span>
//               </div>
//               <div className="p-3 bg-slate-50 text-gray-700 rounded-2xl">
//                 <IconComp size={22} />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Demo Funnel Snapshot */}
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
//         <div className="flex items-center justify-between mb-5">
//           <div className="flex items-center gap-2">
//             <CalendarDays className="text-medical-blue" size={20} />
//             <h3 className="font-bold text-gray-900 text-base">Demo Funnel Snapshot</h3>
//           </div>
//           <Link
//             to="/superadmin/demos"
//             className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark"
//           >
//             Manage demos <ArrowRight size={15} />
//           </Link>
//         </div>
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {[
//             { title: 'Total Bookings', value: demoCounts.total, icon: CalendarDays, bg: 'bg-blue-100', text: 'text-blue-600' },
//             { title: 'Scheduled', value: demoCounts.scheduled, icon: CalendarClock, bg: 'bg-indigo-100', text: 'text-indigo-600' },
//             { title: 'Completed', value: demoCounts.completed, icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' },
//             { title: 'Total Appointments', value: appointments.length, icon: ClipboardList, bg: 'bg-purple-100', text: 'text-purple-600' }
//           ].map((c) => {
//             const Icon = c.icon;
//             return (
//               <div key={c.title} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-gray-200/70">
//                 <div className="min-w-0">
//                   <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.title}</p>
//                   <p className="text-2xl font-extrabold text-medical-dark mt-1">{c.value}</p>
//                 </div>
//                 <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
//                   <Icon className="w-5 h-5" />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* System Audit Log Activity Feed */}
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
//         <div className="flex items-center gap-2 mb-4 border-b pb-3">
//           <AlertCircle className="text-medical-blue" size={20} />
//           <h3 className="font-bold text-gray-900 text-base">System Audit Trail & Live Activity</h3>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {systemLogs.map((log, idx) => (
//             <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-sm">
//               <div>
//                 <p className="font-bold text-gray-800">{log.event}</p>
//                 <span className="text-xs text-gray-400">{log.time}</span>
//               </div>
//               <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
//                 {log.status}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
//         {/* Hospital Bed Capacity Chart (Real DB Data) */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="text-xl font-bold text-medical-dark">Hospital Bed Capacity Overview</h2>
//               <p className="text-xs text-gray-500">Live bed count across registered network hospitals</p>
//             </div>
//             <span className="bg-blue-50 text-medical-blue text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
//               {hospitals.length} Hospitals
//             </span>
//           </div>
//           <div className="h-80 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={hospitals.map(h => ({
//                   name: h.name ? (h.name.length > 18 ? h.name.slice(0, 15) + '...' : h.name) : 'Hospital',
//                   beds: parseInt(String(h.beds).replace(/\D/g, '')) || 100,
//                   location: h.location || 'Network'
//                 }))}
//                 margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                 <XAxis dataKey="name" axisLine={false} tickLine={false} angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
//                 <YAxis axisLine={false} tickLine={false} label={{ value: 'Beds', angle: -90, position: 'insideLeft', fontSize: 12 }} />
//                 <Tooltip 
//                   formatter={(val) => [`${val} Beds`, 'Total Capacity']}
//                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
//                 />
//                 <Bar dataKey="beds" name="Hospital Bed Capacity" fill="#0284c7" radius={[8, 8, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//           <h2 className="text-xl font-bold text-medical-dark mb-6">System Resource Allocations</h2>
//           <div className="h-80 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={[
//                     { name: 'Hospitals', value: hospitals.length || 12 },
//                     { name: 'Admins', value: admins.length || 14 },
//                     { name: 'Doctors', value: 145 },
//                     { name: 'Staff', value: 530 },
//                   ]}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {resourceData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
//                 <Legend iconType="circle" layout="vertical" verticalAlign="bottom" align="center" />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Admin Management Section */}
//       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-medical-dark">Manage Hospital Admins</h2>
//             <p className="text-sm text-gray-500">Onboard new hospital administrators and modify privileges.</p>
//           </div>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-72">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search admins..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue outline-none text-sm"
//               />
//             </div>
//             <button
//               type="button"
//               onClick={fetchAdmins}
//               className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm"
//             >
//               <RefreshCw size={16} /> Refresh
//             </button>
//             <button 
//               onClick={() => {
//                 if (showAddForm) resetForm();
//                 setShowAddForm(!showAddForm);
//               }}
//               className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue text-white font-bold py-2 px-5 rounded-full transition-colors shadow-xs text-sm"
//             >
//               <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Admin'}
//             </button>
//           </div>
//         </div>

//         {showAddForm && (
//           <form onSubmit={handleAddSubmit} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-sm">
//             <div>
//               <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
//               <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue" placeholder="Dr. Jane Doe" />
//             </div>
//             <div>
//               <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
//               <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue" placeholder="jane@hospital.com" />
//             </div>
//             <div>
//               <label className="block font-semibold text-gray-700 mb-1">Assigned Hospital</label>
//               <input type="text" name="hospital" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue" placeholder="Medpark West Branch" />
//             </div>
//             <div>
//               <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
//                 {editingAdmin ? 'Update Admin' : 'Save New Admin'}
//               </button>
//             </div>
//           </form>
//         )}

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-medical-blue/10 text-medical-dark text-sm">
//                 <th className="py-3.5 px-4 font-semibold rounded-tl-lg">Admin Name</th>
//                 <th className="py-3.5 px-4 font-semibold">Email</th>
//                 <th className="py-3.5 px-4 font-semibold">Assigned Hospital</th>
//                 <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredAdmins.map((admin) => (
//                 <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
//                   <td className="py-4 px-4 font-bold text-medical-dark">{admin.name}</td>
//                   <td className="py-4 px-4 text-gray-600">{admin.email}</td>
//                   <td className="py-4 px-4 text-gray-600">{admin.hospital || 'Unassigned'}</td>
//                   <td className="py-4 px-4 text-right flex justify-end gap-3">
//                     <button onClick={() => handleEdit(admin)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold">
//                       <Edit3 size={15} /> Edit
//                     </button>
//                     <button onClick={() => handleDelete(admin)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold">
//                       <Trash2 size={15} /> Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredAdmins.length === 0 && (
//                 <tr>
//                   <td colSpan="4" className="py-8 text-center text-gray-500 italic">No admins found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* All Appointments Section */}
//       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-10">
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-medical-dark">Global System Appointments</h2>
//             <p className="text-sm text-gray-500">Master view of all patient bookings across hospitals.</p>
//           </div>
//           <button
//             type="button"
//             onClick={loadAppointments}
//             className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm"
//           >
//             <RefreshCw size={16} /> Refresh Appointments
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse text-sm">
//             <thead>
//               <tr className="bg-medical-blue/10 text-medical-dark">
//                 <th className="py-3.5 px-4 font-semibold rounded-tl-lg">Patient Name</th>
//                 <th className="py-3.5 px-4 font-semibold">Hospital ID</th>
//                 <th className="py-3.5 px-4 font-semibold">Date</th>
//                 <th className="py-3.5 px-4 font-semibold">Time</th>
//                 <th className="py-3.5 px-4 font-semibold">Status</th>
//                 <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Update Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((appointment) => (
//                 <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                   <td className="py-4 px-4 font-bold text-medical-dark">{appointment.patientName}</td>
//                   <td className="py-4 px-4 text-gray-600">{appointment.hospitalId}</td>
//                   <td className="py-4 px-4 text-gray-600">{appointment.date}</td>
//                   <td className="py-4 px-4 text-gray-600">{appointment.time}</td>
//                   <td className="py-4 px-4">
//                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
//                       appointment.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
//                       appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
//                       appointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {appointment.status}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4 text-right">
//                     <select
//                       value={appointment.status}
//                       onChange={(e) => changeAppointmentStatus(appointment.id, e.target.value)}
//                       className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-full bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue"
//                     >
//                       {appointmentStatusOptions.map((status) => (
//                         <option key={status} value={status}>{status}</option>
//                       ))}
//                     </select>
//                   </td>
//                 </tr>
//               ))}
//               {appointments.length === 0 && (
//                 <tr>
//                   <td colSpan="6" className="py-8 text-center text-gray-500 italic">No appointments found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }



import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  Search, RefreshCw, Edit3, Trash2, Plus, Bell, ShieldCheck,
  AlertCircle, CalendarDays, CalendarClock, CheckCircle2, ClipboardList,
  ArrowRight, ChevronLeft, ChevronRight, UserPlus, Radio, Hourglass, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import Loader, { StatSkeleton, TableSkeleton } from '../../components/Loader';

// How often the live counters refresh (ms). The API rate limiter allows 120 req/min.
const LIVE_REFRESH_MS = 15000;

// Counts animate from their previous value so a change is visible, not just different.
function AnimatedCount({ value = 0 }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const from = display;
    const to = Number(value) || 0;
    if (from === to) return;

    const steps = 18;
    const stepMs = 900 / steps;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      // ease-out so it decelerates into the final number
      const progress = 1 - Math.pow(1 - i / steps, 3);
      setDisplay(i >= steps ? to : Math.round(from + (to - from) * progress));
      if (i >= steps) clearInterval(id);
    }, stepMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

// Dummy Data for Graphs
const systemGrowthData = [
  { name: 'Jan', patients: 4000, hospitals: 2, admins: 2 },
  { name: 'Feb', patients: 4500, hospitals: 3, admins: 3 },
  { name: 'Mar', patients: 5200, hospitals: 4, admins: 4 },
  { name: 'Apr', patients: 6100, hospitals: 5, admins: 5 },
  { name: 'May', patients: 7500, hospitals: 8, admins: 8 },
  { name: 'Jun', patients: 8900, hospitals: 10, admins: 10 },
  { name: 'Jul', patients: 11000, hospitals: 12, admins: 14 },
];

const resourceData = [
  { name: 'Hospitals', value: 12 },
  { name: 'Admins', value: 14 },
  { name: 'Doctors', value: 145 },
  { name: 'Staff', value: 530 },
];

const systemLogs = [
  { time: '10 mins ago', event: 'SuperAdmin updated system-wide HL7 endpoints', status: 'Success' },
  { time: '30 mins ago', event: 'New Admin "Dr. Rajesh Sharma" onboarded to Mohali West', status: 'Success' },
  { time: '2 hours ago', event: 'Automated Database Backup completed successfully', status: 'Success' },
  { time: '5 hours ago', event: 'Security Audit: All 12 Hospital Nodes HIPAA Compliant', status: 'Verified' },
];

const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'];
const appointmentStatusOptions = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

export default function SuperAdminDashboard() {
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', hospital: '' });
  const [demoCounts, setDemoCounts] = useState({ total: 0, requested: 0, scheduled: 0, completed: 0, cancelled: 0 });

  // Pagination States
  const [adminPage, setAdminPage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const itemsPerPage = 5;

  // ─── Live counters (polled) ───────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const navigate = useNavigate();

  const fetchStats = async ({ silent = false } = {}) => {
    if (!silent) setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
      setLastSynced(new Date());
    } catch {
      // Polling is best-effort — a transient failure keeps the last known counts.
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDemoStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/demos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.counts) setDemoCounts(data.counts);
    } catch (err) {}
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
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
      setLoadingAdmins(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      if (res.ok) {
        setHospitals(data);
      }
    } catch (err) {
      toast.error('Unable to load hospitals.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', hospital: '' });
    setEditingAdmin(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setAdminPage(1); // Reset page on search filter change
    const query = value.toLowerCase();
    setFilteredAdmins(admins.filter((admin) =>
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.hospital || '').toLowerCase().includes(query)
    ));
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(parsedUser);
        fetchAdmins();
        fetchHospitals();
        loadAppointments();
        fetchDemoStats();
        fetchStats();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Poll the live counters, and refresh immediately when the tab regains focus
  // so a superadmin returning to the dashboard never reads a stale number.
  useEffect(() => {
    if (!user) return;

    const id = setInterval(() => fetchStats({ silent: true }), LIVE_REFRESH_MS);
    const onFocus = () => fetchStats({ silent: true });
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      }
    } catch (err) {
      toast.error('Unable to load appointments.');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const changeAppointmentStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Unable to update appointment');
      }
      const updated = appointments.map((appointment) => appointment.id === id ? data.appointment || data : appointment);
      setAppointments(updated);
      toast.success('Appointment status updated');
    } catch (err) {
      toast.error('Unable to update appointment status.');
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/admins/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message || 'Unable to delete admin');
      }

      const updatedAdmins = admins.filter(a => a.id !== id);
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

  const handleDelete = (admin) => {
    toast((t) => (
      <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200 max-w-sm mx-auto text-sm">
        <p className="text-gray-900 mb-4">Are you sure you want to delete <span className="font-bold">{admin.name}</span>?</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 font-bold transition"
            onClick={() => {
              handleDeleteConfirm(admin.id);
              toast.dismiss(t.id);
            }}
          >
            Yes, delete
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-4 py-2 font-bold transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, hospital: admin.hospital || '' });
    setShowAddForm(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.email) return toast.error('Please fill required fields');

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
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            hospital: formData.hospital
          })
        });
        data = await res.json();

        if (!res.ok) {
          return toast.error(data.message || 'Unable to update admin');
        }

        const updatedAdmins = admins.map(a => a.id === editingAdmin.id ? data : a);
        setAdmins(updatedAdmins);
        setFilteredAdmins(updatedAdmins.filter((admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
        ));
        toast.success('Admin updated successfully');
      } else {
        res = await fetch(`${API_URL}/api/auth/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            hospital: formData.hospital
          })
        });
        data = await res.json();

        if (!res.ok) {
          return toast.error(data.message || 'Unable to add admin');
        }

        const updatedAdmins = [...admins, data];
        setAdmins(updatedAdmins);
        setFilteredAdmins(updatedAdmins.filter((admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (admin.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
        ));
        toast.success('New Admin added successfully');
      }

      resetForm();
      setShowAddForm(false);
    } catch (err) {
      toast.error(editingAdmin ? 'Unable to update admin.' : 'Unable to add admin.');
    }
  };

  const broadcastAlert = () => {
    toast.success("Broadcast alert sent to all active hospital administrators!");
  };

  // Pagination Slicing calculations
  const totalAdminPages = Math.ceil(filteredAdmins.length / itemsPerPage) || 1;
  const paginatedAdmins = filteredAdmins.slice((adminPage - 1) * itemsPerPage, adminPage * itemsPerPage);

  const totalAppointmentPages = Math.ceil(appointments.length / itemsPerPage) || 1;
  const paginatedAppointments = appointments.slice((appointmentPage - 1) * itemsPerPage, appointmentPage * itemsPerPage);

  return (
    <DashboardLayout
      title="Super Admin Master Control Center"
      subtitle="System-wide management, global hospital statistics, and admin access control."
      user={user}
    >
      {/* SuperAdmin Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/30">
            <ShieldCheck size={14} /> Master Privileges Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Global Hospital System Overview</h1>
          <p className="text-gray-300 text-sm mt-1">Manage global admins, monitor database uptime, and issue system alerts.</p>
        </div>
        <button
          onClick={broadcastAlert}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md transition"
        >
          <Bell size={16} /> Broadcast System Notice
        </button>
      </div>

      {/* ─── Live counters ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="inline-flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="text-lg font-bold text-gray-900">Live Counters</h2>
          <span className="text-xs text-gray-400 font-medium">
            {lastSynced ? `Synced ${lastSynced.toLocaleTimeString()}` : 'Syncing…'} · auto-refreshes every {LIVE_REFRESH_MS / 1000}s
          </span>
        </div>
        <button
          type="button"
          onClick={() => fetchStats()}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold transition text-sm"
        >
          <Radio size={15} /> Refresh now
        </button>
      </div>

      {statsLoading && !stats ? (
        <StatSkeleton count={4} className="mb-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Registrations',
              value: stats?.registrations?.total ?? 0,
              trend: `${stats?.registrations?.pending ?? 0} pending · ${stats?.registrations?.today ?? 0} today`,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              icon: UserPlus,
              to: '/superadmin/registrations'
            },
            {
              title: 'Total Bookings',
              value: stats?.bookings?.total ?? appointments.length,
              trend: `${stats?.bookings?.pending ?? 0} pending · ${stats?.bookings?.today ?? 0} today`,
              color: 'text-medical-blue',
              bg: 'bg-blue-50',
              icon: ClipboardList,
              to: '/superadmin/appointments'
            },
            {
              title: 'Active Admins',
              value: stats?.network?.admins ?? admins.length,
              trend: `${stats?.network?.hospitals ?? hospitals.length} hospitals on the network`,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              icon: ShieldCheck,
              to: '/superadmin/manage-admin'
            },
            {
              title: 'New Enquiries',
              value: stats?.contacts?.new ?? 0,
              trend: `${stats?.contacts?.total ?? 0} contact messages in total`,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              icon: MessageSquare,
              to: '/superadmin/contacts'
            }
          ].map((kpi) => {
            const IconComp = kpi.icon;
            return (
              <Link
                key={kpi.title}
                to={kpi.to}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{kpi.title}</h3>
                  <p className={`text-3xl font-extrabold ${kpi.color}`}>
                    <AnimatedCount value={kpi.value} />
                  </p>
                  <span className="text-xs font-bold text-gray-400 mt-1 block">{kpi.trend}</span>
                </div>
                <div className={`p-3.5 rounded-2xl border border-gray-100 ${kpi.bg} ${kpi.color}`}>
                  <IconComp size={22} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Booking / registration status breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-medical-blue" size={19} />
                <h3 className="font-bold text-gray-900">Bookings by status</h3>
              </div>
              <Link to="/superadmin/appointments" className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pending', value: stats.bookings.pending, cls: 'bg-amber-50 text-amber-700', icon: Hourglass },
                { label: 'Confirmed', value: stats.bookings.confirmed, cls: 'bg-blue-50 text-blue-700', icon: CalendarClock },
                { label: 'Completed', value: stats.bookings.completed, cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
                { label: 'Cancelled', value: stats.bookings.cancelled, cls: 'bg-red-50 text-red-700', icon: AlertCircle }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl p-4 ${s.cls}`}>
                    <Icon size={17} className="mb-2" />
                    <p className="text-2xl font-extrabold leading-none"><AnimatedCount value={s.value} /></p>
                    <p className="text-[11px] font-bold uppercase tracking-wide mt-1.5 opacity-80">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4 font-medium">
              {stats.bookings.thisMonth} booking{stats.bookings.thisMonth === 1 ? '' : 's'} this month
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus className="text-indigo-600" size={19} />
                <h3 className="font-bold text-gray-900">Registrations by status</h3>
              </div>
              <Link to="/superadmin/registrations" className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pending', value: stats.registrations.pending, cls: 'bg-amber-50 text-amber-700', icon: Hourglass },
                { label: 'Approved', value: stats.registrations.approved, cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
                { label: 'Denied', value: stats.registrations.denied, cls: 'bg-red-50 text-red-700', icon: AlertCircle },
                { label: 'Demos', value: stats.demos.total, cls: 'bg-indigo-50 text-indigo-700', icon: CalendarDays }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl p-4 ${s.cls}`}>
                    <Icon size={17} className="mb-2" />
                    <p className="text-2xl font-extrabold leading-none"><AnimatedCount value={s.value} /></p>
                    <p className="text-[11px] font-bold uppercase tracking-wide mt-1.5 opacity-80">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4 font-medium">
              {stats.registrations.thisMonth} registration{stats.registrations.thisMonth === 1 ? '' : 's'} this month
            </p>
          </div>
        </div>
      )}

      {/* Demo Funnel Snapshot */}
      {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-medical-blue" size={20} />
            <h3 className="font-bold text-gray-900 text-base">Demo Funnel Snapshot</h3>
          </div>
          <Link
            to="/superadmin/demos"
            className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark transition"
          >
            Manage demos <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Bookings', value: demoCounts.total, icon: CalendarDays, bg: 'bg-blue-50', text: 'text-blue-600' },
            { title: 'Scheduled', value: demoCounts.scheduled, icon: CalendarClock, bg: 'bg-indigo-50', text: 'text-indigo-600' },
            { title: 'Completed', value: demoCounts.completed, icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { title: 'Total Appointments', value: appointments.length, icon: ClipboardList, bg: 'bg-purple-50', text: 'text-purple-600' }
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 border border-gray-200/60">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{c.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{c.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div> */}
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hospital Bed Capacity Overview</h2>
              <p className="text-xs text-gray-500">Live bed count across registered network hospitals</p>
            </div>
            <span className="bg-blue-50 text-medical-blue text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              {hospitals.length} Hospitals
            </span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hospitals.map(h => ({
                  name: h.name ? (h.name.length > 18 ? h.name.slice(0, 15) + '...' : h.name) : 'Hospital',
                  beds: parseInt(String(h.beds).replace(/\D/g, '')) || 100,
                  location: h.location || 'Network'
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} label={{ value: 'Beds', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`${val} Beds`, 'Total Capacity']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
                />
                <Bar dataKey="beds" name="Hospital Bed Capacity" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Resource Allocations</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Hospitals', value: hospitals.length || 12 },
                    { name: 'Admins', value: admins.length || 14 },
                    { name: 'Doctors', value: 145 },
                    { name: 'Staff', value: 530 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Hospital Admins</h2>
            <p className="text-sm text-gray-500">Onboard new hospital administrators and modify privileges.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search admins..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-medical-blue outline-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={fetchAdmins}
              disabled={loadingAdmins}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm disabled:opacity-60"
            >
              {loadingAdmins ? <Loader size="sm" /> : <RefreshCw size={16} />} Refresh
            </button>
            <button 
              onClick={() => {
                if (showAddForm) resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-medical-blue text-white font-bold py-2 px-5 rounded-full transition-colors shadow-xs text-sm"
            >
              <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Admin'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-sm">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue bg-white" placeholder="Dr. Jane Doe" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue bg-white" placeholder="jane@hospital.com" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Assigned Hospital</label>
              <input type="text" name="hospital" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue bg-white" placeholder="Medpark West Branch" />
            </div>
            <div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
                {editingAdmin ? 'Update Admin' : 'Save New Admin'}
              </button>
            </div>
          </form>
        )}

        {loadingAdmins ? <TableSkeleton rows={5} cols={4} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-medical-blue/10 text-medical-dark text-sm">
                <th className="py-3.5 px-4 font-semibold rounded-tl-lg">Admin Name</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Hospital</th>
                <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                  <td className="py-4 px-4 font-bold text-gray-900">{admin.name}</td>
                  <td className="py-4 px-4 text-gray-600">{admin.email}</td>
                  <td className="py-4 px-4 text-gray-600">{admin.hospital || 'Unassigned'}</td>
                  <td className="py-4 px-4 text-right flex justify-end gap-3">
                    <button onClick={() => handleEdit(admin)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition">
                      <Edit3 size={15} /> Edit
                    </button>
                    <button onClick={() => handleDelete(admin)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition">
                      <Trash2 size={15} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedAdmins.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 italic">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Admins Pagination Controls */}
        {!loadingAdmins && filteredAdmins.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-700">{(adminPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(adminPage * itemsPerPage, filteredAdmins.length)}</span> of <span className="font-bold text-gray-700">{filteredAdmins.length}</span> admins
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={adminPage === 1}
                onClick={() => setAdminPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 font-bold text-gray-700">Page {adminPage} of {totalAdminPages}</span>
              <button
                disabled={adminPage === totalAdminPages}
                onClick={() => setAdminPage(p => Math.min(p + 1, totalAdminPages))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* All Appointments Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Global System Appointments</h2>
            <p className="text-sm text-gray-500">Master view of all patient bookings across hospitals.</p>
          </div>
          <button
            type="button"
            onClick={loadAppointments}
            disabled={loadingAppointments}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-xs transition text-sm disabled:opacity-60"
          >
            {loadingAppointments ? <Loader size="sm" /> : <RefreshCw size={16} />} Refresh Appointments
          </button>
        </div>

        {loadingAppointments ? <TableSkeleton rows={5} cols={6} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-medical-blue/10 text-medical-dark">
                <th className="py-3.5 px-4 font-semibold rounded-tl-lg">Patient Name</th>
                <th className="py-3.5 px-4 font-semibold">Hospital ID</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Time</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right rounded-tr-lg">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">{appointment.patientName}</td>
                  <td className="py-4 px-4 text-gray-600">{appointment.hospitalId}</td>
                  <td className="py-4 px-4 text-gray-600">{appointment.date}</td>
                  <td className="py-4 px-4 text-gray-600">{appointment.time}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      appointment.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <select
                      value={appointment.status}
                      onChange={(e) => changeAppointmentStatus(appointment.id, e.target.value)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-full bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue"
                    >
                      {appointmentStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {paginatedAppointments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 italic">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Appointments Pagination Controls */}
        {!loadingAppointments && appointments.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-700">{(appointmentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(appointmentPage * itemsPerPage, appointments.length)}</span> of <span className="font-bold text-gray-700">{appointments.length}</span> appointments
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={appointmentPage === 1}
                onClick={() => setAppointmentPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 font-bold text-gray-700">Page {appointmentPage} of {totalAppointmentPages}</span>
              <button
                disabled={appointmentPage === totalAppointmentPages}
                onClick={() => setAppointmentPage(p => Math.min(p + 1, totalAppointmentPages))}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}