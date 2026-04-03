import React from 'react';
import AppLayout from '@/components/AppLayout';
import ReferralLinkBox from './components/ReferralLinkBox';
import LevelStatsCards from './components/LevelStatsCards';
import ReferralListTable from './components/ReferralListTable';
import ReferralTreeViz from './components/ReferralTreeViz';

export default function ReferralPage() {
  return (
    <AppLayout>
      <div className="space-y-6 pb-20 lg:pb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Referral Program</h1>
          <p className="text-sm text-white/40 mt-0.5">Share your link and earn 3 levels deep</p>
        </div>

        <ReferralLinkBox />
        <LevelStatsCards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ReferralListTable />
          </div>
          <div>
            <ReferralTreeViz />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}