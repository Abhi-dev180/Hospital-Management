import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

export default function PlanExpiredModal({ isOpen, onClose, subscription, user }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Extract plan key and resolve plan name & interval label
  const rawPlanKey = (subscription?.plan_key || user?.planKey || user?.plan_key || 'quarterly').toLowerCase();

  const getPlanMeta = (key) => {
    if (key.includes('month')) {
      return { name: 'Monthly subscription', interval: 'billed every 30 days' };
    }
    if (key.includes('year') || key.includes('annual')) {
      return { name: 'Yearly subscription', interval: 'billed every 365 days' };
    }
    return { name: 'Quarterly subscription', interval: 'billed every 90 days' };
  };

  const planMeta = getPlanMeta(rawPlanKey);

  // Format expiry date
  const rawDate = subscription?.expiry_date || user?.planEnd || user?.plan_end || user?.expiryDate || '2026-08-23';
  let formattedDate = 'August 23, 2026';
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (e) {
    /* fallback to default */
  }

  const handleRenew = () => {
    if (onClose) onClose();
    const token = user?.renewal_token || subscription?.renewal_token;
    if (token) {
      navigate(`/renew/${token}`);
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 transition-all duration-300">
      <div 
        className="bg-white rounded-[28px] shadow-2xl max-w-[420px] w-full p-7 text-center border border-red-100/80 relative transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Circle Exclamation Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fde8e8] ring-8 ring-[#fdf2f2]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc2626] text-white shadow-xs">
            <svg 
              className="h-7 w-7" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl font-extrabold text-[#991b1b] tracking-tight mb-3">
          Your plan has expired
        </h3>

        {/* Description Text matching exact wording & formatting */}
        <p className="text-[#475569] text-[15px] leading-relaxed mb-7 px-1">
          Your{' '}
          <span className="font-bold text-[#1e293b]">
            {planMeta.name} — {planMeta.interval}
          </span>{' '}
          plan has expired on{' '}
          <span className="font-bold text-[#b91c1c]">{formattedDate}</span>. Renew
          your subscription to continue using your plan.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-[#fca5a5]/80 bg-white hover:bg-red-50/50 text-[#991b1b] font-semibold text-sm transition-colors duration-150 shadow-2xs"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleRenew}
            className="w-full py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all duration-150 hover:shadow-lg active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4 stroke-[2.5]" />
            <span>Renew Subscription</span>
          </button>
        </div>
      </div>
    </div>
  );
}
