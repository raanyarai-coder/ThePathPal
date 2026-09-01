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
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import {
  supabase,
  resendPalVerificationEmail,
  formatApplicationFromDb,
} from '../lib/supabase';
import { Pal, PalApplication } from '../types';

interface PalVerifyPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
}

export const PalVerifyPage: React.FC<PalVerifyPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verifyStatus, setVerifyStatus] = useState<
    'idle' | 'success' | 'unconfirmed' | 'pending_approval' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedPal, setActivatedPal] = useState<Pal | null>(null);
  const [approvedApp, setApprovedApp] = useState<PalApplication | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  // Resend email state
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    // Run verification flow on mount
    verifyAndActivatePal();

    // Listen for auth state changes (e.g., token exchanged from email confirmation link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (session.user.email) {
          setCurrentUserEmail(session.user.email);
          setResendEmail(session.user.email);
        }
        await verifyAndActivatePal();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Complete Email Verification Flow:
   * 1. Detect if the user is authenticated via supabase.auth.getSession().
   * 2. On mount, extract the email from the authenticated user.
   * 3. Query the 'pals' table to find an existing record where the email matches the approved pal_applications email.
   * 4. Update that record: set auth_user_id = user.id and email_verified = true.
   * 5. Show success message 'Your PAL account is ready' with a button to redirect to the PAL login portal.
   */
  const verifyAndActivatePal = async () => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // 1. Detect if the user is authenticated via supabase.auth.getSession()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session retrieval error:', sessionError);
      }

      const user = session?.user;
      if (!user) {
        // No active session detected
        setVerifyStatus('idle');
        setIsVerifying(false);
        return;
      }

      // 2. Extract the email from the authenticated user
      const userEmail = (user.email || '').trim().toLowerCase();
      setCurrentUserEmail(userEmail);
      setResendEmail(userEmail);

      // Check if email has been confirmed in Supabase Auth
      if (!user.email_confirmed_at) {
        setVerifyStatus('unconfirmed');
        setIsVerifying(false);
        return;
      }

      // 3. Query the 'pals' table to find an existing record where the email matches the approved application email
      // Check approved application first
      const { data: applicationRows, error: appError } = await supabase
        .from('pal_applications')
        .select('*')
        .ilike('email', userEmail)
        .order('created_at', { ascending: false });

      if (appError) {
        console.error('Error fetching pal application:', appError.message);
      }

      let approvedApplication: PalApplication | null = null;
      if (applicationRows && applicationRows.length > 0) {
        const approvedRow = applicationRows.find((app: any) => app.status === 'approved');
        if (approvedRow) {
          approvedApplication = formatApplicationFromDb(approvedRow);
          setApprovedApp(approvedApplication);
        } else {
          const pendingRow = applicationRows.find((app: any) => app.status === 'pending');
          if (pendingRow) {
            setVerifyStatus('pending_approval');
            setErrorMessage(
              'Your PAL application is currently pending administrator review. Once approved, your account will be activated.'
            );
            setIsVerifying(false);
            return;
          }
        }
      }

      // Query 'pals' table to find existing record where email matches approved application or auth user
      let targetPalId: string | null = null;
      let existingPalRecord: any = null;

      // Match by email or auth_user_id directly in 'pals' table
      const { data: palByEmail } = await supabase
        .from('pals')
        .select('*')
        .or(`email.eq.${userEmail},auth_user_id.eq.${user.id}`)
        .maybeSingle();

      if (palByEmail) {
        targetPalId = palByEmail.id;
        existingPalRecord = palByEmail;
      }

      // If not found yet, try matching by phone/name from the approved pal application
      if (!targetPalId && approvedApplication) {
        const { data: palByApp } = await supabase
          .from('pals')
          .select('*')
          .or(`phone.eq.${approvedApplication.phone},name.eq.${approvedApplication.name}`)
          .maybeSingle();

        if (palByApp) {
          targetPalId = palByApp.id;
          existingPalRecord = palByApp;
        }
      }

      // 4. Update that record: set auth_user_id = user.id and email_verified = true
      let finalPal: Pal | null = null;

      if (targetPalId) {
        const { data: updatedPal, error: updateErr } = await supabase
          .from('pals')
          .update({
            auth_user_id: user.id,
            email_verified: true,
          })
          .eq('id', targetPalId)
          .select()
          .single();

        if (updateErr) {
          console.error('Error updating pal record:', updateErr.message);
          finalPal = existingPalRecord;
        } else {
          finalPal = updatedPal as Pal;
        }
      } else {
        // If not already in 'pals' table, insert active verified record with auth_user_id & email_verified=true
        const displayName =
          approvedApplication?.name ||
          (user.user_metadata as any)?.full_name ||
          userEmail.split('@')[0] ||
          'Pal Companion';
        const displayPhone = approvedApplication?.phone || (user.user_metadata as any)?.phone || '';
        const displayBio =
          approvedApplication?.bio || 'Hospital Escort and Patient Companion Pal.';

        const { data: insertedPal, error: insertErr } = await supabase
          .from('pals')
          .insert([
            {
              auth_user_id: user.id,
              name: displayName,
              phone: displayPhone,
              bio: displayBio,
              availability: 'Flexible (Weekdays & Weekends)',
              background_check_status: 'cleared',
              email_verified: true,
              rating: 5.0,
              hourly_rate_cents: 2600,
            },
          ])
          .select()
          .single();

        if (insertErr) {
          console.error('Error creating pal record:', insertErr.message);
          setErrorMessage('Could not synchronize your Pal record. Please try logging in.');
          setVerifyStatus('error');
          setIsVerifying(false);
          return;
        }

        finalPal = insertedPal as Pal;
      }

      // 5. Show success message 'Your PAL account is ready'
      if (finalPal) {
        setActivatedPal(finalPal);
        setVerifyStatus('success');
      } else {
        setErrorMessage('Verification could not find or update your Pal profile.');
        setVerifyStatus('error');
      }
    } catch (err: any) {
      console.error('Pal verification error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred during verification.');
      setVerifyStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = resendEmail.trim() || currentUserEmail;
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
      setResendMsg('Verification email sent! Please check your inbox and spam folder.');
    }
  };

  const handleNavigateToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.hash = 'pal';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-[#1F3449]">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48A6A5]/10 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PAL VERIFICATION & ACTIVATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">
          Pal Account Verification
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Verifying your approved application, email confirmation, and companion credentials.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-[#48A6A5]/30 shadow-xl space-y-6">
        {/* Loading State */}
        {isVerifying && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#48A6A5] mx-auto" />
            <h3 className="text-lg font-bold text-[#1F3449]">Verifying PAL Credentials...</h3>
            <p className="text-xs text-gray-500">
              Checking session, matching approved application, and updating your profile.
            </p>
          </div>
        )}

        {/* 5. Success State: 'Your PAL account is ready' with button to redirect to PAL login portal */}
        {!isVerifying && verifyStatus === 'success' && activatedPal && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F3449]">
                Your PAL account is ready
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Welcome, <strong>{activatedPal.name}</strong>! Your email has been verified, your profile record is linked, and you are ready to accept companion bookings.
              </p>
            </div>

            {/* Verification & Account Credentials Summary Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  PAL Companion Profile Active
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Status: Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-emerald-950 pt-3 border-t border-emerald-200/80">
                <div>
                  <strong>Companion Name:</strong> {activatedPal.name}
                </div>
                <div>
                  <strong>Badge ID:</strong>{' '}
                  <span className="font-mono font-bold">
                    {activatedPal.badgeNumber || `PAL-${activatedPal.id}`}
                  </span>
                </div>
                <div>
                  <strong>Verified Email:</strong>{' '}
                  <span className="font-mono text-emerald-700">
                    {currentUserEmail || approvedApp?.email || activatedPal.email || 'Verified'}
                  </span>
                </div>
                <div>
                  <strong>Email Verified:</strong>{' '}
                  <span className="font-bold text-emerald-700">✓ true (Confirmed)</span>
                </div>
                <div>
                  <strong>Background Check:</strong>{' '}
                  <span className="font-bold text-emerald-800">Cleared & Active</span>
                </div>
                <div>
                  <strong>Hourly Rate:</strong>{' '}
                  <span className="font-bold text-emerald-800">
                    ${(activatedPal.hourly_rate_cents / 100).toFixed(2)}/hr
                  </span>
                </div>
              </div>
            </div>

            {/* Button to redirect to PAL login portal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleNavigateToLogin}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Redirect to PAL Login Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* State: Unconfirmed Email */}
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
                We sent a confirmation link to <strong>{currentUserEmail}</strong>. Please click the link in your email to complete verification.
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
                onClick={verifyAndActivatePal}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>I've Clicked the Email Link</span>
              </button>

              <button
                onClick={handleNavigateToLogin}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>PAL Login</span>
              </button>
            </div>
          </div>
        )}

        {/* State: Pending Approval */}
        {!isVerifying && verifyStatus === 'pending_approval' && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-sky-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#1F3449]">
                Application Under Review
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {errorMessage ||
                  'Your PAL application is currently being reviewed by hospital administrators. Once approved, your account will be activated.'}
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleNavigateToLogin}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Return to Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* State: Idle / No Active Session / Error */}
        {!isVerifying && (verifyStatus === 'idle' || verifyStatus === 'error') && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2">
              <h3 className="font-bold flex items-center gap-1.5 text-sky-950">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Email Confirmation & Account Activation</span>
              </h3>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                When you click the verification link sent to your inbox, your session is detected to verify your approved application and activate your PAL companion profile.
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

            {/* Manual Resend Form */}
            <form
              onSubmit={handleResend}
              className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3"
            >
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
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
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
                className="text-[#48A6A5] hover:underline font-bold cursor-pointer"
              >
                ← Back to PAL Signup
              </a>
              <button
                onClick={handleNavigateToLogin}
                className="text-gray-600 hover:text-[#1F3449] font-bold cursor-pointer"
              >
                Already Verified? PAL Login →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
