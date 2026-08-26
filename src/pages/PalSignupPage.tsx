import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Lock, Mail, Key, CheckCircle2, AlertCircle, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { getApprovedPalApplication, signUpPal } from '../lib/supabase';
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
    } else {
      // Default to Marcus Vance demo application if no ID provided in URL
      setAppIdInput('app-9101');
      loadApplication('app-9101');
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

    setSignupSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-[#1F3449]">
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48A6A5]/10 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/30">
          <UserCheck className="w-3.5 h-3.5" />
          <span>PAL ONBOARDING & CREDENTIALING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">Pal Account Registration</h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Create your official Supabase Auth login account using your approved <code>pal_applications</code> credentials.
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
                <strong className="block font-bold">Application Gate Error:</strong>
                <span>{appError}</span>
              </div>
            </div>
          )}

          {application && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approved Application Found: <strong>{application.full_name}</strong>
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Status: {application.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-[11px] pt-1 border-t border-emerald-200">
                <div><span className="font-semibold text-gray-500">Email:</span> {application.email}</div>
                <div><span className="font-semibold text-gray-500">Phone:</span> {application.phone}</div>
                <div><span className="font-semibold text-gray-500">Languages:</span> {application.languages}</div>
                <div><span className="font-semibold text-gray-500">Approved:</span> {application.approved_at ? new Date(application.approved_at).toLocaleDateString() : 'Active'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Supabase Auth Password Setup */}
        {!signupSuccess ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">STEP 2 OF 2</span>
              <h3 className="text-lg font-black text-[#1F3449]">Create Supabase Auth Password</h3>
              <p className="text-xs text-gray-600">
                Set a secure password for your Pal companion login account. Passwords are managed securely in Supabase Auth.
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
                Upon submission, Supabase Auth will register your account and dispatch a verification email to <strong>{email || 'your email'}</strong>.
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
                  <span>Creating Supabase Auth Account...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Create Pal Supabase Account</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-5 py-6">
            <div className="w-16 h-16 bg-[#48A6A5] text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#1F3449]">
                Your account has been created.
              </h3>
              <p className="text-sm font-semibold text-[#48A6A5]">
                Please check your email to verify your account.
              </p>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                We sent a verification link to <strong>{email}</strong>. Once you confirm your email, your profile in the <code>pals</code> database table will be activated, and you will receive your "Your Pal Account Is Ready" confirmation message.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-md mx-auto text-left text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Next Step: Email Confirmation</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Do not attempt to log in before verifying your email. The system validates <code>user.email_confirmed_at</code> before allowing dispatch access.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#pal-verify"
                onClick={() => {
                  if (onNavigateToVerify) onNavigateToVerify();
                  else window.location.hash = 'pal-verify';
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Proceed to Verification Link Handler</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
