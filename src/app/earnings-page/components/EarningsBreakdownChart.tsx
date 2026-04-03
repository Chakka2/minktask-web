'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Backend: replace with monthly aggregated earnings from Firestore
const MONTHLY_DATA = [
  { month: 'Jan', referral: 0, affiliate: 0, total: 0 },
  { month: 'Feb', referral: 0, affiliate: 0, total: 0 },
  { month: 'Mar', referral: 126, affiliate: 42, total: 168 },
  { month: 'Apr', referral: 12, affiliate: 0, total: 12 },
];

const WEEKLY_DATA = [
  { period: 'Mar 3', referral: 14, affiliate: 0, total: 14 },
  { period: 'Mar 10', referral: 26, affiliate: 0, total: 26 },
  { period: 'Mar 17', referral: 38, affiliate: 42, total: 80 },
  { period: 'Mar 24', referral: 48, affiliate: 0, total: 48 },
  { period: 'Mar 31', referral: 12, affiliate: 0, total: 12 },
  { period: 'Apr 1', referral: 12, affiliate: 0, total: 12 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs space-y-1 min-w-[130px]">
        <p className="font-semibold text-white mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={`et-${entry.name}`} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }} className="capitalize">{entry.name}</span>
            <span className="font-mono font-semibold text-white tabular-nums">₹{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EarningsBreakdownChart() {
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const data = view === 'monthly' ? MONTHLY_DATA : WEEKLY_DATA;
  const xKey = view === 'monthly' ? 'month' : 'period';

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Earnings Over Time</h3>
          <p className="text-xs text-white/40 mt-0.5">Referral + Affiliate breakdown</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['monthly', 'weekly'] as const).map((v) => (
            <button
              key={`chart-view-${v}`}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v ? 'gradient-bg text-white' : 'text-white/40 hover:text-white'}`}
            >
              {v === 'monthly' ? 'Monthly' : 'Weekly'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {[
          { key: 'referral', color: '#6366f1', label: 'Referral' },
          { key: 'affiliate', color: '#22d3ee', label: 'Affiliate' },
        ].map((item) => (
          <div key={`legend-${item.key}`} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-white/50">{item.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEarnRef" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradEarnAff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey={xKey} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="referral" stroke="#6366f1" strokeWidth={2} fill="url(#gradEarnRef)" />
          <Area type="monotone" dataKey="affiliate" stroke="#22d3ee" strokeWidth={2} fill="url(#gradEarnAff)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}