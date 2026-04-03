import React from 'react';
import AppLayout from '@/components/AppLayout';
import EarningsSummaryCards from './components/EarningsSummaryCards';
import EarningsBreakdownChart from './components/EarningsBreakdownChart';
import TransactionHistoryTable from './components/TransactionHistoryTable';

export default function EarningsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 pb-20 lg:pb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-sm text-white/40 mt-0.5">Complete breakdown of all your income</p>
        </div>

        <EarningsSummaryCards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <EarningsBreakdownChart />
          </div>
          <div>
            <SourceBreakdown />
          </div>
        </div>

        <TransactionHistoryTable />
      </div>
    </AppLayout>
  );
}

// Inline source breakdown component
function SourceBreakdown() {
  const sources = [
    { id: 'src-ref', label: 'Referral Earnings', amount: 138, pct: 56, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { id: 'src-aff', label: 'Affiliate Distribution', amount: 84, pct: 34, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
    { id: 'src-bonus', label: 'Bonus Credits', amount: 26, pct: 10, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  ];
  const total = sources?.reduce((s, x) => s + x?.amount, 0);

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-base font-semibold text-white mb-5">Source Breakdown</h3>
      <div className="space-y-4">
        {sources?.map((src) => (
          <div key={src?.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/60">{src?.label}</span>
              <span className="text-sm font-bold font-mono tabular-nums text-white">₹{src?.amount}</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${src?.pct}%`, background: src?.color, opacity: 0.75 }} />
            </div>
            <p className="text-xs text-white/30 mt-0.5">{src?.pct}% of total</p>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
        <span className="text-xs text-white/50">Total Earnings</span>
        <span className="text-lg font-bold text-white font-mono tabular-nums">₹{total}</span>
      </div>
    </div>
  );
}