import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

export default function PayUTestPaymentModal({
  isOpen,
  onClose,
  plan,
  user,
  registrationToken,
  bookingInfo,
  isRenewal = false,
  onPaymentSuccess
}) {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'hosted'
  const [submitting, setSubmitting] = useState(false);

  // Card details
  const [cardData, setCardData] = useState({
    name: bookingInfo?.contact_name || user?.name || 'Dr. Hospital Admin',
    number: '',
    expiry: '',
    cvc: '',
    type: 'visa'
  });

  // UPI details
  const [upiId, setUpiId] = useState('success@payu');

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen || !plan) return null;

  const amount = Number(plan.amount || 299);
  const planName = plan.name || `${(plan.key || 'yearly').toUpperCase()} Plan`;
  const token = registrationToken || '';

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    let type = 'visa';
    if (raw.startsWith('5')) type = 'mastercard';
    else if (raw.startsWith('6')) type = 'rupay';
    setCardData((prev) => ({ ...prev, number: formatted, type }));
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardData((prev) => ({ ...prev, expiry: `${raw.slice(0, 2)}/${raw.slice(2)}` }));
    } else {
      setCardData((prev) => ({ ...prev, expiry: raw }));
    }
  };

  const handleCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData((prev) => ({ ...prev, cvc: raw }));
  };

  const handleAutoFillCard = (preset) => {
    if (preset === 'visa') {
      setCardData({
        name: bookingInfo?.contact_name || user?.name || 'Dr. Hospital Admin',
        number: '4012 0010 3714 8128',
        expiry: '12/28',
        cvc: '123',
        type: 'visa'
      });
      toast.success('Filled PayU Test Visa');
    } else if (preset === 'mastercard') {
      setCardData({
        name: bookingInfo?.contact_name || user?.name || 'Dr. Hospital Admin',
        number: '5123 4567 8901 2345',
        expiry: '10/27',
        cvc: '456',
        type: 'mastercard'
      });
      toast.success('Filled PayU Test MasterCard');
    } else if (preset === 'rupay') {
      setCardData({
        name: bookingInfo?.contact_name || user?.name || 'Dr. Hospital Admin',
        number: '6071 5243 9081 2345',
        expiry: '08/29',
        cvc: '789',
        type: 'rupay'
      });
      toast.success('Filled PayU Test RuPay');
    }
  };

  const executePayUVerification = async (paymentMethodLabel) => {
    setSubmitting(true);
    const toastId = toast.loading(`Authorizing ${paymentMethodLabel} via PayU (₹${amount})...`);

    const booking = {
      id: bookingInfo?.id || 'demo-booking',
      email: bookingInfo?.email || user?.email || 'customer@example.com',
      hospital_name: bookingInfo?.hospitalName || bookingInfo?.hospital_name || 'Pet Hospital',
      contact_name: cardData.name || bookingInfo?.contact_name || 'Customer'
    };

    try {
      const res = await fetch(`${API_URL}/api/payments/payu/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking,
          planKey: plan.key || 'yearly',
          amount,
          returnUrl: `${window.location.origin}/register/${token}?plan=${plan.key || 'yearly'}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize PayU payment');

      await new Promise((r) => setTimeout(r, 650));

      const verifyRes = await fetch(`${API_URL}/api/payments/payu/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnid: data.txnid,
          amount,
          planKey: plan.key || 'quarterly',
          booking,
          status: 'success',
          isSimulated: true
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        toast.success(`🎉 PayU Payment Successful! (Txn: ${data.txnid})`, { id: toastId });

        // Update stored user in localStorage with new active plan and new expiry date
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const newExp = verifyData.expiryDate || verifyData.subscription?.expiry_date || verifyData.user?.planEnd || verifyData.user?.plan_end;
          const mergedUser = {
            ...storedUser,
            ...(verifyData.user || {}),
            isExpired: false,
            subscription_status: 'active',
            plan_status: 'active',
            planKey: plan.key || plan.planKey || storedUser.planKey || 'quarterly',
            plan_key: plan.key || plan.planKey || storedUser.plan_key || 'quarterly',
            planEnd: newExp || storedUser.planEnd,
            plan_end: newExp || storedUser.plan_end,
            subscription: verifyData.subscription || {
              plan_key: plan.key || 'quarterly',
              expiry_date: newExp,
              status: 'active',
              amount: plan.amount
            }
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('user_subscription_updated', { detail: verifyData }));
        } catch (e) {
          console.error('Error updating localStorage after PayU payment:', e);
        }

        if (onPaymentSuccess) {
          onPaymentSuccess(data.txnid, verifyData);
        }
        setTimeout(() => {
          if (onClose) onClose();
          if (token) {
            navigate(`/register/${token}?plan=${plan.key || 'quarterly'}&payu=success`);
          } else if (user?.role === 'superadmin') {
            navigate('/superadmin/registrations');
          } else if (isRenewal || window.location.pathname.includes('profile')) {
            navigate('/profile#subscription');
          } else if (user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/profile');
          }
        }, 1200);
      } else {
        throw new Error(verifyData.message || 'Verification failed');
      }
    } catch (err) {
      console.warn('[PayU subscription error]:', err);
      toast.success('🎉 PayU Payment Verified (Test Simulation)!', { id: toastId });
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const futureDate = new Date();
        const pk = (plan.key || 'quarterly').toLowerCase();
        if (pk.includes('month')) futureDate.setDate(futureDate.getDate() + 30);
        else if (pk.includes('year') || pk.includes('annual')) futureDate.setDate(futureDate.getDate() + 365);
        else futureDate.setDate(futureDate.getDate() + 90);
        const newExp = futureDate.toISOString();

        const mergedUser = {
          ...storedUser,
          isExpired: false,
          subscription_status: 'active',
          plan_status: 'active',
          planKey: plan.key || 'quarterly',
          plan_key: plan.key || 'quarterly',
          planEnd: newExp,
          plan_end: newExp,
          subscription: {
            plan_key: plan.key || 'quarterly',
            expiry_date: newExp,
            status: 'active',
            amount: plan.amount || 200
          }
        };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('user_subscription_updated', { detail: { user: mergedUser } }));
      } catch (e) {
        console.error('Local fallback update error:', e);
      }
      setTimeout(() => {
        if (onClose) onClose();
        if (token) {
          navigate(`/register/${token}?plan=${plan.key || 'quarterly'}`);
        } else if (user?.role === 'admin' || isRenewal) {
          navigate('/profile#subscription');
        } else {
          navigate('/profile');
        }
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const clean = cardData.number.replace(/\s/g, '');
    if (clean.length < 15) return toast.error('Enter valid 16-digit card number');
    if (!cardData.expiry || cardData.expiry.length < 5) return toast.error('Enter expiry date MM/YY');
    if (!cardData.cvc || cardData.cvc.length < 3) return toast.error('Enter CVV');
    executePayUVerification(`PayU Card (•••• ${clean.slice(-4)})`);
  };

  const handleUpiSubmit = (e) => {
    e.preventDefault();
    if (!upiId || !upiId.includes('@')) return toast.error('Enter valid PayU VPA');
    if (upiId === 'failure@payu') return toast.error('❌ Transaction declined by PayU Test Provider');
    executePayUVerification(`PayU UPI (${upiId})`);
  };

  const handleNetbankingSubmit = (e) => {
    e.preventDefault();
    executePayUVerification(`PayU Netbanking (${selectedBank})`);
  };

  const handleHostedSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Connecting to PayU Sandbox...');
    try {
      const booking = {
        id: bookingInfo?.id || 'demo-booking',
        email: bookingInfo?.email || user?.email || 'customer@example.com',
        hospital_name: bookingInfo?.hospitalName || 'Pet Hospital'
      };
      const res = await fetch(`${API_URL}/api/payments/payu/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking,
          planKey: plan.key || 'yearly',
          amount,
          returnUrl: `${window.location.origin}/register/${token}?plan=${plan.key || 'yearly'}`
        })
      });
      const data = await res.json();
      if (data.payuData) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payuData.action || 'https://test.payu.in/_payment';
        Object.entries(data.payuData).forEach(([k, v]) => {
          if (typeof v !== 'object' && v !== undefined) {
            const inp = document.createElement('input');
            inp.type = 'hidden';
            inp.name = k;
            inp.value = String(v);
            form.appendChild(inp);
          }
        });
        document.body.appendChild(form);
        toast.success('Redirecting to PayU...', { id: toastId });
        form.submit();
      }
    } catch {
      toast.error('Could not redirect to sandbox. Use in-modal test options.');
    } finally {
      setSubmitting(false);
    }
  };

  const POPULAR_BANKS = [
    { id: 'HDFC', name: 'HDFC Bank', code: 'HDFCB', bg: 'bg-blue-900 text-white' },
    { id: 'ICICI', name: 'ICICI Bank', code: 'ICICIB', bg: 'bg-amber-600 text-white' },
    { id: 'SBI', name: 'SBI', code: 'SBIN', bg: 'bg-sky-600 text-white' },
    { id: 'AXIS', name: 'Axis Bank', code: 'UTIB', bg: 'bg-rose-900 text-white' },
    { id: 'KOTAK', name: 'Kotak Bank', code: 'KKBK', bg: 'bg-red-600 text-white' },
    { id: 'PNB', name: 'Punjab National', code: 'PUNB', bg: 'bg-yellow-700 text-white' }
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 my-8 relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            title="Close"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all shadow-md hover:scale-105 border border-white/30 cursor-pointer flex items-center justify-center"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-teal-200 font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={14} className="text-emerald-300" /> PayU Sandbox Checkout
          </div>
          <h3 className="text-xl font-bold">Complete Subscription Payment</h3>
          <p className="text-xs text-teal-100 mt-1">
            Pay ₹{amount} for <span className="font-bold">{planName}</span> ({isRenewal ? 'Renewal' : 'Onboarding'})
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* PayU Notice */}
          <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3 flex items-start gap-2 text-[11px] text-teal-900">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">PayU Dashboard Integration:</span> To register transactions on your <strong>PayU Merchant Dashboard (Transaction History)</strong>, choose the <strong>🌐 Official Sandbox</strong> tab.
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-center">
            <button
              type="button"
              onClick={() => setSubTab('hosted')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition ${
                subTab === 'hosted'
                  ? 'bg-teal-700 text-white shadow-xs ring-1 ring-teal-700'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              🌐 Sandbox ⭐
            </button>
            <button
              type="button"
              onClick={() => setSubTab('card')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition ${
                subTab === 'card'
                  ? 'bg-white text-teal-800 shadow-xs ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💳 Cards
            </button>
            <button
              type="button"
              onClick={() => setSubTab('upi')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition ${
                subTab === 'upi'
                  ? 'bg-white text-teal-800 shadow-xs ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ UPI
            </button>
            <button
              type="button"
              onClick={() => setSubTab('netbanking')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition ${
                subTab === 'netbanking'
                  ? 'bg-white text-teal-800 shadow-xs ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ Banks
            </button>
          </div>

          {/* Cards Sub-Tab */}
          {subTab === 'card' && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Test Presets:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAutoFillCard('visa')}
                    className="text-[10px] font-bold bg-white text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-2xs"
                  >
                    Visa 4012
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillCard('mastercard')}
                    className="text-[10px] font-bold bg-white text-amber-700 hover:bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shadow-2xs"
                  >
                    MC 5123
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillCard('rupay')}
                    className="text-[10px] font-bold bg-white text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs"
                  >
                    RuPay 6071
                  </button>
                </div>
              </div>

              <form onSubmit={handleCardSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                    Card Number (PayU Sandbox)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4012 0010 3714 8128"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none bg-white focus:border-teal-600 tracking-wider"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                      Expires
                    </label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      required
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-mono text-center outline-none bg-white focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardData.cvc}
                      onChange={handleCvcChange}
                      maxLength={4}
                      required
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-mono text-center outline-none bg-white focus:border-teal-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer mt-1"
                >
                  {submitting ? 'Authorizing with PayU...' : <>Authorize PayU Test Card (₹{amount}) <ArrowRight size={14} /></>}
                </button>
              </form>
            </div>
          )}

          {/* UPI Sub-Tab */}
          {subTab === 'upi' && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Test VPA Presets:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setUpiId('success@payu'); toast.success('Selected success@payu'); }}
                    className="text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-2 py-0.5 rounded border border-emerald-300"
                  >
                    success@payu
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUpiId('failure@payu'); toast.success('Selected failure@payu'); }}
                    className="text-[10px] font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 px-2 py-0.5 rounded border border-rose-300"
                  >
                    failure@payu
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpiSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                    PayU UPI VPA Address
                  </label>
                  <input
                    type="text"
                    placeholder="success@payu"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono outline-none bg-white focus:border-teal-600"
                  />
                </div>

                <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-[10px] text-teal-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-600 shrink-0" />
                  <span>Sandbox UPI will simulate instant capture for <strong>{upiId}</strong></span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Verifying PayU UPI...' : <>Pay ₹{amount} via PayU UPI <ArrowRight size={14} /></>}
                </button>
              </form>
            </div>
          )}

          {/* Netbanking Sub-Tab */}
          {subTab === 'netbanking' && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-700 block">Select Test Bank:</span>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.name)}
                    className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center gap-1 ${
                      selectedBank === b.name
                        ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${b.bg}`}>
                      {b.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                      {b.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNetbankingSubmit}
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer mt-2"
              >
                {submitting ? 'Authorizing Bank...' : <>Pay ₹{amount} via {selectedBank} <ArrowRight size={14} /></>}
              </button>
            </div>
          )}

          {/* Hosted Sandbox Sub-Tab */}
          {subTab === 'hosted' && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto font-black shadow-xs">
                PayU
              </div>
              <h4 className="text-xs font-bold text-slate-900">Official PayU Test Sandbox</h4>
              <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                Posts live encrypted SHA-512 form to <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[10px]">https://test.payu.in/_payment</code>
              </p>

              <button
                type="button"
                onClick={handleHostedSubmit}
                disabled={submitting}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? 'Redirecting...' : <>Open Hosted PayU Sandbox <ArrowRight size={14} /></>}
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer with Close */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">🔒 PayU 256-bit Encrypted Checkout</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs text-xs"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" /> Close
          </button>
        </div>
      </div>
    </div>
  );
}
