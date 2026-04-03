import React from 'react';
import HeroSection from './components/HeroSection';
import EarningPillars from './components/EarningPillars';
import HowItWorks from './components/HowItWorks';
import ReferralTree from './components/ReferralTree';
import PaymentSection from './components/PaymentSection';
import FAQSection from './components/FAQSection';
import LandingNav from './components/LandingNav';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="page-bg min-h-screen">
      <LandingNav />
      <HeroSection />
      <EarningPillars />
      <HowItWorks />
      <ReferralTree />
      <PaymentSection />
      <FAQSection />
      <LandingFooter />
    </div>
  );
}