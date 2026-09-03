import React, { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Navigation, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Users, 
  CheckCircle2, 
  Target, 
  Globe2, 
  Activity, 
  FileCheck, 
  ArrowRight, 
  Quote, 
  Building2,
  Lock,
  HeartHandshake,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutAndBrandProps {
  onRequestPal?: () => void;
  onBecomePal?: () => void;
}

export const AboutAndBrand: React.FC<AboutAndBrandProps> = ({
  onRequestPal,
  onBecomePal,
}) => {
  const { t } = useLanguage();

  const coreValues = [
    {
      icon: HeartHandshake,
      title: "Human Dignity First",
      desc: "Every patient deserves a friendly, compassionate human guide—never feeling lost, anxious, or isolated inside intimidating medical centers.",
      color: "text-[#E85D75] bg-[#E85D75]/10 border-[#E85D75]/30"
    },
    {
      icon: ShieldCheck,
      title: "Uncompromising Safety",
      desc: "100% FBI/State background checks, HIPAA compliance, real-time BLE radar tracking, and 1-tap emergency SOS protocols.",
      color: "text-[#48A6A5] bg-[#48A6A5]/10 border-[#48A6A5]/30"
    },
    {
      icon: Globe2,
      title: "Language & Health Equity",
      desc: "Breaking communication barriers for non-English speakers, elderly individuals, and patients with physical or visual disabilities.",
      color: "text-[#1F3449] bg-white/10 border-white/20"
    },
    {
      icon: FileCheck,
      title: "Transparent Flat Rates",
      desc: "Affordable, predictable out-of-pocket pricing starting at $35 with zero hidden fees or surge multipliers.",
      color: "text-[#F1B84C] bg-[#F1B84C]/10 border-[#F1B84C]/30"
    }
  ];

  return (
    <section id="about" className="py-20 bg-[#1F3449] border-t border-white/10 relative overflow-hidden text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#48A6A5]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#E85D75]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        
        {/* ==================== 1. ABOUT PATHPAL ==================== */}
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#48A6A5]/15 border border-[#48A6A5]/40 text-[#48A6A5] text-xs font-black uppercase tracking-[0.25em] shadow-lg">
              <Compass className="w-4 h-4" />
              <span>ABOUT PATHPAL</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight text-white">
              Transforming Hospital Navigation Through <br />
              <span className="text-[#E85D75]">Compassionate Companion Pals</span>
            </h2>
            
            <p className="text-sm sm:text-base text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
              PathPal pairs vulnerable patients with accredited, background-checked Community Health Workers and Companion Pals—ensuring no one faces a complex hospital visit alone.
            </p>
          </div>

          {/* Founding Story Content Card */}
          <div className="bg-[#2B425B] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#48A6A5]/10 text-[#48A6A5] text-[11px] font-black uppercase tracking-wider border border-[#48A6A5]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>THE PATHPAL ORIGIN</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white leading-snug">
                  Born from a Hospital ER Realization
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-normal">
                  In 2024, clinical teams noticed a troubling pattern: <strong className="text-white">over 30% of elderly and non-English speaking patients</strong> were missing appointments, arriving late in panic, or abandoning follow-up care simply because navigating multi-building medical campuses was overwhelming.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed font-normal">
                  PathPal was created to bridge this gap. We combine door-to-door human companionship with real-time BLE indoor GPS radar—giving families complete peace of mind while lowering hospital no-show rates by 34%.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#1F3449] p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-[#48A6A5]">14,200+</div>
                    <div className="text-xs text-gray-300 mt-1">Visits Completed</div>
                  </div>
                  <div className="bg-[#1F3449] p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-[#E85D75]">34%</div>
                    <div className="text-xs text-gray-300 mt-1">No-Show Reduction</div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden border-2 border-[#48A6A5]/30 shadow-2xl group">
                <img 
                  src={new URL('../assets/images/pal_companion_tablet_1785710708562.jpg', import.meta.url).href} 
                  alt="PathPal Companion escorting elderly patient with tablet" 
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F3449] via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#1F3449]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <Quote className="w-8 h-8 text-[#48A6A5] shrink-0" />
                  <p className="text-xs text-gray-200 italic">
                    "My companion met me right at valet parking with a wheelchair and stayed with me until my pharmacy discharge."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 2. OUR MISSION (DISTINCT SECTION) ==================== */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E85D75]/20 border border-[#E85D75]/40 text-[#E85D75]">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E85D75]">OUR MISSION</span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">No Patient Navigates Alone</h3>
            </div>
          </div>

          <div className="bg-[#2B425B] p-8 sm:p-10 rounded-3xl border border-[#E85D75]/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="w-2 h-full bg-[#E85D75] absolute top-0 left-0"></div>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-medium">
              To ensure no patient ever faces a complex medical center alone—by placing a trained, vetted, and caring companion within reach of every hospital appointment, regardless of age, mobility, language, or financial background.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#E85D75]" />
                <h4 className="text-sm font-bold text-white">Door-to-Door Guidance</h4>
                <p className="text-xs text-gray-300">Arm-in-arm patient escort from campus entry to discharge.</p>
              </div>
              <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#E85D75]" />
                <h4 className="text-sm font-bold text-white">Family Peace of Mind</h4>
                <p className="text-xs text-gray-300">Real-time SMS status updates and check-in alerts for loved ones.</p>
              </div>
              <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#E85D75]" />
                <h4 className="text-sm font-bold text-white">Equal Access Care</h4>
                <p className="text-xs text-gray-300">Zero out-of-pocket costs via partner health vouchers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 3. OUR VISION (DISTINCT SECTION) ==================== */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F1B84C]/20 border border-[#F1B84C]/40 text-[#F1B84C]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#F1B84C]">OUR VISION</span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">Universal Health Access & Peace of Mind</h3>
            </div>
          </div>

          <div className="bg-[#2B425B] p-8 sm:p-10 rounded-3xl border border-[#F1B84C]/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="w-2 h-full bg-[#F1B84C] absolute top-0 left-0"></div>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-medium">
              A healthcare ecosystem where every patient journey in every city begins with a friendly face at the entrance and ends with safe, dignified, and clear peace of mind.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#F1B84C]" />
                <h4 className="text-sm font-bold text-white">Accredited CHW Network</h4>
                <p className="text-xs text-gray-300">Nationwide network of certified companion health workers.</p>
              </div>
              <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#F1B84C]" />
                <h4 className="text-sm font-bold text-white">EHR & Health System Sync</h4>
                <p className="text-xs text-gray-300">Seamless automated integration with hospital scheduling APIs.</p>
              </div>
              <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#F1B84C]" />
                <h4 className="text-sm font-bold text-white">HCAHPS Quality Impact</h4>
                <p className="text-xs text-gray-300">Measurable improvements in patient satisfaction and hospital ratings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 4. CORE VALUES (DISTINCT SECTION) ==================== */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#48A6A5]/20 border border-[#48A6A5]/40 text-[#48A6A5]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#48A6A5]">CORE VALUES</span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">The Standards That Guide Every Journey</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, index) => {
              const IconComponent = val.icon;
              return (
                <div key={index} className="bg-[#2B425B] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-white/30 transition-all flex flex-col justify-between shadow-xl">
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${val.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black uppercase text-white">{val.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-normal">{val.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <Check className="w-3.5 h-3.5 text-[#48A6A5]" />
                    <span>Verified Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Trinity (Heart, Pin, Path Breakdown) */}
        <div className="bg-[#2B425B] rounded-3xl p-8 lg:p-12 border border-white/10 relative overflow-hidden shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#48A6A5]">
              THE PATHPAL BRAND TRINITY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              CARE + NAVIGATION + DIRECTION
            </h3>
            <p className="text-xs text-gray-300 font-normal">
              Every element of our visual identity represents our three core commitments to patients and care teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Heart */}
            <div className="bg-[#1F3449] p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-[#E85D75]/40 transition-all">
              <div className="p-3 bg-[#E85D75]/20 rounded-2xl text-[#E85D75] shrink-0 border border-[#E85D75]/30">
                <Heart className="w-7 h-7 fill-[#E85D75]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">HEART</h4>
                <p className="text-xs text-gray-300 mt-1 font-normal leading-relaxed">
                  Empathy, warmth, and genuine non-clinical human reassurance at every single patient touchpoint.
                </p>
              </div>
            </div>

            {/* Pin */}
            <div className="bg-[#1F3449] p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-[#48A6A5]/40 transition-all">
              <div className="p-3 bg-[#48A6A5]/20 rounded-2xl text-[#48A6A5] shrink-0 border border-[#48A6A5]/30">
                <MapPin className="w-7 h-7 fill-[#48A6A5]/20" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">PIN</h4>
                <p className="text-xs text-gray-300 mt-1 font-normal leading-relaxed">
                  Exact entrance rendezvous points, valet check-ins, and turn-by-turn indoor BLE campus radar.
                </p>
              </div>
            </div>

            {/* Path */}
            <div className="bg-[#1F3449] p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-[#48A6A5]/40 transition-all">
              <div className="p-3 bg-[#48A6A5]/20 rounded-2xl text-[#48A6A5] shrink-0 border border-[#48A6A5]/30">
                <Navigation className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">PATH</h4>
                <p className="text-xs text-gray-300 mt-1 font-normal leading-relaxed">
                  Door-to-door escort, appointment waiting room attendance, pharmacy pickup, and safe valet discharge.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action CTAs inside About Us */}
        {(onRequestPal || onBecomePal) && (
          <div className="bg-gradient-to-r from-[#2B425B] via-[#1F3449] to-[#2B425B] p-8 rounded-3xl border border-[#48A6A5]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase">Ready to Experience PathPal?</h3>
              <p className="text-xs text-gray-300">
                Book a companion escort or apply as an accredited CHW Pal anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {onRequestPal && (
                <button
                  onClick={onRequestPal}
                  className="bg-[#E85D75] hover:bg-[#E85D75]/90 text-white font-black text-xs uppercase px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Request a Pal</span>
                </button>
              )}

              {onBecomePal && (
                <button
                  onClick={onBecomePal}
                  className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Become a Pal</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
