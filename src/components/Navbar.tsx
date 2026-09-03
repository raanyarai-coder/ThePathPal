import React, { useState } from 'react';
import { Heart, MapPin, Navigation, Menu, X, Shield, Users, Building2, CreditCard, UserCheck, HelpCircle, Calculator, Bell, ShieldAlert, Globe, ChevronDown, Keyboard, Calendar, Database, LogIn, RefreshCw } from 'lucide-react';
import { useLanguage, LANGUAGES, SupportedLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentPage: 'home' | 'patient' | 'pal' | 'hospital' | 'about';
  onNavigatePage: (page: 'home' | 'patient' | 'pal' | 'hospital' | 'about') => void;
  onRequestPal: () => void;
  onBecomePal: () => void;
  onReplacePal?: () => void;
  onOpenPayment?: () => void;
  onOpenPalAccount?: () => void;
  onOpenGpsModal?: () => void;
  onOpenChargesModal?: () => void;
  onOpenPushNotifications?: () => void;
  onOpenKeyboardModal?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenSupabaseAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigatePage,
  onRequestPal,
  onBecomePal,
  onReplacePal,
  onOpenPayment,
  onOpenPalAccount,
  onOpenGpsModal,
  onOpenChargesModal,
  onOpenPushNotifications,
  onOpenKeyboardModal,
  onOpenCalendarModal,
  onOpenSupabaseAuth,
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
    <header className="sticky top-0 z-40 bg-white/95 text-[#1F3449] shadow-sm border-b border-gray-200/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigatePage('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            {/* Primary Logo Icon Mark with Pin & Teal Arch */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-10 h-10 bg-[#FCE9EC] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-[#E85D75]/30">
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
              <span className="text-2xl font-black tracking-tight text-[#1F3449] flex items-center gap-0.5">
                Path<span className="text-[#E85D75]">Pal</span>
              </span>
              <span className="text-[8.5px] uppercase tracking-widest font-bold text-gray-500 -mt-0.5">
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
                      : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
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
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
              {/* Language Toggle */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-white text-[#1F3449] transition-all flex items-center gap-1.5 text-xs font-bold"
                  title="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#48A6A5]" />
                  <span className="text-xs">{currentLangObj.flag}</span>
                  <span className="text-[10px] font-black uppercase text-[#48A6A5]">{currentLangObj.code}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50 p-1 space-y-0.5">
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
                            : 'text-gray-700 hover:bg-gray-100'
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
                  className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#48A6A5] transition-all"
                >
                  <Navigation className="w-4 h-4 text-[#48A6A5]" />
                </button>
              )}

              {/* Push Alerts */}
              {onOpenPushNotifications && (
                <button
                  onClick={onOpenPushNotifications}
                  title="Push Notifications"
                  className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#48A6A5] transition-all relative"
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
                  className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#48A6A5] transition-all"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              )}

              {/* Keyboard Shortcuts */}
              {onOpenKeyboardModal && (
                <button
                  onClick={onOpenKeyboardModal}
                  title="Keyboard Shortcuts (Alt+K)"
                  className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#48A6A5] transition-all"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              )}

              {/* Supabase Patient Auth */}
              {onOpenSupabaseAuth && (
                <button
                  onClick={onOpenSupabaseAuth}
                  title="Supabase Patient Sign Up & Login"
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patient Auth</span>
                </button>
              )}
            </div>

            {onReplacePal && (
              <button
                onClick={onReplacePal}
                className="text-xs font-bold text-[#E85D75] bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                title="Replace Pal Template"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#E85D75]" />
                <span>Replace Pal</span>
              </button>
            )}

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
                className="p-2 rounded-xl bg-gray-100 text-[#48A6A5] border border-gray-200 relative"
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
              className="p-2 rounded-xl text-[#1F3449] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {/* Mobile Language Selector */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#48A6A5]" /> Select Language
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    language === lang.code
                      ? 'bg-[#48A6A5] text-white font-black'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-2 pb-3 border-b border-gray-200">
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
                    isActive ? 'bg-[#48A6A5]/15 text-[#48A6A5] font-black' : 'text-gray-700 hover:bg-gray-100'
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
                className="w-full text-xs font-bold uppercase text-[#48A6A5] bg-gray-50 py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-200"
              >
                <Bell className="w-4 h-4 text-[#48A6A5]" />
                <span>Push Notifications & Alerts Manager</span>
              </button>
            )}

            {onOpenGpsModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGpsModal();
                }}
                className="w-full text-xs font-bold uppercase text-[#48A6A5] bg-gray-50 py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-200"
              >
                <Navigation className="w-4 h-4 text-[#48A6A5]" />
                Live GPS Location Tracker
              </button>
            )}

            {onReplacePal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplacePal();
                }}
                className="w-full text-xs font-bold uppercase text-[#E85D75] bg-rose-50 hover:bg-rose-100 py-3 rounded-xl flex items-center justify-center gap-2 border border-rose-200"
              >
                <RefreshCw className="w-4 h-4 text-[#E85D75]" />
                <span>Replace a Pal</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestPal();
              }}
              className="w-full text-xs font-black uppercase text-white bg-[#E85D75] py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
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


