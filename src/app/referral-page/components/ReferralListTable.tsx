'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

// Backend: replace with Firestore query of users where referredBy == currentUser.referralCode
const REFERRALS = [
  { id: 'ref-001', name: 'Priya Kapoor', level: 1, joinedDate: '01/04/2026', earned: 12, status: 'paid' },
  { id: 'ref-002', name: 'Amit Singh', level: 2, joinedDate: '31/03/2026', earned: 2, status: 'paid' },
  { id: 'ref-003', name: 'Sunita Rao', level: 1, joinedDate: '28/03/2026', earned: 12, status: 'paid' },
  { id: 'ref-004', name: 'Deepa Nair', level: 3, joinedDate: '27/03/2026', earned: 1, status: 'paid' },
  { id: 'ref-005', name: 'Kiran Mehta', level: 2, joinedDate: '26/03/2026', earned: 2, status: 'paid' },
  { id: 'ref-006', name: 'Rajesh Kumar', level: 1, joinedDate: '25/03/2026', earned: 12, status: 'paid' },
  { id: 'ref-007', name: 'Neha Verma', level: 3, joinedDate: '24/03/2026', earned: 1, status: 'paid' },
  { id: 'ref-008', name: 'Suresh Pillai', level: 1, joinedDate: '22/03/2026', earned: 12, status: 'paid' },
  { id: 'ref-009', name: 'Anita Joshi', level: 2, joinedDate: '20/03/2026', earned: 2, status: 'paid' },
  { id: 'ref-010', name: 'Vikram Patil', level: 3, joinedDate: '18/03/2026', earned: 1, status: 'paid' },
  { id: 'ref-011', name: 'Meena Gupta', level: 1, joinedDate: '15/03/2026', earned: 12, status: 'paid' },
  { id: 'ref-012', name: 'Arun Sharma', level: 2, joinedDate: '12/03/2026', earned: 2, status: 'paid' },
];

const LEVEL_BADGE: Record<number, { bg: string; color: string }> = {
  1: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  2: { bg: 'rgba(129,140,248,0.12)', color: '#c7d2fe' },
  3: { bg: 'rgba(34,211,238,0.1)', color: '#67e8f9' },
};

export default function ReferralListTable() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  const filtered = REFERRALS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === null || r.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h3 className="text-base font-semibold text-white">Referral List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 py-2 text-xs w-40"
              aria-label="Search referrals"
            />
          </div>
          <div className="flex gap-1">
            {[null, 1, 2, 3].map((l) => (
              <button
                key={`filter-level-${l ?? 'all'}`}
                onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${levelFilter === l ? 'gradient-bg text-white' : 'text-white/40 hover:text-white hover:bg-white/8'}`}
              >
                {l === null ? 'All' : `L${l}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              {['Name', 'Level', 'Joined', 'Earned'].map((col) => (
                <th key={`col-${col}`} className="text-left text-xs font-semibold text-white/40 pb-3 pr-4 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-white/30">No referrals found matching your filter</td>
              </tr>
            ) : (
              filtered.map((ref) => {
                const badge = LEVEL_BADGE[ref.level];
                return (
                  <tr key={ref.id} className="border-b border-white/5 hover:bg-white/3 transition-all group">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {ref.name[0]}
                        </div>
                        <span className="text-sm text-white/80">{ref.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>L{ref.level}</span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-white/50 font-mono">{ref.joinedDate}</td>
                    <td className="py-3 text-sm font-bold text-green-400 font-mono tabular-nums">+₹{ref.earned}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-white/30">Showing {filtered.length} of {REFERRALS.length} referrals</p>
      </div>
    </div>
  );
}