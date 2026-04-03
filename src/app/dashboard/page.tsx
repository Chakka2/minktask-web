import React from 'react';
import AppLayout from '@/components/AppLayout';
import WalletHeroCard from './components/WalletHeroCard';
import KPICards from './components/KPICards';
import EarningsChart from './components/EarningsChart';
import RecentTransactions from './components/RecentTransactions';
import QuickActions from './components/QuickActions';
import AffiliateSnapshot from './components/AffiliateSnapshot';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6 pb-20 lg:pb-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/40 mt-0.5">Your earnings overview</p>
          </div>
          <span className="text-xs text-white/30 font-mono">Updated just now</span>
        </div>

        {/* Wallet + KPIs */}
        <WalletHeroCard />
        <KPICards />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <EarningsChart />
            <RecentTransactions />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <AffiliateSnapshot />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}