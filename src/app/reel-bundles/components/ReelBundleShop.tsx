'use client';

import { useMemo, useState } from 'react';
import { Copy, QrCode, X } from 'lucide-react';
import { REEL_BUNDLES, REEL_BUNDLE_PRICE } from '@/lib/constants';
import { getClientUserId, getReferralCode } from '@/lib/user';
import { ENTRY_VPA } from '@/lib/constants';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export default function ReelBundleShop() {
  const userId = useMemo(() => (typeof window !== 'undefined' ? getClientUserId() : ''), []);
  const referralCode = useMemo(() => (typeof window !== 'undefined' ? getReferralCode() : ''), []);
  const [buyingBundle, setBuyingBundle] = useState<string | null>(null);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [requestToken, setRequestToken] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const shareLink = (_bundleId: string) =>
    `https://mintytask.online/?ref=${referralCode}`;

  const onCopyLink = async (bundleId: string) => {
    const link = shareLink(bundleId);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else if (typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      } else {
        throw new Error('Clipboard unavailable');
      }
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy automatically. Please copy this link manually.');
    }
  };

  const onBuy = async (bundleId: string) => {
    setSelectedBundleId(bundleId);
    setShowPayPopup(true);
    setConfirmed(false);
    setRequestToken(null);
    setBuyingBundle(bundleId);
    const res = await fetch('/api/reel-bundles/pay-started', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId: userId, bundleId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data?.error || 'Could not start payment request');
      setBuyingBundle(null);
      return;
    }
    setRequestToken(data.token ?? null);
    setBuyingBundle(null);
  };

  const onCheckStatus = async () => {
    if (!requestToken || !selectedBundleId) return;
    const res = await fetch(`/api/reel-bundles/status?token=${encodeURIComponent(requestToken)}`);
    const data = await res.json().catch(() => ({}));
    if (data?.status === 'approved') {
      setConfirmed(true);
      toast.success('Bundle activated');
      return;
    }
    if (data?.status === 'denied') {
      toast.error('Payment was denied. Please retry.');
      return;
    }
    toast.message('Still pending confirmation');
  };

  const upiLink = `upi://pay?pa=${ENTRY_VPA}&pn=MintyTask&am=${REEL_BUNDLE_PRICE.toFixed(
    2
  )}&cu=INR&tn=ReelBundle-${userId}`;

  return (
    <div className="space-y-6 pb-20 lg:pb-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Reel Bundle Shop</h1>
        <p className="text-sm text-white/50 mt-0.5">
          Sell reel bundles with direct referral commission on each sale.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Reel Bundle Categories</h2>
        <p className="text-sm text-white/40">Each bundle ₹99 · Referrer earns ₹50</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REEL_BUNDLES.map((bundle) => (
          <div key={bundle.id} className="glass-card p-5 space-y-4">
            <div className="text-3xl">{bundle.emoji}</div>
            <h3 className="text-lg text-white font-semibold">{bundle.name}</h3>
            <p className="text-white/40 text-sm">
              Direct 1-level referral commission on successful sale.
            </p>
            <p className="text-2xl font-bold gradient-text">₹{REEL_BUNDLE_PRICE}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCopyLink(bundle.id)}
                className="btn-ghost text-sm inline-flex items-center justify-center gap-2"
              >
                <Copy size={14} />
                Copy Link
              </button>
              <button
                onClick={() => onBuy(bundle.id)}
                disabled={buyingBundle === bundle.id}
                className="btn-primary text-sm inline-flex items-center justify-center gap-2"
              >
                <QrCode size={14} />
                {buyingBundle === bundle.id ? 'Preparing...' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPayPopup && selectedBundleId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 relative">
            <button onClick={() => setShowPayPopup(false)} className="absolute right-3 top-3 p-2 text-white/50 hover:text-white">
              <X size={16} />
            </button>
            <h3 className="text-xl text-white font-bold mb-1">Complete Bundle Payment</h3>
            <p className="text-sm text-white/50 mb-4">Scan and pay ₹{REEL_BUNDLE_PRICE.toFixed(2)} to activate this bundle.</p>
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl p-3 bg-white">
                <QRCodeSVG value={upiLink} size={240} level="M" bgColor="#ffffff" fgColor="#0f172a" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={onCheckStatus} className="btn-primary" disabled={!requestToken}>
                {confirmed ? 'Activated' : 'I Have Paid - Check Status'}
              </button>
              {confirmed && (
                <a href="https://t.me/+PVL4Um3uaohhODBl" target="_blank" rel="noreferrer" className="btn-ghost text-center">
                  Join Private Community
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
