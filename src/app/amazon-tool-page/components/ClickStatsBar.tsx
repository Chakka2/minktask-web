import React from 'react';
import { MousePointer, TrendingUp, IndianRupee, Link2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// Backend: replace with Firestore affiliateStats for current user
const STATS = [
  { id: 'cs-total', label: 'Total Clicks', value: '1,204', icon: MousePointer, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  { id: 'cs-month', label: 'This Month', value: '247', icon: TrendingUp, color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  { id: 'cs-links', label: 'Links Created', value: '38', icon: Link2, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  { id: 'cs-est', label: 'Est. April Earn', value: '₹42', icon: IndianRupee, color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
];

export default function ClickStatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS?.map((stat) => {
        const Icon = stat?.icon;
        return (
          <div key={stat?.id} className="glass-card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat?.bg }}>
              <Icon size={18} style={{ color: stat?.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-white font-mono tabular-nums">{stat?.value}</p>
              <p className="text-xs text-white/40">{stat?.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}