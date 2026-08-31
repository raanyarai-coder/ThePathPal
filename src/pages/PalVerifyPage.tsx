import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ShieldCheck,
  ArrowRight,
  LogIn,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  verifyPalEmailAndActivate,
  resendPalVerificationEmail,
  supabase,
} from '../lib/supabase';
import { Pal, PalEmailNotification } from '../types';

interface PalVerifyPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
}

export const PalVerifyPage: React.FC<PalVerifyPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'unconfirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedPal, setActivatedPal] = useState<Pal | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial verification check
    runVerificationCheck();

    // 2. Listen for auth state changes (e.g. when token in URL hash/code is exchanged)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        if (session.user.email_confirmed_at) {
          await runVerificationCheck();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const runVerificationCheck = async () => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // 1. Check session & user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // No session found yet
        setVerifyStatus('idle');
        setIsVerifying(false);
        return;
      }

      setCurrentUser(user);
      if (user.email) {
        setResendEmail(user.email);
      }

      // 2. Check if email is confirmed in auth.users
      if (!user.email_confirmed_at) {
        setVerifyStatus('unconfirmed');
        setIsVerifying(false);
        return;
      }

      // 3. Email is confirmed -> Link and synchronize PAL record
      const res = await verifyPalEmailAndActivate();

      if (res.error) {
        setErrorMessage(res.error.message);
        setVerifyStatus('error');
      } else if (res.data?.palRecord) {
        setActivatedPal(res.data.palRecord);
        setVerifyStatus('success');
      } else {
        setVerifyStatus('error');
        setErrorMessage('Unable to verify Pal profile. Please contact administrator.');
      }
    } catch (e: any) {
      console.error('Verification error:', e);
      setErrorMessage('Verification could not be processed at this time.');
      setVerifyStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = resendEmail.trim() || currentUser?.email || '';
    if (!targetEmail) {
      setResendStatus('error');
      setResendMsg('Please enter the email address you registered with.');
      return;
    }

    setIsResending(true);
    setResendStatus('idle');
    setResendMsg(null);

    const res = await resendPalVerificationEmail(targetEmail);
    setIsResending(false);

    if (res.error) {
      setResendStatus('error');
      setResendMsg(res.error.message);
    } else {
      setResendStatus('success');
      setResendMsg('Verification email sent. Please check your inbox and spam folder.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-[#1F3449]">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48A6A5]/10 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EMAIL VERIFICATION & ACTIVATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">Pal Email Verification</h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Confirming your email verification and activating your Pal Companion account.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-[#48A6A5]/30 shadow-xl space-y-6">
        
        {/* Loading State */}
        {isVerifying && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#48A6A5] mx-auto" />
            <h3 className="text-lg font-bold text-[#1F3449]">Validating Email Confirmation...</h3>
            <p className="text-xs text-gray-500">Checking your account status and linking your Pal profile.</p>
          </div>
        )}

        {/* State 1: Verification Succeeded */}
        {!isVerifying && verifyStatus === 'success' && activatedPal && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F3449]">
                Your PAL account is ready.
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your email has been verified and your Pal profile for <strong>{activatedPal.name}</strong> is now active.
              </p>
            </div>

            {/* Account Details Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Pal Account Synchronized
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Status: Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-950 pt-2 border-t border-emerald-200/80">
                <div><strong>Pal Companion:</strong> {activatedPal.name}</div>
                <div><strong>Badge ID:</strong> <span className="font-mono">{activatedPal.badgeNumber || `PAL-${activatedPal.id}`}</span></div>
                <div><strong>Auth User ID:</strong> <span className="font-mono text-[10px]">{activatedPal.auth_user_id || currentUser?.id}</span></div>
                <div><strong>Email Status:</strong> <span className="font-bold text-emerald-700">Verified</span></div>
              </div>
            </div>

            {/* Link to Pal Login Portal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#pal"
                onClick={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else window.location.hash = 'pal';
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Pal Login</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* State 2: Unconfirmed Email */}
        {!isVerifying && verifyStatus === 'unconfirmed' && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#1F3449]">
                Please check your email to verify your account.
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                We sent a confirmation email to <strong>{currentUser?.email}</strong>. Please click the link inside your email to complete verification.
              </p>
            </div>

            {/* Resend Action Box */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={() => handleResend()}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-[#1F3449] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-[#48A6A5]" />
                  )}
                  <span>Resend verification email</span>
                </button>
              </div>

              {resendStatus === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendMsg}</span>
                </div>
              )}

              {resendStatus === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resendMsg}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={runVerificationCheck}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>I've Clicked the Email Link</span>
              </button>

              <a
                href="#pal"
                onClick={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else window.location.hash = 'pal';
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Pal Login</span>
              </a>
            </div>
          </div>
        )}

        {/* State 3: Idle / No Active Session / Error */}
        {!isVerifying && (verifyStatus === 'idle' || verifyStatus === 'error') && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2">
              <h3 className="font-bold flex items-center gap-1.5 text-sky-950">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Email Confirmation & Account Activation</span>
              </h3>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                When you click the verification link in your confirmation email, your browser is redirected here to activate your account.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <strong className="block font-bold">Notice:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Manual Resend & Status Check Form */}
            <form onSubmit={handleResend} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <label className="block text-xs font-bold text-[#1F3449]">
                Need a new verification link?
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-white font-mono"
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="px-4 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Resend</span>
                </button>
              </div>

              {resendStatus === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendMsg}</span>
                </div>
              )}

              {resendStatus === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resendMsg}</span>
                </div>
              )}
            </form>

            <div className="flex justify-between items-center text-xs pt-2">
              <a
                href="#pal-signup"
                onClick={() => {
                  if (onNavigateToSignup) onNavigateToSignup();
                  else window.location.hash = 'pal-signup';
                }}
                className="text-[#48A6A5] hover:underline font-bold"
              >
                ← Back to Pal Signup
              </a>
              <a
                href="#pal"
                onClick={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else window.location.hash = 'pal';
                }}
                className="text-gray-600 hover:text-[#1F3449] font-bold"
              >
                Already Verified? Pal Login →
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
