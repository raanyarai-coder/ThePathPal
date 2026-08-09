import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, Tag, DollarSign, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'visit' | 'membership';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, defaultType = 'visit' }) => {
  const [paymentType, setPaymentType] = useState<'visit' | 'membership_monthly' | 'membership_annual' | 'subsidized_voucher'>(
    defaultType === 'membership' ? 'membership_monthly' : 'visit'
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'applepay' | 'voucher'>('card');
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const getAmount = () => {
    if (paymentType === 'visit') return 35;
    if (paymentType === 'membership_monthly') return 49;
    if (paymentType === 'membership_annual') return 399;
    if (paymentType === 'subsidized_voucher') return 0;
    return 35;
  };

  const finalAmount = appliedVoucher ? 0 : getAmount();

  const handleApplyVoucher = () => {
    if (voucherCode.trim().length > 0) {
      setAppliedVoucher(true);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#121824] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#00F0FF]/40 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00F0FF] uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5" />
                <span>256-BIT SECURE CHECKOUT</span>
              </div>
              <h3 className="text-2xl font-black uppercase italic text-white">PathPal Care & Access Payment</h3>
              <p className="text-xs text-gray-300 font-light">
                Select your service plan and complete payment via Credit Card, PayPal, Apple Pay, or Insurance Voucher.
              </p>
            </div>

            {/* Plan Selection Radio Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Select Plan / Booking Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('visit')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentType === 'visit'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-md'
                      : 'bg-[#1A2232] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase text-[#00F0FF]">Single Visit</div>
                  <div className="text-lg font-black">$35 <span className="text-[10px] font-normal text-gray-400">/ escort</span></div>
                  <div className="text-[9px] text-gray-400">One-time 2hr hospital escort</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('membership_monthly')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentType === 'membership_monthly'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-md'
                      : 'bg-[#1A2232] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase text-companion-coral">Monthly Pass</div>
                  <div className="text-lg font-black">$49 <span className="text-[10px] font-normal text-gray-400">/ mo</span></div>
                  <div className="text-[9px] text-gray-400">Unlimited hospital visits</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('membership_annual')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentType === 'membership_annual'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-md'
                      : 'bg-[#1A2232] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase text-warm-gold">Annual Family</div>
                  <div className="text-lg font-black">$399 <span className="text-[10px] font-normal text-gray-400">/ yr</span></div>
                  <div className="text-[9px] text-gray-400">Full year family protection</div>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'card', label: '💳 Credit Card' },
                  { id: 'paypal', label: '🅿️ PayPal' },
                  { id: 'applepay', label: '🍎 Apple Pay' },
                  { id: 'voucher', label: '🎟️ Insurance Voucher' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      if (m.id === 'voucher') setPaymentType('subsidized_voucher');
                    }}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : 'bg-[#1A2232] border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voucher / Coupon Code */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Insurance Voucher Code (e.g. VOUCHER2026)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full bg-[#1A2232] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl"
              >
                Apply
              </button>
            </div>

            {appliedVoucher && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-between">
                <span>✓ Health Benefit Voucher Applied! 100% Subsidized</span>
                <span className="text-white">$0.00 Due</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handlePayment} className="space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-3 bg-[#1A2232] p-4 rounded-2xl border border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-[#121824] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4532 •••• •••• 8910"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#121824] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Expiration</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-[#121824] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">CVV Security</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-[#121824] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-4 bg-[#1A2232] rounded-2xl border border-white/10 text-center space-y-2">
                  <div className="text-xl font-black text-blue-400">PayPal Express Checkout</div>
                  <p className="text-xs text-gray-300">You will be redirected to PayPal to complete your $ {finalAmount} authorization securely.</p>
                </div>
              )}

              {paymentMethod === 'applepay' && (
                <div className="p-4 bg-[#1A2232] rounded-2xl border border-white/10 text-center space-y-2">
                  <div className="text-xl font-black text-white">Apple Pay Touch / Face ID</div>
                  <p className="text-xs text-gray-300">Double-click side button to confirm payment of ${finalAmount}.</p>
                </div>
              )}

              {paymentMethod === 'voucher' && (
                <div className="p-4 bg-[#1A2232] rounded-2xl border border-white/10 space-y-2">
                  <label className="block text-xs font-bold uppercase text-[#00F0FF]">Health Plan / Insurance Member ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Insurance Member ID Number"
                    className="w-full bg-[#121824] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400">Covers non-clinical companion navigation under partner health benefit codes.</p>
                </div>
              )}

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-[#1A2232] border border-white/10 flex items-center justify-between text-sm font-black">
                <span className="uppercase text-gray-300">Total Amount Due:</span>
                <span className="text-2xl text-[#00F0FF]">${finalAmount}.00</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-[#00F0FF] text-black text-sm font-black uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-all shadow-lg shadow-[#00F0FF]/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Authorization...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Confirm & Pay ${finalAmount}.00</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HIPAA Compliant • Encrypted Payment Tokenization • Cancel Anytime</span>
            </div>

          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic">Payment Successful!</h3>
            <p className="text-xs text-gray-300 max-w-sm mx-auto font-light">
              Your PathPal payment receipt and booking confirmation have been generated. An SMS confirmation was sent to your phone.
            </p>
            <div className="p-4 bg-[#1A2232] rounded-2xl border border-white/10 text-left text-xs space-y-1 font-mono text-gray-300">
              <div>Transaction ID: <span className="text-[#00F0FF]">PP-PAY-2026-8819</span></div>
              <div>Amount Paid: <span className="text-white">${finalAmount}.00</span></div>
              <div>Status: <span className="text-emerald-400">Verified & Active</span></div>
            </div>
            <button
              onClick={onClose}
              className="bg-[#00F0FF] text-black text-xs font-black uppercase px-6 py-3 rounded-xl"
            >
              Done & Return to Site
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
