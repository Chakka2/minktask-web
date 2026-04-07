import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Backend: replace with Firestore transactions query ordered by createdAt desc, limit 6
const TRANSACTIONS = [
  { id: 'txn-001', type: 'credit', source: 'referral', level: 1, amount: 12, desc: 'L1 referral — Priya Kapoor joined', time: '2 hours ago' },
  { id: 'txn-002', type: 'credit', source: 'bundle', level: null, amount: 42, desc: 'Reel bundle commission — March', time: 'Yesterday' },
  { id: 'txn-003', type: 'credit', source: 'referral', level: 2, amount: 2, desc: 'L2 referral — Amit Singh joined', time: 'Yesterday' },
  { id: 'txn-004', type: 'debit', source: 'withdrawal', level: null, amount: -150, desc: 'Withdrawal to UPI — rahul@upi', time: 'Mar 30' },
  { id: 'txn-005', type: 'credit', source: 'referral', level: 1, amount: 12, desc: 'L1 referral — Sunita Rao joined', time: 'Mar 28' },
  { id: 'txn-006', type: 'credit', source: 'referral', level: 3, amount: 1, desc: 'L3 referral — Deepa Nair joined', time: 'Mar 27' },
];

const SOURCE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  referral: { label: 'Referral', bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  bundle: { label: 'Bundle Sale', bg: 'rgba(34,211,238,0.12)', color: '#67e8f9' },
  withdrawal: { label: 'Withdrawal', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
};

export default function RecentTransactions() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
        <Link href="/earnings-page" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        {TRANSACTIONS.map((txn) => {
          const badge = SOURCE_BADGE[txn.source];
          return (
            <div key={txn.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-all group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}
                style={{ background: txn.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                {txn.type === 'credit' ? '+' : '−'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{txn.desc}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}{txn.level ? ` L${txn.level}` : ''}
                  </span>
                  <span className="text-[10px] text-white/30">{txn.time}</span>
                </div>
              </div>
              <span className={`text-sm font-bold font-mono tabular-nums flex-shrink-0 ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}