import React from 'react';
import { Heart, UserCheck, Building2, MapPin, Navigation, ShieldCheck, ArrowRight, Sparkles, Star, CheckCircle2, Phone, Clock, Calculator, ShieldAlert, Radio } from 'lucide-react';
import { Hero } from '../components/Hero';
import { AboutAndBrand } from '../components/AboutAndBrand';
import { SAMPLE_PALS, SAMPLE_HOSPITALS } from '../data/mockData';

interface HomePageProps {
  onNavigatePage: (page: 'home' | 'patient' | 'pal' | 'hospital' | 'about') => void;
  onRequestPal: () => void;
  onBecomePal: () => void;
  onOpenGpsModal: () => void;
  onOpenChargesModal: (tab?: 'patient_charges' | 'pal_earnings') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigatePage,
  onRequestPal,
  onBecomePal,
  onOpenGpsModal,
  onOpenChargesModal,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48A6A5]/15 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHOOSE YOUR DEDICATED PORTAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F3449] tracking-tight">
            Tailored Experiences for Every Role
          </h2>
          <p className="text-sm text-gray-600">
            Patients, Companion Pals, and Administrators have custom portals designed specifically for their needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Patient Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg flex flex-col justify-between space-y-6 hover:border-[#E85D75] transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E85D75]/15 border border-[#E85D75] text-[#E85D75] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 fill-[#E85D75]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-[#E85D75] tracking-widest">FOR PATIENTS & FAMILIES</span>
                <h3 className="text-2xl font-black text-[#1F3449]">Patient Portal</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Request a compassionate companion, track your assigned Pal in real-time, view zero out-of-pocket health voucher coverage, and manage your encrypted HIPAA medical summary.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E85D75] shrink-0" />
                  <span>Book Hospital Meeting Point & Doorstep Pal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E85D75] shrink-0" />
                  <span>Read-Only HIPAA Medical Summary Control</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E85D75] shrink-0" />
                  <span>Live GPS Tracking & Indoor Campus Radar</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigatePage('patient')}
              className="w-full bg-[#E85D75] hover:bg-[#E85D75]/90 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Enter Patient Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pal Companion Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg flex flex-col justify-between space-y-6 hover:border-[#48A6A5] transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#48A6A5]/15 border border-[#48A6A5] text-[#48A6A5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-[#48A6A5] tracking-widest">FOR COMPANION PALS & CHWs</span>
                <h3 className="text-2xl font-black text-[#1F3449]">Pal Portal</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Accept nearby Pal requests, navigate hospital campuses with turn-by-turn indoor radar, track earnings ($22-$28/hr), and access patient mobility requirements safely.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Live Pal Assignments Feed & Accept/Decline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Stipend & Earnings Calculator ($22-$28/hr)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Turn-by-Turn BLE Campus Navigation Radar</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigatePage('pal')}
              className="w-full bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Enter Pal Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg flex flex-col justify-between space-y-6 hover:border-[#1F3449] transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1F3449]/10 border border-[#1F3449]/30 text-[#1F3449] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-[#1F3449] tracking-widest">FOR ADMIN & CARE CO-ORDINATORS</span>
                <h3 className="text-2xl font-black text-[#1F3449]">Admin Portal</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Oversee real-time patient companion dispatch, review Pal onboarding applications, monitor HCAHPS scores, and download CHNA Schedule H community benefit reports.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Real-Time Patient Companion Dispatch Log</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Pal Applicant Verification & Approval Pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Schedule H CHNA Community Benefit Exemption</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigatePage('hospital')}
              className="w-full bg-[#1F3449] hover:bg-[#1F3449]/90 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Enter Admin Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. Concise 3-Step Journey Overview */}
      <section className="bg-[#FCE9EC]/50 py-16 border-y border-[#E85D75]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#48A6A5]">HOW PATHPAL WORKS</span>
            <h2 className="text-3xl font-black text-[#1F3449]">3 Simple Steps to Safe Navigation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E85D75] text-white text-xl font-black mx-auto flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-[#1F3449]">Request Your Pal</h3>
              <p className="text-xs text-gray-600">
                Book a background-checked companion for your upcoming hospital visit in seconds via web or Android app.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#48A6A5] text-white text-xl font-black mx-auto flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-[#1F3449]">Rendezvous at Entrance</h3>
              <p className="text-xs text-gray-600">
                Your Pal meets you at valet parking, transit stops, or hospital lobby gates with live GPS radar tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#48A6A5] text-white text-xl font-black mx-auto flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-[#1F3449]">Guided Care Companion</h3>
              <p className="text-xs text-gray-600">
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
      />

      {/* 5. Quick Action Bar for Navigation & Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-white via-[#FCE9EC] to-white p-6 sm:p-8 rounded-3xl border border-[#48A6A5]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Navigation className="w-5 h-5 text-[#48A6A5] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-[#48A6A5]">CARE COORDINATION & NAVIGATION TOOLS</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1F3449]">Need Hospital Live GPS Radar or Fee Calculations?</h3>
            <p className="text-xs text-gray-600 max-w-xl">
              Access turn-by-turn campus radar, live BLE beacon tracking, health voucher calculator, and instant Pal booking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenGpsModal}
              className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-2 shadow-md"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>Live GPS Radar</span>
            </button>
            <button
              onClick={() => onOpenChargesModal('patient_charges')}
              className="bg-white hover:bg-gray-50 text-emerald-600 font-bold text-xs uppercase px-5 py-3 rounded-xl border border-emerald-500/40 flex items-center gap-2 shadow-sm"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Patient Charges & Coverage</span>
            </button>
            <button
              onClick={() => onNavigatePage('about')}
              className="bg-[#1F3449] hover:bg-[#1F3449]/90 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-sm"
            >
              <span>Learn About & Impact</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
