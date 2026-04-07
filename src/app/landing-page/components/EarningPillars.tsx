import React from 'react';
import { Users, Link2, IndianRupee } from 'lucide-react';


const PILLARS = [
  {
    id: 'referral',
    icon: Users,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'rgba(99,102,241,0.2)',
    iconBg: 'rgba(99,102,241,0.2)',
    iconColor: '#818cf8',
    title: '3-Level Entry Network',
    description: 'Entry network rewards continue independently from bundle sale commissions.',
    breakdown: [
      { level: 'Level 1', amount: '₹20', desc: 'Direct entry referral' },
      { level: 'Level 2', amount: '₹2', desc: 'Your referral refers someone' },
      { level: 'Level 3', amount: '₹1', desc: 'Goes 3 levels deep' },
    ],
  },
  {
    id: 'bundles',
    icon: Link2,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'rgba(34,211,238,0.25)',
    iconBg: 'rgba(34,211,238,0.15)',
    iconColor: '#22d3ee',
    title: 'Reel Bundle Marketplace',
    description: 'Share your unique bundle links and convert buyers into direct sale commissions.',
    breakdown: [
      { level: 'Bundles', amount: '10', desc: 'Niche-ready reel categories' },
      { level: 'Bundle Price', amount: '₹99', desc: 'Per bundle purchase' },
      { level: 'Link Share', amount: 'Instant', desc: 'Your referral link auto-attached' },
    ],
  },
  {
    id: 'sale-profit',
    icon: IndianRupee,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'rgba(34,197,94,0.25)',
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: '#4ade80',
    title: 'Direct Sale Earnings',
    description: 'Every successful referred bundle sale gives you instant commission.',
    breakdown: [
      { level: 'Your Commission', amount: '₹50', desc: 'Per referred sale' },
      { level: 'Bundle Price', amount: '₹99', desc: 'Per bundle purchase' },
      { level: 'Type', amount: '1-Level', desc: 'Direct product referral only' },
    ],
  },
];

export default function EarningPillars() {
  return (
    <section id="earnings" className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Three Ways to Earn</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">Every action you take compounds into more income through entry referrals and reel bundle sales.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS?.map((pillar) => {
            const Icon = pillar?.icon;
            return (
              <div
                key={`pillar-${pillar?.id}`}
                className="glass-card-hover p-7 animate-fade-in-up"
                style={{ border: '1px solid rgba(255,255,255,0.18)' }}
              >
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