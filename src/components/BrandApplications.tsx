import React from 'react';
import { Sparkles, QrCode, CreditCard, Shield, Megaphone, FileText, GraduationCap } from 'lucide-react';

export const BrandApplications: React.FC = () => {
  const touchpoints = [
    { title: 'Lobby poster', desc: 'Prominent QR code in waiting bays allowing instant Request a Pal scanning.', icon: QrCode },
    { title: 'Patient card', desc: 'Appointment mailing insert or take-home pocket card with hospital map tips.', icon: CreditCard },
    { title: 'Pal badge', desc: 'Highly recognizable photo ID badge, PathPal lanyard, or high-visibility vest.', icon: Shield },
    { title: 'Social media', desc: 'Community campaign story tiles highlighting companion testimonials.', icon: Megaphone },
    { title: 'Hospital one-pager', desc: 'Executive overview of pilot benefits, metrics, and HCPCS G0511 setup.', icon: FileText },
    { title: 'Recruitment material', desc: 'Outreach kits for universities, nursing schools, and community centers.', icon: GraduationCap },
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-care-blush text-companion-coral text-xs font-bold uppercase tracking-wider border border-soft-rose">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PROMOTIONAL CAMPAIGN & TOUCHPOINTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            One brand. Three audiences.
          </h2>
          <p className="text-base text-pathpal-navy/70">
            Tailored messaging crafted to build trust with patients, companions, and health systems alike.
          </p>
        </div>

        {/* 3 Audience Cards (Slide 22) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-companion-coral text-white rounded-3xl p-8 space-y-4 shadow-md">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              FOR PATIENTS
            </span>
            <h3 className="text-2xl font-black leading-tight">Never Navigate the Hospital Alone.</h3>
            <p className="text-xs text-white/90 font-medium leading-relaxed">
              Your appointment is about your care — not finding your way through a maze of corridors.
            </p>
          </div>

          <div className="bg-navigation-teal text-white rounded-3xl p-8 space-y-4 shadow-md">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              FOR PALS
            </span>
            <h3 className="text-2xl font-black leading-tight">Be the Person Who Helps.</h3>
            <p className="text-xs text-white/90 font-medium leading-relaxed">
              Turn your natural empathy into a structured, meaningful hospital guidance journey.
            </p>
          </div>

          <div className="bg-pathpal-navy text-white rounded-3xl p-8 space-y-4 shadow-md">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              FOR HOSPITALS
            </span>
            <h3 className="text-2xl font-black leading-tight">Make Navigation More Human.</h3>
            <p className="text-xs text-white/90 font-medium leading-relaxed">
              A coordinated support layer for a better patient experience and lower missed appointment rates.
            </p>
          </div>

        </div>

        {/* Designed to Live Beyond the Screen (Slide 23) */}
        <div className="bg-gray-50/80 rounded-3xl p-8 sm:p-12 border border-gray-200 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-companion-coral">
              BRAND APPLICATIONS
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-pathpal-navy">
              Designed to live beyond the screen
            </h3>
            <p className="text-sm text-pathpal-navy/70">
              Physical touchpoints bringing the PathPal experience into lobby entrances, waiting rooms, and local communities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {touchpoints.map((tp) => {
              const Icon = tp.icon;
              return (
                <div key={tp.title} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-care-blush text-companion-coral rounded-xl shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-pathpal-navy">{tp.title}</h4>
                    <p className="text-xs text-pathpal-navy/75 font-medium mt-1 leading-relaxed">{tp.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
