'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { id: 'faq-1', q: 'Is ₹29 a monthly fee?', a: 'No — it is a one-time payment. Pay once and access all features for life. No hidden charges, no subscription.' },
  { id: 'faq-2', q: 'When do I receive my referral earnings?', a: 'Referral earnings are credited to your wallet instantly when your referral\'s payment is approved. Usually within 30 minutes.' },
  { id: 'faq-3', q: 'What is the minimum withdrawal amount?', a: 'You can withdraw a minimum of ₹50. A ₹2 processing fee applies per withdrawal request. Amount is paid to your UPI ID within 24 hours.' },
  { id: 'faq-4', q: 'How does the Amazon affiliate sharing work?', a: 'At the end of each month, 50% of the platform\'s total Amazon affiliate earnings are distributed among all users proportional to their click share.' },
  { id: 'faq-5', q: 'Do my referrals need to pay ₹29 too?', a: 'Yes. Referral earnings are only credited when your referred user completes the ₹29 payment and gets approved. Unpaid signups do not count.' },
  { id: 'faq-6', q: 'How many levels of referrals can I earn from?', a: 'You earn from 3 levels deep: ₹20 from Level 1 (direct), ₹2 from Level 2, and ₹1 from Level 3. This compounds as your network grows.' },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS?.map((faq) => (
            <div key={faq?.id} className="glass-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-all"
                onClick={() => setOpenId(openId === faq?.id ? null : faq?.id)}
                aria-expanded={openId === faq?.id}
              >
                <span className="text-sm font-semibold text-white pr-4">{faq?.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-white/40 flex-shrink-0 transition-transform duration-300 ${openId === faq?.id ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openId === faq?.id ? 'max-h-40' : 'max-h-0'}`}>
                <p className="px-5 pb-5 text-sm text-white/55 leading-relaxed">{faq?.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}