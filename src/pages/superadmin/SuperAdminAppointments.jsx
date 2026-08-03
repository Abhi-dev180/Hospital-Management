// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { RefreshCw } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';

// const appointmentStatusOptions = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

// export default function SuperAdminAppointments() {
//   const [user, setUser] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       if (parsedUser.role !== 'superadmin') {
//         navigate('/');
//       } else {
//         setUser(parsedUser);
//         loadAppointments();
//       }
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const loadAppointments = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setAppointments(data);
//       } else {
//         toast.error(data.message || 'Unable to load appointments');
//       }
//     } catch (err) {
//       toast.error('Unable to load appointments.');
//     } finally {
//       setLoading(false);
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
//       setAppointments((prev) => prev.map((appointment) => appointment.id === id ? data.appointment || data : appointment));
//       toast.success('Appointment status updated');
//     } catch (err) {
//       toast.error('Unable to update appointment status.');
//     }
//   };

//   return (
//     <DashboardLayout title="Super Admin Dashboard" subtitle="System-wide overview and management." user={user} showHeader={false}>
//       <DashboardTabs role="superadmin" />
//       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
//         <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-6">
//           <button
//             type="button"
//             onClick={loadAppointments}
//             className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition"
//           >
//             <RefreshCw size={16} /> Refresh
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-medical-blue/10 text-medical-dark">
//                 <th className="py-3 px-4 font-semibold rounded-tl-lg">Patient</th>
//                 <th className="py-3 px-4 font-semibold">Hospital</th>
//                 <th className="py-3 px-4 font-semibold">Date</th>
//                 <th className="py-3 px-4 font-semibold">Time</th>
//                 <th className="py-3 px-4 font-semibold">Status</th>
//                 <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Update</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((appointment) => (
//                 <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                   <td className="py-4 px-4 font-medium text-medical-dark">{appointment.patientName}</td>
//                   <td className="py-4 px-4 text-gray-600">{appointment.hospitalId}</td>
//                   <td className="py-4 px-4 text-gray-600">{appointment.date}</td>
//                   <td className="py-4 px-4 text-gray-600">{appointment.time}</td>
//                   <td className="py-4 px-4">
//                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
//                       appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                       appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
//                       appointment.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
//                       appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {appointment.status}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4 text-right">
//                     <select
//                       value={appointment.status}
//                       onChange={(e) => changeAppointmentStatus(appointment.id, e.target.value)}
//                       className="px-3 py-2 border border-gray-300 rounded-full bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue"
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


// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { RefreshCw } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import DashboardLayout from '../../components/DashboardLayout';
// import DashboardTabs from '../../components/DashboardTabs';

// const appointmentStatusOptions = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
// const ITEMS_PER_PAGE = 6; // Add pagination constant

// export default function SuperAdminAppointments() {
//   const [user, setUser] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1); // Add page state
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const parsedUser = JSON.parse(userData);
//       if (parsedUser.role !== 'superadmin') {
//         navigate('/');
//       } else {
//         setUser(parsedUser);
//         loadAppointments();
//       }
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const loadAppointments = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setAppointments(Array.isArray(data) ? data : []);
//       } else {
//         toast.error(data.message || 'Unable to load appointments');
//       }
//     } catch (err) {
//       toast.error('Unable to load appointments.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const changeAppointmentStatus = async (id, status) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/appointments/${id}/status`, {
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
//       setAppointments((prev) => 
//         prev.map((appointment) => 
//           appointment.id === id ? { ...appointment, status: data.appointment?.status || status } : appointment
//         )
//       );
//       toast.success('Appointment status updated');
//     } catch (err) {
//       toast.error('Unable to update appointment status.');
//     }
//   };

//   // Pagination logic (same as Admin)
//   const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  
//   const paginatedAppointments = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return appointments.slice(start, start + ITEMS_PER_PAGE);
//   }, [appointments, currentPage]);

//   // Reset to first page when data changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [appointments.length]);

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'Pending': return 'bg-yellow-100 text-yellow-800';
//       case 'Confirmed': return 'bg-blue-100 text-blue-800';
//       case 'In Progress': return 'bg-purple-100 text-purple-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       case 'Cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <DashboardLayout 
//       title="Super Admin Dashboard" 
//       subtitle="System-wide overview and management." 
//       user={user} 
//       showHeader={false}
//     >
//       <DashboardTabs role="superadmin" />
//       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
//           <div className="text-sm text-gray-600">
//             Showing {paginatedAppointments.length} of {appointments.length} appointments
//           </div>
//           <button
//             type="button"
//             onClick={loadAppointments}
//             disabled={loading}
//             className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition disabled:opacity-50"
//           >
//             <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
//             {loading ? 'Loading...' : 'Refresh'}
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center py-12">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-medical-blue border-t-transparent"></div>
//             <p className="mt-2 text-gray-500">Loading appointments...</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-medical-blue/10 text-medical-dark">
//                     <th className="py-3 px-4 font-semibold rounded-tl-lg">Patient</th>
//                     <th className="py-3 px-4 font-semibold">Hospital</th>
//                     <th className="py-3 px-4 font-semibold">Date</th>
//                     <th className="py-3 px-4 font-semibold">Time</th>
//                     <th className="py-3 px-4 font-semibold">Status</th>
//                     <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Update</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedAppointments.length === 0 ? (
//                     <tr>
//                       <td colSpan="6" className="py-8 text-center text-gray-500 italic">
//                         No appointments found.
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedAppointments.map((appointment) => (
//                       <tr 
//                         key={appointment.id} 
//                         className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="py-4 px-4 font-medium text-medical-dark">
//                           {appointment.patientName}
//                         </td>
//                         <td className="py-4 px-4 text-gray-600">
//                           {appointment.hospitalName || appointment.hospitalId || '-'}
//                         </td>
//                         <td className="py-4 px-4 text-gray-600">
//                           {appointment.date || '-'}
//                         </td>
//                         <td className="py-4 px-4 text-gray-600">
//                           {appointment.time || '-'}
//                         </td>
//                         <td className="py-4 px-4">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(appointment.status)}`}>
//                             {appointment.status}
//                           </span>
//                         </td>
//                         <td className="py-4 px-4 text-right">
//                           <select
//                             value={appointment.status}
//                             onChange={(e) => changeAppointmentStatus(appointment.id, e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-full bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue"
//                           >
//                             {appointmentStatusOptions.map((status) => (
//                               <option key={status} value={status}>{status}</option>
//                             ))}
//                           </select>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination Controls */}
//             {totalPages > 1 && (
//               <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                   className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
//                       currentPage === page
//                         ? 'bg-medical-blue text-white shadow-sm'
//                         : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ))}

//                 <button
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage === totalPages}
//                   className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }




import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Pencil, Trash2, X, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardTabs from '../../components/DashboardTabs';
import { TableSkeleton } from '../../components/Loader';

const appointmentStatusOptions = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
const ITEMS_PER_PAGE = 6;

export default function SuperAdminAppointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    date: '',
    time: '',
    reason: '',
    status: 'Pending',
    hospitalId: '',
    doctorName: 'Any Available Doctor'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'superadmin') {
        navigate('/');
      } else {
        setUser(parsedUser);
        loadAppointments();
        loadHospitals();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        toast.error(data.message || 'Unable to load appointments');
      }
    } catch (err) {
      toast.error('Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      if (res.ok) setHospitals(Array.isArray(data) ? data : []);
    } catch { /* non-blocking */ }
  };

  const changeAppointmentStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${id}/status`, {
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
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: data.appointment?.status || status }
            : appointment
        )
      );
      toast.success('Appointment status updated');
    } catch (err) {
      toast.error('Unable to update appointment status.');
    }
  };

  // Delete appointment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Failed to delete appointment');
      }
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      toast.error('Unable to delete appointment.');
    }
  };

  // Edit – open modal
  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientName: appointment.patientName || '',
      patientPhone: appointment.patientPhone || '',
      date: appointment.date || '',
      time: appointment.time || '',
      reason: appointment.reason || '',
      status: appointment.status || 'Pending',
      hospitalId: appointment.hospitalId || '',
      doctorName: appointment.doctorName || 'Any Available Doctor'
    });
    setEditModal(true);
  };

  // Update appointment (PUT /api/appointments/:id)
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientPhone) {
      return toast.error('Patient name and phone are required');
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Failed to update appointment');
      }
      // Update the appointment in the list
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppointment.id
            ? { ...item, ...data.appointment }
            : item
        )
      );
      toast.success('Appointment updated successfully');
      setEditModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      toast.error('Error updating appointment');
    } finally {
      setSaving(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return appointments.slice(start, start + ITEMS_PER_PAGE);
  }, [appointments, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appointments.length]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      subtitle="System-wide overview and management."
      user={user}
      showHeader={false}
    >
      <DashboardTabs role="superadmin" />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="text-sm text-gray-600">
            Showing {paginatedAppointments.length} of {appointments.length} appointments
          </div>
          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-medical-blue/10 text-medical-dark">
                    <th className="py-3 px-4 font-semibold rounded-tl-lg">Patient</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Hospital</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500 italic">
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-medical-dark">
                          {appointment.patientName}
                          {appointment.patientPhone && (
                            <span className="block text-xs font-normal text-gray-400 mt-0.5">
                              {appointment.patientPhone}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {/* Public bookings carry the email inline; dashboard bookings resolve it from the user record. */}
                          {appointment.email ? (
                            <a
                              href={`mailto:${appointment.email}`}
                              className="text-medical-blue hover:underline break-all text-sm"
                              title={appointment.email}
                            >
                              {appointment.email}
                            </a>
                          ) : (
                            <span className="text-xs italic text-gray-400">Not provided</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {appointment.hospitalName || appointment.hospital || appointment.hospitalId || '-'}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{appointment.date || '-'}</td>
                        <td className="py-4 px-4 text-gray-600">{appointment.time || '-'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={appointment.status}
                              onChange={(e) => changeAppointmentStatus(appointment.id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-full bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue"
                            >
                              {appointmentStatusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleEditClick(appointment)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(appointment.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-800">Edit Appointment</h2>
              <button
                onClick={() => {
                  setEditModal(false);
                  setSelectedAppointment(null);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, patientPhone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Hospital</label>
                  <select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hospitalId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select hospital</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {appointmentStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Doctor Name</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, doctorName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Reason</label>
                  <textarea
                    rows="4"
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Update Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}