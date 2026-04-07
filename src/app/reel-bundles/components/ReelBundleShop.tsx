'use client';

import { useMemo, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { REEL_BUNDLES, REEL_BUNDLE_PRICE } from '@/lib/constants';
import { getClientUserId } from '@/lib/user';

export default function ReelBundleShop() {
  const userId = useMemo(() => (typeof window !== 'undefined' ? getClientUserId() : ''), []);
  const [buyingBundle, setBuyingBundle] = useState<string | null>(null);

  const shareLink = (bundleId: string) =>
    `${window.location.origin}/reel-bundles?bundle=${bundleId}&ref=${userId}`;

  const onCopyLink = async (bundleId: string) => {
    await navigator.clipboard.writeText(shareLink(bundleId));
  };

  const onBuy = async (bundleId: string) => {
    setBuyingBundle(bundleId);
    const params = new URLSearchParams(window.location.search);
    const referrerId = params.get('ref');
    await fetch('/api/reel-bundles/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId: userId, referrerId, bundleId }),
    });
    setBuyingBundle(null);
  };

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
        <p className="text-sm text-white/40">Each bundle ₹99 · Referrer earns ₹50 · Owner keeps ₹49</p>
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
                <Share2 size={14} />
                {buyingBundle === bundle.id ? 'Buying...' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
