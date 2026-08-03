import React, { useState } from 'react';
import { Users, Accessibility, UserPlus, HeartHandshake, Globe2, Smile, ArrowRight } from 'lucide-react';

interface TargetAudiencesProps {
  onRequestPal: () => void;
}

export const TargetAudiences: React.FC<TargetAudiencesProps> = ({ onRequestPal }) => {
  const [activeAudience, setActiveAudience] = useState<number | null>(0);

  const audiences = [
    {
      id: 0,
      title: 'Older adults',
      icon: Users,
      color: 'border-companion-coral text-companion-coral bg-companion-coral/10',
      description: 'Large campuses can be difficult to navigate on foot, leading to fatigue and disorientation.',
      benefit: 'Pals provide steady pacing, elevator escort, and resting point guidance from door to clinic.',
    },
    {
      id: 1,
      title: 'Accessibility needs',
      icon: Accessibility,
      color: 'border-navigation-teal text-navigation-teal bg-navigation-teal/10',
      description: 'Mobility, vision, hearing, and other physical accommodations required during the visit.',
      benefit: 'Pals are trained in wheelchair escort, visual navigation aid, and accessible route selection.',
    },
    {
      id: 2,
      title: 'First-time patients',
      icon: UserPlus,
      color: 'border-warm-gold text-pathpal-navy bg-warm-gold/20',
      description: 'Unfamiliar with the hospital structure, registration process, or health system rules.',
      benefit: 'Pals welcome patients right at the entrance and walk them through check-in step-by-step.',
    },
    {
      id: 3,
      title: 'Busy families',
      icon: HeartHandshake,
      color: 'border-companion-coral text-companion-coral bg-companion-coral/10',
      description: 'Additional support when primary family caregivers cannot attend due to work or childcare.',
      benefit: 'Caregivers receive real-time updates and peace of mind knowing their loved one is in caring hands.',
    },
    {
      id: 4,
      title: 'Language preferences',
      icon: Globe2,
      color: 'border-navigation-teal text-navigation-teal bg-navigation-teal/10',
      description: 'Navigating unfamiliar health systems when English is not the primary language.',
      benefit: 'Smart matching pairs patients with fluent, multilingual Pals (Spanish, Mandarin, Arabic, etc.).',
    },
    {
      id: 5,
      title: 'Anxious patients',
      icon: Smile,
      color: 'border-warm-gold text-pathpal-navy bg-warm-gold/20',
      description: 'A reassuring, calm human presence in high-stress surgical or diagnostic settings.',
      benefit: 'Pals offer friendly conversation, reducing stress levels before and after medical procedures.',
    },
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-care-blush text-companion-coral text-xs font-bold uppercase tracking-wider border border-soft-rose">
            <Users className="w-3.5 h-3.5" />
            <span>WHO PATHPAL SERVES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            Designed for people who need a little more support
          </h2>
          <p className="text-base text-pathpal-navy/70">
            Tailored companions for diverse patient needs across every stage of life and health journey.
          </p>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((item) => {
            const Icon = item.icon;
            const isSelected = activeAudience === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setActiveAudience(item.id)}
                className={`bg-white rounded-3xl p-6 border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-companion-coral shadow-lg bg-care-blush/40 scale-[1.02]'
                    : 'border-gray-100 hover:border-soft-rose hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {isSelected ? 'SELECTED' : 'CLICK TO VIEW'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-pathpal-navy mb-2">{item.title}</h3>
                <p className="text-xs text-pathpal-navy/80 font-medium leading-relaxed mb-3">
                  {item.description}
                </p>

                <div className="pt-3 border-t border-gray-100 text-xs text-navigation-teal font-semibold flex items-center gap-1.5">
                  <span>How PathPal Helps:</span>
                </div>
                <p className="text-xs text-pathpal-navy/70 mt-1 font-medium">
                  {item.benefit}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="bg-navigation-teal/10 rounded-2xl p-6 border border-navigation-teal/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-base font-bold text-pathpal-navy">Do you or a family member need a Pal for an upcoming visit?</h4>
            <p className="text-xs text-pathpal-navy/75 font-medium">Requesting support takes under 2 minutes. No app installation required.</p>
          </div>
          <button
            onClick={onRequestPal}
            className="bg-navigation-teal hover:bg-navigation-teal/90 text-white text-xs font-bold px-6 py-3 rounded-xl shrink-0 flex items-center gap-2 shadow-xs"
          >
            <span>Request Support Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
