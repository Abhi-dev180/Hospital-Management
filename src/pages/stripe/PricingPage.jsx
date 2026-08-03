import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ShieldCheck, Zap, Crown, ArrowRight, Loader2, Sparkles,
  Building2, Calendar, Star, Rocket, Gem, AlertCircle, RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import { CardSkeleton } from '../../components/Loader';

// Plans come from the backend (HMS_BACKEND/config/stripePlans.js). The backend sends an
// icon *key*; this map turns it into the lucide component to render.
const ICONS = {
  zap: Zap,
  sparkles: Sparkles,
  crown: Crown,
  star: Star,
  rocket: Rocket,
  gem: Gem,
  building: Building2,
  calendar: Calendar
};

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const isRenewal = searchParams.get('renew') === 'true';
  // Stripe's cancel_url sends people back here with ?payment=cancelled.
  const paymentCancelled = ['cancelled', 'canceled', 'true'].includes(
    (searchParams.get('payment') || searchParams.get('canceled') || '').toLowerCase()
  );
  const [showCancelNotice, setShowCancelNotice] = useState(paymentCancelled);
  const [checkoutError, setCheckoutError] = useState('');

  const [bookingInfo, setBookingInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [user, setUser] = useState(null);

  // ─── Plans (from backend config) ────────────────────────────
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState('');

  const fetchPlans = async () => {
    setLoadingPlans(true);
    setPlansError('');
    try {
      const res = await fetch(`${API_URL}/api/payments/plans`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load plans');

      const list = Array.isArray(data.plans) ? data.plans : [];
      setPlans(list);
      // Preselect the plan flagged "popular", else the first one.
      const preferred = list.find((p) => p.popular) || list[0];
      if (preferred) setSelectedPlan((prev) => prev || preferred.key);
    } catch (err) {
      console.error('Could not load pricing plans', err);
      setPlansError(err.message || 'Could not load pricing plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ─── Check if user is logged in ─────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ─── Fetch booking info if token exists ─────────────────────
  // useEffect(() => {
  //   if (!token) {
  //     setLoadingInfo(false);
  //     return;
  //   }
  //   (async () => {
  //     try {
  //       const res = await fetch(`${API_URL}/api/feedback/${token}`);
  //       const data = await res.json();
  //       if (res.ok && data.booking) {
  //         setBookingInfo(data.booking);
  //       }
  //     } catch (err) {
  //       console.error('Could not fetch booking details for pricing page', err);
  //     } finally {
  //       setLoadingInfo(false);
  //     }
  //   })();
  // }, [token]);

  useEffect(() => {
    if (!token) {
      setLoadingInfo(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/feedback/${token}`);
        const data = await res.json();
        if (res.ok && data.booking) {
          // Correctly set the booking info
          setBookingInfo({
            ...data.booking,
            // Ensure email is always available
            email: data.booking.email || data.booking.contactEmail || 'customer@example.com'
          });
        }
      } catch (err) {
        console.error('Could not fetch booking details for pricing page', err);
      } finally {
        setLoadingInfo(false);
      }
    })();
  }, [token]);


  // ─── Handle plan selection ───────────────────────────────────
  // const handleChoosePlan = async (planKey) => {
  //   try {
  //     setSubmitting(planKey);

  //     // Get auth token
  //     const authToken = localStorage.getItem('token');
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       ...(authToken && { Authorization: `Bearer ${authToken}` })
  //     };

  //     // Build request body
  //     const body = {
  //       planKey,
  //       ...(token && { feedbackToken: token }),
  //       ...(bookingInfo?.id && { bookingId: bookingInfo.id }),
  //       ...(user?.id && { userId: user.id }),
  //       ...(bookingInfo?.hospitalName && { hospitalName: bookingInfo.hospitalName }),
  //       isRenewal: isRenewal
  //     };

  //     // If user is logged in, use subscription endpoint
  //     const endpoint = user
  //       ? '/api/subscriptions/create-checkout'
  //       : '/api/payments/create-checkout-session';

  //     const res = await fetch(`${API_URL}${endpoint}`, {
  //       method: 'POST',
  //       headers,
  //       body: JSON.stringify(body)
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       // Fallback for dev mode when Stripe isn't configured
  //       if (res.status === 503 || data.message?.includes('Stripe not configured')) {
  //         toast.success('Redirecting to registration...');
  //         navigate(`/register/${token}?plan=${planKey}`);
  //         return;
  //       }
  //       toast.error(data.message || 'Could not initiate payment');
  //       return;
  //     }

  //     if (data.url) {
  //       window.location.href = data.url; // Redirect to Stripe Checkout
  //     } else {
  //       navigate(`/register/${token}?plan=${planKey}`);
  //     }
  //   } catch (err) {
  //     console.error('Payment error:', err);
  //     toast.error('Network error during payment initiation. Redirecting...');
  //     navigate(`/register/${token}?plan=${planKey}`);
  //   } finally {
  //     setSubmitting(null);
  //   }
  // };

  const handleChoosePlan = async (planKey) => {
  try {
    setSubmitting(planKey);
    setCheckoutError('');
    setShowCancelNotice(false);

    const authToken = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    };

    // Build the booking object with email
    const booking = {
      id: bookingInfo?.id || 'demo-booking',
      email: bookingInfo?.email || user?.email || 'customer@example.com',
      hospital_name: bookingInfo?.hospitalName || 'Pet Hospital'
    };

    const body = {
      booking,                    
      planKey,
      feedbackToken: token,
      isRenewal: isRenewal
    };

    // If user is logged in, use subscription endpoint; otherwise, use payment endpoint
    const endpoint = user
      ? '/api/subscriptions/create-checkout'
      : '/api/payments/create-checkout-session';

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      // Stripe genuinely switched off — skipping straight to registration is correct.
      if (res.status === 503 || data.message?.includes('Stripe not configured')) {
        toast.success('Payments are disabled — taking you to registration…');
        navigate(`/register/${token}?plan=${planKey}`);
        return;
      }
      // Any other failure is a real error: stay put so the user can retry.
      // Bouncing them to /register here would look like the payment succeeded.
      setCheckoutError(data.message || 'We could not start the payment. Please try again.');
      toast.error(data.message || 'Could not initiate payment');
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    setCheckoutError('Stripe did not return a checkout link. Please try again in a moment.');
    toast.error('Could not open the payment page');
  } catch (err) {
    console.error('Payment error:', err);
    setCheckoutError('Network error — we could not reach the payment service. Please check your connection and try again.');
    toast.error('Network error during payment initiation');
  } finally {
    setSubmitting(null);
  }
};

  const getIntervalLabel = (interval) => {
    const map = {
      monthly: 'per month',
      quarterly: 'per quarter',
      yearly: 'per year',
      month: 'per month',
      year: 'per year'
    };
    return map[interval] || interval;
  };

  const isLoading = loadingInfo || loadingPlans;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 mb-3">
            <ShieldCheck size={14} /> Secure Onboarding
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {isRenewal ? 'Renew Your Subscription' : 'Choose Your Hospital Plan'}
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            {isRenewal ? (
              'Renew your subscription to continue managing your hospital seamlessly.'
            ) : (
              <>
                Select the subscription plan that best fits{' '}
                {bookingInfo?.hospitalName
                  ? <strong className="text-slate-800">{bookingInfo.hospitalName}</strong>
                  : 'your clinic'}
                . You will be redirected to complete payment and register.
              </>
            )}
          </p>
          {isRenewal && user && (
            <div className="mt-2 text-sm text-slate-500">
              👋 Welcome back, <strong>{user.name || user.email}</strong>
            </div>
          )}
        </div>

        {/* Cancelled / failed checkout notice */}
        <AnimatePresence>
          {showCancelNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 text-sm">Checkout was cancelled</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  You were not charged and your hospital is not registered yet. Pick a plan below to try again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelNotice(false)}
                className="p-1 rounded-full text-amber-500 hover:bg-amber-100 transition shrink-0"
                aria-label="Dismiss"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkout could not be started */}
        <AnimatePresence>
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-red-900 text-sm">Payment could not be started</p>
                <p className="text-sm text-red-800 mt-0.5">{checkoutError}</p>
                <p className="text-xs text-red-700/80 mt-1.5">You have not been charged.</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutError('')}
                className="p-1 rounded-full text-red-500 hover:bg-red-100 transition shrink-0"
                aria-label="Dismiss"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plan Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[0, 1, 2].map((i) => <CardSkeleton key={i} lines={5} />)}
          </div>
        ) : plansError ? (
          <div className="py-16 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800">We couldn’t load the pricing plans</p>
              <p className="text-sm text-slate-500 mt-1">{plansError}</p>
            </div>
            <button
              type="button"
              onClick={fetchPlans}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 text-sm transition"
            >
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No plans are available right now.</div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 items-stretch ${plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {plans.map((plan) => {
              const Icon = ICONS[plan.icon] || Sparkles;
              const isSelected = selectedPlan === plan.key;
              const isSubmittingThis = submitting === plan.key;

              return (
                <motion.div
                  key={plan.key}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl transition-all cursor-pointer border-2 ${isSelected ? 'border-teal-500 ring-4 ring-teal-500/20' : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${plan.color} text-white shadow-md`}>
                        <Icon size={24} />
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                        <span className="text-xs text-slate-500 block">{getIntervalLabel(plan.interval)}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-6">{plan.subtitle}</p>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoosePlan(plan.key);
                    }}
                    disabled={submitting !== null}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${plan.btnColor} disabled:opacity-60`}
                  >
                    {isSubmittingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
                      </>
                    ) : (
                      <>
                        {isRenewal ? `Renew ${plan.name}` : `Choose ${plan.name}`} <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-xs text-slate-400">
          🔒 Payments are securely processed via Stripe. After payment, you will automatically be redirected to finish registering your hospital credentials.
        </div>
      </div>
    </div>
  );
}