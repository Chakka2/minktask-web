import React from 'react';
import AppLayout from '@/components/AppLayout';
import LinkGenerator from './components/LinkGenerator';
import ClickStatsBar from './components/ClickStatsBar';
import RecentLinks from './components/RecentLinks';
import HowToUse from './components/HowToUse';

export default function AmazonToolPage() {
  return (
    <AppLayout>
      <div className="space-y-6 pb-20 lg:pb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Amazon Affiliate Tool</h1>
          <p className="text-sm text-white/40 mt-0.5">Generate affiliate links and track your clicks</p>
        </div>

        <ClickStatsBar />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <LinkGenerator />
            <RecentLinks />
          </div>
          <div>
            <HowToUse />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}