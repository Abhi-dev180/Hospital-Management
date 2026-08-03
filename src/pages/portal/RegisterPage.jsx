import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, User, Mail, Phone, MapPin, Home, BedDouble, Lock, ShieldCheck,
  Loader2, CheckCircle2, AlertCircle, Check, X, Eye, EyeOff, CreditCard, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import PortalCardPage from '../../components/portal/PortalCardPage';
import AddressAutocomplete from '../../components/AddressAutocomplete';

const initial = {
  hospitalName: '', contactName: '', email: '', phone: '', city: '',
  address: '', beds: '', username: '', password: '', confirm: ''
};

// Password rules used for live validation feedback.
const rules = [
  { key: 'len', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'num', label: 'One number', test: (p) => /\d/.test(p) }
];

export default function RegisterPage() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  const [verifying, setVerifying] = useState(true);
  const [paymentOk, setPaymentOk] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  // Why verification failed, so we can show the right recovery path:
  // 'no-session' | 'unpaid' | 'error'
  const [failReason, setFailReason] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const verifyPayment = async () => {
    setFailReason('');
    try {
      const res = await fetch(`${API_URL}/api/payments/verify?session_id=${sessionId || ''}`);
      const data = await res.json();

      // Stripe switched off (dev / self-hosted) → let registration through.
      if (!data.configured) {
        setStripeConfigured(false);
        setPaymentOk(true);
        return;
      }

      setStripeConfigured(true);

      if (!res.ok) {
        // 400 with no session_id means they opened this page directly.
        setPaymentOk(false);
        setFailReason(sessionId ? 'error' : 'no-session');
        return;
      }

      setPaymentOk(!!data.paid);
      if (!data.paid) setFailReason('unpaid');
      if (data.email) setForm((f) => ({ ...f, email: data.email }));
    } catch {
      setPaymentOk(false);
      setStripeConfigured(true);
      setFailReason('error');
    }
  };

  useEffect(() => {
    (async () => {
      await verifyPayment();
      setVerifying(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Stripe's webhook can land a beat after the redirect, so let people re-check
  // rather than assuming the payment failed.
  const retryVerify = async () => {
    setRetrying(true);
    await verifyPayment();
    setRetrying(false);
    // `paymentOk` updates asynchronously; read the freshest value on next render.
  };

  // Prefill with the data we already captured at demo time (hospital, contact, email, phone, city).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/registrations/prefill/${token}`);
        const data = await res.json();
        const p = data.prefill;
        if (p) {
          setForm((f) => ({
            ...f,
            hospitalName: f.hospitalName || p.hospitalName || '',
            contactName: f.contactName || p.contactName || '',
            email: f.email || p.email || '',
            phone: f.phone || p.phone || '',
            city: f.city || p.city || ''
          }));
        }
      } catch { /* ignore */ }
    })();
  }, [token]);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const passOk = rules.every((r) => r.test(form.password));

  const validate = () => {
    const e = {};
    if (!form.hospitalName.trim()) e.hospitalName = 'Required';
    if (!form.contactName.trim()) e.contactName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.phone && !/^\d{7,15}$/.test(form.phone.trim())) e.phone = 'Phone must be 7–15 digits';
    if (!passOk) e.password = 'Password does not meet the requirements';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix the highlighted fields');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackToken: token, sessionId, ...form })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not submit registration');
      setDone(true);
      toast.success('Registration submitted! 🎉');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) return <PortalCardPage><div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-medical-blue" /></div></PortalCardPage>;

  if (stripeConfigured && !paymentOk) {
    const COPY = {
      'no-session': {
        title: 'Payment step not completed',
        body: 'This page is reached after checkout. Pick a plan and complete payment to unlock registration.'
      },
      unpaid: {
        title: 'Payment not completed',
        body: 'Stripe reports this checkout as unpaid — it was cancelled or the card was declined. Nothing has been charged.'
      },
      error: {
        title: 'We couldn’t verify your payment',
        body: 'Something went wrong while checking with Stripe. If you were charged, do not pay again — re-check below or contact support.'
      }
    };
    const copy = COPY[failReason] || COPY.error;

    return (
      <PortalCardPage>
        <div className="text-center py-8">
          <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-medical-dark">{copy.title}</h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">{copy.body}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to={`/pricing${token ? `?token=${token}` : ''}`} className="btn btn-primary btn-md">
              <CreditCard className="w-4 h-4" /> {failReason === 'no-session' ? 'Choose a plan' : 'Try payment again'}
            </Link>
            {failReason !== 'no-session' && (
              <button type="button" onClick={retryVerify} disabled={retrying} className="btn btn-outline btn-md">
                {retrying
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Re-checking…</>
                  : <><RefreshCw className="w-4 h-4" /> Re-check payment</>}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Charged but still stuck? Email{' '}
            <a href="mailto:contact@medpark.com" className="text-medical-blue font-semibold hover:underline">
              contact@medpark.com
            </a>
            {sessionId && <> quoting reference <span className="font-mono">{sessionId.slice(-12)}</span></>}.
          </p>
        </div>
      </PortalCardPage>
    );
  }

  if (done) return (
    <PortalCardPage>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-5" />
        <h1 className="text-2xl font-extrabold text-medical-dark">Registration submitted! 🎉</h1>
        <p className="text-gray-600 mt-3">Your details are now with our team for approval. We'll email you as soon as your account is activated.</p>
      </motion.div>
    </PortalCardPage>
  );

  return (
    <PortalCardPage icon={ShieldCheck} title="Complete your registration" subtitle="Tell us about your hospital to finish setting up." wide>
      {stripeConfigured && paymentOk && (
        <div className="mb-6 flex items-center gap-2 justify-center text-sm font-semibold text-green-600 bg-green-50 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4" /> Payment confirmed
        </div>
      )}
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={Building2} label="Hospital name *" error={errors.hospitalName}>
            <input value={form.hospitalName} onChange={update('hospitalName')} className="portal-input" placeholder="Happy Paws Veterinary" />
          </Field>
          <Field icon={User} label="Contact name *" error={errors.contactName}>
            <input value={form.contactName} onChange={update('contactName')} className="portal-input" placeholder="Dr. Jane Doe" />
          </Field>
          <Field icon={Mail} label="Email *" error={errors.email}>
            <input type="email" value={form.email} onChange={update('email')} className="portal-input" placeholder="jane@happypaws.com" />
          </Field>
          <Field icon={Phone} label="Phone" error={errors.phone}>
            <input value={form.phone} onChange={update('phone')} className="portal-input" placeholder="9876543210" />
          </Field>
          <Field icon={MapPin} label="City">
            <input value={form.city} onChange={update('city')} className="portal-input" placeholder="Mumbai" />
          </Field>
          <Field icon={BedDouble} label="Number of beds">
            <input type="number" min="0" value={form.beds} onChange={update('beds')} className="portal-input" placeholder="50" />
          </Field>
          <div className="sm:col-span-2">
            <Field icon={Home} label="Address">
              <AddressAutocomplete
                value={form.address}
                onChange={(v) => { setForm((f) => ({ ...f, address: v })); setErrors((prev) => ({ ...prev, address: undefined })); }}
                placeholder="Search address…"
              />
            </Field>
          </div>
          <Field icon={User} label="Username">
            <input value={form.username} onChange={update('username')} className="portal-input" placeholder="happypaws" />
          </Field>
          <div className="hidden sm:block" />
          <Field icon={Lock} label="Password *" error={errors.password}>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')} className="portal-input pr-11" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title={showPw ? 'Hide' : 'Show'}>
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </Field>
          <Field icon={Lock} label="Confirm password *" error={errors.confirm}>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={update('confirm')} className="portal-input pr-11" placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title={showConfirm ? 'Hide' : 'Show'}>
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </Field>
        </div>

        {/* Live password rules */}
        {form.password && (
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {rules.map((r) => {
              const ok = r.test(form.password);
              return (
                <span key={r.key} className={`flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                  {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} {r.label}
                </span>
              );
            })}
          </div>
        )}

        <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-full shadow-lg transition-all">
          {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>) : 'Submit registration'}
        </button>
        <p className="text-center text-xs text-gray-400">Your registration goes to our team for approval.</p>
      </form>
    </PortalCardPage>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
        <Icon className="w-4 h-4 text-medical-blue" /> {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}
