import React, { useState } from 'react';
import { Heart, MapPin, ShieldCheck, Clock, Star, ArrowRight, UserCheck, Sparkles, Navigation, Phone, CheckCircle2, AlertTriangle, Radio, Zap, Crosshair, Check, ShieldAlert } from 'lucide-react';
import { SAMPLE_PALS } from '../data/mockData';
import { SosEmergencyModal } from './SosEmergencyModal';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onRequestPal: () => void;
  onExploreDemo: () => void;
  onBecomePal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRequestPal, onExploreDemo, onBecomePal }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'patient' | 'pal' | 'hospital'>('patient');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isPinningGps, setIsPinningGps] = useState(false);
  const [gpsPinned, setGpsPinned] = useState(false);
  const [selectedEntrance, setSelectedEntrance] = useState('Emergency ER Gate 1');
  const [emergencyDispatched, setEmergencyDispatched] = useState(false);

  const samplePal = SAMPLE_PALS[0];

  const handlePinLocation = () => {
    setIsPinningGps(true);
    setTimeout(() => {
      setIsPinningGps(false);
      setGpsPinned(true);
    }, 1200);
  };

  const handleEmergencyDispatch = () => {
    setEmergencyDispatched(true);
    setIsSosModalOpen(true);
  };

  const handleToggleEmergencyMode = () => {
    const nextState = !isEmergencyMode;
    setIsEmergencyMode(nextState);
    setEmergencyDispatched(false);
    if (nextState) {
      setIsSosModalOpen(true);
    }
  };

  return (
    <section className={`relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden transition-colors duration-500 ${
      isEmergencyMode
        ? 'bg-[#120507] text-white border-b-4 border-[#FF3344]'
        : 'bg-gradient-to-b from-[#0A0D14] via-[#0E131F] to-[#0A0D14] text-white border-b border-white/10'
    }`}>
      {/* Background Glows */}
      {isEmergencyMode ? (
        <div className="absolute inset-0 bg-radial from-[#FF3344]/20 via-transparent to-transparent pointer-events-none animate-pulse"></div>
      ) : (
        <>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-companion-coral/10 blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* EMERGENCY MODE TOGGLE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#161C2B] border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center ${
              isEmergencyMode ? 'bg-[#FF3344] text-white animate-bounce' : 'bg-[#00F0FF]/10 text-[#00F0FF]'
            }`}>
              {isEmergencyMode ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase tracking-wider text-white">
                  {isEmergencyMode ? 'URGENT DISPATCH MODE ACTIVE' : 'PathPal Real-Time Care Coordination'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  isEmergencyMode ? 'bg-[#FF3344] text-white' : 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30'
                }`}>
                  {isEmergencyMode ? 'PRIORITY HIGH' : '24/7 LIVE SERVICE'}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {isEmergencyMode
                  ? 'Non-essential content hidden. Streamlined GPS quick request active for urgent hospital navigation.'
                  : 'Toggle Emergency Mode for immediate entrance dispatch & live GPS location locking.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch Button */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase ${isEmergencyMode ? 'text-[#FF3344]' : 'text-gray-400'}`}>
              Emergency Mode
            </span>
            <button
              onClick={handleToggleEmergencyMode}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEmergencyMode ? 'bg-[#FF3344]' : 'bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEmergencyMode ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================= EMERGENCY MODE UI ================= */}
        {isEmergencyMode ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#240A0D] border-2 border-[#FF3344] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-4xl mx-auto">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#FF3344]/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#FF3344] animate-ping"></div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                    Urgent Hospital Dispatch Center
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsSosModalOpen(true)}
                    className="bg-[#FF3344] hover:bg-[#FF3344]/90 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg animate-bounce"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Initiate SOS Countdown & 911 Dialer</span>
                  </button>
                  <a
                    href="tel:18007284725"
                    className="bg-black/50 hover:bg-black/70 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/20"
                  >
                    <Phone className="w-4 h-4 fill-white" /> 1-800-PATH-PAL
                  </a>
                </div>
              </div>

              {!emergencyDispatched ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Step 1: GPS Pinning */}
                  <div className="bg-[#120507] p-5 rounded-2xl border border-[#FF3344]/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#FF3344] flex items-center gap-1.5">
                        <Crosshair className="w-4 h-4" /> 1. Lock GPS Location
                      </span>
                      {gpsPinned && (
                        <span className="text-[10px] font-bold bg-[#00F0FF]/20 text-[#00F0FF] px-2 py-0.5 rounded border border-[#00F0FF]/30">
                          GPS LOCKED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300">
                      Pin your current device location so our nearest on-duty Pal can meet your vehicle instantly.
                    </p>

                    <button
                      onClick={handlePinLocation}
                      disabled={isPinningGps}
                      className="w-full bg-[#1A090C] hover:bg-[#2A1014] text-white border border-[#FF3344]/60 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isPinningGps ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FF3344] border-t-transparent rounded-full animate-spin"></div>
                          <span>Acquiring GPS Satellites...</span>
                        </>
                      ) : gpsPinned ? (
                        <>
                          <Check className="w-4 h-4 text-[#00F0FF]" />
                          <span>Coordinates: 37.7749° N, 122.4194° W (± 2m)</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-[#FF3344]" />
                          <span>Pin My Current GPS Coordinates</span>
                        </>
                      )}
                    </button>

                    {gpsPinned && (
                      <div className="text-[11px] text-gray-400 bg-black/40 p-2.5 rounded-lg font-mono flex items-center justify-between">
                        <span>Nearest Medical Hub:</span>
                        <span className="text-white font-bold">St. Mary's ER Complex (0.3 mi)</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Select Entrance & Quick Dispatch */}
                  <div className="bg-[#120507] p-5 rounded-2xl border border-[#FF3344]/30 space-y-4">
                    <div className="text-xs font-black uppercase text-[#FF3344] flex items-center gap-1.5">
                      <Radio className="w-4 h-4 animate-pulse" /> 2. Select Hospital Meeting Point
                    </div>

                    <div className="space-y-2">
                      {[
                        'Emergency ER Gate 1 (Valet Bay)',
                        'Main Hospital Front Lobby Entrance',
                        'Urgent Care / Outpatient Surgery Tower',
                        'Ambulance Bay Drop-Off Desk'
                      ].map((entrance) => (
                        <button
                          key={entrance}
                          onClick={() => setSelectedEntrance(entrance)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                            selectedEntrance === entrance
                              ? 'bg-[#FF3344]/20 border-[#FF3344] text-white'
                              : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          📍 {entrance}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleEmergencyDispatch}
                      className="w-full bg-[#FF3344] hover:bg-[#FF3344]/90 text-white font-black uppercase text-xs py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      DISPATCH EMERGENCY PAL NOW (ETA ~3 MINS)
                    </button>
                  </div>

                </div>
              ) : (
                /* Dispatched Confirmation Screen */
                <div className="bg-[#120507] p-6 rounded-2xl border-2 border-[#00F0FF] space-y-4 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center mx-auto border border-[#00F0FF]/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-black uppercase text-white">EMERGENCY PAL DISPATCHED</h3>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Companion Pal <strong className="text-[#00F0FF]">Marcus T. (Badge #PAL-9401)</strong> has been notified and is en route to meet you at <strong className="text-white">{selectedEntrance}</strong>.
                  </p>

                  <div className="p-3 bg-[#161C2B] rounded-xl border border-white/10 max-w-sm mx-auto flex items-center justify-between text-xs">
                    <span className="text-gray-400">Estimated Pal Arrival:</span>
                    <span className="text-[#00F0FF] font-black text-sm animate-pulse">2 Mins 45 Secs</span>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setEmergencyDispatched(false)}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Modify Request
                    </button>
                    <a
                      href="tel:18007284725"
                      className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Assigned Pal
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* ================= STANDARD STARTUP HERO UI ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2232] border border-[#00F0FF]/30 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-widest text-[#00F0FF]">
                  {t('heroBadge')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white">
                {t('heroTitlePrefix')} <br />
                <span className="text-[#00F0FF] text-stroke-cyan">{t('heroTitleHighlight')}</span>
              </h1>

              <p className="text-lg font-bold text-gray-200">
                {t('tagline')}
              </p>

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
                {t('heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onRequestPal}
                  className="bg-companion-coral hover:bg-companion-coral/90 text-white font-black uppercase text-xs tracking-wider px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
                >
                  <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span>{t('btnRequestPal')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="bg-[#1A2232] hover:bg-white/10 text-white border border-white/20 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5 text-[#00F0FF]" />
                  <span>Explore Live App Portals</span>
                </button>
              </div>

              {/* Quick Highlight Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] shrink-0 border border-[#00F0FF]/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">100% Non-Clinical</div>
                    <div className="text-[11px] text-gray-400">Trained & Vetted</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-companion-coral/10 text-companion-coral shrink-0 border border-companion-coral/20">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Curb Meeting</div>
                    <div className="text-[11px] text-gray-400">Met at Doorstep</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">4.96 / 5 Rating</div>
                    <div className="text-[11px] text-gray-400">Patient Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Companion Match Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="bg-[#121824] rounded-3xl p-6 shadow-2xl border border-white/15 relative z-10 space-y-5">
                
                {/* Audience Selector Tabs */}
                <div className="flex bg-[#0A0D14] p-1 rounded-2xl border border-white/10">
                  <button
                    onClick={() => setActiveTab('patient')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'patient'
                        ? 'bg-companion-coral text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    For Patients
                  </button>
                  <button
                    onClick={() => setActiveTab('pal')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'pal'
                        ? 'bg-[#00F0FF] text-black shadow-md font-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    For Pals
                  </button>
                  <button
                    onClick={() => setActiveTab('hospital')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeTab === 'hospital'
                        ? 'bg-[#1A2232] text-white border border-white/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    For Hospitals
                  </button>
                </div>

                {activeTab === 'patient' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between bg-[#00F0FF]/10 p-3 rounded-2xl border border-[#00F0FF]/30">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#00F0FF] animate-ping"></span>
                        <span className="text-xs font-black text-[#00F0FF]">LIVE DISPATCH DISCOVERED</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400">Visit ID: #PAL-8802</span>
                    </div>

                    {/* Companion Profile Card with Hero Theme Photo */}
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#00F0FF]/40 shadow-xl group">
                        <img
                          src={new URL('../assets/images/hospital_escort_hero_1785710544430.jpg', import.meta.url).href}
                          alt="PathPal Companion Pal in Hospital"
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/30"></div>
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                          <span className="bg-[#00F0FF] text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                            ACTIVE PAL MATCH
                          </span>
                          <span className="text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/20">
                            St. Jude Medical Center
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1A2232] border border-white/10">
                        <div className="relative">
                          <img
                            src={samplePal.avatar}
                            alt={samplePal.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00F0FF]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-[#00F0FF] text-black p-1 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white">{samplePal.name}</h3>
                            <div className="flex items-center gap-1 text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>{samplePal.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 font-medium">Verified Companion Pal • Badge #{samplePal.badgeNumber}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {samplePal.languages.map((lang) => (
                              <span key={lang} className="text-[10px] font-bold bg-[#0A0D14] text-[#00F0FF] px-2 py-0.5 rounded-md border border-[#00F0FF]/30">
                                🗣️ {lang}
                              </span>
                            ))}
                            <span className="text-[10px] font-bold bg-[#0A0D14] text-companion-coral px-2 py-0.5 rounded-md border border-companion-coral/30">
                              ♿ Wheelchair Certified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Point Box */}
                    <div className="p-3.5 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                        <span>DISPATCH LOCATION</span>
                        <span className="text-[#00F0FF] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Ready in 15 Mins
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-5 h-5 text-companion-coral shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">Metro Health - Main Entrance Valet Desk</div>
                          <div className="text-[11px] text-gray-400">Elena will meet you outside the glass doors with a PathPal badge & lanyard.</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onRequestPal}
                      className="w-full text-xs font-black uppercase text-white bg-companion-coral hover:bg-companion-coral/90 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      Book Companion Pal Now
                    </button>
                  </div>
                )}

                {activeTab === 'pal' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-[#00F0FF]/10 p-4 rounded-2xl border border-[#00F0FF]/30 space-y-2">
                      <div className="text-xs font-black text-[#00F0FF] uppercase tracking-wider">For Companions ("Pals")</div>
                      <h3 className="text-base font-bold text-white">Earn Money & Make a Real Impact.</h3>
                      <p className="text-xs text-gray-300">
                        Turn your empathy into structured hospital companion support. Flexible hourly pay, CHW career certification pathways, and performance bonuses.
                      </p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A0D14] border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
                        <span className="font-semibold text-gray-200">Full background check & hospital credentialing</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A0D14] border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
                        <span className="font-semibold text-gray-200">Clear non-clinical guidelines & safety protocols</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A0D14] border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
                        <span className="font-semibold text-gray-200">Earn Community Health Worker (CHW) billable credits</span>
                      </div>
                    </div>
                    <button
                      onClick={onBecomePal}
                      className="w-full text-xs font-black uppercase text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Apply to Join as a Pal
                    </button>
                  </div>
                )}

                {activeTab === 'hospital' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-[#1A2232] text-white p-4 rounded-2xl border border-white/10 space-y-2">
                      <div className="text-[10px] font-black text-[#00F0FF] uppercase tracking-wider">For Hospital Systems</div>
                      <h3 className="text-base font-bold">Turnkey Patient Care Pal Integration.</h3>
                      <p className="text-xs text-gray-300">
                        Improve HCAHPS patient experience ratings (25% of VBP score), lower appointment drop-offs by 34%, and fulfill Schedule H Community Benefit mandates.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-3 bg-[#0A0D14] rounded-xl border border-white/10">
                        <div className="text-base font-black text-[#00F0FF]">HCPCS G0511</div>
                        <div className="text-[10px] text-gray-400">CMS Reimbursement Code</div>
                      </div>
                      <div className="p-3 bg-[#0A0D14] rounded-xl border border-white/10">
                        <div className="text-base font-black text-companion-coral">Schedule H</div>
                        <div className="text-[10px] text-gray-400">CHNA Community Benefit</div>
                      </div>
                    </div>
                    <button
                      onClick={onBecomePal}
                      className="w-full text-xs font-black uppercase text-white bg-companion-coral hover:bg-companion-coral/90 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Request Hospital Enterprise Demo
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>

      <SosEmergencyModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />
    </section>
  );
};
