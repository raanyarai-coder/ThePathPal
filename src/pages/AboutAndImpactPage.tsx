import React from 'react';
import { AboutAndBrand } from '../components/AboutAndBrand';
import { SocialImpactShowcase } from '../components/SocialImpactShowcase';
import { VideoGuidesSection } from '../components/VideoGuidesSection';
import { AndroidAppSection } from '../components/AndroidAppSection';
import { FAQSection } from '../components/FAQSection';
import { ChallengeSection } from '../components/ChallengeSection';
import { BusinessModel } from '../components/BusinessModel';
import { RoadmapAndScorecard } from '../components/RoadmapAndScorecard';
import { ResponsibleDesign } from '../components/ResponsibleDesign';

interface AboutAndImpactPageProps {
  onRequestPal: () => void;
  onBecomePal: () => void;
  onOpenPayment: () => void;
}

export const AboutAndImpactPage: React.FC<AboutAndImpactPageProps> = ({
  onRequestPal,
  onBecomePal,
  onOpenPayment,
}) => {
  return (
    <div className="space-y-16 animate-fade-in pb-16">
      
      {/* Page Title Header */}
      <div className="bg-[#1F3449] py-12 border-b border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#48A6A5] bg-[#48A6A5]/15 px-3 py-1 rounded-full border border-[#48A6A5]/30">
            SOCIAL CAUSE & PLATFORM MISSION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">About PathPal, Safety & Impact</h1>
          <p className="text-sm sm:text-base text-gray-300">
            Learn why PathPal was built, how our accredited Companion Pals transform health access, and our compliance with healthcare quality standards.
          </p>
        </div>
      </div>

      <AboutAndBrand />

      <SocialImpactShowcase />

      <VideoGuidesSection
        onRequestPal={onRequestPal}
        onBecomePal={onBecomePal}
      />

      <AndroidAppSection
        onRequestPal={onRequestPal}
      />

      <FAQSection
        onRequestPal={onRequestPal}
        onOpenPayment={onOpenPayment}
      />

      <ChallengeSection />

      <BusinessModel />

      <RoadmapAndScorecard />

      <ResponsibleDesign />

    </div>
  );
};
