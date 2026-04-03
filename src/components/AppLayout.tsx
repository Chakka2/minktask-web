'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Users,
  Link2,
  TrendingUp,
  Wallet,
  Menu,
  X,
  ChevronLeft,
  Bell,
  LogOut,
  IndianRupee,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Referrals', href: '/referral-page', icon: Users },
  { label: 'Amazon Tool', href: '/amazon-tool-page', icon: Link2 },
  { label: 'Earnings', href: '/earnings-page', icon: TrendingUp },
  { label: 'Withdraw', href: '/withdraw-page', icon: Wallet },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="page-bg flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
          border-r border-white/8`}
        style={{
          background: 'rgba(10, 14, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/8 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <AppLogo size={32} />
              <span className="font-bold text-lg gradient-text">Mintask</span>
            </div>
          )}
          {sidebarCollapsed && <AppLogo size={28} />}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Wallet Quick View */}
        {!sidebarCollapsed && (
          <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-xs text-white/50 mb-1">Wallet Balance</p>
            <p className="text-lg font-bold text-white font-mono tabular-nums flex items-center gap-1">
              <IndianRupee size={14} />
              <span>248.00</span>
            </p>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={`nav-${item.href}`}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className={`p-3 border-t border-white/8 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                R
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Rahul Sharma</p>
                <p className="text-xs text-white/40 truncate">rahul@gmail.com</p>
              </div>
              <LogOut size={15} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              R
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 z-50 lg:hidden flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r border-white/8`}
        style={{
          background: 'rgba(10, 14, 30, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-bold text-lg gradient-text">Mintask</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="text-xs text-white/50 mb-1">Wallet Balance</p>
          <p className="text-lg font-bold text-white font-mono tabular-nums flex items-center gap-1">
            <IndianRupee size={14} />
            <span>248.00</span>
          </p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={`mobile-nav-${item.href}`}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">R</div>
            <div>
              <p className="text-sm font-semibold text-white">Rahul Sharma</p>
              <p className="text-xs text-white/40">rahul@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/8"
          style={{ background: 'rgba(10, 14, 30, 0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <p className="text-sm text-white/40">Welcome back,</p>
              <p className="text-sm font-semibold text-white">Rahul Sharma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
            </button>
            <Link href="/landing-page" className="text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8">
              Invite
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/8 flex"
          style={{ background: 'rgba(10, 14, 30, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={`bottom-nav-${item.href}`}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-all duration-200
                  ${isActive ? 'text-blue-400' : 'text-white/40 hover:text-white/70'}`}
              >
                <Icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}