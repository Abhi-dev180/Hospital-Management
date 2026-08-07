// // src/pages/profile/ProfilePage.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import {
//   User, Mail, Phone, Building2, Shield, Save, Loader2, ArrowLeft, CheckCircle2
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import PortalCardPage from '../../components/portal/PortalCardPage';

// export default function ProfilePage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [user, setUser] = useState(null);
//   const [form, setForm] = useState({ name: '', email: '', phone: '' });

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (!userData) {
//       navigate('/login');
//       return;
//     }
//     const parsed = JSON.parse(userData);
//     setUser(parsed);
//     setForm({
//       name: parsed.name || '',
//       email: parsed.email || '',
//       phone: parsed.phone || ''
      
//     });
//     setLoading(false);
//   }, [navigate]);

//   const update = (k) => (e) => {
//     setForm((f) => ({ ...f, [k]: e.target.value }));
//     setSaved(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/users/profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(form)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Update failed');

//       const updatedUser = { ...user, ...data.user };
//       localStorage.setItem('user', JSON.stringify(updatedUser));
//       setUser(updatedUser);
//       window.dispatchEvent(new Event('storage'));

//       setSaved(true);
//       toast.success('Profile updated successfully');
//     } catch (err) {
//       toast.error(err.message || 'Could not update profile');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <PortalCardPage>
//         <div className="py-16 flex justify-center">
//           <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
//         </div>
//       </PortalCardPage>
//     );
//   }

//   const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

//   return (
//     <PortalCardPage
//       icon={User}
//       title="My Profile"
//       subtitle="View and update your account details anytime."
//       wide
//     >
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-medical-blue transition-colors"
//       >
//         <ArrowLeft className="w-4 h-4" /> Back
//       </button>

//       {saved && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
//         >
//           <CheckCircle2 className="w-4 h-4" /> Profile saved successfully.
//         </motion.div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-5">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="sm:col-span-2">
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <User className="w-4 h-4 text-medical-blue" /> Full Name
//               </span>
//               <input
//                 value={form.name}
//                 onChange={update('name')}
//                 className="portal-input w-full"
//                 placeholder="Dr. Jane Doe"
//                 required
//               />
//             </label>
//           </div>

//           <div className="sm:col-span-2">
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <Mail className="w-4 h-4 text-medical-blue" /> Email
//               </span>
//               <input
//                 type="email"
//                 value={form.email}
//                 onChange={update('email')}
//                 className="portal-input w-full"
//                 required
//               />
//             </label>
//           </div>

//           <div>
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <Phone className="w-4 h-4 text-medical-blue" /> Phone
//               </span>
//               <input
//                 value={form.phone}
//                 onChange={update('phone')}
//                 className="portal-input w-full"
//                 placeholder="9876543210"
//               />
//             </label>
//           </div>

//           <div>
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <Shield className="w-4 h-4 text-medical-blue" /> Role
//               </span>
//               <input
//                 value={user?.role || ''}
//                 disabled
//                 className="portal-input w-full bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
//               />
//             </label>
//           </div>

//           {isAdminOrSuper && (
//             <div className="sm:col-span-2">
//               <label className="block">
//                 {/* <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                   <Building2 className="w-4 h-4 text-medical-blue" /> Hospital
//                 </span> */}
               
//               </label>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-3 pt-2">
//           <button
//             type="submit"
//             disabled={saving}
//             className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue disabled:opacity-60 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all"
//           >
//             {saving ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Save className="w-4 h-4" />
//             )}
//             {saving ? 'Saving…' : 'Save Changes'}
//           </button>
//         </div>
//       </form>
//     </PortalCardPage>
//   );
// }


// // src/pages/profile/ProfilePage.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import {
//   User, Mail, Phone, Building2, Shield, Save, Loader2, ArrowLeft, CheckCircle2, Key
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import API_URL from '../../config/api';
// import PortalCardPage from '../../components/portal/PortalCardPage';

// export default function ProfilePage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [user, setUser] = useState(null);
//   const [form, setForm] = useState({ name: '', email: '', mobile: '', hospital: '' });
//   const [originalEmail, setOriginalEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [showOtpInput, setShowOtpInput] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (!userData) {
//       navigate('/login');
//       return;
//     }
//     const parsed = JSON.parse(userData);
//     setUser(parsed);
//     setOriginalEmail(parsed.email || '');
//     setForm({
//       name: parsed.name || '',
//       email: parsed.email || '',
//       mobile: parsed.mobile || '',
//       hospital: parsed.hospital || ''
//     });
//     setLoading(false);
//   }, [navigate]);

//   const update = (k) => (e) => {
//     setForm((f) => ({ ...f, [k]: e.target.value }));
//     setSaved(false);
//     // If email changes, reset OTP states
//     if (k === 'email') {
//       setOtpSent(false);
//       setOtpVerified(false);
//       setShowOtpInput(false);
//       setOtp('');
//     }
//   };

//   const handleSendOtp = async () => {
//     if (form.email === originalEmail) {
//       // No change, we can submit directly
//       handleSubmit({ preventDefault: () => {} });
//       return;
//     }

//     try {
//       setSaving(true);
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_URL}/api/users/send-otp`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ email: form.email })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

//       setOtpSent(true);
//       setShowOtpInput(true);
//       toast.success('OTP sent to your new email address');
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       // If email changed and OTP not sent yet, send OTP first
//       if (form.email !== originalEmail && !otpSent) {
//         await handleSendOtp();
//         return; // exit, OTP will be sent
//       }

//       // If email changed and OTP sent but not verified, we should verify
//       if (form.email !== originalEmail && otpSent && !otpVerified) {
//         // OTP will be verified in the profile update call
//         // We'll include otp in the request
//       }

//       const token = localStorage.getItem('token');
//       const payload = {
//         name: form.name,
//         mobile: form.mobile,
//         hospital: form.hospital,
//       };

//       // If email changed, include email and otp
//       if (form.email !== originalEmail) {
//         if (!otp) {
//           toast.error('Please enter the OTP sent to your new email');
//           setSaving(false);
//           return;
//         }
//         payload.email = form.email;
//         payload.otp = otp;
//       }

//       const res = await fetch(`${API_URL}/api/users/profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Update failed');

//       const updatedUser = { ...user, ...data.user };
//       localStorage.setItem('user', JSON.stringify(updatedUser));
//       setUser(updatedUser);
//       setOriginalEmail(updatedUser.email);
//       setOtpSent(false);
//       setOtpVerified(false);
//       setShowOtpInput(false);
//       setOtp('');
//       window.dispatchEvent(new Event('storage'));

//       setSaved(true);
//       toast.success('Profile updated successfully');
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <PortalCardPage>
//         <div className="py-16 flex justify-center">
//           <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
//         </div>
//       </PortalCardPage>
//     );
//   }

//   const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

//   return (
//     <PortalCardPage
//       icon={User}
//       title="My Profile"
//       subtitle="View and update your account details anytime."
//       wide
//     >
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-medical-blue transition-colors"
//       >
//         <ArrowLeft className="w-4 h-4" /> Back
//       </button>

//       {saved && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
//         >
//           <CheckCircle2 className="w-4 h-4" /> Profile saved successfully.
//         </motion.div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-5">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="sm:col-span-2">
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <User className="w-4 h-4 text-medical-blue" /> Full Name
//               </span>
//               <input
//                 value={form.name || ''}
//                 onChange={update('name')}
//                 className="portal-input w-full"
//                 placeholder="Dr. Jane Doe"
//                 required
//               />
//             </label>
//           </div>

//           <div className="sm:col-span-2">
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <Mail className="w-4 h-4 text-medical-blue" /> Email
//               </span>
//               <div className="flex gap-2 items-center">
//                 <input
//                   type="email"
//                   value={form.email || ''}
//                   onChange={update('email')}
//                   className="portal-input w-full"
//                   required
//                 />
//                 {form.email !== originalEmail && !otpSent && (
//                   <button
//                     type="button"
//                     onClick={handleSendOtp}
//                     className="shrink-0 px-4 py-2 bg-medical-blue text-white rounded-lg text-sm font-medium hover:bg-medical-dark transition"
//                   >
//                     Send OTP
//                   </button>
//                 )}
//               </div>
//             </label>
//           </div>

//           {showOtpInput && (
//             <div className="sm:col-span-2">
//               <label className="block">
//                 <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                   <Key className="w-4 h-4 text-medical-blue" /> OTP (sent to new email)
//                 </span>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   className="portal-input w-full"
//                   placeholder="Enter 4-digit OTP"
//                   maxLength={4}
//                   required
//                 />
//                 <p className="text-xs text-gray-400 mt-1">Enter the OTP sent to your new email address.</p>
//               </label>
//             </div>
//           )}

//           <div>
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <Phone className="w-4 h-4 text-medical-blue" /> Mobile
//               </span>
//               <input
//                 value={form.mobile || ''}
//                 onChange={update('mobile')}
//                 className="portal-input w-full"
//                 placeholder="9876543210"
//               />
//             </label>
//           </div>

//           <div>
//             <label className="block">
//               <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                 <Shield className="w-4 h-4 text-medical-blue" /> Role
//               </span>
//               <input
//                 value={user?.role || ''}
//                 disabled
//                 className="portal-input w-full bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
//               />
//             </label>
//           </div>

//           {isAdminOrSuper && (
//             <div className="sm:col-span-2">
//               <label className="block">
//                 <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
//                   <Building2 className="w-4 h-4 text-medical-blue" /> Hospital
//                 </span>
//                 <input
//                   value={form.hospital || ''}
//                   onChange={update('hospital')}
//                   className="portal-input w-full"
//                   placeholder="Happy Paws Veterinary"
//                 />
//               </label>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-3 pt-2">
//           <button
//             type="submit"
//             disabled={saving}
//             className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue disabled:opacity-60 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all"
//           >
//             {saving ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Save className="w-4 h-4" />
//             )}
//             {saving ? 'Saving…' : 'Save Changes'}
//           </button>
//         </div>
//       </form>
//     </PortalCardPage>
//   );
// }


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield, Save, Loader2, ArrowLeft, CheckCircle2,
  Key, Send, Check, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import PortalCardPage from '../../components/portal/PortalCardPage';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', hospital: '' });
  const [originalEmail, setOriginalEmail] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Password change state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Eye toggles for password fields
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    setOriginalEmail(parsed.email || '');
    setForm({
      name: parsed.name || '',
      email: parsed.email || '',
      mobile: parsed.mobile || '',
      hospital: parsed.hospital || ''
    });
    setLoading(false);
  }, [navigate]);

  const update = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
    setSaved(false);
    if (k === 'email') {
      setEmailChanged(val !== originalEmail);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
    }
  };

  const handleSendOtp = async () => {
    if (!form.email || form.email === originalEmail) {
      toast.error('Email not changed');
      return;
    }
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setOtpSent(true);
      toast.success('OTP sent to your new email');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP');
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      setOtpVerified(true);
      toast.success('OTP verified');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailChanged && !otpVerified) {
      toast.error('Please verify your new email with OTP');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        mobile: form.mobile,
      };
        if (emailChanged) {
          payload.email = form.email;
          payload.otpVerified = otpVerified;
        };
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setOriginalEmail(updatedUser.email);
      setEmailChanged(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setSaved(true);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalCardPage>
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
        </div>
      </PortalCardPage>
    );
  }

  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <PortalCardPage
      icon={User}
      title="My Profile"
      subtitle="View and update your account details anytime."
      wide
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-medical-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
        >
          <CheckCircle2 className="w-4 h-4" /> Profile saved successfully.
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <User className="w-4 h-4 text-medical-blue" /> Full Name
              </span>
              <input
                value={form.name}
                onChange={update('name')}
                className="portal-input w-full"
                placeholder="Dr. Jane Doe"
                required
              />
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <Mail className="w-4 h-4 text-medical-blue" /> Email
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  className="portal-input w-full"
                  required
                />
                {emailChanged && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || otpVerified}
                    className="px-4 py-2 bg-medical-blue text-white rounded-lg text-sm font-semibold hover:bg-medical-dark transition disabled:opacity-60 flex items-center gap-1"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {otpVerified ? 'Verified' : 'Send OTP'}
                  </button>
                )}
              </div>
              {emailChanged && !otpVerified && otpSent && (
                <div className="mt-2 flex gap-2 items-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="portal-input w-32"
                    maxLength="4"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpVerified}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-1"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Verify
                  </button>
                </div>
              )}
              {emailChanged && otpVerified && (
                <p className="text-xs text-green-600 mt-1">✓ Email verified</p>
              )}
            </label>
          </div>

          <div>
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 text-medical-blue" /> Mobile
              </span>
              <input
                value={form.mobile}
                onChange={update('mobile')}
                className="portal-input w-full"
                placeholder="9876543210"
              />
            </label>
          </div>

          <div>
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <Shield className="w-4 h-4 text-medical-blue" /> Role
              </span>
              <input
                value={user?.role || ''}
                disabled
                className="portal-input w-full bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
              />
            </label>
          </div>

          {isAdminOrSuper && (
            <div className="sm:col-span-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <Building2 className="w-4 h-4 text-medical-blue" /> Hospital
                </span>
                <input
                  value={form.hospital || 'Not assigned'}
                  disabled
                  className="portal-input w-full bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Hospital cannot be changed.</p>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue disabled:opacity-60 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* ─── Change Password Section ────────────────────────── */}
      <div className="mt-8 border-t pt-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm font-semibold text-medical-blue hover:underline"
        >
          <Key className="w-4 h-4" /> {showPassword ? 'Hide' : 'Change Password'}
        </button>
        {showPassword && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="portal-input w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="portal-input w-full pr-10"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="portal-input w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full shadow transition disabled:opacity-60"
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {passwordLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </PortalCardPage>
  );
}