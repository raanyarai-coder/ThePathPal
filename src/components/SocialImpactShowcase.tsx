import React from 'react';
import { Heart, ShieldCheck, Smile, Award, ArrowUpRight, Users, Sparkles } from 'lucide-react';

import escortImg from '../assets/images/raanya_pal_hospital_1785711053110.jpg';
import guidanceImg from '../assets/images/pal_entrance_guidance_1785620344141.jpg';
import communityImg from '../assets/images/community_social_impact_1785620356275.jpg';

export const SocialImpactShowcase: React.FC = () => {
  return (
    <section id="social-cause" className="py-24 bg-[#0A0D14] border-t border-white/10 relative overflow-hidden text-white">
      {/* Cyan Ambient Backlight */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-bold uppercase tracking-[0.25em]">
            <Heart className="w-4 h-4 text-[#00F0FF]" />
            <span>HUMAN CONNECTION & SOCIETAL CAUSE</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase italic leading-none text-white">
            RESTORING DIGNITY & COMFORT <br />
            <span className="text-[#00F0FF] text-stroke-cyan">IN HEALTHCARE NAVIGATION.</span>
          </h2>
          <p className="text-sm text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            Hospitals can be intimidating maze-like environments. Millions of vulnerable patients—especially seniors, first-time visitors, and those with physical limitations—face extreme anxiety or miss appointments entirely due to navigation barriers.
          </p>
        </div>

        {/* Picture Grid Showing Cause & Real Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Compassionate Hospital Companion Pal */}
          <div className="bg-[#121824] rounded-3xl overflow-hidden border border-white/10 hover:border-[#00F0FF]/50 transition-all group flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden">
              <img
                src={escortImg}
                alt="Hospital Companion Pal (Inspired by Founder Raanya)"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0D14]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#00F0FF]/30 text-[10px] font-black uppercase text-[#00F0FF] tracking-widest flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                <span>Anxiety Reduction</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#00F0FF] transition-colors">
                Personal Wheelchair & Walking Pal
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Patients are met warmly right at hospital drop-off zones or valet desks. Companion Pals provide steady physical arm guidance, elevator support, and emotional reassurance through long medical corridors.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#00F0FF] uppercase tracking-wider">
                <span>94% Anxiety Reduction</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Check-In & Digital Wayfinding */}
          <div className="bg-[#121824] rounded-3xl overflow-hidden border border-white/10 hover:border-[#00F0FF]/50 transition-all group flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden">
              <img
                src={guidanceImg}
                alt="Pal Check-In Guidance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0D14]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-companion-coral/30 text-[10px] font-black uppercase text-companion-coral tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Missed Visits</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#00F0FF] transition-colors">
                Check-In & Waiting Room Advocacy
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Pals ensure patients arrive at exact diagnostic labs, specialist offices, and outpatient suites on time. Pals stay with patients during waiting periods, easing the stress of long hospital delays.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-companion-coral uppercase tracking-wider">
                <span>99.1% On-Time Arrival</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Community Health & Economic Empowerment */}
          <div className="bg-[#121824] rounded-3xl overflow-hidden border border-white/10 hover:border-[#00F0FF]/50 transition-all group flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden">
              <img
                src={communityImg}
                alt="Community Companion Pals"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0D14]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-navigation-teal/30 text-[10px] font-black uppercase text-navigation-teal tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Community Benefit</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#00F0FF] transition-colors">
                Empowering Local Care Workers
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                PathPal creates meaningful local workforce opportunities for trained community health workers, students, and active retirees, fostering intergenerational empathy and strong neighborhood bonds.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-navigation-teal uppercase tracking-wider">
                <span>IRS Schedule H Credit</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

        {/* Social Value Impact Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-[#121824]/80 rounded-3xl border border-white/10">
          <div className="text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-[#00F0FF] italic">98.4%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">Match Accuracy</div>
            <div className="text-[10px] text-gray-400 font-light">Patients paired with ideal language/mobility Pals</div>
          </div>
          <div className="text-center space-y-1 border-l border-white/10 pl-4">
            <div className="text-3xl sm:text-4xl font-black text-companion-coral italic">-42%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">No-Show Reduction</div>
            <div className="text-[10px] text-gray-400 font-light">Fewer missed hospital specialist appointments</div>
          </div>
          <div className="text-center space-y-1 border-l border-white/10 pl-4">
            <div className="text-3xl sm:text-4xl font-black text-navigation-teal italic">+24 Pts</div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">HCAHPS Score Lift</div>
            <div className="text-[10px] text-gray-400 font-light">Elevated hospital patient satisfaction ratings</div>
          </div>
          <div className="text-center space-y-1 border-l border-white/10 pl-4">
            <div className="text-3xl sm:text-4xl font-black text-warm-gold italic">$0 Cost</div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">Medicare/Medicaid</div>
            <div className="text-[10px] text-gray-400 font-light">Subsidized via SSBCI healthcare vouchers</div>
          </div>
        </div>

      </div>
    </section>
  );
};
