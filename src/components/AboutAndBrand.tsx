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
  onHospitalPartner?: () => void;
}

export const AboutAndBrand: React.FC<AboutAndBrandProps> = ({
  onRequestPal,
  onBecomePal,
  onHospitalPartner,
}) => {
  const { t } = useLanguage();
  const [activeStoryTab, setActiveStoryTab] = useState<'origin' | 'mission' | 'values' | 'team'>('origin');

  const teamMembers = [
    {
      name: "Dr. Aris Thorne, MD",
      role: "Founder & Chief Medical Officer",
      bio: "Former ER Chief with 18+ years in acute hospital care. Founded PathPal after seeing vulnerable patients miss life-saving appointments due to complex campus navigation.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
      badge: "Clinical Leadership"
    },
    {
      name: "Elena Rostova, CHW",
      role: "Lead Community Health Ambassador",
      bio: "Accredited Community Health Worker fluent in English, Spanish, and Russian. Leads PathPal's companion training, empathy protocols, and door-to-door patient safety.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      badge: "CHW Accreditation"
    },
    {
      name: "Marcus Vance",
      role: "VP of Hospital System Partnerships",
      bio: "12+ years optimizing health system operations & HCAHPS scores. Connects regional hospital networks with CMS Medicare G0511 reimbursement channels.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
      badge: "Health Systems"
    },
    {
      name: "Amina Al-Mansoor",
      role: "Director of Patient Accessibility & i18n",
      bio: "Passionate health equity advocate specializing in bilingual patient support for English and Spanish speaking patient communities.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      badge: "Language Equity"
    }
  ];

  const coreValues = [
    {
      icon: HeartHandshake,
      title: "Human Dignity First",
      desc: "Every patient deserves a friendly, compassionate human guide—never feeling lost, anxious, or isolated inside intimidating medical centers.",
      color: "text-companion-coral bg-companion-coral/10 border-companion-coral/30"
    },
    {
      icon: ShieldCheck,
      title: "Uncompromising Safety",
      desc: "100% FBI/State background checks, HIPAA compliance, real-time BLE radar tracking, and 1-tap emergency SOS protocols.",
      color: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30"
    },
    {
      icon: Globe2,
      title: "Language & Health Equity",
      desc: "Breaking communication barriers for non-English speakers, elderly individuals, and patients with physical or visual disabilities.",
      color: "text-navigation-teal bg-navigation-teal/10 border-navigation-teal/30"
    },
    {
      icon: FileCheck,
      title: "Medicare G0511 Covered",
      desc: "Aligned with CMS Principal Illness Navigation (PIN) guidelines, providing $0 out-of-pocket costs for qualified patients.",
      color: "text-warm-gold bg-warm-gold/10 border-warm-gold/30"
    }
  ];

  return (
    <section id="about" className="py-20 bg-[#0A0D14] border-t border-white/10 relative overflow-hidden text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#00F0FF]/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-companion-coral/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-black uppercase tracking-[0.25em] shadow-lg shadow-[#00F0FF]/10">
            <Compass className="w-4 h-4" />
            <span>ABOUT US • OUR STORY & MISSION</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase italic leading-tight text-white">
            Transforming Hospital Navigation Through <br />
            <span className="text-[#00F0FF] text-stroke-cyan">Compassionate Companion Pals</span>
          </h2>
          
          <p className="text-sm sm:text-base text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
            PathPal pairs vulnerable patients with accredited, background-checked Community Health Workers and Companion Pals—ensuring no one faces a complex hospital visit alone.
          </p>
        </div>

        {/* Story & Mission Tabbed Interactive Showcase */}
        <div className="bg-[#121824] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-6">
            <button
              onClick={() => setActiveStoryTab('origin')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeStoryTab === 'origin'
                  ? 'bg-[#00F0FF] text-black shadow-lg shadow-[#00F0FF]/20'
                  : 'bg-[#1A2232] text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Our Founding Story</span>
            </button>

            <button
              onClick={() => setActiveStoryTab('mission')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeStoryTab === 'mission'
                  ? 'bg-companion-coral text-white shadow-lg shadow-companion-coral/20'
                  : 'bg-[#1A2232] text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Mission & Vision</span>
            </button>

            <button
              onClick={() => setActiveStoryTab('values')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeStoryTab === 'values'
                  ? 'bg-navigation-teal text-white shadow-lg shadow-navigation-teal/20'
                  : 'bg-[#1A2232] text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Core Values</span>
            </button>

            <button
              onClick={() => setActiveStoryTab('team')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeStoryTab === 'team'
                  ? 'bg-warm-gold text-black shadow-lg shadow-warm-gold/20 font-black'
                  : 'bg-[#1A2232] text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Leadership & Team</span>
            </button>
          </div>

          {/* Tab Content 1: Founding Story */}
          {activeStoryTab === 'origin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00F0FF]/10 text-[#00F0FF] text-[11px] font-black uppercase tracking-wider border border-[#00F0FF]/30">
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
                  <div className="bg-[#1A2232] p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-[#00F0FF]">14,200+</div>
                    <div className="text-xs text-gray-300 mt-1">Visits Completed</div>
                  </div>
                  <div className="bg-[#1A2232] p-4 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-companion-coral">34%</div>
                    <div className="text-xs text-gray-300 mt-1">No-Show Reduction</div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden border-2 border-[#00F0FF]/30 shadow-2xl group">
                <img 
                  src={new URL('../assets/images/pal_companion_tablet_1785710708562.jpg', import.meta.url).href} 
                  alt="PathPal Companion escorting elderly patient with tablet" 
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#121824]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <Quote className="w-8 h-8 text-[#00F0FF] shrink-0" />
                  <p className="text-xs text-gray-200 italic">
                    "My companion met me right at valet parking with a wheelchair and stayed with me until my pharmacy discharge."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Mission & Vision */}
          {activeStoryTab === 'mission' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="bg-[#1A2232] p-8 rounded-3xl border border-companion-coral/40 space-y-4 relative overflow-hidden">
                <div className="w-1.5 h-full bg-companion-coral absolute top-0 left-0"></div>
                <div className="flex items-center gap-3 text-companion-coral">
                  <Target className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">OUR MISSION</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white">
                  No Patient Navigates Alone
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-normal">
                  To ensure no patient ever faces a complex medical center alone—by placing a trained, vetted, and caring companion within reach of every hospital appointment, regardless of age, mobility, language, or financial background.
                </p>
                <ul className="space-y-2 text-xs text-gray-200 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-companion-coral" />
                    <span>Door-to-door arm-in-arm patient guidance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-companion-coral" />
                    <span>Real-time family SMS status notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-companion-coral" />
                    <span>Zero out-of-pocket costs via Medicare G0511</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#1A2232] p-8 rounded-3xl border border-warm-gold/40 space-y-4 relative overflow-hidden">
                <div className="w-1.5 h-full bg-warm-gold absolute top-0 left-0"></div>
                <div className="flex items-center gap-3 text-warm-gold">
                  <Compass className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">OUR VISION</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white">
                  Universal Health Access Peace of Mind
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-normal">
                  A healthcare ecosystem where every patient journey in every city begins with a friendly face at the entrance and ends with safe, dignified, and clear peace of mind.
                </p>
                <ul className="space-y-2 text-xs text-gray-200 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-warm-gold" />
                    <span>Nationwide accredited CHW companion network</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-warm-gold" />
                    <span>Seamless integration with hospital EMR systems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-warm-gold" />
                    <span>Enhanced hospital HCAHPS patient experience ratings</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content 3: Core Values */}
          {activeStoryTab === 'values' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {coreValues.map((val, index) => {
                const IconComponent = val.icon;
                return (
                  <div key={index} className="bg-[#1A2232] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-white/30 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${val.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-black uppercase text-white">{val.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-normal">{val.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                      <Check className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>Verified Standard</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content 4: Leadership Team */}
          {activeStoryTab === 'team' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-[#1A2232] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#00F0FF]/40 transition-all group">
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-[#00F0FF] border border-[#00F0FF]/30">
                        {member.badge}
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="text-base font-black text-white">{member.name}</h4>
                      <p className="text-xs font-bold text-companion-coral uppercase">{member.role}</p>
                      <p className="text-xs text-gray-300 leading-relaxed pt-1 font-normal">{member.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Brand Trinity (Heart, Pin, Path Breakdown) */}
        <div className="bg-[#121824]/90 rounded-3xl p-8 lg:p-12 border border-white/10 relative overflow-hidden shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00F0FF]">
              THE PATHPAL BRAND TRINITY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase italic text-white">
              CARE + NAVIGATION + DIRECTION
            </h3>
            <p className="text-xs text-gray-300 font-normal">
              Every element of our visual identity represents our three core commitments to patients and care teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Heart */}
            <div className="bg-[#1A2232] p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-companion-coral/40 transition-all">
              <div className="p-3 bg-companion-coral/20 rounded-2xl text-companion-coral shrink-0 border border-companion-coral/30">
                <Heart className="w-7 h-7 fill-companion-coral" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">HEART</h4>
                <p className="text-xs text-gray-300 mt-1 font-normal leading-relaxed">
                  Empathy, warmth, and genuine non-clinical human reassurance at every single patient touchpoint.
                </p>
              </div>
            </div>

            {/* Pin */}
            <div className="bg-[#1A2232] p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-[#00F0FF]/40 transition-all">
              <div className="p-3 bg-[#00F0FF]/20 rounded-2xl text-[#00F0FF] shrink-0 border border-[#00F0FF]/30">
                <MapPin className="w-7 h-7 fill-[#00F0FF]/20" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">PIN</h4>
                <p className="text-xs text-gray-300 mt-1 font-normal leading-relaxed">
                  Exact entrance rendezvous points, valet check-ins, and turn-by-turn indoor BLE campus radar.
                </p>
              </div>
            </div>

            {/* Path */}
            <div className="bg-[#1A2232] p-6 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-navigation-teal/40 transition-all">
              <div className="p-3 bg-navigation-teal/20 rounded-2xl text-navigation-teal shrink-0 border border-navigation-teal/30">
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
        {(onRequestPal || onBecomePal || onHospitalPartner) && (
          <div className="bg-gradient-to-r from-[#1A2232] via-[#121824] to-[#1A2232] p-8 rounded-3xl border border-[#00F0FF]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase">Ready to Experience PathPal?</h3>
              <p className="text-xs text-gray-300">
                Book a companion escort, apply as an accredited CHW Pal, or bring PathPal to your hospital network.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {onRequestPal && (
                <button
                  onClick={onRequestPal}
                  className="bg-companion-coral hover:bg-companion-coral/90 text-white font-black text-xs uppercase px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Request a Pal</span>
                </button>
              )}

              {onBecomePal && (
                <button
                  onClick={onBecomePal}
                  className="bg-navigation-teal hover:bg-navigation-teal/90 text-white font-black text-xs uppercase px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Become a Pal</span>
                </button>
              )}

              {onHospitalPartner && (
                <button
                  onClick={onHospitalPartner}
                  className="bg-white/10 hover:bg-white/20 text-[#00F0FF] border border-[#00F0FF]/40 font-black text-xs uppercase px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Hospital Partner</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
