import React from 'react';

// Backend: replace with aggregated referral counts and earnings from Firestore
const LEVEL_STATS = [
  {
    id: 'level-1',
    level: 'Level 1',
    levelNum: 1,
    description: 'Direct referrals',
    count: 8,
    perReferral: 20,
    totalEarned: 160,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    id: 'level-2',
    level: 'Level 2',
    levelNum: 2,
    description: "Your referrals\' referrals",
    count: 16,
    perReferral: 2,
    totalEarned: 32,
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.1)',
    border: 'rgba(129,140,248,0.2)',
  },
  {
    id: 'level-3',
    level: 'Level 3',
    levelNum: 3,
    description: '3 levels deep',
    count: 10,
    perReferral: 1,
    totalEarned: 10,
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.08)',
    border: 'rgba(34,211,238,0.18)',
  },
];

export default function LevelStatsCards() {
  const totalReferrals = LEVEL_STATS?.reduce((s, l) => s + l?.count, 0);
  const totalEarned = LEVEL_STATS?.reduce((s, l) => s + l?.totalEarned, 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Total Referrals:</span>
          <span className="text-sm font-bold text-white font-mono">{totalReferrals}</span>
        </div>
        <div className="w-px h-4 bg-white/10 self-center" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Total Earned:</span>
          <span className="text-sm font-bold text-green-400 font-mono">₹{totalEarned}</span>
        </div>
        <div className="w-px h-4 bg-white/10 self-center" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Potential (if L1×100):</span>
          <span className="text-sm font-bold text-blue-400 font-mono">₹{100 * 20 + 200 * 2 + 400 * 1}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEVEL_STATS?.map((stat) => (
          <div key={stat?.id} className="glass-card-hover p-5" style={{ borderColor: stat?.border }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: stat?.bg, color: stat?.color, border: `1px solid ${stat?.border}` }}>
                {stat?.level}
              </span>
              <span className="text-xs text-white/40">{stat?.description}</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono tabular-nums mb-1">{stat?.count}</p>
            <p className="text-xs text-white/40 mb-4">referrals</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/8">
              <div>
                <p className="text-xs text-white/40">Per referral</p>
                <p className="text-sm font-bold font-mono" style={{ color: stat?.color }}>₹{stat?.perReferral}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Total earned</p>
                <p className="text-sm font-bold text-green-400 font-mono">₹{stat?.totalEarned}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}