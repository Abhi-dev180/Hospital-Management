// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';

// export default function UserBookAppointment() {
//   const [user, setUser] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [formData, setFormData] = useState({ hospitalId: '', date: '', time: '', patientName: '', patientPhone: '', reason: '' });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       setUser(JSON.parse(userData));
//       fetchHospitals();
//       fetchAppointments(localStorage.getItem('token'));
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const fetchHospitals = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/hospitals`);
//       const data = await res.json();
//       setHospitals(data);
//     } catch (err) {
//       toast.error('Failed to load hospitals.');
//     }
//   };

//   const fetchAppointments = async (token) => {
//     try {
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setAppointments(data);
//       }
//     } catch (err) {
//       toast.error('Failed to load appointments.');
//     }
//   };

//   const [bookedSlots, setBookedSlots] = useState([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);

//   useEffect(() => {
//     if (!formData.date) return;
//     (async () => {
//       setLoadingSlots(true);
//       try {
//         const res = await fetch(`${API_URL}/api/appointments/booked-slots?date=${formData.date}&hospitalId=${formData.hospitalId || ''}`);
//         const data = await res.json();
//         if (res.ok && Array.isArray(data.bookedSlots)) {
//           setBookedSlots(data.bookedSlots);
//         } else {
//           setBookedSlots([]);
//         }
//       } catch (e) {
//         console.error('Could not fetch booked slots:', e);
//       } finally {
//         setLoadingSlots(false);
//       }
//     })();
//   }, [formData.date, formData.hospitalId]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.hospitalId || !formData.date || !formData.time || !formData.patientName || !formData.patientPhone) {
//       return toast.error('Please fill all required fields');
//     }
//     if (bookedSlots.includes(formData.time)) {
//       return toast.error('That slot is already booked. Please pick an available time.');
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();

//       if (res.ok) {
//         toast.success(data.message);
//         setAppointments([...appointments, data.appointment]);
//         setFormData({ hospitalId: '', date: '', time: '', patientName: '', patientPhone: '', reason: '' });
//       } else {
//         toast.error(data.message || 'Failed to book appointment');
//       }
//     } catch (error) {
//       toast.error('An error occurred');
//     }
//   };

//   return (
//     <DashboardLayout title="User Dashboard" subtitle="Book appointments, view your schedule, and stay connected with care." user={user} showHeader={false}>
//       <DashboardTabs role="user" />
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">Select Hospital <span className="text-red-500">*</span></label>
//               <select
//                 name="hospitalId"
//                 value={formData.hospitalId}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//               >
//                 <option value="">-- Choose Hospital --</option>
//                 {hospitals.map((h) => (
//                   <option key={h.id} value={h.id}>{h.name} - {h.location}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-1">Date <span className="text-red-500">*</span></label>
//                 <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue" />
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-1">Time <span className="text-red-500">*</span></label>
//                 <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue" />
//               </div>
//             </div>

//             {formData.date && (
//               <div className="mt-1">
//                 <span className="text-xs font-semibold text-gray-500 block mb-1">
//                   Available Slots {loadingSlots ? '(checking Google Calendar...)' : ''}:
//                 </span>
//                 <div className="flex flex-wrap gap-1.5">
//                   {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((slot) => {
//                     const isBooked = bookedSlots.includes(slot);
//                     const isSelected = formData.time === slot;
//                     return (
//                       <button
//                         key={slot}
//                         type="button"
//                         disabled={isBooked}
//                         onClick={() => setFormData((f) => ({ ...f, time: slot }))}
//                         className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
//                           isBooked
//                             ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
//                             : isSelected
//                             ? 'bg-medical-blue text-white border-medical-blue shadow-sm'
//                             : 'bg-white text-gray-700 border-gray-300 hover:border-medical-blue'
//                         }`}
//                         title={isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
//                       >
//                         {slot} {isBooked ? '(Booked)' : ''}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">Patient Name <span className="text-red-500">*</span></label>
//               <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required placeholder="John Doe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue" />
//             </div>

//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">Phone Number <span className="text-red-500">*</span></label>
//               <input type="tel" name="patientPhone" value={formData.patientPhone} onChange={handleChange} required placeholder="123-456-7890" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue" />
//             </div>

//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">Reason for Visit</label>
//               <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" placeholder="Briefly describe your symptoms..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"></textarea>
//             </div>

//             <button type="submit" className="w-full bg-medical-blue text-white font-bold py-3 rounded-lg hover:bg-medical-dark transition-colors mt-4 shadow-md">
//               Confirm Booking
//             </button>
//           </form>
//         </div>

//         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit">
//           <h2 className="text-2xl font-bold text-medical-dark mb-6 border-b pb-2">My Appointments</h2>
//           {appointments.length === 0 ? (
//             <p className="text-gray-500 italic text-center py-10">No appointments booked yet.</p>
//           ) : (
//             <div className="space-y-4">
//               {appointments.map((app) => (
//                 <div key={app.id} className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
//                   <div className="flex justify-between items-start mb-2">
//                     <h3 className="font-bold text-lg text-medical-dark">{app.patientName}</h3>
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
//                       {app.status}
//                     </span>
//                   </div>
//                   <p className="text-gray-600 text-sm mb-1"><span className="font-semibold">Date:</span> {app.date} at {app.time}</p>
//                   <p className="text-gray-600 text-sm mb-1"><span className="font-semibold">Doctor:</span> {app.doctorName}</p>
//                   {app.reason && <p className="text-gray-500 text-sm mt-2 italic">"{app.reason}"</p>}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }


// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';
// import SlotSelector from '../../components/SlotSelector';
// import MyAppointmentsList from '../../pages/user/UserMyAppointments';

// export default function UserBookAppointment() {
//   const [user, setUser] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [formData, setFormData] = useState({
//     hospitalId: '',
//     date: '',
//     time: '',
//     patientName: '',
//     patientPhone: '',
//     email: '',
//     reason: ''
//   });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       setUser(parsedUser);
//       // Prefill email from user data if available
//       setFormData((prev) => ({ ...prev, email: parsedUser.email || '' }));
//       fetchHospitals();
//       fetchAppointments(localStorage.getItem('token'));
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const fetchHospitals = async () => {
//     try {
//       const res = await fetch(`${API_URL}/api/hospitals`);
//       const data = await res.json();
//       setHospitals(data);
//     } catch (err) {
//       toast.error('Failed to load hospitals.');
//     }
//   };

//   const fetchAppointments = async (token) => {
//     try {
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setAppointments(data);
//       }
//     } catch (err) {
//       toast.error('Failed to load appointments.');
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // ─── Phone number: only digits, max 10 ───────────────────
//     if (name === 'patientPhone') {
//       const cleaned = value.replace(/\D/g, '').slice(0, 10);
//       setFormData({ ...formData, [name]: cleaned });
//       return;
//     }

//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // ─── Validation ───────────────────────────────────────────
//     if (!formData.hospitalId || !formData.date || !formData.time || !formData.patientName || !formData.patientPhone) {
//       return toast.error('Please fill all required fields');
//     }

//     // ─── Validate 10-digit phone ─────────────────────────────
//     if (!/^\d{10}$/.test(formData.patientPhone.trim())) {
//       return toast.error('Mobile number must be exactly 10 digits');
//     }

//     // ─── Validate email ──────────────────────────────────────
//     if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
//       return toast.error('Please enter a valid email address');
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           ...formData,
//           email: formData.email || user?.email || '' // Ensure email is sent
//         })
//       });
//       const data = await res.json();

//       if (res.ok) {
//         toast.success(data.message);
//         setAppointments([...appointments, data.appointment]);
//         setFormData({
//           hospitalId: '',
//           date: '',
//           time: '',
//           patientName: '',
//           patientPhone: '',
//           email: user?.email || '',
//           reason: ''
//         });
//       } else {
//         toast.error(data.message || 'Failed to book appointment');
//       }
//     } catch (error) {
//       toast.error('An error occurred');
//     }
//   };

//   return (
//     <DashboardLayout
//       title="User Dashboard"
//       subtitle="Book appointments, view your schedule, and stay connected with care."
//       user={user}
//       showHeader={false}
//     >
//       <DashboardTabs role="user" />
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* ─── Booking Form ───────────────────────────────────── */}
//         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Hospital */}
//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">
//                 Select Hospital <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="hospitalId"
//                 value={formData.hospitalId}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//               >
//                 <option value="">-- Choose Hospital --</option>
//                 {hospitals.map((h) => (
//                   <option key={h.id} value={h.id}>
//                     {h.name} - {h.location}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Date & Time */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-1">
//                   Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//                 />
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-1">
//                   Time <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="time"
//                   name="time"
//                   value={formData.time}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//                 />
//               </div>
//             </div>

//             {/* Slot Selector */}
//             {formData.date && (
//               <SlotSelector
//                 date={formData.date}
//                 hospitalId={formData.hospitalId}
//                 selectedTime={formData.time}
//                 onSelectTime={(slot) => setFormData((f) => ({ ...f, time: slot }))}
//               />
//             )}

//             {/* Patient Name */}
//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">
//                 Patient Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="patientName"
//                 value={formData.patientName}
//                 onChange={handleChange}
//                 required
//                 placeholder="John Doe"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//               />
//             </div>

//             {/* Phone Number */}
//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">
//                 Mobile Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 name="patientPhone"
//                 value={formData.patientPhone}
//                 onChange={handleChange}
//                 required
//                 maxLength={10}
//                 placeholder="9876543210"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//               />
//               <p className="text-xs text-gray-400 mt-1">Enter a 10-digit mobile number</p>
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">
//                 Email <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 placeholder="you@example.com"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//               />
//             </div>

//             {/* Reason */}
//             <div>
//               <label className="block text-gray-700 font-semibold mb-1">Reason for Visit</label>
//               <textarea
//                 name="reason"
//                 value={formData.reason}
//                 onChange={handleChange}
//                 rows="3"
//                 placeholder="Briefly describe your symptoms..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue"
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-medical-blue text-white font-bold py-3 rounded-lg hover:bg-medical-dark transition-colors mt-4 shadow-md"
//             >
//               Confirm Booking
//             </button>
//           </form>
//         </div>

//         {/* ─── My Appointments ────────────────────────────────── */}
//         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit">
//           <h2 className="text-2xl font-bold text-medical-dark mb-6 border-b pb-2">
//             My Appointments
//           </h2>
//           <MyAppointmentsList appointments={appointments} />
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }


import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import SlotSelector from '../../components/SlotSelector';
import Pagination from '../../components/Pagination';
import { 
  Calendar, 
  Clock, 
  Building2, 
  UserCheck, 
  Phone, 
  Mail, 
  FileText, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ListSkeleton } from '../../components/Loader';

const APPOINTMENTS_PER_PAGE = 3;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function UserBookAppointment() {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [formData, setFormData] = useState({
    hospitalId: '',
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    email: '',
    reason: ''
  });

  // ─── Pagination state ──────────────────────────────────────
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData((prev) => ({ ...prev, email: parsedUser.email || '' }));
      fetchHospitals();
      fetchAppointments(localStorage.getItem('token'));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(data);
    } catch (err) {
      toast.error('Failed to load hospitals.');
    }
  };

  const fetchAppointments = async (token) => {
    setLoadingAppointments(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      toast.error('Failed to load appointments.');
    }
    finally {
      setLoadingAppointments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientPhone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hospitalId || !formData.date || !formData.time || !formData.patientName || !formData.patientPhone) {
      return toast.error('Please fill all required fields');
    }

    if (!/^\d{10}$/.test(formData.patientPhone.trim())) {
      return toast.error('Mobile number must be exactly 10 digits');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return toast.error('Please enter a valid email address');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || user?.email || ''
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setAppointments([...appointments, data.appointment]);
        setFormData({
          hospitalId: '',
          date: '',
          time: '',
          patientName: '',
          patientPhone: '',
          email: user?.email || '',
          reason: ''
        });
        // Reset to page 1 on new booking to see the latest appointment
        setPage(1);
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // ─── Paginated appointments ──────────────────────────────
  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * APPOINTMENTS_PER_PAGE;
    return appointments.slice(start, start + APPOINTMENTS_PER_PAGE);
  }, [appointments, page]);

  const totalPages = Math.ceil(appointments.length / APPOINTMENTS_PER_PAGE);

  return (
    <DashboardLayout
      title="User Dashboard"
      subtitle="Book appointments, view your schedule, and stay connected with care."
      user={user}
      showHeader={false}
    >
      <DashboardTabs role="user" />

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Booking Form Panel (7 Cols) ─────────────────── */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-7 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Book New Appointment</h2>
                <p className="text-xs text-slate-400">Select a facility, date and available slot</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
              <Sparkles size={12} /> Instant Booking
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hospital Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Select Hospital <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">-- Choose Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} - {h.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Slot Selector */}
            {formData.date && (
              <div className="p-4 bg-blue-50/40 border border-blue-100/60 rounded-2xl">
                <SlotSelector
                  date={formData.date}
                  hospitalId={formData.hospitalId}
                  selectedTime={formData.time}
                  onSelectTime={(slot) => setFormData((f) => ({ ...f, time: slot }))}
                />
              </div>
            )}

            {/* Patient Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="tel"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">Exactly 10 digits required</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason for Visit</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Briefly describe your symptoms or reason..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 size={18} /> Confirm Booking
            </motion.button>
          </form>
        </motion.div>

        {/* ─── My Appointments Panel with Pagination (5 Cols) ─── */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                My Appointments
              </h2>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {appointments.length} Total
              </span>
            </div>

            {loadingAppointments ? (
              <ListSkeleton rows={3} />
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar size={28} />
                </div>
                <p className="text-slate-400 font-medium text-sm">No appointments booked yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {paginatedAppointments.map((app) => (
                    <motion.div
                      key={app.id || app._id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50/90 transition-all flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{app.patientName}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {app.date}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> {app.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-blue-600 mt-1.5 flex items-center gap-1">
                            <Building2 size={12} /> {app.hospitalName || app.hospital}
                          </p>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          app.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </div>
                      {app.reason && (
                        <p className="text-xs text-slate-600 italic bg-white/80 px-3 py-2 rounded-xl border border-slate-100">
                          "{app.reason}"
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
              <Pagination
                page={page}
                total={appointments.length}
                perPage={APPOINTMENTS_PER_PAGE}
                onChange={setPage}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}