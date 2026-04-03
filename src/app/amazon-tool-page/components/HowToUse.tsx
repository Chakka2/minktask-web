import React from 'react';
import { AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 'ht-1', num: '1', text: 'Go to Amazon.in and find any product you want to promote.' },
  { id: 'ht-2', num: '2', text: 'Copy the full product URL from your browser address bar.' },
  { id: 'ht-3', num: '3', text: 'Paste it in the generator above and click Generate.' },
  { id: 'ht-4', num: '4', text: 'Copy the Tracking Link — this tracks your clicks.' },
  { id: 'ht-5', num: '5', text: 'Share the link on WhatsApp, Instagram, or any platform.' },
  { id: 'ht-6', num: '6', text: 'Every click is counted. Monthly earnings distributed based on your share.' },
];

export default function HowToUse() {
  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className="text-base font-semibold text-white mb-4">How to Use</h3>
        <div className="space-y-3">
          {STEPS?.map((step) => (
            <div key={step?.id} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{step?.num}</span>
              <p className="text-xs text-white/60 leading-relaxed">{step?.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <div className="flex items-start gap-2">
          <AlertCircle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-yellow-400 mb-1">Important</p>
            <p className="text-xs text-white/50 leading-relaxed">Your affiliate ID is automatically included in every generated link. Just paste, generate, and share — no extra steps needed.</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Monthly Distribution</h3>
        <p className="text-xs text-white/50 leading-relaxed mb-3">50% of total platform Amazon earnings are split among all users based on click percentage.</p>
        <div className="p-3 rounded-xl text-xs font-mono" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
          Your Share = (Your Clicks / Total Clicks) × 50% Pool
        </div>
      </div>
    </div>
  );
}