'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  defs,
  linearGradient,
  stop,
} from 'recharts';

// Backend: replace with Firestore earnings aggregated by date
const EARNINGS_DATA = [
  { date: 'Mar 25', referral: 12, affiliate: 0, total: 12 },
  { date: 'Mar 26', referral: 0, affiliate: 0, total: 0 },
  { date: 'Mar 27', referral: 26, affiliate: 0, total: 26 },
  { date: 'Mar 28', referral: 12, affiliate: 0, total: 12 },
  { date: 'Mar 29', referral: 0, affiliate: 0, total: 0 },
  { date: 'Mar 30', referral: 14, affiliate: 42, total: 56 },
  { date: 'Mar 31', referral: 12, affiliate: 0, total: 12 },
  { date: 'Apr 1', referral: 12, affiliate: 0, total: 12 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs space-y-1 min-w-[130px]">
        <p className="font-semibold text-white mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={`tooltip-${entry.name}`} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }} className="capitalize">{entry.name}</span>
            <span className="font-mono font-semibold text-white tabular-nums">₹{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EarningsChart() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Daily Earnings</h3>
          <p className="text-xs text-white/40 mt-0.5">Last 8 days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#6366f1' }} />
            <span className="text-xs text-white/50">Referral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22d3ee' }} />
            <span className="text-xs text-white/50">Affiliate</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={EARNINGS_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReferral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAffiliate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="referral" stroke="#6366f1" strokeWidth={2} fill="url(#gradReferral)" />
          <Area type="monotone" dataKey="affiliate" stroke="#22d3ee" strokeWidth={2} fill="url(#gradAffiliate)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}