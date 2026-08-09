import React, { useState } from 'react';
import { Heart, MapPin, ShieldCheck, Clock, Star, ArrowRight, UserCheck, Sparkles, Navigation, Phone, CheckCircle2, Zap, Check } from 'lucide-react';
import { SAMPLE_PALS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onRequestPal: () => void;
  onExploreDemo: () => void;
  onBecomePal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRequestPal, onExploreDemo, onBecomePal }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'patient' | 'pal' | 'hospital'>('patient');

  const samplePal = SAMPLE_PALS[0];

  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-[#FAF4F5] text-[#1C2D42] border-b border-[#E85264]/20">
      {/* Brand Slide Decorative Circles (matching provided pitch deck slide) */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#E85264]/20 pointer-events-none blur-sm"></div>
      <div className="absolute bottom-[-15%] right-[5%] w-[350px] h-[350px] rounded-full bg-[#38A3A0]/25 pointer-events-none blur-sm"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#ECA93A]/30 pointer-events-none blur-sm"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* ================= STANDARD STARTUP HERO UI ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C2D42] text-white shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E85264] animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  INNOVATION PROJECT • {t('heroBadge')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#1C2D42]">
                Human companionship. <br />
                <span className="text-[#E85264]">Smarter hospital navigation.</span>
              </h1>

              <p className="text-lg font-bold text-[#1C2D42]/80">
                {t('tagline')}
              </p>

              <p className="text-base sm:text-lg text-gray-700 max-w-2xl leading-relaxed">
                {t('heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onRequestPal}
                  className="bg-[#E85264] hover:bg-[#E85264]/90 text-white font-black uppercase text-xs tracking-wider px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
                >
                  <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span>{t('btnRequestPal')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="bg-[#1C2D42] hover:bg-[#1C2D42]/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5 text-[#38A3A0]" />
                  <span>Explore Live App Portals</span>
                </button>
              </div>

              {/* Quick Highlight Badges */}
              <div className="pt-6 border-t border-[#1C2D42]/10 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#38A3A0]/15 text-[#38A3A0] shrink-0 border border-[#38A3A0]/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C2D42]">100% Non-Clinical</div>
                    <div className="text-[11px] text-gray-600">Trained & Vetted</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E85264]/15 text-[#E85264] shrink-0 border border-[#E85264]/30">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C2D42]">Curb Meeting</div>
                    <div className="text-[11px] text-gray-600">Met at Doorstep</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#ECA93A]/20 text-[#1C2D42] shrink-0 border border-[#ECA93A]/40">
                    <Star className="w-5 h-5 fill-[#ECA93A] text-[#ECA93A]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C2D42]">4.96 / 5 Rating</div>
                    <div className="text-[11px] text-gray-600">Patient Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Companion Match Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="bg-[#1C2D42] rounded-3xl p-6 shadow-2xl border border-white/20 text-white relative z-10 space-y-5">
                
                {/* Audience Selector Tabs */}
                <div className="flex bg-[#182538] p-1 rounded-2xl border border-white/10">
                  <button
                    onClick={() => setActiveTab('patient')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'patient'
                        ? 'bg-[#E85264] text-white shadow-md'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    For Patients
                  </button>
                  <button
                    onClick={() => setActiveTab('pal')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'pal'
                        ? 'bg-[#38A3A0] text-white shadow-md font-black'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    For Pals
                  </button>
                  <button
                    onClick={() => setActiveTab('hospital')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'hospital'
                        ? 'bg-[#ECA93A] text-black shadow-md font-black'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    For Hospitals
                  </button>
                </div>

                {activeTab === 'patient' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between bg-[#38A3A0]/20 p-3 rounded-2xl border border-[#38A3A0]/40">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#38A3A0] animate-ping"></span>
                        <span className="text-xs font-black text-[#38A3A0]">LIVE DISPATCH DISCOVERED</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-300">Visit ID: #PAL-8802</span>
                    </div>

                    {/* Companion Profile Card with Hero Theme Photo */}
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#38A3A0]/40 shadow-xl group">
                        <img
                          src={new URL('../assets/images/hospital_escort_hero_1785710544430.jpg', import.meta.url).href}
                          alt="PathPal Companion Pal in Hospital"
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C2D42] via-transparent to-black/30"></div>
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                          <span className="bg-[#E85264] text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                            ACTIVE PAL MATCH
                          </span>
                          <span className="text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/20">
                            St. Jude Medical Center
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#22334A] border border-white/10">
                        <div className="relative">
                          <img
                            src={samplePal.avatar}
                            alt={samplePal.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#38A3A0]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-[#38A3A0] text-white p-1 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white">{samplePal.name}</h3>
                            <div className="flex items-center gap-1 text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                              <Star className="w-3 h-3 text-[#ECA93A] fill-[#ECA93A]" />
                              <span>{samplePal.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 font-medium">Verified Companion Pal • Badge #{samplePal.badgeNumber}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {samplePal.languages.map((lang) => (
                              <span key={lang} className="text-[10px] font-bold bg-[#182538] text-[#38A3A0] px-2 py-0.5 rounded-md border border-[#38A3A0]/30">
                                🗣️ {lang}
                              </span>
                            ))}
                            <span className="text-[10px] font-bold bg-[#182538] text-[#E85264] px-2 py-0.5 rounded-md border border-[#E85264]/30">
                              ♿ Wheelchair Certified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Point Box */}
                    <div className="p-3.5 rounded-2xl bg-[#182538] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
                        <span>DISPATCH LOCATION</span>
                        <span className="text-[#38A3A0] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Ready in 15 Mins
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-5 h-5 text-[#E85264] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">Metro Health - Main Entrance Valet Desk</div>
                          <div className="text-[11px] text-gray-300">Elena will meet you outside the glass doors with a PathPal badge & lanyard.</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onRequestPal}
                      className="w-full text-xs font-black uppercase text-white bg-[#E85264] hover:bg-[#E85264]/90 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      Book Companion Pal Now
                    </button>
                  </div>
                )}

                {activeTab === 'pal' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-[#38A3A0]/20 p-4 rounded-2xl border border-[#38A3A0]/40 space-y-2">
                      <div className="text-xs font-black text-[#38A3A0] uppercase tracking-wider">For Companions ("Pals")</div>
                      <h3 className="text-base font-bold text-white">Earn Money & Make a Real Impact.</h3>
                      <p className="text-xs text-gray-200">
                        Turn your empathy into structured hospital companion support. Flexible hourly pay, CHW career certification pathways, and performance bonuses.
                      </p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#182538] border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-[#38A3A0]" />
                        <span className="font-semibold text-gray-200">Full background check & hospital credentialing</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#182538] border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-[#38A3A0]" />
                        <span className="font-semibold text-gray-200">Clear non-clinical guidelines & safety protocols</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#182538] border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-[#38A3A0]" />
                        <span className="font-semibold text-gray-200">Earn Community Health Worker (CHW) billable credits</span>
                      </div>
                    </div>
                    <button
                      onClick={onBecomePal}
                      className="w-full text-xs font-black uppercase text-white bg-[#38A3A0] hover:bg-[#38A3A0]/90 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Apply to Join as a Pal
                    </button>
                  </div>
                )}

                {activeTab === 'hospital' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-[#22334A] text-white p-4 rounded-2xl border border-white/10 space-y-2">
                      <div className="text-[10px] font-black text-[#ECA93A] uppercase tracking-wider">For Hospital Systems</div>
                      <h3 className="text-base font-bold">Turnkey Patient Care Pal Integration.</h3>
                      <p className="text-xs text-gray-300">
                        Improve HCAHPS patient experience ratings (25% of VBP score), lower appointment drop-offs by 34%, and fulfill Schedule H Community Benefit mandates.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-3 bg-[#182538] rounded-xl border border-white/10">
                        <div className="text-base font-black text-[#38A3A0]">HCPCS G0511</div>
                        <div className="text-[10px] text-gray-400">CHW Care Code</div>
                      </div>
                      <div className="p-3 bg-[#182538] rounded-xl border border-white/10">
                        <div className="text-base font-black text-[#E85264]">Schedule H</div>
                        <div className="text-[10px] text-gray-400">CHNA Community Benefit</div>
                      </div>
                    </div>
                    <button
                      onClick={onBecomePal}
                      className="w-full text-xs font-black uppercase text-white bg-[#E85264] hover:bg-[#E85264]/90 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Request Hospital Enterprise Demo
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>

      </div>
    </section>
  );
};
