import React from 'react';
import { Navigation, Calculator, MapPin, DollarSign, ShieldCheck, Heart, UserCheck, ArrowRight, Signal, Zap, CheckCircle2 } from 'lucide-react';

interface GpsAndFinancialSectionProps {
  onOpenGps: () => void;
  onOpenCharges: () => void;
  onRequestPal: () => void;
  onBecomePal: () => void;
}

export const GpsAndFinancialSection: React.FC<GpsAndFinancialSectionProps> = ({
  onOpenGps,
  onOpenCharges,
  onRequestPal,
  onBecomePal,
}) => {
  return (
    <section id="gps-charges" className="py-20 bg-[#1F3449] text-white border-b border-white/10 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#48A6A5]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#E85D75]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#48A6A5]/20 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/40">
            <Signal className="w-4 h-4 animate-pulse" />
            <span>REAL-TIME TELEMETRY & TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Live GPS Tracking & <span className="text-[#48A6A5]">Clear Financial Breakdown</span>
          </h2>
          <p className="text-base text-gray-300 font-light">
            Patients and Pals stay connected with encrypted live campus location radar, while both parties enjoy 100% upfront clarity on patient charges and Pal earnings.
          </p>
        </div>

        {/* Feature Cards Grid (2 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Feature 1: Live GPS Location Tracking */}
          <div className="bg-[#2B425B] p-8 rounded-3xl border border-[#48A6A5]/40 hover:border-[#48A6A5]/60 transition-all space-y-6 flex flex-col justify-between shadow-2xl relative group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#48A6A5]/20 border border-[#48A6A5]/40 flex items-center justify-center text-[#48A6A5]">
                  <Navigation className="w-7 h-7 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Radar Active
                </span>
              </div>

              <h3 className="text-2xl font-black uppercase text-white">
                Live GPS Patient & Pal Location Radar
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Track exact hospital rendezvous points, drop-off gates, outdoor campus paths, and indoor BLE beacon radar. Patients see their Pal approaching in real time, while Pals get turn-by-turn guidance to patient drop-off doors.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Real-time ETA countdown & speed telemetry</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Audio & haptic rendezvous ping button</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                  <span>Encrypted location sharing links for family</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenGps}
              className="w-full py-4 rounded-2xl bg-[#48A6A5] text-white font-black text-xs uppercase tracking-wider hover:bg-[#48A6A5]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#48A6A5]/20 mt-4"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Live GPS Radar Tracker Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feature 2: Transparent Charges & Earnings Calculator */}
          <div className="bg-[#2B425B] p-8 rounded-3xl border border-[#E85D75]/40 hover:border-[#E85D75]/60 transition-all space-y-6 flex flex-col justify-between shadow-2xl relative group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-companion-coral/15 border border-companion-coral/40 flex items-center justify-center text-companion-coral">
                  <Calculator className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-companion-coral/20 text-companion-coral border border-companion-coral/30">
                  Zero Hidden Fees
                </span>
              </div>

              <h3 className="text-2xl font-black uppercase text-white">
                Transparent Charges & Pal Earnings Portal
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Complete upfront transparency for both sides. Patients see exact plan charges, health insurance subsidies, and out-of-pocket costs. Pals see their hourly escort pay, CHW bonuses, and direct-deposit payouts.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Patient breakdown: $35 single visit or $0 with approved health benefit voucher</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Pal payout: $22-$28/hr stipend + CHW certification bonuses</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>100% transparent itemized financial statements</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCharges}
              className="w-full py-4 rounded-2xl bg-companion-coral text-white font-black text-xs uppercase tracking-wider hover:bg-companion-coral/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-companion-coral/20 mt-4"
            >
              <Calculator className="w-4 h-4" />
              <span>Open Charges & Earnings Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
