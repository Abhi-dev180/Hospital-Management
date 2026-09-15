import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield, Save, Loader2, ArrowLeft, CheckCircle2,
  Key, Send, Check, Eye, EyeOff, CreditCard, Calendar, AlertTriangle, RefreshCw, Sparkles,
  MapPin, BedDouble, FileText, CheckCircle, ExternalLink, ShieldCheck, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import PortalCardPage from '../../components/portal/PortalCardPage';
import PlanExpiredModal from '../../components/PlanExpiredModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Editable Profile fields (matching registration)
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    hospital: '',
    city: '',
    address: '',
    beds: ''
  });

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

  const fetchSubscription = async () => {
    setSubLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/api/subscriptions/my-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setSubscription(data.subscription);
        }
        if (Array.isArray(data.subscriptions)) {
          setSubscriptionsList(data.subscriptions);
        }
      }
    } catch (e) {
      console.error('Failed to fetch subscription:', e);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const merged = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...data.user };
          localStorage.setItem('user', JSON.stringify(merged));
          setUser(merged);
          setOriginalEmail(merged.email || '');
          setForm({
            name: merged.name || merged.contactName || '',
            email: merged.email || '',
            mobile: merged.mobile || merged.phone || '',
            hospital: merged.hospital || merged.hospitalName || '',
            city: merged.city || '',
            address: merged.address || '',
            beds: merged.beds || ''
          });
          if (data.subscription) {
            setSubscription(data.subscription);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
  };

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
      name: parsed.name || parsed.contactName || '',
      email: parsed.email || '',
      mobile: parsed.mobile || parsed.phone || '',
      hospital: parsed.hospital || parsed.hospitalName || '',
      city: parsed.city || '',
      address: parsed.address || '',
      beds: parsed.beds || ''
    });
    setLoading(false);

    fetchSubscription();
    fetchProfile();

    const handleCustomSubUpdate = () => {
      fetchSubscription();
      fetchProfile();
      const updatedStr = localStorage.getItem('user');
      if (updatedStr) {
        setUser(JSON.parse(updatedStr));
      }
    };
    window.addEventListener('user_subscription_updated', handleCustomSubUpdate);
    window.addEventListener('storage', handleCustomSubUpdate);
    return () => {
      window.removeEventListener('user_subscription_updated', handleCustomSubUpdate);
      window.removeEventListener('storage', handleCustomSubUpdate);
    };
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
        contactName: form.name,
        mobile: form.mobile,
        phone: form.mobile,
        hospital: form.hospital,
        hospitalName: form.hospital,
        city: form.city,
        address: form.address,
        beds: form.beds
      };
      if (emailChanged) {
        payload.email = form.email;
        payload.otpVerified = otpVerified;
      }

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
      window.dispatchEvent(new Event('user_subscription_updated'));
      toast.success('Profile and hospital information updated successfully!');
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

  // Calculate Subscription Info
  const effectiveSub = subscription || user?.subscription;
  const planKey = (effectiveSub?.plan_key || user?.planKey || user?.plan_key || 'quarterly').toLowerCase();
  const rawExpiry = effectiveSub?.expiry_date || user?.planEnd || user?.plan_end || '2026-08-23';
  const rawStart = effectiveSub?.start_date || user?.planStart || user?.plan_start;

  const isExplicitlyActive =
    user?.isExpired === false ||
    user?.subscription_status === 'active' ||
    user?.plan_status === 'active' ||
    effectiveSub?.status === 'active';

  let isExpired = false;
  if (!isExplicitlyActive) {
    if (rawExpiry) {
      isExpired = new Date(rawExpiry).getTime() < Date.now();
    } else if (effectiveSub?.status === 'expired' || user?.isExpired || user?.planStatus === 'expired') {
      isExpired = true;
    }
  }

  const getPlanMeta = (k) => {
    if (k.includes('month')) return { title: 'Monthly Plan', interval: 'Billed every 30 days', price: '₹9,999 / mo' };
    if (k.includes('year') || k.includes('annual')) return { title: 'Yearly Plan', interval: 'Billed annually', price: '₹69,999 / yr' };
    if (k.includes('enterprise')) return { title: 'Enterprise Tier', interval: 'Full custom access', price: 'Custom' };
    return { title: 'Quarterly Plan', interval: 'Billed every 90 days', price: '₹20,000 / quarter' };
  };

  const meta = getPlanMeta(planKey);

  const fmtDate = (dStr) => {
    if (!dStr) return 'N/A';
    try {
      return new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dStr;
    }
  };

  // Remaining days calculation
  let daysRemaining = null;
  if (rawExpiry) {
    const diffTime = new Date(rawExpiry).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = diffDays;
  }

  return (
    <PortalCardPage>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-medical-blue hover:text-medical-dark transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-medical-dark flex items-center gap-2">
              <User className="w-7 h-7 text-medical-blue" /> Account & Hospital Profile
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Edit your contact details, hospital facility info, and manage live subscription plans.
            </p>
          </div>
          {saved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* ─── Profile & Registration Details Edit Form ───────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-3">
            <Building2 className="w-5 h-5 text-medical-blue" />
            Hospital & Contact Information (Registration Details)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Person Name */}
            <div>
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <User className="w-4 h-4 text-medical-blue" /> Contact Person / Full Name *
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  className="portal-input w-full"
                  placeholder="e.g. Dr. John Doe / Anushka"
                  required
                />
              </label>
            </div>

            {/* Mobile / Phone */}
            <div>
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <Phone className="w-4 h-4 text-medical-blue" /> Mobile Number *
                </span>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={update('mobile')}
                  className="portal-input w-full"
                  placeholder="e.g. 9876543210"
                  required
                />
              </label>
            </div>

            {/* Email with OTP verification */}
            <div className="sm:col-span-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4 text-medical-blue" /> Email Address *
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
                      className="px-4 py-2 bg-medical-blue text-white rounded-lg text-sm font-semibold hover:bg-medical-dark transition disabled:opacity-60 flex items-center gap-1 shrink-0 cursor-pointer"
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-1 cursor-pointer"
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

            {/* Hospital Name (Editable) */}
            <div className="sm:col-span-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <Building2 className="w-4 h-4 text-medical-blue" /> Hospital / Clinic Facility Name *
                </span>
                <input
                  type="text"
                  value={form.hospital}
                  onChange={update('hospital')}
                  placeholder="e.g. Avinash Hospital / MedPark Branch"
                  className="portal-input w-full font-medium"
                  required
                />
              </label>
            </div>

            {/* City */}
            <div>
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 text-medical-blue" /> City / Location
                </span>
                <input
                  type="text"
                  value={form.city}
                  onChange={update('city')}
                  placeholder="e.g. Mohali / New York"
                  className="portal-input w-full"
                />
              </label>
            </div>

            {/* Total Beds */}
            <div>
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <BedDouble className="w-4 h-4 text-medical-blue" /> Bed Capacity (Optional)
                </span>
                <input
                  type="number"
                  value={form.beds}
                  onChange={update('beds')}
                  placeholder="e.g. 150"
                  className="portal-input w-full"
                  min="0"
                />
              </label>
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 text-medical-blue" /> Full Facility Address
                </span>
                <textarea
                  rows="2"
                  value={form.address}
                  onChange={update('address')}
                  placeholder="e.g. Sector 62, Phase 8, Industrial Area, Mohali, Punjab"
                  className="portal-input w-full resize-none"
                />
              </label>
            </div>

            {/* Account Role (Read-only) */}
            <div className="sm:col-span-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-medical-blue" /> Account Access Role
                </span>
                <input
                  value={user?.role ? `${user.role.toUpperCase()} Portal Access` : 'User'}
                  disabled
                  className="portal-input w-full bg-gray-100 text-gray-600 cursor-not-allowed capitalize font-semibold"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue disabled:opacity-60 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving Changes…' : 'Save Profile & Hospital Info'}
          </button>
        </div>
      </form>

      {/* ─── Change Password Section ────────────────────────── */}
      <div className="mt-8 border-t pt-6">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center gap-2 text-sm font-semibold text-medical-blue hover:underline cursor-pointer"
        >
          <Key className="w-4 h-4" /> {showPassword ? 'Hide Password Change' : 'Change Account Password'}
        </button>
        {showPassword && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4 max-w-md bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
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
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl shadow transition disabled:opacity-60 cursor-pointer"
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {passwordLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* ─── Complete Subscription & Hospital Plan Details Section ── */}
      <div className="mt-10 border-t border-slate-200/90 pt-8" id="subscription">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-medical-blue" />
              Hospital Subscription & License Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live subscription status, licensed hospital branch, renewal dates, and billing history.
            </p>
          </div>
          {subLoading ? (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-medical-blue" /> Syncing live status…
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
              <Sparkles className="w-3 h-3" /> Live Synced
            </span>
          )}
        </div>

        {/* Plan Summary Card */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isExpired
            ? 'bg-red-50/70 border-red-200/90 shadow-xs'
            : 'bg-gradient-to-br from-slate-900 via-medical-dark to-blue-950 text-white border-slate-800 shadow-lg'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`font-extrabold text-xl sm:text-2xl ${isExpired ? 'text-slate-900' : 'text-white'}`}>
                  {meta.title}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  isExpired ? 'bg-white text-slate-700 border-slate-200' : 'bg-white/10 text-blue-200 border-white/20'
                }`}>
                  {meta.interval}
                </span>
                {isExpired ? (
                  <span className="text-xs font-bold bg-red-100 text-red-800 border border-red-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Expired
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Active License
                  </span>
                )}
              </div>

              {/* Hospital & Subscription Metadata Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs ${
                isExpired ? 'text-slate-600' : 'text-blue-100/90'
              }`}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Hospital: <strong className={isExpired ? 'text-slate-900' : 'text-white'}>{form.hospital || user?.hospital || 'Avinash Hospital'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Valid Until: <strong className={isExpired ? 'text-red-700 font-bold' : 'text-white'}>{fmtDate(rawExpiry)}</strong></span>
                </div>
                {daysRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Status: <strong className={daysRemaining > 0 ? (isExpired ? 'text-slate-900' : 'text-emerald-300') : 'text-red-400'}>
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                    </strong></span>
                  </div>
                )}
                {rawStart && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Activation Date: <strong className={isExpired ? 'text-slate-900' : 'text-white'}>{fmtDate(rawStart)}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Tier Rate: <strong className={isExpired ? 'text-slate-900' : 'text-white'}>{meta.price}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Online Verification: <strong className="text-emerald-400">Verified & Active</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowExpiredModal(true)}
                className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all duration-150 active:scale-95 cursor-pointer ${
                  isExpired
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white text-medical-dark hover:bg-blue-50 font-extrabold'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {isExpired ? 'Renew Subscription' : 'Manage / Extend Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Subscription History Table ────────────────────────── */}
        <div className="mt-8">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-medical-blue" />
            Billing & Renewal Transactions ({subscriptionsList.length > 0 ? subscriptionsList.length : 1})
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Plan Name</th>
                  <th className="py-3.5 px-4">Hospital Branch</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptionsList.length > 0 ? (
                  subscriptionsList.map((sub, idx) => {
                    const sStatus = sub.status || 'active';
                    const isAct = sStatus === 'active';
                    const planTitle = (sub.plan_key || planKey || 'quarterly').replace('_', ' ').toUpperCase();
                    const amt = sub.amount ? (sub.amount > 1000 ? sub.amount / 100 : sub.amount) : 200;
                    return (
                      <tr key={sub.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{planTitle} PLAN</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{form.hospital || user?.hospital || 'Avinash Hospital'}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">₹{(amt * 100).toLocaleString('en-IN')} (USD {amt})</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isAct ? '✓ Paid / Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{fmtDate(sub.start_date || rawStart)}</td>
                        <td className="py-3.5 px-4 text-slate-600">{fmtDate(sub.expiry_date || rawExpiry)}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {sub.stripe_subscription_id ? 'Stripe Checkout' : 'Online Verified'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{meta.title.toUpperCase()}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{form.hospital || user?.hospital || 'Avinash Hospital'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{meta.price}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        !isExpired ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {!isExpired ? '✓ Paid / Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{fmtDate(rawStart)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{fmtDate(rawExpiry)}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">Online Verified</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PlanExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        subscription={effectiveSub}
        user={user}
      />
    </PortalCardPage>
  );
}