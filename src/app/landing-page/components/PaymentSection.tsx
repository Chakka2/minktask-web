'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, QrCode, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAuthUser } from '@/lib/auth';
import { getClientUserId, getReferralCode } from '@/lib/user';
import { ENTRY_VPA } from '@/lib/constants';

const TIMER_SECONDS = 120;

function formatMmSs(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PaymentSection() {
  const router = useRouter();
  const [expectedAmount, setExpectedAmount] = useState<number>(29.01);
  const [isLocked, setIsLocked] = useState(true);
  const [userId, setUserId] = useState('');
  const [isBusy, setIsBusy] = useState(true);
  const [initFailed, setInitFailed] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    const id = getClientUserId();
    setUserId(id);

    const init = async () => {
      setIsBusy(true);
      setInitFailed(false);
      try {
        const params = new URLSearchParams(window.location.search);
        const referredBy = params.get('ref');
        const referralCode = getReferralCode();
        const res = await fetch('/api/entry/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id, referredBy, referralCode }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setInitFailed(true);
          toast.error(data?.error || 'Could not load your personalised amount. You can still continue; try refreshing if this persists.');
        } else {
          setExpectedAmount(Number(data.expectedAmount ?? 29.01));
          if (typeof data.isLocked === 'boolean') setIsLocked(data.isLocked);
        }
      } catch {
        setInitFailed(true);
        toast.error('Network error loading payment setup. You can still open the QR.');
      } finally {
        setIsBusy(false);
      }
    };
    init();
  }, []);

  const pollStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/entry/status?userId=${encodeURIComponent(userId)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.isLocked !== 'boolean') return;
      setIsLocked(data.isLocked);
    } catch {
      /* ignore — do not flip to unlocked on network/HTML error */
    }
  }, [userId]);

  useEffect(() => {
    const ms = showQr ? 3000 : 8000;
    const timer = setInterval(pollStatus, ms);
    return () => clearInterval(timer);
  }, [pollStatus, showQr]);

  useEffect(() => {
    if (!showQr) return;
    setSecondsLeft(TIMER_SECONDS);
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(0, TIMER_SECONDS - elapsed);
      setSecondsLeft(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [showQr]);

  useEffect(() => {
    if (isBusy || isLocked || !showQr) return;
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 700);
    return () => clearTimeout(timer);
  }, [isBusy, isLocked, showQr, router]);

  const upiLink = `upi://pay?pa=${ENTRY_VPA}&pn=EarnHub&am=${expectedAmount.toFixed(
    2
  )}&cu=INR&tn=Entry-${userId || 'device'}`;

  const handlePayWithQr = () => {
    if (showQr) return;
    const id = userId || getClientUserId();
    if (!id) {
      toast.error('Could not identify this device. Please allow storage and refresh.');
      return;
    }
    if (id !== userId) setUserId(id);

    // Same as the old home-screen flow: show QR and timer immediately (no API wait).
    setSecondsLeft(TIMER_SECONDS);
    setShowQr(true);

    setNotifyLoading(true);
    void (async () => {
      try {
        const res = await fetch('/api/entry/pay-started', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id, amount: expectedAmount }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(
            typeof data?.error === 'string'
              ? data.error
              : 'Could not sync payment request right now. Your QR is still ready.'
          );
          return;
        }
        toast.success('Payment request received. Access updates automatically after confirmation.');
      } catch {
        toast.error('Network error while syncing payment request. Your QR is still ready.');
      } finally {
        setNotifyLoading(false);
      }
    })();
  };

  if (!isLocked && !isBusy) {
    const authUser = typeof window !== 'undefined' ? getAuthUser() : null;
    return (
      <section id="payment" className="py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card p-10 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={36} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Entry Confirmed</h3>
            <p className="text-sm text-white/50 mb-6">Your account is unlocked and active.</p>
            <a href={authUser ? '/dashboard' : '/signup'} className="btn-primary flex items-center justify-center gap-2">
              {authUser ? 'Open Dashboard' : 'Create Account'}
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Secure Account Activation</h2>
          <p className="text-white/50 text-lg">
            {showQr
              ? 'Complete payment for the amount shown. Access is enabled as soon as payment is confirmed.'
              : 'When you are ready, open your payment QR and pay the exact amount shown.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div
            className="relative z-10 p-8 text-center rounded-3xl animate-fade-in-up"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 16px 40px rgba(4, 10, 30, 0.35)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <QrCode size={32} className="text-indigo-400" />
            </div>

            {!showQr ? (
              <>
                <p className="text-3xl font-bold gradient-text font-mono tabular-nums mb-2">₹{expectedAmount.toFixed(2)}</p>
                <p className="text-sm text-white/45 mb-6">Your payable amount for this device.</p>
                <button
                  type="button"
                  onClick={handlePayWithQr}
                  className="btn-primary w-full max-w-xs mx-auto flex items-center justify-center gap-2"
                >
                  Pay with QR
                </button>
                {initFailed && (
                  <p className="text-xs text-white/40 mt-3 max-w-xs mx-auto leading-relaxed">
                    We couldn&apos;t sync your personalised amount yet. The figure shown may be a placeholder—refresh when
                    you&apos;re online, or use Support if you&apos;ve already paid.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Time remaining</span>
                  <span
                    className="text-lg font-mono font-bold tabular-nums px-3 py-1 rounded-xl"
                    style={{
                      background: secondsLeft <= 30 ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                      color: secondsLeft <= 30 ? '#fca5a5' : '#a5b4fc',
                    }}
                  >
                    {formatMmSs(secondsLeft)}
                  </span>
                </div>
                <div
                  className="mx-auto mb-5 rounded-2xl p-3 w-fit inline-block"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 10px 30px rgba(8, 15, 35, 0.2)',
                  }}
                >
                  <QRCodeSVG
                    value={upiLink}
                    size={260}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    className="rounded-xl block"
                    title="UPI payment QR"
                  />
                </div>
                {notifyLoading && (
                  <p className="text-xs text-white/45 mb-2 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin shrink-0" />
                    Syncing payment request…
                  </p>
                )}
                <p className="text-3xl font-bold gradient-text font-mono tabular-nums mb-2">₹{expectedAmount.toFixed(2)}</p>
              </>
            )}
          </div>

          <div className="space-y-4 animate-fade-in-up stagger-1">
            <h3 className="text-lg font-bold text-white mb-6">How it works</h3>
            {[
              'Tap Pay with QR only when you are ready to pay.',
              'Use any UPI app to pay the exact amount shown on screen.',
              'After confirmation, your account unlocks automatically within a few seconds.',
              'If payment is denied, your access remains locked.',
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-sm text-white/70 pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
