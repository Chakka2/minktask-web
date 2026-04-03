'use client';

import React, { useState } from 'react';
import { Copy, Check, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

// Backend: replace with current user's referralCode from Firestore
const REFERRAL_CODE = 'RAHUL8423';
const REFERRAL_LINK = `https://mintask.in/join?ref=${REFERRAL_CODE}`;

export default function ReferralLinkBox() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(REFERRAL_LINK)?.then(() => {
      setCopied(true);
      toast?.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const whatsappShare = () => {
    const msg = encodeURIComponent(`🚀 Join Mintask and start earning! Pay just ₹29 once and earn through referrals + Amazon affiliate. Use my link: ${REFERRAL_LINK}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const telegramShare = () => {
    const msg = encodeURIComponent(`Join Mintask — earn with referrals + affiliate! ${REFERRAL_LINK}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(REFERRAL_LINK)}&text=${msg}`, '_blank');
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/60 mb-2">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="flex-1 text-sm text-white/80 font-mono truncate">{REFERRAL_LINK}</span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0 ${copied ? 'text-green-400' : 'text-blue-400 hover:bg-blue-500/10'}`}
                aria-label="Copy referral link"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-white/40">Your code:</span>
            <span className="text-xs font-bold font-mono text-blue-400 px-2 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.15)' }}>{REFERRAL_CODE}</span>
          </div>
          <p className="text-xs text-white/30 mt-2">When someone clicks your link, your code is pre-filled. You earn ₹20 when they complete their ₹29 payment.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={whatsappShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)', color: '#4ade80' }}>
            <MessageCircle size={16} />
            WhatsApp
          </button>
          <button onClick={telegramShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(0,136,204,0.15)', border: '1px solid rgba(0,136,204,0.25)', color: '#38bdf8' }}>
            <Send size={16} />
            Telegram
          </button>
        </div>
      </div>
    </div>
  );
}