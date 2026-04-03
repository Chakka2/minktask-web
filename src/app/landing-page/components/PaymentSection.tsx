'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, QrCode, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UPI_ID = 'mintask@upi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentSection() {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Developer bypass check
  const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

  useEffect(() => {
    // Capture referral code from URL query param
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      // Persist referral code in sessionStorage so it survives page navigation
      sessionStorage.setItem('mintask_ref', ref);
    } else {
      const stored = sessionStorage.getItem('mintask_ref');
      if (stored) setReferralCode(stored);
    }

    // Load Razorpay script
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleCopyUPI = () => {
    navigator.clipboard?.writeText(UPI_ID)?.then(() => {
      setCopied(true);
      toast?.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRazorpayPayment = async () => {
    if (DEV_BYPASS) {
      toast.success('Dev bypass active — access granted!');
      setIsPaid(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 2900, currency: 'INR', referralCode }),
      });

      if (!res.ok) {
        toast.error('Could not initiate payment. Please try again.');
        setIsLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = await res.json();

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Mintask',
        description: 'Lifetime Access — ₹29',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                referralCode,
              }),
            });

            const result = await verifyRes.json();
            if (result.success) {
              toast.success('Payment successful! Welcome to Mintask 🎉');
              setIsPaid(true);
              sessionStorage.removeItem('mintask_ref');
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Verification error. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          referral_code: referralCode,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (isPaid) {
    return (
      <section id="payment" className="py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card p-10 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={36} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're In! 🎉</h3>
            <p className="text-sm text-white/50 mb-6">Your account is now active. Start earning with Mintask.</p>
            <a href="/dashboard" className="btn-primary flex items-center justify-center gap-2">
              Go to Dashboard
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="payment" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join for Just ₹29</h2>
          <p className="text-white/50 text-lg">One-time payment. Lifetime access to all features.</p>
          {referralCode && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <span className="text-white/60">Referred by:</span>
              <span className="font-bold font-mono text-blue-400">{referralCode}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Razorpay Pay Button */}
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Zap size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pay Securely with Razorpay</h3>
            <p className="text-sm text-white/50 mb-6">UPI, Cards, Net Banking, Wallets — all supported</p>
            <p className="text-3xl font-bold gradient-text font-mono tabular-nums mb-6">₹29.00</p>
            <button
              onClick={handleRazorpayPayment}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '52px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Opening Payment...
                </>
              ) : DEV_BYPASS ? (
                <>
                  <Zap size={18} />
                  Dev Bypass — Skip Payment
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Pay ₹29 & Get Access
                </>
              )}
            </button>
            <p className="text-xs text-white/30 mt-3">Secured by Razorpay · 256-bit SSL</p>

            {/* Manual UPI fallback */}
            <div className="mt-6 pt-6 border-t border-white/8">
              <p className="text-xs text-white/40 mb-3">Or pay manually via UPI</p>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <QrCode size={14} className="text-white/30 flex-shrink-0" />
                <span className="flex-1 text-sm text-white font-mono">{UPI_ID}</span>
                <button onClick={handleCopyUPI} className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-white/50 hover:text-white" aria-label="Copy UPI ID">
                  {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">How It Works</h3>
            {[
              { step: '1', text: 'Click "Pay ₹29 & Get Access" above' },
              { step: '2', text: 'Complete payment via Razorpay (UPI, Card, etc.)' },
              { step: '3', text: 'Your account is activated instantly after payment' },
              { step: '4', text: 'Start earning with referrals and affiliate links!' },
            ]?.map((item) => (
              <div key={`pay-step-${item?.step}`} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {item?.step}
                </div>
                <p className="text-sm text-white/70 pt-1">{item?.text}</p>
              </div>
            ))}

            <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm font-semibold text-green-400">What You Get</span>
              </div>
              <ul className="space-y-1">
                {['Lifetime platform access', '3-level referral system (₹20/₹2/₹1)', 'Amazon affiliate tool', 'Monthly earnings distribution', 'UPI withdrawal from ₹50']?.map((feature) => (
                  <li key={`feature-${feature}`} className="text-xs text-white/60 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-400/60" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}