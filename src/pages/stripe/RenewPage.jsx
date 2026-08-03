import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, ShieldCheck, Zap, Crown, ArrowRight, Loader2, 
  Sparkles, AlertCircle, CalendarClock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from "../../config/api";

const PLANS = [
  {
    key: 'mini',
    name: 'Mini Plan',
    price: '$100',
    interval: 'monthly',
    subtitle: 'Great for small clinics starting out',
    icon: Zap,
    popular: false,
    color: 'from-blue-500 to-cyan-500',
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    features: [
      'Up to 5 Staff Accounts',
      'Basic Appointment Management',
      'Patient Records & History',
      'Email Support'
    ]
  },
  {
    key: 'basic',
    name: 'Basic Plan',
    price: '$200',
    interval: 'quarterly',
    subtitle: 'Ideal for growing veterinary hospitals',
    icon: Sparkles,
    popular: true,
    color: 'from-emerald-500 to-teal-600',
    btnColor: 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30',
    features: [
      'Up to 25 Staff Accounts',
      'Advanced Calendar & Scheduling',
      'Billing, Invoicing & Prescriptions',
      'Google Calendar Integration',
      '24/7 Priority Support'
    ]
  },
  {
    key: 'advanced',
    name: 'Advanced Plan',
    price: '$500',
    interval: 'yearly',
    subtitle: 'For enterprise multi-branch hospitals',
    icon: Crown,
    popular: false,
    color: 'from-purple-600 to-indigo-600',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    features: [
      'Unlimited Staff & Admin Accounts',
      'Multi-Branch Hospital Management',
      'Custom Workflow & Integrations',
      'Dedicated Account Manager',
      'Full Analytics & Export Tools'
    ]
  }
];

export default function RenewPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [submitting, setSubmitting] = useState(null);

  // ─── Verify the renewal token ──────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-renewal/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setError(data.message || 'Invalid or expired renewal link');
          setVerifying(false);
          setLoading(false);
          return;
        }

        setUser(data.user);
        setSubscription(data.subscription);

        // Set the selected plan to the user's current plan
        if (data.subscription?.plan_key) {
          setSelectedPlan(data.subscription.plan_key);
        }

        setVerifying(false);
        setLoading(false);
      } catch (err) {
        console.error('Renewal verification error:', err);
        setError('Network error. Please try again later.');
        setVerifying(false);
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Missing renewal token');
      setVerifying(false);
      setLoading(false);
    }
  }, [token]);

  // ─── Handle plan selection ───────────────────────────────────
  const handleRenew = async (planKey) => {
    try {
      setSubmitting(planKey);

      const authToken = localStorage.getItem('token');
      
      // If user is not logged in, try to login with the renewal token
      if (!authToken) {
        // Try to get token from renewal verification
        const loginRes = await fetch(`${API_URL}/api/auth/login-with-renewal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewalToken: token })
        });
        
        if (!loginRes.ok) {
          toast.error('Please log in to renew your subscription');
          navigate('/login');
          return;
        }
        
        const loginData = await loginRes.json();
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      const res = await fetch(`${API_URL}/api/subscriptions/create-checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          planKey,
          isRenewal: true,
          renewalToken: token
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Could not initiate renewal');
        return;
      }

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error('No checkout URL received');
      }
    } catch (err) {
      console.error('Renewal error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getIntervalLabel = (interval) => {
    const map = {
      monthly: 'per month',
      quarterly: 'per quarter',
      yearly: 'per year'
    };
    return map[interval] || interval;
  };

  // ─── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Verifying your renewal link...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Invalid Renewal Link</h2>
          <p className="text-slate-600 mt-2">{error}</p>
          <p className="text-slate-500 text-sm mt-1">This link may have expired or been used already.</p>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-6 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // ─── Success state ──────────────────────────────────────────
  const currentPlan = PLANS.find(p => p.key === subscription?.plan_key);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 mb-3">
            <ShieldCheck size={14} /> Secure Renewal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Renew Your Subscription
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Welcome back, <strong className="text-slate-800">{user?.name || user?.email}</strong>!
            {currentPlan && (
              <span className="block text-sm text-slate-500 mt-1">
                Current plan: <span className="font-semibold text-teal-600">{currentPlan.name}</span>
              </span>
            )}
            {subscription?.expiry_date && (
              <span className="block text-sm text-slate-500">
                Expires: <span className="font-semibold">
                  {new Date(subscription.expiry_date).toLocaleDateString('en-US', { 
                    dateStyle: 'full' 
                  })}
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.key;
            const isCurrentPlan = subscription?.plan_key === plan.key;
            const isSubmittingThis = submitting === plan.key;

            return (
              <motion.div
                key={plan.key}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedPlan(plan.key)}
                className={`relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl transition-all cursor-pointer border-2 ${
                  isSelected ? 'border-teal-500 ring-4 ring-teal-500/20' : 'border-gray-100 hover:border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-amber-400/30' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-md">
                    Current Plan
                  </div>
                )}
                {plan.popular && !isCurrentPlan && (
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
                    handleRenew(plan.key);
                  }}
                  disabled={submitting !== null || isCurrentPlan}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : plan.btnColor
                  } disabled:opacity-60`}
                >
                  {isSubmittingThis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : isCurrentPlan ? (
                    '✓ Current Plan'
                  ) : (
                    <>
                      Renew {plan.name} <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-xs text-slate-400">
          🔒 Payments are securely processed via Stripe. Your subscription will be extended from the expiry date.
        </div>
      </div>
    </div>
  );
}
