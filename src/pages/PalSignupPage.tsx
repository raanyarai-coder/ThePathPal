import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Mail, Key, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, LogIn } from 'lucide-react';
import { getApprovedPalApplication, signUpPal, resendPalVerificationEmail } from '../lib/supabase';
import { PalApplication } from '../types';

interface PalSignupPageProps {
  appId?: string;
  onNavigateToVerify?: () => void;
  onNavigateToLogin?: () => void;
}

export const PalSignupPage: React.FC<PalSignupPageProps> = ({
  appId: propAppId,
  onNavigateToVerify,
  onNavigateToLogin,
}) => {
  const [appIdInput, setAppIdInput] = useState<string>(propAppId || '');
  const [application, setApplication] = useState<PalApplication | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Resend state
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Parse app_id from URL query / hash on mount if not provided as prop
  useEffect(() => {
    let id = propAppId;
    if (!id) {
      const urlParams = new URLSearchParams(window.location.search);
      id = urlParams.get('app_id') || undefined;

      if (!id && window.location.hash.includes('app_id=')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          id = hashParams.get('app_id') || undefined;
        }
      }
    }

    if (id) {
      setAppIdInput(id);
      loadApplication(id);
    }
  }, [propAppId]);

  const loadApplication = async (id: string) => {
    if (!id.trim()) return;
    setIsLoadingApp(true);
    setAppError(null);
    setApplication(null);

    const res = await getApprovedPalApplication(id.trim());
    setIsLoadingApp(false);

    if (res.error) {
      setAppError(res.error.message);
      return;
    }

    if (res.data) {
      setApplication(res.data);
      setEmail(res.data.email);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplication(appIdInput);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!application) {
      setSignupError('Please provide a valid approved application reference first.');
      return;
    }

    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setSignupError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await signUpPal(email, password, application);
    setIsSubmitting(false);

    if (error) {
      setSignupError(error.message);
      return;
    }

    // Success - user is registered and confirmation email has been dispatched by Supabase Auth
    setSignupSuccess(true);
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setResendStatus('idle');
    setResendMessage(null);

    const res = await resendPalVerificationEmail(email);
    setIsResending(false);

    if (res.error) {
      setResendStatus('error');
      setResendMessage(res.error.message);
    } else {
      setResendStatus('success');
      setResendMessage('Verification email sent. Please check your inbox and spam folder.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-[#1F3449]">
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48A6A5]/10 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/30">
          <UserCheck className="w-3.5 h-3.5" />
          <span>PAL ONBOARDING & SIGNUP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">Pal Account Registration</h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Create your official Pal login credentials using your approved application email.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-[#48A6A5]/30 shadow-xl space-y-6">
        
        {/* Step 1: Application Reference Verification */}
        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">STEP 1 OF 2</span>
              <h3 className="text-sm font-bold text-[#1F3449]">Approved Application Verification</h3>
            </div>
            <span className="text-[11px] text-gray-500">Security Gate: Approved Applicants Only</span>
          </div>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. app-9101"
              value={appIdInput}
              onChange={(e) => setAppIdInput(e.target.value)}
              className="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-white font-mono"
            />
            <button
              type="submit"
              disabled={isLoadingApp}
              className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoadingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
            </button>
          </form>

          {appError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Application Notice:</strong>
                <span>{appError}</span>
              </div>
            </div>
          )}

          {application && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approved Application: <strong>{application.name || application.full_name}</strong>
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Status: {application.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-[11px] pt-1 border-t border-emerald-200">
                <div><span className="font-semibold text-gray-500">Email:</span> {application.email}</div>
                <div><span className="font-semibold text-gray-500">Phone:</span> {application.phone}</div>
                <div><span className="font-semibold text-gray-500">Languages:</span> {application.languages}</div>
                <div><span className="font-semibold text-gray-500">Status:</span> Approved</div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Supabase Auth Password Setup */}
        {!signupSuccess ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">STEP 2 OF 2</span>
              <h3 className="text-lg font-black text-[#1F3449]">Create Account Password</h3>
              <p className="text-xs text-gray-600">
                Set a secure password for your Pal Companion account.
              </p>
            </div>

            {signupError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{signupError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1F3449] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pal.companion@example.com"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F3449] mb-1">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-white font-mono"
                  />
                </div>
                <span className="text-[10px] text-gray-500">Minimum 6 characters</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3449] mb-1">Confirm Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#48A6A5] shrink-0" />
              <span className="text-[11px]">
                Upon registration, Supabase Auth will send a confirmation email with a verification link to <strong>{email || 'your email'}</strong>.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !application}
              className="w-full py-4 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Create Pal Account</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-5 py-6 animate-fade-in">
            <div className="w-16 h-16 bg-[#48A6A5] text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#1F3449]">
                Account created.
              </h3>
              <p className="text-sm font-semibold text-[#48A6A5]">
                Please check your email to verify your account.
              </p>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                We sent a confirmation link to <strong>{email}</strong>. Click the link in your email to complete verification and activate your Pal profile.
              </p>
            </div>

            {/* Resend confirmation button */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 max-w-md mx-auto space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-[#1F3449] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendMessage}</span>
                </div>
              )}

              {resendStatus === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resendMessage}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#pal-verify"
                onClick={() => {
                  if (onNavigateToVerify) onNavigateToVerify();
                  else window.location.hash = 'pal-verify';
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Open Verification Page</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#pal"
                onClick={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else window.location.hash = 'pal';
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Pal Login</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
