import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Loader2, CheckCircle2, AlertCircle, CreditCard, Heart, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import PortalCardPage from '../../components/portal/PortalCardPage';

export default function FeedbackPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [interested, setInterested] = useState(null); // null = not chosen yet
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/feedback/${token}`);
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'Invalid feedback link'); return; }
        setInfo(data);
      } catch {
        setError('Could not load feedback form');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, interested: interested === true, comment })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not submit feedback');

      if (data.interested && (data.redirectUrl || data.plansUrl)) {
        navigate(data.redirectUrl || data.plansUrl || `/pricing?token=${token}`);
        return;
      }
      if (data.interested && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.interested && data.registerUrl) {
        navigate(data.registerUrl);
        return;
      }
      setDone(true);
      toast.success('Thanks for your feedback!');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PortalCardPage><div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-medical-blue" /></div></PortalCardPage>;

  if (error) return (
    <PortalCardPage>
      <div className="text-center py-8">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-medical-dark">{error}</h1>
      </div>
    </PortalCardPage>
  );

  if (done || info?.alreadySubmitted) return (
    <PortalCardPage>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-5" />
        <h1 className="text-2xl font-extrabold text-medical-dark">Thank you! 🙏</h1>
        <p className="text-gray-600 mt-3">Your feedback helps us make the Pet Hospital Portal better.</p>
      </motion.div>
    </PortalCardPage>
  );

  const priceLabel = info?.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: (info.price.currency || 'usd').toUpperCase() }).format((info.price.amount || 0) / 100)
    : '';

  return (
    <PortalCardPage icon={Star} title="How was your demo?" subtitle={`We'd love your feedback, ${info?.booking?.contactName || 'there'}.`}>
      <form onSubmit={submit} className="space-y-6">
        <div className="text-center">
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star className={`w-9 h-9 ${(hover || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          {rating > 0 && <p className="text-sm text-gray-500 mt-2">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Comments (optional)</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="What did you like? What could be better?" className="portal-input resize-none" />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Would you like to get started with the portal?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setInterested(true)}
              className={`text-left p-4 rounded-2xl border-2 transition ${interested === true ? 'border-medical-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="flex items-center gap-2 font-bold text-medical-dark"><Heart className="w-4 h-4 text-rose-500" /> Yes, I'm interested!</span>
              <span className="block text-sm text-gray-500 mt-0.5">Continue to {info?.stripeEnabled ? `payment (${priceLabel})` : 'registration'} and set up your hospital.</span>
            </button>
            <button type="button" onClick={() => setInterested(false)}
              className={`text-left p-4 rounded-2xl border-2 transition ${interested === false ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300'}`}>
              <span className="flex items-center gap-2 font-bold text-gray-700"><ThumbsDown className="w-4 h-4 text-gray-400" /> Not interested right now</span>
              <span className="block text-sm text-gray-500 mt-0.5">Just leaving feedback — that's totally fine!</span>
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-medical-dark hover:bg-medical-blue disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-full shadow-lg transition-all">
          {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>)
            : interested ? (<><CreditCard className="w-4 h-4" /> Continue{info?.stripeEnabled ? ' to payment' : ''}</>)
            : 'Submit feedback'}
        </button>
      </form>
    </PortalCardPage>
  );
}
