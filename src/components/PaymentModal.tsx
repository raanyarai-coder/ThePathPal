import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, Tag, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { createStripeCheckoutSession, checkPatientEntitlement, PlanType, PaymentEntitlement } from '../lib/stripeService';
import { supabase } from '../lib/supabaseClient';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'visit' | 'membership';
  onRequestBookPal?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'visit',
  onRequestBookPal,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    defaultType === 'membership' ? 'monthly_pass' : 'single_visit'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<PaymentEntitlement | null>(null);
  const [isCheckingEntitlement, setIsCheckingEntitlement] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkCurrentStatus();
    }
  }, [isOpen]);

  const checkCurrentStatus = async () => {
    setIsCheckingEntitlement(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const hasUser = Boolean(session?.user);
      setIsLoggedIn(hasUser);

      if (hasUser) {
        const ent = await checkPatientEntitlement(session?.user?.id);
        setEntitlement(ent);
      } else {
        setEntitlement(null);
      }
    } catch {
      // Ignored
    } finally {
      setIsCheckingEntitlement(false);
    }
  };

  if (!isOpen) return null;

  const planDetails: Record<PlanType, { name: string; price: string; period: string; desc: string; badge: string; badgeColor: string }> = {
    single_visit: {
      name: 'Single Visit',
      price: '$35',
      period: '/ escort',
      desc: 'One-time door-to-department companion escort (up to 2 hours) with accredited PAL.',
      badge: 'Single Escort',
      badgeColor: 'text-[#48A6A5]',
    },
    monthly_pass: {
      name: 'PathPal Plus Monthly',
      price: '$49',
      period: '/ month',
      desc: 'Unlimited hospital visits with priority dispatch and family notifications.',
      badge: 'Most Popular',
      badgeColor: 'text-[#E85D75]',
    },
    annual_family: {
      name: 'PathPal Plus Annual',
      price: '$399',
      period: '/ year',
      desc: 'Complete 365-day protection for up to 4 family members across all affiliated hospitals.',
      badge: 'Best Value',
      badgeColor: 'text-amber-600',
    },
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isLoggedIn) {
      setErrorMessage('Please sign in or create a patient account before checking out.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createStripeCheckoutSession(selectedPlan, window.location.origin);

      if (result.error) {
        setErrorMessage(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.url) {
        // Redirect to Stripe's hosted Checkout page
        window.location.href = result.url;
      } else {
        setErrorMessage('Could not generate Stripe Checkout URL. Please try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error redirecting to Stripe payment gateway.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#48A6A5] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            <span>Stripe 256-Bit Encrypted Checkout</span>
          </div>
          <h3 className="text-2xl font-black text-[#1F3449]">PathPal Escort & Membership Plans</h3>
          <p className="text-xs text-gray-500 font-normal">
            Choose between a single-visit door-to-department companion escort or an unlimited PathPal Plus membership.
          </p>
        </div>

        {/* Existing Entitlement Banner */}
        {entitlement?.isEntitled && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-emerald-900">
                You have an active entitlement: <span className="underline">{entitlement.planLabel}</span>
              </div>
              <p className="text-emerald-700">{entitlement.details}</p>
              {onRequestBookPal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestBookPal();
                  }}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Proceed to Book Companion PAL</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Unable to Start Stripe Checkout</div>
              <div>{errorMessage}</div>
              {!isLoggedIn && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  Please log in via the Patient Portal tab to link your payment or subscription securely.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Plan Selection Radio Tabs */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Select Your Service Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(planDetails) as PlanType[]).map((pKey) => {
              const p = planDetails[pKey];
              const isSelected = selectedPlan === pKey;
              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setSelectedPlan(pKey)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#48A6A5]/10 border-2 border-[#48A6A5] shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase ${p.badgeColor}`}>{p.badge}</div>
                  <div className="text-base font-black text-[#1F3449] mt-0.5">{p.name}</div>
                  <div className="text-lg font-black text-[#1F3449] mt-1">
                    {p.price} <span className="text-[10px] font-normal text-gray-500">{p.period}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-snug mt-1">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan Summary Card */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-gray-700">
            <span>Selected Service:</span>
            <span className="text-[#1F3449] font-black">{planDetails[selectedPlan].name}</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Standard Included Escort Duration:</span>
            <span className="font-semibold text-gray-700">120 Minutes (2 Hours)</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Payment Processor:</span>
            <span className="font-semibold text-gray-700">Stripe Hosted Checkout</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-black">
            <span className="text-gray-700">Authoritative Charge:</span>
            <span className="text-xl text-[#48A6A5]">
              {planDetails[selectedPlan].price}{' '}
              <span className="text-xs font-normal text-gray-500">{planDetails[selectedPlan].period}</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <form onSubmit={handleCheckout} className="space-y-4">
          <button
            type="submit"
            disabled={isProcessing || isCheckingEntitlement}
            className="w-full py-4 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 disabled:opacity-60 text-white text-sm font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Redirecting to Stripe...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Continue to Stripe Checkout ({planDetails[selectedPlan].price})</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>PCI-DSS Level 1 Certified • End-to-End Encrypted • HIPAA Compliant Escort Logistics</span>
        </div>
      </div>
    </div>
  );
};
