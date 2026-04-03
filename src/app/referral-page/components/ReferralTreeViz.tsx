import React from 'react';

export default function ReferralTreeViz() {
  return (
    <div className="glass-card p-5">
      <h3 className="text-base font-semibold text-white mb-5">Earning Breakdown</h3>
      <div className="space-y-4">
        {[
          { level: 'L1', count: 8, perEach: 12, total: 96, width: '100%', color: '#6366f1', bg: 'rgba(99,102,241,0.3)' },
          { level: 'L2', count: 16, perEach: 2, total: 32, width: '33%', color: '#818cf8', bg: 'rgba(129,140,248,0.25)' },
          { level: 'L3', count: 10, perEach: 1, total: 10, width: '10%', color: '#22d3ee', bg: 'rgba(34,211,238,0.2)' },
        ]?.map((item) => (
          <div key={`tree-viz-${item?.level}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: item?.bg, color: item?.color }}>{item?.level}</span>
                <span className="text-xs text-white/50">{item?.count} referrals × ₹{item?.perEach}</span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-white">₹{item?.total}</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: item?.width, background: item?.color, opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
        <span className="text-xs text-white/50">Total Referral Earnings</span>
        <span className="text-lg font-bold text-white font-mono tabular-nums">₹138</span>
      </div>
      <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <p className="text-xs text-white/50 mb-3 font-semibold">Potential if 100 L1 referrals</p>
        <div className="space-y-1.5">
          {[
            { label: 'L1 × 100', val: '₹1,200', color: '#6366f1' },
            { label: 'L2 × 200', val: '₹400', color: '#818cf8' },
            { label: 'L3 × 400', val: '₹400', color: '#22d3ee' },
          ]?.map((p) => (
            <div key={`pot-${p?.label}`} className="flex items-center justify-between">
              <span className="text-xs text-white/40">{p?.label}</span>
              <span className="text-xs font-bold font-mono" style={{ color: p?.color }}>{p?.val}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/60">Total potential</span>
            <span className="text-sm font-bold text-green-400 font-mono">₹2,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}