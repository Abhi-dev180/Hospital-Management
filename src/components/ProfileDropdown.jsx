import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LogOut, Settings, Shield, Building2, CreditCard,
  Calendar, ChevronDown, CheckCircle2, AlertTriangle, Sparkles,
  LayoutDashboard, ArrowRight, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

export default function ProfileDropdown({ user: initialUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  // Sync user state from props and localStorage
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Fetch live user profile and subscription details from backend
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoadingSub(true);

      const [userRes, subRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/subscriptions/my-subscriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (userRes.status === 'fulfilled') {
        if (userRes.value.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          onLogout?.();
          return;
        }
        if (userRes.value.ok) {
          const uData = await userRes.value.json();
          if (uData.user) {
            setUser((prev) => {
              const merged = { ...prev, ...uData.user };
              try {
                localStorage.setItem('user', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
            if (uData.subscription) {
              setSubscription(uData.subscription);
            }
          }
        }
      }

      if (subRes.status === 'fulfilled') {
        if (subRes.value.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          onLogout?.();
          return;
        }
        if (subRes.value.ok) {
          const sData = await subRes.value.json();
          if (sData.subscription) {
            setSubscription(sData.subscription);
          }
        }
      }
    } catch (e) {
      console.debug('Failed to fetch user/subscription in dropdown:', e);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    const syncUserState = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (_) {}
    };

    fetchUserData();
    window.addEventListener('storage', syncUserState);
    window.addEventListener('user_subscription_updated', () => {
      syncUserState();
      fetchUserData();
    });

    return () => {
      window.removeEventListener('storage', syncUserState);
      window.removeEventListener('user_subscription_updated', syncUserState);
    };
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    onLogout?.();
    navigate('/');
  };

  if (!user) return null;

  // Determine user role and styling
  const roleName = {
    superadmin: 'Super Administrator',
    admin: 'Hospital Admin',
    doctor: 'Doctor / Specialist',
    user: 'Patient / User'
  }[user.role] || (user.role ? user.role.toUpperCase() : 'User');

  // Determine dashboard link
  const getDashboardPath = () => {
    if (user.role === 'superadmin') return '/superadmin';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  // Hospital information
  const hospitalName =
    user.hospital ||
    user.hospitalName ||
    user.hospital_name ||
    (user.role === 'admin' ? user.name : null);

  // Subscription information
  const effectiveSub = subscription || user.subscription;
  const planKey = (effectiveSub?.plan_key || user.planKey || user.plan_key || 'basic').toLowerCase();
  const rawExpiry = effectiveSub?.expiry_date || user.planEnd || user.plan_end || user.expiryDate;

  let isDateExpired = false;
  if (rawExpiry) {
    const expTime = new Date(rawExpiry).getTime();
    if (!isNaN(expTime)) {
      isDateExpired = expTime < Date.now();
    }
  }

  const isExplicitlyExpired =
    user.isExpired === true ||
    user.subscription_status === 'expired' ||
    user.plan_status === 'expired' ||
    effectiveSub?.status === 'expired';

  const isExpired = user.role !== 'superadmin' && (isDateExpired || isExplicitlyExpired);

  let planTitle = 'Basic Plan';
  let planInterval = 'Standard tier';
  if (planKey.includes('quarter')) {
    planTitle = 'Quarterly Plan';
    planInterval = 'Every 90 days';
  } else if (planKey.includes('month')) {
    planTitle = 'Monthly Plan';
    planInterval = 'Every 30 days';
  } else if (planKey.includes('year') || planKey.includes('annual')) {
    planTitle = 'Yearly Plan';
    planInterval = 'Annual billing';
  } else if (planKey.includes('enterprise')) {
    planTitle = 'Enterprise Plan';
    planInterval = 'Custom tier';
  }

  let formattedExpiry = null;
  if (rawExpiry) {
    try {
      formattedExpiry = new Date(rawExpiry).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      formattedExpiry = String(rawExpiry);
    }
  }

  const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={ref}>
      {/* ─── Profile Pill / Trigger Button ──────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        title="View profile, hospital & subscription details"
        className={`group flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-medical-blue/30 select-none ${
          open
            ? 'bg-blue-50/90 border-medical-blue/40 text-medical-dark shadow-xs ring-2 ring-medical-blue/15'
            : 'bg-white hover:bg-slate-50/90 border-slate-200/90 text-slate-700 shadow-2xs hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="relative shrink-0">
          <div className="h-7.5 w-7.5 rounded-full bg-gradient-to-tr from-slate-900 via-medical-dark to-medical-blue flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs ring-1 ring-white/60 group-hover:scale-105 transition-transform">
            {userInitial}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-2xs ${
              isExpired ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            title={isExpired ? 'Subscription Expired' : 'Active Account'}
          />
        </div>

        <div className="hidden sm:flex flex-col text-left max-w-[130px] min-w-0 pr-0.5">
          <span className="text-xs font-bold text-slate-800 truncate leading-tight tracking-tight">
            {user.name || 'Account'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium capitalize truncate leading-tight mt-0.5">
            {hospitalName ? hospitalName : roleName}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-medical-blue' : ''
          }`}
        />
      </button>

      {/* ─── Quick Logout Action Icon ───────────────────────────── */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-200/90 hover:border-rose-200 shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer shrink-0"
        title="Sign Out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>

      {/* ─── Rich Profile Popover Dropdown ──────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-0 z-[9999] overflow-hidden text-slate-800"
          >
            {/* Header: User Info Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-medical-dark to-blue-950 p-4 text-white relative">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10 ring-2 ring-white/30 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-base uppercase shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm truncate leading-tight">
                      {user.name || 'User Profile'}
                    </h4>
                  </div>
                  <p className="text-xs text-blue-200/90 truncate mt-0.5">
                    {user.email || 'No email provided'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                      <Shield className="w-2.5 h-2.5 text-blue-300" />
                      {roleName}
                    </span>
                    {user.mobile && (
                      <span className="text-[10px] text-blue-200/80">
                        • {user.mobile}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-2.5 max-h-[75vh] overflow-y-auto">
              {/* 🏥 Hospital Details Card */}
              <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100/90 rounded-xl p-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-medical-blue/10 text-medical-blue shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Hospital Association
                      </span>
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {hospitalName || 'Not Assigned / General Access'}
                      </p>
                    </div>
                  </div>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="text-[11px] font-semibold text-medical-blue hover:text-medical-dark hover:underline inline-flex items-center gap-0.5 shrink-0"
                    >
                      Admin <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/explore-hospitals"
                      onClick={() => setOpen(false)}
                      className="text-[11px] font-semibold text-medical-blue hover:text-medical-dark hover:underline inline-flex items-center gap-0.5 shrink-0"
                    >
                      Browse <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* 💳 Subscription & Plan Details Card */}
              <div
                className={`border rounded-xl p-3 shadow-2xs transition-colors ${
                  isExpired
                    ? 'bg-rose-50/70 border-rose-200/80'
                    : 'bg-gradient-to-br from-indigo-50/60 to-emerald-50/30 border-indigo-100/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isExpired
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Subscription Plan
                        </span>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-2.5 h-2.5" /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                        {planTitle}
                        <span className="text-[11px] font-normal text-slate-500 ml-1">
                          ({planInterval})
                        </span>
                      </p>

                      {formattedExpiry && (
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {isExpired ? 'Expired on: ' : 'Valid until: '}
                            <strong className="text-slate-800 font-semibold">{formattedExpiry}</strong>
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-0.5 shrink-0 mt-0.5"
                  >
                    Manage <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* ─── Navigation Links ─────────────────────────────── */}
              <div className="pt-1 space-y-1 border-t border-slate-100">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-medical-blue hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-medical-blue transition-colors" />
                    Portal Dashboard
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-medical-blue group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-medical-blue hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-medical-blue transition-colors" />
                    My Profile & Settings
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-medical-blue group-hover:translate-x-0.5 transition-all" />
                </Link>

                {user.role === 'user' && (
                  <Link
                    to="/dashboard/my-appointments"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-medical-blue hover:bg-slate-50 transition-colors group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-slate-400 group-hover:text-medical-blue transition-colors" />
                      My Appointments
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-medical-blue group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )}
              </div>
            </div>

            {/* ─── Footer: Sign Out ─────────────────────────────── */}
            <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 pl-2">
                HMS Secure Portal
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100/70 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}