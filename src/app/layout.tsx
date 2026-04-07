import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import ToasterProvider from '@/components/ToasterProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'EarnHub — Reel Bundle Network',
  description: '₹29 locked entry payment plus reel bundle referrals and withdrawals.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[hsl(222_47%_6%)] text-[hsl(210_40%_96%)] font-sans antialiased">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}