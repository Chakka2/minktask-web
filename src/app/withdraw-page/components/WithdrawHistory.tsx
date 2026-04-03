'use client';

import React from 'react';

// Backend: replace with Firestore withdrawals query for current user
const WITHDRAWALS = [
  { id: 'wd-001', amount: 150, fee: 2, net: 148, upiId: 'rahul@upi', requestedAt: '30/03/2026', processedAt: '30/03/2026', status: 'paid' },
  { id: 'wd-002', amount: 100, fee: 2, net: 98, upiId: 'rahul@upi', requestedAt: '20/03/2026', processedAt: '21/03/2026', status: 'paid' },
  { id: 'wd-003', amount: 200, fee: 2, net: 198, upiId: 'rahul@paytm', requestedAt: '01/04/2026', processedAt: null, status: 'pending' },
];

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  paid: { label: 'Paid', bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
  pending: { label: 'Pending', bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
};

export default function WithdrawHistory() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-5">Withdrawal History</h3>

      {WITHDRAWALS.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-white/30">No withdrawal requests yet</p>
          <p className="text-xs text-white/20 mt-1">Your withdrawal history will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Amount', 'UPI ID', 'Requested', 'Processed', 'Status'].map((col) => (
                  <th key={`wd-col-${col}`} className="text-left text-xs font-semibold text-white/40 pb-3 pr-4 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WITHDRAWALS.map((wd) => {
                const style = STATUS_STYLES[wd.status];
                return (
                  <tr key={wd.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-bold text-white font-mono tabular-nums">₹{wd.amount}</p>
                      <p className="text-xs text-white/30 font-mono">Net: ₹{wd.net} (−₹{wd.fee} fee)</p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-white/60 font-mono">{wd.upiId}</td>
                    <td className="py-3 pr-4 text-sm text-white/50 font-mono">{wd.requestedAt}</td>
                    <td className="py-3 pr-4 text-sm text-white/50 font-mono">{wd.processedAt ?? '—'}</td>
                    <td className="py-3">
                      <span className="status-badge" style={{ background: style.bg, color: style.color }}>{style.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}