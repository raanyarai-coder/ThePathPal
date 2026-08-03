import React from 'react';
import { Heart, UserCheck, Building2, MapPin, Navigation, ShieldCheck, ArrowRight, Sparkles, Star, CheckCircle2, Phone, Clock, Calculator, ShieldAlert, Radio } from 'lucide-react';
import { Hero } from '../components/Hero';
import { AboutAndBrand } from '../components/AboutAndBrand';
import { SAMPLE_PALS, SAMPLE_HOSPITALS } from '../data/mockData';

interface HomePageProps {
  onNavigatePage: (page: 'home' | 'patient' | 'pal' | 'hospital' | 'about') => void;
  onRequestPal: () => void;
  onBecomePal: () => void;
  onHospitalPartner: () => void;
  onOpenGpsModal: () => void;
  onOpenChargesModal: () => void;
  onOpenSosModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigatePage,
  onRequestPal,
  onBecomePal,
  onHospitalPartner,
  onOpenGpsModal,
  onOpenChargesModal,
  onOpenSosModal,
}) => {
  return (
    <div className="space-y-16 animate-fade-in pb-16">
      {/* 1. Refined Hero with Direct Role Selection */}
      <Hero
        onRequestPal={onRequestPal}
        onExploreDemo={() => onNavigatePage('patient')}
        onBecomePal={onBecomePal}
      />

      {/* 2. Clear Role Selection Banners - Tailored Experiences */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-black uppercase tracking-wider border border-[#00F0FF]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHOOSE YOUR DEDICATED PORTAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tailored Experiences for Every Role
          </h2>
          <p className="text-sm text-gray-300">
            Patients, Companion Pals, and Hospital Administrators have custom portals designed specifically for their needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Patient Card */}
          <div className="bg-[#121824] p-8 rounded-3xl border border-companion-coral/40 shadow-xl flex flex-col justify-between space-y-6 hover:border-companion-coral transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-companion-coral/20 border border-companion-coral text-companion-coral flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 fill-companion-coral" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-companion-coral tracking-widest">FOR PATIENTS & FAMILIES</span>
                <h3 className="text-2xl font-black text-white">Patient Portal</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Request a compassionate companion, track your assigned Pal in real-time, view zero out-of-pocket Medicare G0511 coverage, and manage your encrypted HIPAA medical summary.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Book Hospital Meeting Point & Doorstep Pal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Read-Only HIPAA Medical Summary Control</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Live GPS Tracking & Emergency SOS Button</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigatePage('patient')}
              className="w-full bg-companion-coral hover:bg-companion-coral/90 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-companion-coral/20"
            >
              <span>Enter Patient Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pal Companion Card */}
          <div className="bg-[#121824] p-8 rounded-3xl border border-navigation-teal/40 shadow-xl flex flex-col justify-between space-y-6 hover:border-navigation-teal transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-navigation-teal/20 border border-navigation-teal text-navigation-teal flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-navigation-teal tracking-widest">FOR COMPANION PALS & CHWs</span>
                <h3 className="text-2xl font-black text-white">Pal Companion Portal</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Accept nearby Pal requests, navigate hospital campuses with turn-by-turn indoor radar, track earnings ($22-$28/hr), and access patient mobility requirements safely.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                  <span>Live Pal Assignments Feed & Accept/Decline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                  <span>Stipend & Earnings Calculator ($22-$28/hr)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                  <span>Turn-by-Turn BLE Campus Navigation Radar</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigatePage('pal')}
              className="w-full bg-navigation-teal hover:bg-navigation-teal/90 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-navigation-teal/20"
            >
              <span>Enter Pal Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hospital Partner Card */}
          <div className="bg-[#121824] p-8 rounded-3xl border border-[#00F0FF]/30 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#00F0FF]/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-[#00F0FF] tracking-widest">FOR HOSPITAL ADMIN & CARE CO-ORDINATORS</span>
                <h3 className="text-2xl font-black text-white">Hospital Admin Portal</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Oversee real-time patient companion dispatch, reduce appointment no-shows, monitor HCAHPS scores, and download CHNA Schedule H community benefit reports.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>Real-Time Patient Companion Dispatch Log</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>No-Show Reduction & Wait Time Metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>Schedule H CHNA Community Benefit Exemption</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigatePage('hospital')}
              className="w-full bg-white/10 hover:bg-white/20 text-[#00F0FF] border border-[#00F0FF]/50 font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Enter Hospital Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. Concise 3-Step Journey Overview */}
      <section className="bg-[#121824] py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00F0FF]">HOW PATHPAL WORKS</span>
            <h2 className="text-3xl font-black text-white">3 Simple Steps to Safe Navigation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-[#1A2232] p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-companion-coral text-white text-xl font-black mx-auto flex items-center justify-center shadow-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Request Your Pal</h3>
              <p className="text-xs text-gray-300">
                Book a background-checked companion for your upcoming hospital visit in seconds via web or Android app.
              </p>
            </div>

            <div className="bg-[#1A2232] p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-navigation-teal text-white text-xl font-black mx-auto flex items-center justify-center shadow-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Rendezvous at Entrance</h3>
              <p className="text-xs text-gray-300">
                Your Pal meets you at valet parking, transit stops, or hospital lobby gates with live GPS radar tracking.
              </p>
            </div>

            <div className="bg-[#1A2232] p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00F0FF] text-black text-xl font-black mx-auto flex items-center justify-center shadow-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Guided Care Companion</h3>
              <p className="text-xs text-gray-300">
                Enjoy stress-free arm-in-arm navigation through complex clinics, check-ins, pharmacy picks, and discharge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dedicated About Us Section */}
      <AboutAndBrand 
        onRequestPal={onRequestPal}
        onBecomePal={onBecomePal}
        onHospitalPartner={onHospitalPartner}
      />

      {/* 5. Quick Action Bar for Emergency & Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#2B0A0E] via-[#121824] to-[#1A2232] p-6 sm:p-8 rounded-3xl border-2 border-[#FF3344]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FF3344] animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider text-[#FF3344]">URGENT DISPATCH & SAFETY TOOLS</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Need Emergency Hospital SOS or Live GPS Radar?</h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Access 1-tap 911 dialing, campus security desk alerts, live BLE beacon tracking, and fee estimations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSosModal}
              className="bg-[#FF3344] hover:bg-[#FF3344]/90 text-white font-black text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg animate-pulse"
            >
              <ShieldAlert className="w-4 h-4 fill-white" />
              <span>SOS Dispatch & 911</span>
            </button>
            <button
              onClick={onOpenGpsModal}
              className="bg-[#1A2232] hover:bg-white/10 text-[#00F0FF] font-bold text-xs uppercase px-5 py-3 rounded-xl border border-[#00F0FF]/40 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-[#00F0FF]" />
              <span>Live GPS Radar</span>
            </button>
            <button
              onClick={() => onNavigatePage('about')}
              className="bg-white/10 hover:bg-white/20 text-gray-200 font-bold text-xs uppercase px-5 py-3 rounded-xl border border-white/20"
            >
              <span>Learn About & Impact</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
