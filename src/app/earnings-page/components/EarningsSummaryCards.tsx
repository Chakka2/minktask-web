import React from 'react';
import { IndianRupee, Users, MousePointer, Calendar } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// Backend: replace with aggregated earnings from Firestore transactions
const SUMMARY = [
  { id: 'es-total', label: 'Total Lifetime Earnings', value: '₹486', sub: 'Since joining Mar 2026', icon: IndianRupee, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', positive: true },
  { id: 'es-referral', label: 'Referral Earnings', value: '₹138', sub: 'From 34 referrals (L1+L2+L3)', icon: Users, color: '#818cf8', bg: 'rgba(129,140,248,0.12)', positive: true },
  { id: 'es-affiliate', label: 'Affiliate Earnings', value: '₹84', sub: '2 distributions received', icon: MousePointer, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', positive: true },
  { id: 'es-this-month', label: 'This Month', value: '₹58', sub: 'April 2026 so far', icon: Calendar, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', positive: null },
];

export default function EarningsSummaryCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {SUMMARY?.map((card) => {
        const Icon = card?.icon;
        return (
          <div key={card?.id} className="glass-card-hover p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: card?.bg }}>
              <Icon size={18} style={{ color: card?.color }} />
            </div>
            <p className="text-2xl font-bold text-white font-mono tabular-nums mb-1">{card?.value}</p>
            <p className="text-xs font-medium text-white/50 mb-0.5">{card?.label}</p>
            <p className="text-xs text-white/30">{card?.sub}</p>
          </div>
        );
      })}
    </div>
  );
}