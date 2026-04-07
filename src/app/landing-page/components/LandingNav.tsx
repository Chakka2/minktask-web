'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X } from 'lucide-react';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/8' : ''}`}
      style={
        scrolled
          ? { background: 'rgba(10,14,30,0.78)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
          : {}
      }
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo size={32} />
          <span className="font-bold text-xl gradient-text">EarnHub</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</a>
          <a href="#earnings" className="text-sm text-white/60 hover:text-white transition-colors">Earnings</a>
          <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</a>
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
          <a href="#payment" className="btn-primary text-sm py-2 px-5">Get Started — ₹29</a>
        </div>
        <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-white/8 px-4 py-4 flex flex-col gap-3" style={{ background: 'rgba(10,14,30,0.97)' }}>
          <a href="#how-it-works" className="text-sm text-white/60 hover:text-white py-2" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#earnings" className="text-sm text-white/60 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Earnings</a>
          <a href="#faq" className="text-sm text-white/60 hover:text-white py-2" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="#payment" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>Get Started — ₹29</a>
        </div>
      )}
    </nav>
  );
}