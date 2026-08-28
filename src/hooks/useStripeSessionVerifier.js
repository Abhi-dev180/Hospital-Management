import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

export default function useStripeSessionVerifier() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const processedRef = useRef(new Set());

  useEffect(() => {
    if (!sessionId || processedRef.current.has(sessionId)) return;

    processedRef.current.add(sessionId);

    const verifyStripeSession = async () => {
      const loadingToast = toast.loading('Verifying payment and activating subscription...');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });

        const data = await res.json();
        toast.dismiss(loadingToast);

        if (res.ok && data.paid) {
          toast.success(data.message || '🎉 Payment verified! Your subscription is now active.', { duration: 6000 });

          // Update user in localStorage & dispatch event to update Navbar/Profile
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const newSub = data.subscription || data.subscriptionRecord || currentUser.subscription;
          const newExp = newSub?.expiry_date || data.user?.planEnd || data.user?.plan_end;

          const mergedUser = {
            ...currentUser,
            ...(data.user || {}),
            isExpired: false,
            subscription_status: 'active',
            plan_status: 'active',
            planEnd: newExp || currentUser.planEnd,
            plan_end: newExp || currentUser.plan_end,
            subscription: newSub ? { ...newSub, status: 'active', expiry_date: newExp || newSub.expiry_date } : null
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('user_subscription_updated', { detail: data }));

          // Clean up session_id from URL bar without page reload
          searchParams.delete('session_id');
          setSearchParams(searchParams, { replace: true });
        } else {
          toast.error(data.message || 'Payment verification returned incomplete status.');
        }
      } catch (err) {
        toast.dismiss(loadingToast);
        console.error('[useStripeSessionVerifier] Verification error:', err);
        toast.error('Payment verification failed. Please refresh your profile.');
      }
    };

    verifyStripeSession();
  }, [sessionId, searchParams, setSearchParams]);
}
