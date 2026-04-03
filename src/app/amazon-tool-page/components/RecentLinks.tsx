'use client';

import React, { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

// Backend: replace with Firestore affiliateClicks query for current user, ordered by createdAt desc
const RECENT_LINKS = [
  { id: 'link-001', productTitle: 'boAt Airdopes 141 Bluetooth TWS', url: 'https://amazon.in/dp/B09XYZ1234?tag=earnhub-21', clicks: 47, createdAt: '01/04/2026', shortUrl: 'earnhub.in/go/rahul8423?url=...' },
  { id: 'link-002', productTitle: 'Redmi Note 13 5G (6GB+128GB)', url: 'https://amazon.in/dp/B0ABCD5678?tag=earnhub-21', clicks: 182, createdAt: '30/03/2026', shortUrl: 'earnhub.in/go/rahul8423?url=...' },
  { id: 'link-003', productTitle: 'Prestige Iris 750W Mixer Grinder', url: 'https://amazon.in/dp/B07EFGH901?tag=earnhub-21', clicks: 23, createdAt: '28/03/2026', shortUrl: 'earnhub.in/go/rahul8423?url=...' },
  { id: 'link-004', productTitle: 'Amazon Fire TV Stick 4K Max', url: 'https://amazon.in/dp/B08LZ1XYZ2?tag=earnhub-21', clicks: 95, createdAt: '25/03/2026', shortUrl: 'earnhub.in/go/rahul8423?url=...' },
  { id: 'link-005', productTitle: 'Fastrack Reflex Beat Smartwatch', url: 'https://amazon.in/dp/B09PQR3456?tag=earnhub-21', clicks: 31, createdAt: '22/03/2026', shortUrl: 'earnhub.in/go/rahul8423?url=...' },
  { id: 'link-006', productTitle: 'Pigeon by Stovekraft Induction Cooktop', url: 'https://amazon.in/dp/B07STU7890?tag=earnhub-21', clicks: 14, createdAt: '20/03/2026', shortUrl: 'earnhub.in/go/rahul8423?url=...' },
];

export default function RecentLinks() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      toast.success('Link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-white">Recent Links</h3>
        <span className="text-xs text-white/30">{RECENT_LINKS.length} links created</span>
      </div>

      <div className="space-y-3">
        {RECENT_LINKS.map((link) => (
          <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-all group" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate font-medium">{link.productTitle}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-white/30 font-mono">{link.createdAt}</span>
                <span className="text-xs font-semibold" style={{ color: '#22d3ee' }}>{link.clicks} clicks</span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => window.open(link.url, '_blank')}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Open link"
              >
                <ExternalLink size={13} />
              </button>
              <button
                onClick={() => handleCopy(link.id, link.url)}
                className={`p-1.5 rounded-lg transition-all ${copiedId === link.id ? 'text-green-400' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                aria-label="Copy link"
              >
                {copiedId === link.id ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold"
              style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee' }}>
              {link.clicks}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}