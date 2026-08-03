import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MailCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import AddressAutocomplete from '../AddressAutocomplete';

const initialForm = {
  hospitalName: '',
  contactName: '',
  email: '',
  phone: '',
  city: '',
  message: ''
};

// "Book a Demo" section. Submits the request; the prospect then receives an email,
// and a scheduling link once the super admin invites them to pick a time.
export default function BookDemoSection() {
  const [step, setStep] = useState('form'); // 'form' | 'done'
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.hospitalName.trim()) e.hospitalName = 'Hospital name is required';
    if (!form.contactName.trim()) e.contactName = 'Your name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix the highlighted fields');

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/demos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not submit. Please try again.');
      toast.success('Request sent! Check your email 📧');
      setStep('done');
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            noValidate
            className="card-lg p-6 sm:p-9 space-y-5 text-left"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field icon={Building2} label="Hospital / Clinic name *" error={errors.hospitalName}>
                <input value={form.hospitalName} onChange={update('hospitalName')} placeholder="Happy Paws Veterinary" className="portal-input" />
              </Field>
              <Field icon={User} label="Your name *" error={errors.contactName}>
                <input value={form.contactName} onChange={update('contactName')} placeholder="Dr. Jane Doe" className="portal-input" />
              </Field>
              <Field icon={Mail} label="Email *" error={errors.email}>
                <input type="email" value={form.email} onChange={update('email')} placeholder="jane@happypaws.com" className="portal-input" />
              </Field>
              <Field icon={Phone} label="Phone (10-digit mobile)" error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })); setErrors((p) => ({ ...p, phone: undefined })); }}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  className="portal-input"
                />
              </Field>
              <Field icon={MapPin} label="City">
                <AddressAutocomplete cityOnly value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="Search city…" />
              </Field>
            </div>

            <Field icon={MessageSquare} label="Anything you'd like us to focus on?">
              <textarea value={form.message} onChange={update('message')} rows={3} placeholder="We manage 3 clinics and want to streamline scheduling…" className="portal-input resize-none" />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg w-full"
            >
              {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>) : (<>Request my demo <ArrowRight className="w-4 h-4" /></>)}
            </button>
            <p className="text-center text-xs text-gray-400">We'll email you a link to pick a date &amp; time.</p>
          </motion.form>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-lg p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <MailCheck className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-extrabold text-medical-dark">Request received! 🎉</h3>
            <p className="text-gray-600 mt-3 max-w-md mx-auto">
              Thanks, {form.contactName || 'there'}! We've emailed <strong>{form.email}</strong> to confirm.
              You'll get a link to choose your demo date &amp; time shortly.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> No spam, ever.
            </div>
            <button
              onClick={() => { setForm(initialForm); setStep('form'); }}
              className="btn btn-primary btn-lg mt-8"
            >
              Book another demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="portal-label">
        <Icon className="w-4 h-4 text-medical-blue" /> {label}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
