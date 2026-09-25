import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ShieldCheck, Zap, Crown, ArrowRight, Loader2, Sparkles,
  Building2, Calendar, Star, Rocket, Gem, AlertCircle, RefreshCw, X, QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import { CardSkeleton } from '../../components/Loader';
import UpiQrPaymentModal from '../../components/UpiQrPaymentModal';
import PayUTestPaymentModal from '../../components/PayUTestPaymentModal';
import { load } from '@cashfreepayments/cashfree-js';

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
  const isPaypalReturn = searchParams.get('paypal_return') === 'true';
  const token = isPaypalReturn ? searchParams.get('f_token') : (searchParams.get('token') || '');
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
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  const [showPayUModal, setShowPayUModal] = useState(false);
  const [paymentPlanKey, setPaymentPlanKey] = useState('');

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

  // ─── Handle PayPal Return ────────────────────────────────────
  useEffect(() => {
    if (isPaypalReturn) {
      const orderId = searchParams.get('token'); // PayPal sends the order ID in the 'token' param
      const pPlan = searchParams.get('plan');
      
      const capturePayPal = async () => {
        toast.loading('Capturing PayPal payment...', { id: 'paypal_capture' });
        try {
          const res = await fetch(`${API_URL}/api/payments/paypal/capture-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              orderId, 
              planKey: pPlan, 
              feedbackToken: token,
              isRenewal 
            })
          });
          const data = await res.json();
          if (res.ok) {
            toast.success('PayPal Payment Successful!', { id: 'paypal_capture' });
            setTimeout(() => {
              navigate(`/register/${token}?plan=${pPlan}`);
            }, 1500);
          } else {
            throw new Error(data.message);
          }
        } catch (err) {
          toast.error(err.message || 'Failed to capture PayPal', { id: 'paypal_capture' });
          setCheckoutError(err.message);
        }
      };
      capturePayPal();
    }
  }, [isPaypalReturn, searchParams, navigate, token, isRenewal]);



  // ─── Handle plan selection ───────────────────────────────────
  const handleChoosePlan = (planKey) => {
    setPaymentPlanKey(planKey);
    setShowPaymentModal(true);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (method) => {
    try {
      setSubmitting(paymentPlanKey);
      setCheckoutError('');
      setShowCancelNotice(false);
      setShowPaymentModal(false);

      const authToken = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      };

      const booking = {
        id: bookingInfo?.id || 'demo-booking',
        email: bookingInfo?.email || user?.email || 'customer@example.com',
        hospital_name: bookingInfo?.hospitalName || 'Pet Hospital'
      };

      const body = {
        booking,
        planKey: paymentPlanKey,
        feedbackToken: token,
        isRenewal: isRenewal
      };

      if (user && token) {
        body.successPath = `/register/${token}`;
        body.cancelPath = `/pricing?token=${token}&payment=cancelled`;
      } else if (token) {
        body.cancelPath = `/pricing?token=${token}&payment=cancelled`;
      }

      if (method === 'stripe') {
        const endpoint = user
          ? '/api/subscriptions/create-checkout'
          : '/api/payments/create-checkout-session';

        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Stripe error');
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } else if (method === 'paypal') {
        const returnUrl = `${window.location.origin}/pricing?paypal_return=true&f_token=${token}&plan=${paymentPlanKey}&renew=${isRenewal}`;
        const cancelUrl = `${window.location.origin}/pricing?token=${token}&payment=cancelled`;

        const res = await fetch(`${API_URL}/api/payments/paypal/create-order`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...body, returnUrl, cancelUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'PayPal error');
        
        const approveLink = data.links?.find(link => link.rel === 'approve')?.href;
        if (approveLink) {
           window.location.href = approveLink;
        } else {
           throw new Error('PayPal did not return an approval link.');
        }
        return;
      } else if (method === 'cashfree') {
        const res = await fetch(`${API_URL}/api/payments/cashfree/create-order`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const orderData = await res.json();
        if (!res.ok) throw new Error(orderData.message || 'Cashfree error');

        const cashfree = await load({ mode: "sandbox" });
        if (orderData.payment_session_id) {
            cashfree.checkout({
                paymentSessionId: orderData.payment_session_id,
                redirectTarget: "_modal",
            }).then(async (result) => {
                if(result.error) {
                    setCheckoutError(result.error.message);
                }
                if(result.paymentDetails || result.redirect) {
                    toast.loading('Verifying payment...', { id: 'cf_verify' });
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/payments/cashfree/verify-payment`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ 
                                ...body, 
                                order_id: orderData.order_id 
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if(verifyRes.ok) {
                            toast.success('Payment Successful!', { id: 'cf_verify' });
                            try {
                              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                              const newExp = verifyData.expiryDate || verifyData.subscription?.expiry_date || verifyData.user?.planEnd || verifyData.user?.plan_end;
                              const mergedUser = {
                                ...storedUser,
                                ...(verifyData.user || {}),
                                isExpired: false,
                                subscription_status: 'active',
                                plan_status: 'active',
                                planKey: paymentPlanKey,
                                plan_key: paymentPlanKey,
                                planEnd: newExp || storedUser.planEnd,
                                plan_end: newExp || storedUser.plan_end,
                                subscription: verifyData.subscription || {
                                  plan_key: paymentPlanKey,
                                  expiry_date: newExp,
                                  status: 'active'
                                }
                              };
                              localStorage.setItem('user', JSON.stringify(mergedUser));
                              window.dispatchEvent(new Event('storage'));
                              window.dispatchEvent(new CustomEvent('user_subscription_updated', { detail: verifyData }));
                            } catch (e) {
                              console.error('Error saving updated user after Cashfree:', e);
                            }
                            setTimeout(() => {
                                if (token) {
                                  navigate(body.successPath || `/register/${token}?plan=${paymentPlanKey}`);
                                } else if (user?.role === 'admin' || isRenewal) {
                                  navigate('/profile#subscription');
                                } else {
                                  navigate('/profile');
                                }
                            }, 1500);
                        } else {
                            throw new Error(verifyData.message);
                        }
                    } catch(e) {
                        toast.error(e.message || 'Failed to verify payment', { id: 'cf_verify' });
                        setCheckoutError(e.message);
                    }
                }
            });
        }
        return;
      } else if (method === 'upi') {
        const res = await fetch(`${API_URL}/api/payments/razorpay/create-order`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Razorpay error');

        const loaded = await loadRazorpay();
        if (!loaded) throw new Error('Failed to load Razorpay SDK');

        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: "Hospital Management System",
          description: `${paymentPlanKey?.toUpperCase() || 'Subscription'} Plan Payment`,
          order_id: data.id,
          handler: async function (response) {
            try {
              toast.loading('Verifying payment...', { id: 'upi_verify' });
              const verifyRes = await fetch(`${API_URL}/api/payments/razorpay/verify-payment`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                  ...body, 
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature 
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                toast.success('Payment Successful!', { id: 'upi_verify' });
                try {
                  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                  const newExp = verifyData.expiryDate || verifyData.subscription?.expiry_date || verifyData.user?.planEnd || verifyData.user?.plan_end;
                  const mergedUser = {
                    ...storedUser,
                    ...(verifyData.user || {}),
                    isExpired: false,
                    subscription_status: 'active',
                    plan_status: 'active',
                    planKey: paymentPlanKey,
                    plan_key: paymentPlanKey,
                    planEnd: newExp || storedUser.planEnd,
                    plan_end: newExp || storedUser.plan_end,
                    subscription: verifyData.subscription || {
                      plan_key: paymentPlanKey,
                      expiry_date: newExp,
                      status: 'active'
                    }
                  };
                  localStorage.setItem('user', JSON.stringify(mergedUser));
                  window.dispatchEvent(new Event('storage'));
                  window.dispatchEvent(new CustomEvent('user_subscription_updated', { detail: verifyData }));
                } catch (e) {
                  console.error('Error saving updated user after Razorpay:', e);
                }
                setTimeout(() => {
                  if (token) {
                    navigate(body.successPath || `/register/${token}?plan=${paymentPlanKey}`);
                  } else if (user?.role === 'admin' || isRenewal) {
                    navigate('/profile#subscription');
                  } else {
                    navigate('/profile');
                  }
                }, 1500);
              } else {
                 throw new Error(verifyData.message);
              }
            } catch (e) {
              toast.error(e.message || 'Failed to verify payment', { id: 'upi_verify' });
              setCheckoutError(e.message);
            }
          },
          prefill: {
            name: body.booking?.contact_name || body.booking?.hospital_name || 'Customer',
            email: body.booking?.email || 'customer@example.com',
            contact: body.booking?.phone || '9876543210'
          },
          theme: {
            color: "#0d9488"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
           setCheckoutError(response.error.description);
        });
        rzp.open();
        return;
      } else if (method === 'payu') {
        toast.loading('Initializing PayU Test Gateway...', { id: 'payu_init' });
        const res = await fetch(`${API_URL}/api/payments/payu/create-payment`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'PayU error');

        toast.loading('Verifying PayU Test Payment...', { id: 'payu_init' });
        const verifyRes = await fetch(`${API_URL}/api/payments/payu/verify-payment`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...body,
            txnid: data.txnid,
            amount: data.amount,
            planKey: paymentPlanKey,
            status: 'success',
            isSimulated: true
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          toast.success('🎉 PayU Payment Successful (Test Mode)!', { id: 'payu_init' });
          try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const newExp = verifyData.expiryDate || verifyData.subscription?.expiry_date || verifyData.user?.planEnd || verifyData.user?.plan_end;
            const mergedUser = {
              ...storedUser,
              ...(verifyData.user || {}),
              isExpired: false,
              subscription_status: 'active',
              plan_status: 'active',
              planKey: paymentPlanKey,
              plan_key: paymentPlanKey,
              planEnd: newExp || storedUser.planEnd,
              plan_end: newExp || storedUser.plan_end,
              subscription: verifyData.subscription || {
                plan_key: paymentPlanKey,
                expiry_date: newExp,
                status: 'active',
                amount: data.amount
              }
            };
            localStorage.setItem('user', JSON.stringify(mergedUser));
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('user_subscription_updated', { detail: verifyData }));
          } catch (e) {
            console.error('Error saving updated user after PayU:', e);
          }
          setTimeout(() => {
            if (token) {
              navigate(body.successPath || `/register/${token}?plan=${paymentPlanKey}`);
            } else if (user?.role === 'admin' || isRenewal) {
              navigate('/profile#subscription');
            } else {
              navigate('/profile');
            }
          }, 1500);
        } else {
          throw new Error(verifyData.message || 'PayU verification failed');
        }
        return;
      }

    } catch (err) {
      console.error('Payment error:', err);
      setCheckoutError(err.message || 'Payment initiation failed.');
      toast.error('Payment failed');
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
          🔒 Payments are securely processed. After payment, you will automatically be redirected to finish registering your hospital credentials.
        </div>

        {/* Payment Selection Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowPaymentModal(false);
              }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 my-8"
              >
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  aria-label="Close payment options"
                  title="Close"
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer flex items-center justify-center"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-2xl font-black text-slate-900 mb-2">How would you like to pay?</h2>
                <p className="text-slate-500 text-sm mb-6">Select a secure payment method below to complete your subscription.</p>
                
                <div className="space-y-3">
                  {/* Free UPI QR Code Option */}
                  <button 
                    onClick={() => { setShowPaymentModal(false); setShowUpiQrModal(true); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 hover:border-emerald-500 hover:bg-emerald-100/80 transition group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <QrCode size={22} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-2">
                          Free UPI QR Scan <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">0% Fee</span>
                        </div>
                        <div className="text-xs text-slate-600">Scan via GPay, PhonePe, Paytm, BHIM</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-emerald-600 group-hover:text-emerald-800" />
                  </button>

                  <button onClick={() => processPayment('stripe')} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-1.1c-1.3-.2-2.5-1.1-2.9-2.4l1.4-.6c.2.8.9 1.4 1.7 1.6V11H10c-1.1 0-2-.9-2-2s.9-2 2-2v-1.1c1.3.2 2.5 1.1 2.9 2.4l-1.4.6c-.2-.8-.9-1.4-1.7-1.6V13h1.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/></svg>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-900">Credit / Debit Card</div>
                        <div className="text-xs text-slate-500">Securely processed via Stripe</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                  </button>

                  <button onClick={() => processPayment('paypal')} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black italic text-lg">
                        P
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 group-hover:text-blue-900">PayPal</div>
                        <div className="text-xs text-slate-500">Pay with your PayPal balance</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600" />
                  </button>
                  
                  <button onClick={() => processPayment('cashfree')} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg">
                        C
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 group-hover:text-orange-900">Cashfree Payments</div>
                        <div className="text-xs text-slate-500">Netbanking, Cards, Wallets</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-orange-600" />
                  </button>

                  <button onClick={() => processPayment('upi')} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        RZP
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 group-hover:text-blue-900 flex items-center gap-2">
                          Razorpay <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">UPI QR / Cards</span>
                        </div>
                        <div className="text-xs text-slate-500">Instant UPI QR Code, Cards & Netbanking</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600" />
                  </button>

                  {/* PayU Test Mode Gateway */}
                  <button 
                    onClick={() => { setShowPaymentModal(false); setShowPayUModal(true); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-teal-200 bg-teal-50/40 hover:border-teal-500 hover:bg-teal-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        PayU
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 group-hover:text-teal-900 flex items-center gap-2">
                          PayU <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Test Mode</span>
                        </div>
                        <div className="text-xs text-slate-500">Netbanking, UPI & Sandbox Cards (Key: DdmBhY)</div>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-teal-400 group-hover:text-teal-600" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Free UPI QR Code Modal */}
        <UpiQrPaymentModal
          isOpen={showUpiQrModal}
          onClose={() => setShowUpiQrModal(false)}
          plan={plans.find(p => p.key === (paymentPlanKey || selectedPlan)) || { key: paymentPlanKey || selectedPlan || 'yearly', amount: 299 }}
          user={user}
          registrationToken={token}
        />

        {/* PayU Test Payment Modal */}
        <PayUTestPaymentModal
          isOpen={showPayUModal}
          onClose={() => setShowPayUModal(false)}
          plan={plans.find(p => p.key === (paymentPlanKey || selectedPlan)) || { key: paymentPlanKey || selectedPlan || 'yearly', amount: 299 }}
          user={user}
          registrationToken={token}
          bookingInfo={bookingInfo}
          isRenewal={isRenewal}
        />
      </div>
    </div>
  );
}