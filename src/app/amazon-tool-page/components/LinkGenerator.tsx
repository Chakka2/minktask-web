'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link2, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Backend: replace AFFILIATE_TAG and USER_ID from environment/user context
const AFFILIATE_TAG = 'mintask-21';
const USER_ID = 'rahul8423';
const BASE_REDIRECT = 'https://mintask.in/go';

interface FormData {
  productUrl: string;
}

function buildAffiliateLink(url: string, tag: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('tag', tag);
    return parsed.toString();
  } catch {
    return url + (url.includes('?') ? '&' : '?') + `tag=${tag}`;
  }
}

export default function LinkGenerator() {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>();
  const [generatedLink, setGeneratedLink] = useState('');
  const [redirectLink, setRedirectLink] = useState('');
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600));

    const tagged = buildAffiliateLink(data.productUrl.trim(), AFFILIATE_TAG);
    const redirect = `${BASE_REDIRECT}/${USER_ID}?url=${encodeURIComponent(tagged)}`;

    setGeneratedLink(tagged);
    setRedirectLink(redirect);
    setIsGenerating(false);
    toast.success('Affiliate link generated!');
  };

  const copyLink = (link: string, type: 'main' | 'redirect') => {
    navigator.clipboard.writeText(link).then(() => {
      if (type === 'main') { setCopiedMain(true); setTimeout(() => setCopiedMain(false), 2500); }
      else { setCopiedRedirect(true); setTimeout(() => setCopiedRedirect(false), 2500); }
      toast.success('Link copied!');
    });
  };

  const handleReset = () => {
    reset();
    setGeneratedLink('');
    setRedirectLink('');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.12)' }}>
            <Link2 size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Generate Affiliate Link</h3>
            <p className="text-xs text-white/40">Paste any Amazon product URL</p>
          </div>
        </div>
        {generatedLink && (
          <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8">
            <RefreshCw size={13} />
            Reset
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Amazon Product URL</label>
          <input
            type="url"
            placeholder="https://www.amazon.in/dp/B0XXXXXXXX"
            className="input-field"
            {...register('productUrl', {
              required: 'Please enter an Amazon product URL',
              validate: (v) => {
                try { const u = new URL(v); return u.hostname.includes('amazon') || 'Please enter a valid Amazon URL'; }
                catch { return 'Please enter a valid URL'; }
              }
            })}
          />
          {errors.productUrl && <p className="text-xs text-red-400 mt-1.5">{errors.productUrl.message}</p>}
          <p className="text-xs text-white/30 mt-1.5">Supports amazon.in, amazon.com, and shortened amzn.to links</p>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="btn-primary flex items-center justify-center gap-2 w-full disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ minWidth: '180px' }}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Link2 size={16} />
              Generate Affiliate Link
            </>
          )}
        </button>
      </form>

      {/* Generated Links */}
      {generatedLink && (
        <div className="mt-6 space-y-4 animate-slide-up">
          <div className="h-px bg-white/8" />

          {/* Direct affiliate link */}
          <div>
            <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Your Affiliate Link</p>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
              <p className="flex-1 text-xs font-mono text-cyan-300/80 truncate">{generatedLink}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => window.open(generatedLink, '_blank')}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Open link"
                >
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => copyLink(generatedLink, 'main')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${copiedMain ? 'text-green-400' : 'text-cyan-400 hover:bg-cyan-500/10'}`}
                  aria-label="Copy affiliate link"
                >
                  {copiedMain ? <Check size={12} /> : <Copy size={12} />}
                  {copiedMain ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Redirect/tracking link */}
          <div>
            <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Tracking Link</p>
            <p className="text-xs text-white/30 mb-2">Share this link to track your clicks on Mintask</p>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="flex-1 text-xs font-mono text-indigo-300/80 truncate">{redirectLink}</p>
              <button
                onClick={() => copyLink(redirectLink, 'redirect')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${copiedRedirect ? 'text-green-400' : 'text-indigo-400 hover:bg-indigo-500/10'}`}
                aria-label="Copy tracking link"
              >
                {copiedRedirect ? <Check size={12} /> : <Copy size={12} />}
                {copiedRedirect ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}