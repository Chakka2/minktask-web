import React from 'react';
import { Users, Link2, IndianRupee } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const PILLARS = [
  {
    id: 'referral',
    icon: Users,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'rgba(99,102,241,0.25)',
    iconBg: 'rgba(99,102,241,0.2)',
    iconColor: '#818cf8',
    title: '3-Level Referral System',
    description: 'Earn every time someone joins through your link — and when they refer others too.',
    breakdown: [
      { level: 'Level 1', amount: '₹20', desc: 'Direct referral joins' },
      { level: 'Level 2', amount: '₹2', desc: 'Your referral refers someone' },
      { level: 'Level 3', amount: '₹1', desc: 'Goes 3 levels deep' },
    ],
  },
  {
    id: 'affiliate',
    icon: Link2,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'rgba(34,211,238,0.25)',
    iconBg: 'rgba(34,211,238,0.15)',
    iconColor: '#22d3ee',
    title: 'Amazon Affiliate Tool',
    description: 'Generate your own Amazon affiliate links instantly. Share products and earn commission.',
    breakdown: [
      { level: 'Link Generator', amount: 'Free', desc: 'Paste any Amazon URL' },
      { level: 'Click Tracking', amount: 'Auto', desc: 'Every click is recorded' },
      { level: 'Your Affiliate ID', amount: 'Instant', desc: 'Added automatically' },
    ],
  },
  {
    id: 'monthly',
    icon: IndianRupee,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'rgba(34,197,94,0.25)',
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: '#4ade80',
    title: 'Monthly Affiliate Share',
    description: '50% of platform affiliate earnings distributed monthly based on your click share.',
    breakdown: [
      { level: 'Pool Share', amount: '50%', desc: 'Of total affiliate revenue' },
      { level: 'Distribution', amount: 'Monthly', desc: 'Credited to your wallet' },
      { level: 'Based On', amount: 'Clicks', desc: 'Your % of total clicks' },
    ],
  },
];

export default function EarningPillars() {
  return (
    <section id="earnings" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Three Ways to Earn</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">Every action you take compounds into more income. Referrals, affiliate clicks, and monthly distributions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS?.map((pillar) => {
            const Icon = pillar?.icon;
            return (
              <div key={`pillar-${pillar?.id}`} className="glass-card-hover p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: pillar?.iconBg }}>
                  <Icon size={24} style={{ color: pillar?.iconColor }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar?.title}</h3>
                <p className="text-white/50 text-sm mb-5 leading-relaxed">{pillar?.description}</p>
                <div className="space-y-3">
                  {pillar?.breakdown?.map((item) => (
                    <div key={`${pillar?.id}-${item?.level}`} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <p className="text-xs font-semibold text-white/70">{item?.level}</p>
                        <p className="text-xs text-white/40">{item?.desc}</p>
                      </div>
                      <span className="text-sm font-bold font-mono tabular-nums" style={{ color: pillar?.iconColor }}>{item?.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}