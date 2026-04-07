'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

// Backend: replace with Firestore transactions query for current user
const ALL_TRANSACTIONS = [
  { id: 'txn-001', type: 'credit', source: 'referral', level: 1, amount: 12, desc: 'L1 referral — Priya Kapoor', date: '01/04/2026' },
  { id: 'txn-002', type: 'credit', source: 'bundle', level: null, amount: 42, desc: 'Reel bundle commission — March 2026', date: '31/03/2026' },
  { id: 'txn-003', type: 'credit', source: 'referral', level: 2, amount: 2, desc: 'L2 referral — Amit Singh', date: '31/03/2026' },
  { id: 'txn-004', type: 'debit', source: 'withdrawal', level: null, amount: 150, desc: 'Withdrawal to UPI — rahul@upi', date: '30/03/2026' },
  { id: 'txn-005', type: 'credit', source: 'referral', level: 1, amount: 12, desc: 'L1 referral — Sunita Rao', date: '28/03/2026' },
  { id: 'txn-006', type: 'credit', source: 'referral', level: 3, amount: 1, desc: 'L3 referral — Deepa Nair', date: '27/03/2026' },
  { id: 'txn-007', type: 'credit', source: 'referral', level: 2, amount: 2, desc: 'L2 referral — Kiran Mehta', date: '26/03/2026' },
  { id: 'txn-008', type: 'credit', source: 'referral', level: 1, amount: 12, desc: 'L1 referral — Rajesh Kumar', date: '25/03/2026' },
  { id: 'txn-009', type: 'credit', source: 'bundle', level: null, amount: 42, desc: 'Reel bundle commission — Feb 2026', date: '28/02/2026' },
  { id: 'txn-010', type: 'credit', source: 'referral', level: 1, amount: 12, desc: 'L1 referral — Neha Verma', date: '24/03/2026' },
  { id: 'txn-011', type: 'credit', source: 'referral', level: 3, amount: 1, desc: 'L3 referral — Vikram Patil', date: '22/03/2026' },
  { id: 'txn-012', type: 'debit', source: 'withdrawal', level: null, amount: 100, desc: 'Withdrawal to UPI — rahul@upi', date: '20/03/2026' },
];

type SourceFilter = 'all' | 'referral' | 'bundle' | 'withdrawal';

const SOURCE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  referral: { label: 'Referral', bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  bundle: { label: 'Bundle Sale', bg: 'rgba(34,211,238,0.12)', color: '#67e8f9' },
  withdrawal: { label: 'Withdrawal', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
};

const ITEMS_PER_PAGE = 8;

export default function TransactionHistoryTable() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const filtered = ALL_TRANSACTIONS
    .filter((t) => {
      const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase());
      const matchSource = sourceFilter === 'all' || t.source === sourceFilter;
      return matchSearch && matchSource;
    })
    .sort((a, b) => {
      const da = a.date.split('/').reverse().join('');
      const db = b.date.split('/').reverse().join('');
      return sortDir === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (f: SourceFilter) => {
    setSourceFilter(f);
    setPage(1);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h3 className="text-base font-semibold text-white">Transaction History</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-8 py-2 text-xs w-36"
              aria-label="Search transactions"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'referral', 'bundle', 'withdrawal'] as SourceFilter[]).map((f) => (
              <button
                key={`txn-filter-${f}`}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${sourceFilter === f ? 'gradient-bg text-white' : 'text-white/40 hover:text-white hover:bg-white/8'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left text-xs font-semibold text-white/40 pb-3 pr-4 uppercase tracking-wider">Description</th>
              <th className="text-left text-xs font-semibold text-white/40 pb-3 pr-4 uppercase tracking-wider">Source</th>
              <th
                className="text-left text-xs font-semibold text-white/40 pb-3 pr-4 uppercase tracking-wider cursor-pointer select-none hover:text-white/70 transition-colors"
                onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              >
                <span className="flex items-center gap-1">
                  Date
                  {sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                </span>
              </th>
              <th className="text-right text-xs font-semibold text-white/40 pb-3 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-white/30">No transactions match your filter</td>
              </tr>
            ) : (
              paginated.map((txn) => {
                const style = SOURCE_STYLES[txn.source];
                return (
                  <tr key={txn.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                    <td className="py-3 pr-4">
                      <p className="text-sm text-white/80">{txn.desc}</p>
                      <p className="text-xs text-white/30 mt-0.5 font-mono">{txn.id}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="status-badge" style={{ background: style.bg, color: style.color }}>
                        {style.label}{txn.level ? ` L${txn.level}` : ''}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-white/50 font-mono">{txn.date}</td>
                    <td className={`py-3 text-right text-sm font-bold font-mono tabular-nums ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.type === 'credit' ? '+' : '−'}₹{txn.amount}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/30">
          Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} transactions
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === p ? 'gradient-bg text-white' : 'text-white/40 hover:text-white hover:bg-white/8'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}