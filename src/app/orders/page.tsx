'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { REEL_BUNDLES } from '@/lib/constants';
import { getClientUserId } from '@/lib/user';

type Order = {
  id: string;
  bundleId: string;
  price: number;
};

export default function OrdersPage() {
  const userId = useMemo(() => (typeof window !== 'undefined' ? getClientUserId() : ''), []);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
      const data = await res.json().catch(() => ({ orders: [] }));
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    };
    load();
  }, [userId]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 lg:pb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-white/50 mt-0.5">Your purchased bundles and access links.</p>
        </div>

        <a href="https://t.me/+PVL4Um3uaohhODBl" target="_blank" rel="noreferrer" className="btn-ghost inline-flex">
          Join Private Community
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => {
            const bundle = REEL_BUNDLES.find((b) => b.id === order.bundleId);
            return (
              <div key={order.id} className="glass-card p-5">
                <p className="text-3xl mb-2">{bundle?.emoji ?? '🎬'}</p>
                <h3 className="text-white font-semibold">{bundle?.name ?? order.bundleId}</h3>
                <p className="text-sm text-white/50 mt-1">Purchased • ₹{order.price.toFixed(2)}</p>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="glass-card p-6 text-white/60">No bundles purchased yet.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

