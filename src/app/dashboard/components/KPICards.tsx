import React from 'react';
import { Users, MousePointer, TrendingUp, IndianRupee } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const KPI_DATA = [
  {
    id: 'kpi-total-earned',
    label: 'Total Earnings',
    value: '₹486.00',
    change: '+₹58 this month',
    positive: true,
    icon: IndianRupee,
    iconBg: 'rgba(59,130,246,0.15)',
    iconColor: '#60a5fa',
  },
  {
    id: 'kpi-referrals',
    label: 'Total Referrals',
    value: '34',
    change: 'L1: 8 · L2: 16 · L3: 10',
    positive: true,
    icon: Users,
    iconBg: 'rgba(99,102,241,0.15)',
    iconColor: '#818cf8',
  },
  {
    id: 'kpi-clicks',
    label: 'Affiliate Clicks',
    value: '1,204',
    change: '+87 this week',
    positive: true,
    icon: MousePointer,
    iconBg: 'rgba(34,211,238,0.12)',
    iconColor: '#22d3ee',
  },
  {
    id: 'kpi-affiliate',
    label: 'Affiliate Pool Share',
    value: '~₹42',
    change: 'Est. for April 2026',
    positive: null,
    icon: TrendingUp,
    iconBg: 'rgba(251,191,36,0.12)',
    iconColor: '#fbbf24',
  },
];

export default function KPICards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {KPI_DATA?.map((kpi) => {
        const Icon = kpi?.icon;
        return (
          <div key={kpi?.id} className="glass-card-hover p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi?.iconBg }}>
                <Icon size={18} style={{ color: kpi?.iconColor }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-mono tabular-nums mb-1">{kpi?.value}</p>
            <p className="text-xs font-medium text-white/50 mb-1">{kpi?.label}</p>
            <p className={`text-xs font-medium ${kpi?.positive === true ? 'text-green-400' : kpi?.positive === false ? 'text-red-400' : 'text-yellow-400/80'}`}>
              {kpi?.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}