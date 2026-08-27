import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Star,
  Clock,
  MapPin,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Phone,
  Lock,
  Award,
  Radio,
  X,
  AlertCircle,
  Calendar,
  LogIn,
  LogOut,
  Sparkles,
  RefreshCw,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { supabase, loginPal, fetchPalByAuthUserId, formatPalFromDb } from '../lib/supabase';
import { SAMPLE_PALS, INITIAL_REQUESTS } from '../data/mockData';
import { Pal, PalRequest } from '../types';
import { MedicalSummaryWidget } from '../components/MedicalSummaryWidget';
import { EtaCalculatorWidget } from '../components/EtaCalculatorWidget';
import { Calculator } from 'lucide-react';
import { createGoogleCalendarUrl } from '../utils/calendarUtils';

interface PalPortalPageProps {
  onOpenGpsModal: () => void;
  onOpenChargesModal: (tab?: 'patient_charges' | 'pal_earnings') => void;
  onBecomePal?: () => void;
}

export const PalPortalPage: React.FC<PalPortalPageProps> = ({
  onOpenGpsModal,
  onOpenChargesModal,
  onBecomePal,
}) => {
  // Authentication & Pal Profile State
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [palInfo, setPalInfo] = useState<Pal | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // Login Form State for Unauthenticated Visitors
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Portal Operational State
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'available_feed' | 'my_active' | 'eta_calculator' | 'earnings' | 'profile'
  >('available_feed');
  const [requests, setRequests] = useState<PalRequest[]>(INITIAL_REQUESTS);
  const [selectedPalPatientSummary, setSelectedPalPatientSummary] = useState<PalRequest | null>(
    null
  );

  // Check Supabase authentication and load linked Pal profile
  useEffect(() => {
    loadAuthenticatedPal();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchPalProfile(session.user);
      } else if (!isDemoMode) {
        setAuthUser(null);
        setPalInfo(null);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadAuthenticatedPal = async () => {
    setIsLoadingAuth(true);
    setActivationError(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn('Supabase auth check note:', userError.message);
        setAuthUser(null);
        setPalInfo(null);
      } else if (user) {
        await fetchPalProfile(user);
      } else {
        setAuthUser(null);
        setPalInfo(null);
      }
    } catch (err: any) {
      console.error('Error during Pal auth initial check:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchPalProfile = async (user: any) => {
    setAuthUser(user);
    setActivationError(null);

    try {
      // 1. Query `pals` table where auth_user_id = user.id (Source of truth)
      const { data: palDb, error: palDbError } = await supabase
        .from('pals')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (palDbError) {
        console.error('Supabase query pals by auth_user_id error:', {
          message: palDbError.message,
          details: palDbError.details,
          code: palDbError.code,
        });
      }

      if (palDb) {
        const formatted = formatPalFromDb(palDb);
        setPalInfo(formatted);
        setActivationError(null);
        return;
      }

      // 2. If not yet linked by auth_user_id, link via approved application if email is confirmed
      if (user.email_confirmed_at && user.email) {
        const { data: application, error: appErr } = await supabase
          .from('pal_applications')
          .select('*')
          .eq('email', user.email)
          .eq('status', 'approved')
          .maybeSingle();

        if (appErr) {
          console.error('Error finding approved application:', appErr);
        }

        const appName = application?.name || user.user_metadata?.full_name;
        const appPhone = application?.phone || user.user_metadata?.phone;

        if (appName && appPhone) {
          const { data: existingPal, error: lookupErr } = await supabase
            .from('pals')
            .select('*')
            .eq('name', appName)
            .eq('phone', appPhone)
            .maybeSingle();

          if (lookupErr) {
            console.error('Error looking up pal by name and phone:', lookupErr);
          }

          if (existingPal) {
            const { data: linkedPal, error: linkErr } = await supabase
              .from('pals')
              .update({ auth_user_id: user.id })
              .eq('id', existingPal.id)
              .select()
              .single();

            if (linkErr) {
              console.error('Error linking auth_user_id to existing pal:', linkErr);
            } else if (linkedPal) {
              const formatted = formatPalFromDb(linkedPal);
              setPalInfo(formatted);
              setActivationError(null);
              return;
            }
          }
        }
      }

      // If no matching Pal profile exists in pals table for this authenticated user:
      console.warn('Pal profile not found for authenticated user:', {
        authUserId: user.id,
        userEmail: user.email,
        emailConfirmedAt: user.email_confirmed_at,
      });

      setPalInfo(null);
      setActivationError(
        'Your Pal profile has not been created yet. Please contact the administrator.'
      );
    } catch (err: any) {
      console.error('Exception fetching pal record:', err);
      setActivationError(
        'Your Pal profile has not been created yet. Please contact the administrator.'
      );
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await loginPal(loginEmail, loginPassword);

      if (res.error) {
        setLoginError(res.error.message);
        setIsLoggingIn(false);
        return;
      }

      if (res.data?.user) {
        setAuthUser(res.data.user);
        if (res.data.palRecord) {
          setPalInfo(res.data.palRecord);
          setActivationError(null);
        } else {
          await fetchPalProfile(res.data.user);
        }
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setAuthUser(null);
    setPalInfo(null);
    setIsDemoMode(false);
    setActivationError(null);
  };

  const handleAcceptRequest = (reqId: string) => {
    const assigned = palInfo || (isDemoMode ? SAMPLE_PALS[0] : null);
    setRequests(
      requests.map((r) =>
        r.id === reqId ? { ...r, status: 'in_progress', assignedPal: assigned || undefined } : r
      )
    );
    setActiveTab('my_active');
  };

  // 1. Loading State
  if (isLoadingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#48A6A5] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-[#1F3449]">Verifying Pal Authentication Session...</h2>
        <p className="text-xs text-gray-500">Querying Supabase Auth and Pal profile status.</p>
      </div>
    );
  }

  // 2. Unauthenticated State (Prompt Login or Onboarding Links)
  if (!authUser && !isDemoMode) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-[#1F3449]">
        {/* Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#48A6A5]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-white bg-[#48A6A5] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <UserCheck className="w-3.5 h-3.5" />
                PAL PORTAL
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Authentication Required
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">
              Pal Companion Sign In
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              Sign in with your approved PathPal Companion credentials to manage hospital patient
              escort dispatches, access read-only medical summaries, and record your CHW stipend
              earnings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (onBecomePal) {
                  onBecomePal();
                } else {
                  window.location.hash = 'pal-apply';
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-black uppercase text-[#1F3449] border border-gray-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#48A6A5]" />
              <span>Apply to Become a Pal</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#1F3449] flex items-center gap-2">
                <LogIn className="w-5 h-5 text-[#48A6A5]" />
                <span>Sign In to Your Pal Account</span>
              </h2>
              <p className="text-xs text-gray-500">
                Enter your registered Supabase authentication credentials.
              </p>
            </div>

            {loginError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Authentication Failed</div>
                  <div>{loginError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Pal Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g., marcus.vance@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-6 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Pal Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href="#pal-verify"
                className="text-[#48A6A5] font-bold hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Email Address</span>
              </a>
              <a
                href="#pal-signup"
                className="text-gray-600 font-medium hover:text-[#1F3449] flex items-center gap-1"
              >
                <span>Have an Approved Signup Link?</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Side Helper Card */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Official Pal Onboarding Steps</span>
              </div>
              <ol className="text-xs text-emerald-900 space-y-2 font-medium list-decimal pl-4">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onBecomePal) {
                        onBecomePal();
                      } else {
                        window.location.hash = 'pal-apply';
                      }
                    }}
                    className="text-[#48A6A5] font-bold underline hover:text-[#48A6A5]/80 text-left cursor-pointer"
                  >
                    Submit your Pal application
                  </button>{' '}
                  with language & mobility experience.
                </li>
                <li>Hospital Administrator reviews and approves your application.</li>
                <li>Follow the approved signup link to create your Supabase Auth account.</li>
                <li>Click the email confirmation link to activate your Pal record.</li>
              </ol>
              <button
                type="button"
                onClick={() => {
                  if (onBecomePal) {
                    onBecomePal();
                  } else {
                    window.location.hash = 'pal-apply';
                  }
                }}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Open Pal Application Form</span>
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Guest Demo Preview</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Explore the Pal companion portal interface in Demo mode using simulated dispatch
                requests and navigation tools.
              </p>
              <button
                onClick={() => setIsDemoMode(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#1F3449] font-black text-xs uppercase tracking-wider border border-gray-300 shadow-sm transition-all"
              >
                Preview Portal in Demo Guest Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated User BUT No Pal Record Activated
  if (authUser && !palInfo && !isDemoMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 animate-fade-in text-[#1F3449]">
        <div className="bg-white p-8 rounded-3xl border-2 border-amber-300 shadow-xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-700">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                Account Status: Activation Pending
              </span>
              <h1 className="text-2xl font-black text-[#1F3449]">
                Pal Profile Not Found
              </h1>
              <p className="text-sm font-semibold text-amber-900 mt-2">
                Your Pal profile has not been created yet. Please contact the administrator.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="font-bold text-gray-700">Session Diagnostics:</div>
            <div className="text-gray-600">
              Logged in as: <strong className="text-[#1F3449]">{authUser.email}</strong>
            </div>
            <div className="text-gray-500 font-mono text-[11px]">
              Supabase Auth User ID: {authUser.id}
            </div>
            <div className="text-gray-500">
              Email Confirmed:{' '}
              <span
                className={`font-bold ${
                  authUser.email_confirmed_at ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {authUser.email_confirmed_at ? 'Yes (Confirmed)' : 'Pending Confirmation'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#pal-verify"
              className="px-5 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete / Check Email Verification</span>
            </a>

            <button
              onClick={() => fetchPalProfile(authUser)}
              className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase tracking-wider border border-gray-300 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-check Activation</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider border border-red-200 flex items-center gap-2 ml-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Pal Profile OR Demo Mode Profile
  const activePal: Pal =
    palInfo || (isDemoMode ? SAMPLE_PALS[0] : SAMPLE_PALS[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-[#1F3449]">
      {/* Demo Mode Banner (If in demo guest mode) */}
      {isDemoMode && (
        <div className="bg-amber-50 p-3 px-5 rounded-2xl border border-amber-300 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Demo Preview Mode:</strong> Showing simulated Pal companion data.
            </span>
          </div>
          <button
            onClick={() => setIsDemoMode(false)}
            className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
          >
            Switch to Supabase Login
          </button>
        </div>
      )}

      {/* Pal Portal Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#48A6A5]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#48A6A5] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <UserCheck className="w-3.5 h-3.5" />
              PAL PORTAL
            </span>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-3 py-1 rounded-full border border-[#48A6A5]/30 font-mono">
              Badge #{activePal.badgeNumber || 'PAL-ACTIVE'}
            </span>
            {authUser && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                ✓ Authenticated Supabase User
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">
            Welcome, {activePal.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Accept companion escort assignments, guide patients safely through hospital campuses,
            and track your CHW stipend earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Duty Status Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 pl-2">Duty Status:</span>
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                isOnDuty
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isOnDuty ? 'animate-ping' : ''}`} />
              <span>{isOnDuty ? 'ON-DUTY (RECEIVING ASSIGNMENTS)' : 'OFF-DUTY'}</span>
            </button>
          </div>

          <button
            onClick={onOpenGpsModal}
            className="bg-[#48A6A5] text-white font-black text-xs uppercase px-4 py-3 rounded-xl flex items-center gap-2 shadow-md hover:bg-[#48A6A5]/90 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Indoor Campus Radar</span>
          </button>

          {authUser && (
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 border border-gray-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pal Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Completed Visits
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#1F3449]">
            {activePal.completedVisits} Visits
          </div>
          <span className="text-[10px] font-bold text-emerald-600">100% On-Time Record</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Patient Rating
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#F1B84C] flex items-center gap-1">
            <span>{activePal.rating}</span>
            <Star className="w-5 h-5 fill-[#F1B84C]" />
          </div>
          <span className="text-[10px] font-bold text-gray-500">Verified Patient Feedback</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Hourly Stipend Rate
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#48A6A5]">$26.00 / hr</div>
          <span className="text-[10px] font-bold text-[#48A6A5]">+ $5.00 Bonus Per Visit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Certifications
          </span>
          <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>CHW + CPR & BLS Active</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500">Annual HIPAA Cleared</span>
        </div>
      </div>

      {/* Pal Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 text-xs font-bold shadow-sm">
        <button
          onClick={() => setActiveTab('available_feed')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'available_feed'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Available Pal Feed ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_active')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'my_active'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My Active Assignments</span>
        </button>

        <button
          onClick={() => setActiveTab('eta_calculator')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'eta_calculator'
              ? 'bg-[#48A6A5] text-white font-black shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#48A6A5]" />
          <span>AI Dispatch ETA Predictor</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'earnings'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings & Stipend Log</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#1F3449] text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4 text-[#F1B84C]" />
          <span>Badge & Profile Details</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE ESCORTS FEED */}
      {activeTab === 'available_feed' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">
                DISPATCH FEED
              </span>
              <h2 className="text-2xl font-black text-[#1F3449]">Pending Patient Pal Requests</h2>
            </div>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-3 py-1 rounded-full border border-[#48A6A5]/30">
              Nearby Hospitals
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#48A6A5] transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1F3449] font-mono bg-white px-2.5 py-0.5 rounded border border-gray-300">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-[#E85D75] bg-[#E85D75]/10 px-2 py-0.5 rounded">
                      {req.department}
                    </span>
                    <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-2 py-0.5 rounded">
                      🗣️ {req.languagePreference}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#1F3449]">{req.patientName}</h3>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E85D75] shrink-0" />
                    <span>
                      {req.hospitalName} • Rendezvous: <strong>{req.meetingPoint}</strong>
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Clock className="w-3.5 h-3.5" /> {req.appointmentDate} at{' '}
                      {req.appointmentTime}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      Est. Stipend: $52.00 (2 hrs)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {req.mobilityNeeds.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-0.5 rounded-md border border-gray-300"
                      >
                        ♿ {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 self-stretch md:self-center">
                  <button
                    onClick={() => setSelectedPalPatientSummary(req)}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#1F3449] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-gray-300 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#48A6A5]" />
                    <span>Read-Only Health Info</span>
                  </button>

                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Pal Assignment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY ACTIVE ESCORTS */}
      {activeTab === 'my_active' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#48A6A5]/40 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">
                ACTIVE ASSIGNMENT
              </span>
              <h2 className="text-2xl font-black text-[#1F3449]">
                Your Accepted Companion Assignments
              </h2>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              Live Pal: {activePal.name}
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-gray-50 p-6 rounded-2xl border-2 border-[#48A6A5]/50 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#48A6A5] uppercase">PATIENT:</span>
                    <h3 className="text-2xl font-black text-[#1F3449]">{req.patientName}</h3>
                    <p className="text-xs text-gray-600">
                      {req.hospitalName} ({req.department})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPalPatientSummary(req)}
                    className="px-4 py-2 rounded-xl bg-white text-[#48A6A5] border border-[#48A6A5]/40 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" /> Audit Read-Only Medical Summary
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-mono text-[10px]">
                      RENDEZVOUS SPOT:
                    </span>
                    <span className="text-[#1F3449] font-bold">{req.meetingPoint}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-mono text-[10px]">TIME:</span>
                    <span className="text-[#1F3449] font-bold">
                      {req.appointmentDate} at {req.appointmentTime}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-mono text-[10px]">
                      MOBILITY REQ:
                    </span>
                    <span className="text-[#E85D75] font-bold">
                      {req.mobilityNeeds.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const gCalUrl = createGoogleCalendarUrl({
                        title: `PathPal Escort Duty: ${req.patientName} at ${req.hospitalName}`,
                        description: `Pal Escort Assignment for ${req.patientName}.\nACTION REQUIRED: Log into PathPal 45 minutes before departure to review read-only medical summary, mobility needs (${req.mobilityNeeds.join(
                          ', '
                        )}), and allergy alerts.\nMeeting Point: ${req.meetingPoint}.`,
                        location: `${req.hospitalName}, ${req.meetingPoint}`,
                        startTime: new Date(`${req.appointmentDate}T10:00:00`),
                        endTime: new Date(`${req.appointmentDate}T12:00:00`),
                        reminderMinutesBefore: [1440, 120, 45, 15],
                      });
                      window.open(gCalUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#48A6A5] font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-[#48A6A5]/40 transition-all shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-[#48A6A5]" />
                    <span>Sync Duty & Medical Review Reminder</span>
                  </button>

                  <button
                    onClick={onOpenGpsModal}
                    className="px-6 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Launch Campus Navigation & Beacon Check-In</span>
                  </button>

                  <a
                    href={`tel:${req.patientPhone}`}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#1F3449] font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-gray-300 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Patient</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2.5: AI DISPATCH ETA PREDICTOR */}
      {activeTab === 'eta_calculator' && (
        <div className="space-y-4">
          <EtaCalculatorWidget
            onApplyEta={() => {
              setActiveTab('my_active');
            }}
          />
        </div>
      )}

      {/* TAB 3: EARNINGS & STIPEND LOG */}
      {activeTab === 'earnings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-lg">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">
              CHW STIPEND LOG
            </span>
            <h2 className="text-2xl font-black text-[#1F3449]">
              Pal Earnings & Payout Breakdown
            </h2>
            <p className="text-xs text-gray-600">
              Pals earn $22-$28/hour plus hospital bonus credits disbursed weekly via direct deposit
              or debit card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-500">
                THIS WEEK EARNINGS
              </span>
              <div className="text-3xl font-black text-emerald-600">$468.00</div>
              <p className="text-xs text-gray-600">18 Hours Logged • 9 Escorts</p>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-500">MONTHLY TOTAL</span>
              <div className="text-3xl font-black text-[#1F3449]">$1,840.00</div>
              <p className="text-xs text-gray-600">71 Hours Logged • 35 Escorts</p>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-500">HOSPITAL BONUSES</span>
              <div className="text-3xl font-black text-[#F1B84C]">$140.00</div>
              <p className="text-xs text-gray-600">5-Star Rating Bonuses</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenChargesModal('pal_earnings')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              <DollarSign className="w-4 h-4" />
              <span>Launch Pal Earnings & Stipend Calculator</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: BADGE & CERTIFICATIONS */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6 shadow-lg">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#F1B84C] tracking-wider">
              ACCREDITATION BADGE
            </span>
            <h2 className="text-2xl font-black text-[#1F3449]">
              Official PathPal Companion Badge & Clearances
            </h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 max-w-md space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              {activePal.avatar ? (
                <img
                  src={activePal.avatar}
                  alt={activePal.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#48A6A5] shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#48A6A5] text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {activePal.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-black text-[#1F3449]">{activePal.name}</h3>
                <span className="text-xs text-[#48A6A5] font-mono font-bold block">
                  Badge #{activePal.badgeNumber || 'PAL-ACTIVE'}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {activePal.hospitalAffiliations?.join(', ') || 'Metro Health Medical Center'}
                </span>
              </div>
            </div>

            {activePal.bio && (
              <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200 italic">
                "{activePal.bio}"
              </p>
            )}

            <div className="space-y-1 text-xs">
              <span className="font-bold text-gray-700 block">Specialties:</span>
              <div className="flex flex-wrap gap-1.5">
                {activePal.specialties.map((s, i) => (
                  <span
                    key={i}
                    className="bg-[#48A6A5]/10 text-[#48A6A5] px-2 py-0.5 rounded font-medium text-[11px]"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-gray-700 block">Languages:</span>
              <div className="flex flex-wrap gap-1.5">
                {activePal.languages.map((l, i) => (
                  <span
                    key={i}
                    className="bg-white text-gray-700 border border-gray-300 px-2 py-0.5 rounded font-medium text-[11px]"
                  >
                    🗣️ {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Background Check:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clear (Passed 2026)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CHW Certification:</span>
                <span className="text-emerald-700 font-bold">State Approved</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CPR / BLS First Aid:</span>
                <span className="text-emerald-700 font-bold">Active Exp 2027</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">HIPAA Compliance:</span>
                <span className="text-emerald-700 font-bold">Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAL READ-ONLY MEDICAL SUMMARY MODAL */}
      {selectedPalPatientSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#48A6A5] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-[#1F3449]">
            <button
              onClick={() => setSelectedPalPatientSummary(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#48A6A5] uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>PAL COMPANION READ-ONLY AUDIT VIEW</span>
            </div>

            <MedicalSummaryWidget
              isPalView={true}
              initialData={{
                patientName: selectedPalPatientSummary.patientName,
                dob: '1958-04-12',
                bloodType: 'O-Positive (O+)',
                primaryLanguage:
                  selectedPalPatientSummary.languagePreference || 'Spanish & English',
                primaryDoctor: 'Dr. Robert Chen, MD',
                doctorPhone: '(555) 234-8900',
                medicalHistory: [
                  'Hypertension',
                  'Type 2 Diabetes',
                  'Post-Op Knee Recovery',
                ],
                allergies: ['Penicillin (Severe Rash)', 'Latex'],
                emergencyContactName: 'Carlos Santos',
                emergencyContactRelation: 'Son',
                emergencyContactPhone:
                  selectedPalPatientSummary.patientPhone || '(555) 987-6543',
                mobilityNotes:
                  selectedPalPatientSummary.mobilityNeeds.join(', ') +
                  ' - Requires steady arm support.',
                uploadedFileName: 'Santos_Medical_Summary_2026.pdf',
                uploadedFileSize: '1.2 MB',
                lastUpdated: '2026-08-02 08:00',
                isSharingActive: true,
              }}
            />

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPalPatientSummary(null)}
                className="bg-[#48A6A5] text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-[#48A6A5]/90 transition-all"
              >
                Close Read-Only View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
