import React from 'react';
import Link from 'next/link';
import { MousePointer, ArrowRight } from 'lucide-react';

// Backend: replace with Firestore reel bundle stats doc for current user
const STATS = {
  totalClicks: 1204,
  thisMonthClicks: 247,
  estimatedEarning: 42,
  poolSharePercent: 8.3,
};

export default function AffiliateSnapshot() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Bundle Sales Snapshot</h3>
        <Link href="/reel-bundles" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          Shop <ArrowRight size={12} />
        </Link>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.15)' }}>
          <MousePointer size={18} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">{STATS?.totalClicks?.toLocaleString('en-IN')}</p>
          <p className="text-xs text-white/40">Total bundle link visits</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { label: 'This Month Visits', value: STATS?.thisMonthClicks?.toString(), color: '#22d3ee' },
          { label: 'Conversion', value: `${STATS?.poolSharePercent}%`, color: '#818cf8' },
          { label: 'Est. Bundle Earnings', value: `₹${STATS?.estimatedEarning}`, color: '#4ade80' },
        ]?.map((item) => (
          <div key={`aff-${item?.label}`} className="flex items-center justify-between">
            <span className="text-xs text-white/50">{item?.label}</span>
            <span className="text-sm font-semibold font-mono tabular-nums" style={{ color: item?.color }}>{item?.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}