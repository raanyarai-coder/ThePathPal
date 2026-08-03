import React, { useState } from 'react';
import { Heart, MapPin, Navigation, Menu, X, Shield, Users, Building2, CreditCard, UserCheck, HelpCircle, Sun, Moon, Calculator, Bell, ShieldAlert, Globe, ChevronDown, Keyboard, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
  onOpenSosModal?: () => void;
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
  onOpenSosModal,
  onOpenKeyboardModal,
  onOpenCalendarModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, currentLangObj } = useLanguage();

  const pageLinks = [
    { id: 'home', name: t('navHome') },
    { id: 'patient', name: t('navPatient'), badge: 'Patient' },
    { id: 'pal', name: t('navPal'), badge: 'Companion' },
    { id: 'hospital', name: t('navHospital') },
    { id: 'about', name: t('navAbout') },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/10 text-white">
      {/* Top Banner */}
      <div className="bg-[#121824] text-gray-300 text-[11px] py-1.5 px-4 text-center flex items-center justify-center gap-2 font-bold uppercase tracking-wider border-b border-white/5">
        <span className="inline-block w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
        <span>PATHPAL CARE COORDINATION • Smarter Hospital Navigation & Companion Care</span>
        <span className="hidden sm:inline-block bg-[#00F0FF]/20 text-[#00F0FF] px-2 py-0.5 rounded text-[10px] font-black tracking-widest border border-[#00F0FF]/30">
          2026 CMS & SSBCI APPROVED
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigatePage('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="relative w-11 h-11 bg-[#1A2232] rounded-2xl border border-[#00F0FF]/40 flex items-center justify-center shadow-lg shadow-[#00F0FF]/10 group-hover:scale-105 transition-transform duration-200">
              <div className="relative flex items-center justify-center">
                <MapPin className="w-8 h-8 text-[#00F0FF] fill-[#00F0FF]/20" />
                <Heart className="w-3.5 h-3.5 text-black fill-[#00F0FF] absolute top-2.5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black italic tracking-tight text-white flex items-center gap-0.5 uppercase">
                Path<span className="text-[#00F0FF] text-stroke-cyan">Pal</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-black text-[#00F0FF] -mt-1">
                Never Navigate Alone
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {pageLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigatePage(link.id)}
                  className={`text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all relative flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{link.name}</span>
                  {'badge' in link && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                      link.id === 'patient' ? 'bg-companion-coral text-white' : 'bg-navigation-teal text-white'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Multilingual i18n Language Toggle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2.5 rounded-xl bg-[#1A2232] hover:bg-white/10 text-white border border-[#00F0FF]/40 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
                title="Select Language / Cambiar Idioma"
              >
                <Globe className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm">{currentLangObj.flag}</span>
                <span className="text-[11px] font-black uppercase text-[#00F0FF]">{currentLangObj.code}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#121824] rounded-2xl border-2 border-[#00F0FF] shadow-2xl overflow-hidden z-50 p-1.5 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-white/10">
                    Hospital Languages
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        language === lang.code
                          ? 'bg-[#00F0FF] text-black font-black'
                          : 'text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] opacity-70 font-mono uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Google Calendar & Reminders Integration */}
            {onOpenCalendarModal && (
              <button
                onClick={onOpenCalendarModal}
                title="Google Calendar & iCal Reminders (Alt+C)"
                className="p-2.5 rounded-xl bg-[#1A2232] hover:bg-white/10 text-white border border-[#00F0FF]/40 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md group"
                aria-label="Google Calendar & Reminders (Alt+C)"
              >
                <Calendar className="w-4 h-4 text-[#00F0FF] group-hover:scale-110 transition-transform" />
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-[#00F0FF] border border-[#00F0FF]/30 font-mono">
                  Alt+C
                </kbd>
              </button>
            )}

            {/* Keyboard Shortcuts Accessibility Guide */}
            {onOpenKeyboardModal && (
              <button
                onClick={onOpenKeyboardModal}
                title="Keyboard Accessibility Shortcuts (Alt+K)"
                className="p-2.5 rounded-xl bg-[#1A2232] hover:bg-white/10 text-white border border-[#00F0FF]/40 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md group"
                aria-label="Keyboard Shortcuts (Alt+K)"
              >
                <Keyboard className="w-4 h-4 text-[#00F0FF] group-hover:scale-110 transition-transform" />
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-[#00F0FF] border border-[#00F0FF]/30 font-mono">
                  Alt+K
                </kbd>
              </button>
            )}

            {/* SOS Emergency Mode Quick Button */}
            {onOpenSosModal && (
              <button
                onClick={onOpenSosModal}
                title="Initiate Emergency SOS Dispatch (Alt+S)"
                className="p-2.5 rounded-xl bg-[#FF3344] hover:bg-[#FF3344]/90 text-white border border-white/20 transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider animate-pulse shadow-lg shadow-[#FF3344]/30"
                aria-label="SOS Emergency Dispatch (Keyboard shortcut: Alt+S)"
              >
                <ShieldAlert className="w-4 h-4 fill-white" />
                <span className="hidden xl:inline-block">SOS Emergency</span>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white border border-white/30 font-mono">
                  Alt+S
                </kbd>
              </button>
            )}

            {/* Explicit Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch Theme (Current: ${theme.toUpperCase()})`}
              className="p-2.5 rounded-xl bg-[#1A2232] hover:bg-white/10 text-[#00F0FF] border border-[#00F0FF]/30 hover:border-[#00F0FF]/60 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
              aria-label="Toggle High-Contrast Theme Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
                  <span className="text-[11px] text-amber-300">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] text-indigo-400">Dark Mode</span>
                </>
              )}
            </button>

            {/* Push Notifications Toggle Button */}
            {onOpenPushNotifications && (
              <button
                onClick={onOpenPushNotifications}
                title="Push Notifications & Alerts Manager"
                className="relative p-2.5 rounded-xl bg-[#1A2232] text-[#00F0FF] hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <Bell className="w-4 h-4 text-[#00F0FF]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-companion-coral border-2 border-[#0A0D14] animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-companion-coral border-2 border-[#0A0D14]" />
                <span className="hidden xl:inline-block text-[11px] text-gray-200">Push Alerts</span>
              </button>
            )}

            {onOpenGpsModal && (
              <button
                onClick={onOpenGpsModal}
                className="text-xs font-bold text-gray-200 bg-[#1A2232] hover:bg-white/10 px-3 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
                Live GPS
              </button>
            )}

            {onOpenChargesModal && (
              <button
                onClick={onOpenChargesModal}
                className="text-xs font-bold text-gray-200 bg-[#1A2232] hover:bg-white/10 px-3 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                Charges & Earnings
              </button>
            )}

            {onOpenPalAccount && (
              <button
                onClick={onOpenPalAccount}
                className="text-xs font-bold text-gray-300 bg-[#1A2232] hover:bg-white/10 px-3 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                Pal Portal
              </button>
            )}

            <button
              onClick={onRequestPal}
              className="text-xs font-black uppercase text-white bg-companion-coral hover:bg-companion-coral/90 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Request Pal
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              className="p-2 rounded-xl bg-[#1A2232] text-amber-300 border border-white/10 flex items-center gap-1 text-[10px] font-bold"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {onOpenPushNotifications && (
              <button
                onClick={onOpenPushNotifications}
                title="Push Notifications"
                className="p-2 rounded-xl bg-[#1A2232] text-[#00F0FF] border border-white/10 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-companion-coral" />
              </button>
            )}

            <button
              onClick={onRequestPal}
              className="text-xs font-bold text-white bg-companion-coral px-3 py-2 rounded-xl"
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
                  className={`text-xs font-black uppercase tracking-wider py-2.5 px-3 rounded-lg text-left flex items-center justify-between transition-all ${
                    isActive ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <span>{link.name}</span>
                  {'badge' in link && (
                    <span className="text-[9px] bg-companion-coral text-white px-2 py-0.5 rounded font-black">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <button
              onClick={toggleTheme}
              className="w-full text-xs font-bold uppercase text-amber-300 bg-[#1A2232] py-3 rounded-xl flex items-center justify-center gap-2 border border-white/10"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

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

            {onOpenChargesModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChargesModal();
                }}
                className="w-full text-xs font-bold uppercase text-emerald-400 bg-[#1A2232] py-3 rounded-xl flex items-center justify-center gap-2 border border-white/10"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                Charges & Earnings Calculator
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


