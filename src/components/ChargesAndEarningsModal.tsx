import React, { useState, useEffect } from 'react';
import { X, Calculator, DollarSign, UserCheck, Heart, ShieldCheck, CheckCircle2, ArrowRight, HelpCircle, FileText, Sparkles } from 'lucide-react';

interface ChargesAndEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPal?: () => void;
  onBecomePal?: () => void;
  initialTab?: 'patient_charges' | 'pal_earnings';
}

export const ChargesAndEarningsModal: React.FC<ChargesAndEarningsModalProps> = ({
  isOpen,
  onClose,
  onRequestPal,
  onBecomePal,
  initialTab = 'patient_charges',
}) => {
  const [viewTab, setViewTab] = useState<'patient_charges' | 'pal_earnings'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setViewTab(initialTab);
    }
  }, [isOpen, initialTab]);
  
  // Patient options
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'monthly' | 'annual'>('single');
  const [visitHours, setVisitHours] = useState<number>(2);
  const [includeWheelchair, setIncludeWheelchair] = useState<boolean>(true);
  const [includeBilingual, setIncludeBilingual] = useState<boolean>(false);

  // Pal options
  const [palShiftHours, setPalShiftHours] = useState<number>(4);
  const [visitsPerShift, setVisitsPerShift] = useState<number>(2);
  const [hasChwCert, setHasChwCert] = useState<boolean>(true);

  if (!isOpen) return null;

  // Patient calculations
  const getPatientBaseRate = () => {
    if (selectedPlan === 'single') return 35;
    if (selectedPlan === 'monthly') return 49;
    if (selectedPlan === 'annual') return 399;
    return 35;
  };

  const baseRate = getPatientBaseRate();
  const additionalHoursCost = selectedPlan === 'single' && visitHours > 2 ? (visitHours - 2) * 15 : 0;
  const wheelchairAddon = includeWheelchair ? 0 : 0; // Free amenity
  const patientTotalCost = baseRate + additionalHoursCost;

  // Pal calculations
  const palBaseRatePerHour = 22;
  const chwBonusRatePerHour = hasChwCert ? 6 : 0;
  const visitCompletionBonus = visitsPerShift * 5;
  const grossPalEarnings = (palShiftHours * (palBaseRatePerHour + chwBonusRatePerHour)) + visitCompletionBonus;
  const platformFee = 0; // 100% covered by hospital partner licensing
  const netPalPayout = grossPalEarnings - platformFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#1F3449] rounded-3xl max-w-3xl w-full border border-[#48A6A5]/40 shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#2B425B] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#48A6A5]/20 border border-[#48A6A5]/40 flex items-center justify-center text-[#48A6A5]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-[#48A6A5] tracking-widest flex items-center gap-1">
                <span>100% TRANSPARENT FINANCIAL MODEL</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Charges & Earnings Transparency Portal
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="p-4 bg-[#2B425B] border-b border-white/10 flex items-center gap-3">
          <button
            onClick={() => setViewTab('patient_charges')}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
              viewTab === 'patient_charges'
                ? 'bg-[#48A6A5] text-white border-[#48A6A5] shadow-lg shadow-[#48A6A5]/20'
                : 'bg-[#1F3449] text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Patient Charges Breakdown</span>
          </button>

          <button
            onClick={() => setViewTab('pal_earnings')}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
              viewTab === 'pal_earnings'
                ? 'bg-[#E85D75] text-white border-[#E85D75] shadow-lg shadow-[#E85D75]/20'
                : 'bg-[#1F3449] text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pal Earnings Payout Breakdown</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* PATIENT CHARGES TAB */}
          {viewTab === 'patient_charges' && (
            <div className="space-y-6">
              
              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Step 1: Select Your Service Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'single', name: 'Single Visit', price: '$35', note: 'Per 2hr Hospital Escort' },
                    { id: 'monthly', name: 'Monthly Pass', price: '$49', note: 'Unlimited Monthly Visits' },
                    { id: 'annual', name: 'Annual Pass', price: '$399', note: 'Full Family Year Pass' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === p.id
                          ? 'bg-[#48A6A5]/20 border-[#48A6A5] text-white shadow-md'
                          : 'bg-[#2B425B] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase text-[#48A6A5]">{p.name}</div>
                      <div className="text-xl font-black text-white">{p.price}</div>
                      <div className="text-[9px] text-gray-400">{p.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Controls */}
              <div className="bg-[#2B425B] p-5 rounded-3xl border border-white/10 space-y-4">
                <div className="text-xs font-bold uppercase text-[#48A6A5] border-b border-white/10 pb-2">
                  Step 2: Custom Visit Requirements & Amenities
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1 font-bold">Estimated Visit Duration: {visitHours} Hours</label>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={visitHours}
                      onChange={(e) => setVisitHours(Number(e.target.value))}
                      className="w-full accent-[#48A6A5]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>1 hr (Express)</span>
                      <span>4 hrs (Outpatient)</span>
                      <span>8 hrs (Day Surgery)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeWheelchair}
                        onChange={(e) => setIncludeWheelchair(e.target.checked)}
                        className="rounded accent-[#48A6A5]"
                      />
                      <span className="text-white">Wheelchair & Mobility Assistance ($0.00 Included)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBilingual}
                        onChange={(e) => setIncludeBilingual(e.target.checked)}
                        className="rounded accent-[#48A6A5]"
                      />
                      <span className="text-white">Bilingual Spanish / Language Support ($0.00 Included)</span>
                    </label>
                  </div>
                </div>

                {/* Insurance Notice */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Direct-Pay Pricing: </span>
                    PathPal is not yet approved for insurance coverage or third-party health plan reimbursement. All rates shown represent transparent, out-of-pocket patient costs.
                  </div>
                </div>
              </div>

              {/* Itemized Invoice Calculation Box */}
              <div className="bg-[#1F3449] p-6 rounded-3xl border border-[#48A6A5]/40 space-y-4">
                <div className="text-xs font-black uppercase text-[#48A6A5] tracking-wider flex items-center justify-between">
                  <span>ITEMIZED PATIENT CHARGE STATEMENT</span>
                  <span>GUARANTEED FLAT FEE</span>
                </div>

                <div className="space-y-2 text-xs border-b border-white/10 pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Plan Rate ({selectedPlan.toUpperCase()}):</span>
                    <span className="font-bold text-white">${baseRate}.00</span>
                  </div>

                  {additionalHoursCost > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Extended Pal Support (+{visitHours - 2} hrs @ $15/hr):</span>
                      <span className="font-bold text-white">+${additionalHoursCost}.00</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-300">
                    <span>Indoor Campus Wayfinding & Care Pal:</span>
                    <span className="font-bold text-emerald-400">INCLUDED FREE</span>
                  </div>

                  {includeWheelchair && (
                    <div className="flex justify-between text-gray-300">
                      <span>Wheelchair Push & Mobility Assistance:</span>
                      <span className="font-bold text-emerald-400">INCLUDED FREE</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">TOTAL PATIENT OUT-OF-POCKET COST</div>
                    <div className="text-[10px] text-emerald-400">No hidden fees, surge pricing, or tip requirements</div>
                  </div>
                  <div className="text-3xl font-black text-[#48A6A5]">${patientTotalCost}.00</div>
                </div>

                {onRequestPal && (
                  <button
                    onClick={() => {
                      onClose();
                      onRequestPal();
                    }}
                    className="w-full py-4 rounded-2xl bg-[#48A6A5] text-white font-black text-sm uppercase tracking-wider hover:bg-[#48A6A5]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#48A6A5]/20"
                  >
                    <span>Proceed to Book Pal at ${patientTotalCost}.00</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* PAL EARNINGS TAB */}
          {viewTab === 'pal_earnings' && (
            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Step 1: Configure Your Pal Shift Metrics
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#2B425B] p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs text-gray-400 font-bold">Shift Hours: {palShiftHours} hrs</label>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={palShiftHours}
                      onChange={(e) => setPalShiftHours(Number(e.target.value))}
                      className="w-full accent-[#E85D75]"
                    />
                  </div>

                  <div className="bg-[#2B425B] p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs text-gray-400 font-bold">Completed Visits: {visitsPerShift}</label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={visitsPerShift}
                      onChange={(e) => setVisitsPerShift(Number(e.target.value))}
                      className="w-full accent-[#E85D75]"
                    />
                  </div>

                  <div className="bg-[#2B425B] p-4 rounded-2xl border border-white/10 space-y-2 flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                      <input
                        type="checkbox"
                        checked={hasChwCert}
                        onChange={(e) => setHasChwCert(e.target.checked)}
                        className="rounded accent-companion-coral"
                      />
                      <span>State CHW Certification (+ $6/hr)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Itemized Earnings Statement Box */}
              <div className="bg-[#1F3449] p-6 rounded-3xl border border-[#E85D75]/30 space-y-4">
                <div className="text-xs font-black uppercase text-[#E85D75] tracking-wider flex items-center justify-between">
                  <span>ITEMIZED PAL DIRECT DEPOSIT EARNINGS</span>
                  <span>WEEKLY PAYOUT READY</span>
                </div>

                <div className="space-y-2 text-xs border-b border-white/10 pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Hourly Pal Rate ({palShiftHours} hrs @ ${palBaseRatePerHour}/hr):</span>
                    <span className="font-bold text-white">${palShiftHours * palBaseRatePerHour}.00</span>
                  </div>

                  {hasChwCert && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>CHW Credential Incentive (+${chwBonusRatePerHour}/hr):</span>
                      <span>+${palShiftHours * chwBonusRatePerHour}.00</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-300">
                    <span>On-Time & Patient Satisfaction Bonus ({visitsPerShift} visits @ $5):</span>
                    <span className="font-bold text-white">+${visitCompletionBonus}.00</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>PathPal Platform Service Fee:</span>
                    <span className="text-emerald-400 font-bold">$0.00 (100% Hospital Funded)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">NET PAL PAYOUT FOR THIS SHIFT</div>
                    <div className="text-[10px] text-gray-300">Directly deposited to your bank account or Stripe debit card</div>
                  </div>
                  <div className="text-3xl font-black text-companion-coral">${netPalPayout}.00</div>
                </div>

                {onBecomePal && (
                  <button
                    onClick={() => {
                      onClose();
                      onBecomePal();
                    }}
                    className="w-full py-4 rounded-2xl bg-companion-coral text-white font-black text-sm uppercase tracking-wider hover:bg-companion-coral/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-companion-coral/20"
                  >
                    <span>Apply to Become a Companion Pal</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
