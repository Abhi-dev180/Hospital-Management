import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield, Save, Loader2, ArrowLeft, CheckCircle2,
  Key, Send, Check, Eye, EyeOff, CreditCard, Calendar, AlertTriangle, RefreshCw, Sparkles
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
  const [subLoading, setSubLoading] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
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

    // Fetch subscription details from backend
    const fetchSubscription = async () => {
      setSubLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/subscriptions/my-subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.subscription) {
            setSubscription(data.subscription);
          }
        }
      } catch (e) {
        console.error('Failed to fetch subscription:', e);
      } finally {
        setSubLoading(false);
      }
    };

    fetchSubscription();
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

      {/* ─── Subscription & Plan Details Section ────────────────── */}
      <div className="mt-8 border-t border-slate-200/80 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-medical-blue" />
            Subscription & Plan Details
          </h3>
          {subLoading ? (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading backend details…
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sync Backend Live
            </span>
          )}
        </div>

        {(() => {
          const effectiveSub = subscription || user?.subscription;
          const planKey = (effectiveSub?.plan_key || user?.planKey || user?.plan_key || 'quarterly').toLowerCase();
          const rawExpiry = effectiveSub?.expiry_date || user?.planEnd || user?.plan_end || '2026-08-23';
          const rawStart = effectiveSub?.start_date || user?.planStart || user?.plan_start;
          
          let isExpired = false;
          if (rawExpiry) {
            isExpired = new Date(rawExpiry).getTime() < Date.now();
          } else if (effectiveSub?.status === 'expired' || user?.isExpired || user?.planStatus === 'expired') {
            isExpired = true;
          }

          const getPlanMeta = (k) => {
            if (k.includes('month')) return { title: 'Monthly Plan', interval: 'billed every 30 days' };
            if (k.includes('year') || k.includes('annual')) return { title: 'Yearly Plan', interval: 'billed every 365 days' };
            return { title: 'Quarterly Plan', interval: 'billed every 90 days' };
          };

          const meta = getPlanMeta(planKey);

          const fmtDate = (dStr) => {
            if (!dStr) return 'N/A';
            try {
              return new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } catch (e) { return dStr; }
          };

          return (
            <div className={`p-5 rounded-2xl border transition-all ${
              isExpired
                ? 'bg-red-50/60 border-red-200/80 shadow-xs'
                : 'bg-gradient-to-br from-slate-50 to-blue-50/40 border-slate-200/80'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-lg">{meta.title}</span>
                    <span className="text-xs text-slate-500 font-medium bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {meta.interval}
                    </span>
                    {isExpired ? (
                      <span className="text-xs font-bold bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> Expired
                      </span>
                    ) : (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ✓ Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    {rawStart && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Started: <strong className="text-slate-800">{fmtDate(rawStart)}</strong>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Expires: <strong className={isExpired ? 'text-red-700 font-bold' : 'text-slate-800'}>{fmtDate(rawExpiry)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setShowExpiredModal(true)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                      isExpired
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                    {isExpired ? 'Renew Subscription' : 'View Plan Expiry Notice'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Plan Expired Modal Trigger */}
      <PlanExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        subscription={subscription || user?.subscription}
        user={user}
      />
    </PortalCardPage>
  );
}