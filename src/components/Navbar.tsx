import React, { useState } from 'react';
import { Heart, MapPin, Navigation, Menu, X, Shield, Users, Building2, CreditCard, UserCheck, HelpCircle, Calculator, Bell, ShieldAlert, Globe, ChevronDown, Keyboard, Calendar } from 'lucide-react';
import { useLanguage, LANGUAGES, SupportedLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentPage: 'home' | 'patient' | 'pal' | 'hospital' | 'about';
  onNavigatePage: (page: 'home' | 'patient' | 'pal' | 'hospital' | 'about') => void;
  onRequestPal: () => void;
  onBecomePal: () => void;
  onHospitalPartner: () => void;
  onOpenPayment?: () => void;
  onOpenPalAccount?: () => void;
  onOpenGpsModal?: () => void;
  onOpenChargesModal?: () => void;
  onOpenPushNotifications?: () => void;
  onOpenKeyboardModal?: () => void;
  onOpenCalendarModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigatePage,
  onRequestPal,
  onBecomePal,
  onHospitalPartner,
  onOpenPayment,
  onOpenPalAccount,
  onOpenGpsModal,
  onOpenChargesModal,
  onOpenPushNotifications,
  onOpenKeyboardModal,
  onOpenCalendarModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { language, setLanguage, t, currentLangObj } = useLanguage();

  const pageLinks = [
    { id: 'home', name: t('navHome') },
    { id: 'patient', name: t('navPatient') },
    { id: 'pal', name: t('navPal') },
    { id: 'hospital', name: t('navHospital') },
    { id: 'about', name: t('navAbout') },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#1F3449] text-white shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigatePage('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            {/* Primary Logo Icon Mark with Pin & Teal Arch */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-10 h-10 bg-[#1F3449] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <MapPin className="w-8 h-8 text-[#E85D75] fill-[#E85D75]" />
                <Heart className="w-3.5 h-3.5 text-white fill-white absolute top-2" />
              </div>
              {/* Wayfinding Teal Curved Line with End Dots */}
              <div className="w-10 h-1.5 flex items-center justify-between -mt-1 px-0.5">
                <span className="w-1 h-1 rounded-full bg-[#48A6A5]"></span>
                <div className="flex-1 h-[2px] bg-[#48A6A5] rounded-full mx-0.5"></div>
                <span className="w-1 h-1 rounded-full bg-[#48A6A5]"></span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-0.5">
                Path<span className="text-[#E85D75]">Pal</span>
              </span>
              <span className="text-[8.5px] uppercase tracking-widest font-medium text-gray-300 -mt-0.5">
                NEVER NAVIGATE THE HOSPITAL ALONE
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {pageLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigatePage(link.id)}
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#48A6A5] text-white font-black shadow-md'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Quick Tools Icon Bar */}
            <div className="flex items-center gap-1 bg-[#152535] p-1 rounded-xl border border-white/10">
              {/* Language Toggle */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                  title="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#48A6A5]" />
                  <span className="text-xs">{currentLangObj.flag}</span>
                  <span className="text-[10px] font-black uppercase text-[#48A6A5]">{currentLangObj.code}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#1F3449] rounded-xl border border-[#48A6A5]/50 shadow-2xl overflow-hidden z-50 p-1 space-y-0.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                          language === lang.code
                            ? 'bg-[#48A6A5] text-white font-bold'
                            : 'text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        <span className="text-[10px] opacity-70 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live GPS */}
              {onOpenGpsModal && (
                <button
                  onClick={onOpenGpsModal}
                  title="Live GPS Location Tracker"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-[#48A6A5] transition-all"
                >
                  <Navigation className="w-4 h-4 text-[#48A6A5]" />
                </button>
              )}

              {/* Push Alerts */}
              {onOpenPushNotifications && (
                <button
                  onClick={onOpenPushNotifications}
                  title="Push Notifications"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-[#48A6A5] transition-all relative"
                >
                  <Bell className="w-4 h-4 text-[#48A6A5]" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E85D75]" />
                </button>
              )}

              {/* Calendar */}
              {onOpenCalendarModal && (
                <button
                  onClick={onOpenCalendarModal}
                  title="Calendar & Reminders (Alt+C)"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-[#48A6A5] transition-all"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              )}

              {/* Keyboard Shortcuts */}
              {onOpenKeyboardModal && (
                <button
                  onClick={onOpenKeyboardModal}
                  title="Keyboard Shortcuts (Alt+K)"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-[#48A6A5] transition-all"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={onRequestPal}
              className="text-xs font-black uppercase text-white bg-[#E85D75] hover:bg-[#E85D75]/90 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md ml-1"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Request Pal
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-1.5">
            {onOpenPushNotifications && (
              <button
                onClick={onOpenPushNotifications}
                title="Push Notifications"
                className="p-2 rounded-xl bg-[#152535] text-[#48A6A5] border border-white/10 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E85D75]" />
              </button>
            )}

            <button
              onClick={onRequestPal}
              className="text-xs font-bold text-white bg-[#E85D75] px-3 py-2 rounded-xl"
            >
              Request
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121824] border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          {/* Mobile Language Selector */}
          <div className="bg-[#1A2232] p-3 rounded-2xl border border-white/10 space-y-2">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00F0FF]" /> Select Language
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    language === lang.code
                      ? 'bg-[#00F0FF] text-black font-black'
                      : 'bg-black/30 text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-2 pb-3 border-b border-white/10">
            {pageLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigatePage(link.id);
                  }}
                  className={`text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg text-left flex items-center justify-between transition-all ${
                    isActive ? 'bg-[#00F0FF]/20 text-[#00F0FF] font-black' : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <span>{link.name}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2">
            {onOpenPushNotifications && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPushNotifications();
                }}
                className="w-full text-xs font-bold uppercase text-[#00F0FF] bg-[#1A2232] py-3 rounded-xl flex items-center justify-center gap-2 border border-white/10"
              >
                <Bell className="w-4 h-4 text-[#00F0FF]" />
                <span>Push Notifications & Alerts Manager</span>
              </button>
            )}

            {onOpenGpsModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGpsModal();
                }}
                className="w-full text-xs font-bold uppercase text-[#00F0FF] bg-[#1A2232] py-3 rounded-xl flex items-center justify-center gap-2 border border-white/10"
              >
                <Navigation className="w-4 h-4 text-[#00F0FF]" />
                Live GPS Location Tracker
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestPal();
              }}
              className="w-full text-xs font-black uppercase text-white bg-companion-coral py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              Request a Pal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


