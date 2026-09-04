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
  Key,
  KeyRound,
  ArrowRight,
  ShieldAlert,
  Bell,
  Activity,
  Layers,
  Calculator,
  User,
  HeartHandshake,
  Timer,
  Play,
  Square,
} from 'lucide-react';
import {
  supabase,
  loginPal,
  signUpPal,
  resendPalVerificationEmail,
  resetPalPassword,
  updatePalPassword,
  getApprovedPalApplicationByEmail,
  fetchPalByAuthUserId,
  formatPalFromDb,
  fetchPalRequests,
  assignPalToRequest,
  verifyPalEmailAndActivate,
  fetchAllHospitalVisits,
  fetchUserNotifications,
  markNotificationRead,
} from '../lib/supabase';
import {
  fetchAllEscortSessions,
  startEscortSession,
  completeEscortSession,
  calculateEscortCountdown,
  formatDurationDisplay,
  createEscortSession,
} from '../lib/escortService';
import {
  startPalLiveTracking,
  stopPalLiveTracking,
  LocationCoordinates,
} from '../lib/locationService';
import { Pal, PalRequest, HospitalVisit, Notification, LiveGpsPoint, EscortSession } from '../types';
import { MedicalSummaryWidget } from '../components/MedicalSummaryWidget';
import { EtaCalculatorWidget } from '../components/EtaCalculatorWidget';
import { LiveLocationMap } from '../components/map/LiveLocationMap';
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
  const [activationError, setActivationError] = useState<string | null>(null);

  // Login Form State for Unauthenticated Visitors
  const [authMode, setAuthMode] = useState<'login' | 'setup' | 'reset' | 'new_password'>('login');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginErrorDetails, setLoginErrorDetails] = useState<{
    code?: string;
    needsEmailVerification?: boolean;
    needsAccountSetup?: boolean;
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // First-time Account Setup State
  const [setupEmail, setSetupEmail] = useState<string>('');
  const [setupPassword, setSetupPassword] = useState<string>('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Password Reset State
  const [resetEmail, setResetEmail] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // New Password (Recovery) State
  const [newRecoveryPassword, setNewRecoveryPassword] = useState<string>('');
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState<string>('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [newPasswordSuccess, setNewPasswordSuccess] = useState<string | null>(null);

  // Resend Email Verification State
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  // Portal Operational State
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    | 'available_feed'
    | 'my_active'
    | 'visits'
    | 'availability'
    | 'notifications'
    | 'live_gps'
    | 'eta_calculator'
    | 'earnings'
    | 'profile'
  >('available_feed');

  // Real Database Collections
  const [requests, setRequests] = useState<PalRequest[]>([]);
  const [visits, setVisits] = useState<HospitalVisit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [escortSessions, setEscortSessions] = useState<EscortSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [selectedPalPatientSummary, setSelectedPalPatientSummary] = useState<PalRequest | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [escortActionLoadingId, setEscortActionLoadingId] = useState<string | null>(null);
  const [escortNotes, setEscortNotes] = useState<Record<string, string>>({});
  const [, setTimerTick] = useState<number>(0);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live GPS Broadcast State
  const [activeGpsSessionId, setActiveGpsSessionId] = useState<string | null>(null);
  const [isStreamingGps, setIsStreamingGps] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Escort countdown timer tick
  useEffect(() => {
    const hasActiveSession = escortSessions.some((s) => s.status === 'in_progress');
    if (!hasActiveSession) return;

    const timer = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [escortSessions]);

  useEffect(() => {
    // Detect password recovery flow from URL
    const isRecovery =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery') ||
      window.location.hash.includes('pal-reset');
    if (isRecovery) {
      setAuthMode('new_password');
    }

    loadAuthenticatedPal();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('new_password');
      }
      if (session?.user) {
        await fetchPalProfile(session.user);
      } else {
        setAuthUser(null);
        setPalInfo(null);
        setIsLoadingAuth(false);
      }
    });

    // Realtime subscription for pal_requests and escort_sessions
    const requestsChannel = supabase
      .channel('pal_portal_requests_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pal_requests' },
        (payload) => {
          console.log('[PAL Portal Realtime] Request change detected:', payload.eventType);
          loadPortalCollections();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escort_sessions' },
        (payload) => {
          console.log('[PAL Portal Realtime] Escort session change detected:', payload.eventType);
          loadPortalCollections();
        }
      )
      .subscribe();

    return () => {
      authListener?.subscription?.unsubscribe();
      supabase.removeChannel(requestsChannel);
    };
  }, []);

  const loadAuthenticatedPal = async () => {
    setIsLoadingAuth(true);
    setActivationError(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setActivationError(sessionError.message);
        setIsLoadingAuth(false);
        return;
      }

      if (session?.user) {
        await fetchPalProfile(session.user);
      } else {
        setIsLoadingAuth(false);
      }
    } catch (err: any) {
      console.error('Error verifying PAL session:', err);
      setActivationError(err?.message || 'Authentication error.');
      setIsLoadingAuth(false);
    }
  };

  const fetchPalProfile = async (user: any) => {
    try {
      setAuthUser(user);
      const res = await verifyPalEmailAndActivate(user.id, user.email || '');

      if (res?.data?.palRecord) {
        setPalInfo(res.data.palRecord);
      } else {
        const palData = await fetchPalByAuthUserId(user.id);
        if (palData) {
          const formatted = formatPalFromDb(palData);
          setPalInfo(formatted);
        }
      }

      await loadPortalCollections();
    } catch (err) {
      console.error('Error fetching PAL profile details:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loadPortalCollections = async () => {
    setIsLoadingData(true);
    try {
      const [liveReqs, visitsData, notifsData, sessionsData] = await Promise.all([
        fetchPalRequests(),
        fetchAllHospitalVisits(),
        fetchUserNotifications(),
        fetchAllEscortSessions(),
      ]);

      setRequests(liveReqs || []);
      setVisits(visitsData || []);
      setNotifications(notifsData || []);
      setEscortSessions(sessionsData || []);
    } catch (err) {
      console.error('Error fetching PAL feed:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginErrorDetails(null);
    setResendFeedback(null);
    setIsLoggingIn(true);

    try {
      const { data, error } = await loginPal(loginEmail, loginPassword);

      if (error) {
        setLoginError(error.message);
        setLoginErrorDetails(error);
        setIsLoggingIn(false);
        return;
      }

      if (data?.user) {
        await fetchPalProfile(data.user);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendVerification = async (targetEmail?: string) => {
    const emailToUse = targetEmail || loginEmail;
    if (!emailToUse) {
      setLoginError('Please enter your email address first.');
      return;
    }
    setIsResending(true);
    setResendFeedback(null);
    try {
      const res = await resendPalVerificationEmail(emailToUse);
      if (res.error) {
        setResendFeedback(`Unable to resend: ${res.error.message}`);
      } else {
        setResendFeedback('Verification email resent! Please check your inbox and spam folder.');
      }
    } catch (err: any) {
      setResendFeedback(err?.message || 'Failed to resend email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSetupPalAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    setSetupMessage(null);

    const email = setupEmail.trim().toLowerCase();
    if (!email || !setupPassword) {
      setSetupError('Please enter your email and a password.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setSetupError('Passwords do not match. Please verify and try again.');
      return;
    }
    if (setupPassword.length < 8) {
      setSetupError('Password must be at least 8 characters long.');
      return;
    }

    setIsSettingUp(true);
    try {
      const appCheck = await getApprovedPalApplicationByEmail(email);
      if (appCheck.error || !appCheck.data) {
        setSetupError(
          appCheck.error?.message ||
            'No approved PAL application was found with this email address. Please apply first.'
        );
        setIsSettingUp(false);
        return;
      }

      const appData = appCheck.data;
      const signUpRes = await signUpPal(
        email,
        setupPassword,
        appData
      );

      if (signUpRes.error) {
        setSetupError(signUpRes.error.message);
      } else {
        setSetupMessage(
          'Account setup successfully created! Please check your email to verify your address, then sign in below.'
        );
        setLoginEmail(email);
        setTimeout(() => {
          setAuthMode('login');
        }, 3000);
      }
    } catch (err: any) {
      setSetupError(err?.message || 'An error occurred during PAL account setup.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);

    const email = resetEmail.trim().toLowerCase();
    if (!email) {
      setResetError('Please enter your email address.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPalPassword(email);
      if (res.error) {
        setResetError(res.error.message);
      } else {
        setResetMessage('Password reset link sent to your email. Please follow the instructions in the email.');
      }
    } catch (err: any) {
      setResetError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateRecoveryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError(null);
    setNewPasswordSuccess(null);

    const password = newRecoveryPassword.trim();
    if (!password || password.length < 8) {
      setNewPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmRecoveryPassword.trim()) {
      setNewPasswordError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePalPassword(password);
      if (res.error) {
        setNewPasswordError(res.error.message);
      } else {
        setNewPasswordSuccess('Password updated successfully! You can now sign in with your new credentials.');
        setNewRecoveryPassword('');
        setConfirmRecoveryPassword('');
        setTimeout(() => {
          setAuthMode('login');
          setNewPasswordSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      setNewPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    if (activeGpsSessionId) {
      await stopPalLiveTracking(activeGpsSessionId);
      setActiveGpsSessionId(null);
      setIsStreamingGps(false);
    }
    await supabase.auth.signOut();
    setAuthUser(null);
    setPalInfo(null);
  };

  const handleAcceptAssignment = async (reqId: string, reqObj?: PalRequest) => {
    if (!palInfo) {
      setActionFeedback({
        type: 'error',
        message: 'PAL profile not loaded. Please re-authenticate.',
      });
      return;
    }

    setAcceptingId(reqId);
    setActionFeedback(null);

    try {
      const res = await assignPalToRequest(reqId, palInfo.id, palInfo);

      if (!res.success || !res.data) {
        setActionFeedback({
          type: 'error',
          message: res.error || 'This request has already been accepted by another PAL or is no longer pending.',
        });
        await loadPortalCollections();
        return;
      }

      // Successful acceptance
      const acceptedReq = res.data;
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? acceptedReq : r))
      );

      setActionFeedback({
        type: 'success',
        message: `Assignment successfully accepted for ${acceptedReq.patientName || reqObj?.patientName || 'patient'} at ${acceptedReq.hospitalName || 'hospital'}!`,
      });

      // Navigate to My Confirmed Escorts tab
      setActiveTab('my_active');
    } catch (err: any) {
      console.error('Accept assignment exception:', err);
      setActionFeedback({
        type: 'error',
        message: err?.message || 'An unexpected error occurred while accepting assignment.',
      });
      await loadPortalCollections();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleStartEscort = async (req: PalRequest) => {
    if (!palInfo) return;
    setEscortActionLoadingId(req.id);
    try {
      let session = escortSessions.find((s) => s.request_id === req.id);
      if (!session) {
        session = await createEscortSession({
          request_id: req.id,
          pal_id: palInfo.id,
          patient_name: req.patientName,
          patient_phone: req.patientPhone,
          hospital_name: req.hospitalName,
          department: req.department,
          meeting_location: req.meetingLocation || req.meetingPoint,
          start_coords: gpsCoords || undefined,
        });
      }

      if (session) {
        const startedResult = await startEscortSession(session.id, gpsCoords || undefined);
        if (startedResult.success && startedResult.session) {
          const started = startedResult.session;
          setEscortSessions((prev) => prev.map((s) => (s.id === started.id ? started : s)));
          setActionFeedback({
            type: 'success',
            message: `2-hour escort started for ${req.patientName}! Door-to-department countdown active.`,
          });
          if (!isStreamingGps) {
            handleStartGps();
          }
        }
      }
    } catch (err: any) {
      console.error('Error starting escort session:', err);
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to start escort session.',
      });
    } finally {
      setEscortActionLoadingId(null);
      await loadPortalCollections();
    }
  };

  const handleCompleteEscort = async (session: EscortSession, req?: PalRequest) => {
    setEscortActionLoadingId(session.id);
    try {
      const notesText =
        escortNotes[session.id] ||
        'Escort successfully completed. Patient accompanied safely to department and care team.';
      const completedResult = await completeEscortSession(session.id, gpsCoords || undefined, notesText);
      if (completedResult.success && completedResult.session) {
        const completed = completedResult.session;
        setEscortSessions((prev) => prev.map((s) => (s.id === completed.id ? completed : s)));
        setActionFeedback({
          type: 'success',
          message: `Escort successfully completed for ${session.patient_name || req?.patientName || 'patient'}! Total duration: ${completed.actual_minutes ?? completed.total_duration_minutes ?? 120} mins. Visit log and records updated.`,
        });
      }
    } catch (err: any) {
      console.error('Error completing escort session:', err);
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to complete escort session.',
      });
    } finally {
      setEscortActionLoadingId(null);
      await loadPortalCollections();
    }
  };

  const handleStartGps = async () => {
    if (!palInfo) return;
    setIsStreamingGps(true);
    try {
      const { sessionId } = await startPalLiveTracking({
        palId: typeof palInfo.id === 'number' ? palInfo.id : parseInt(palInfo.id, 10) || undefined,
        userId: authUser?.id,
        onPositionUpdate: (coords: LocationCoordinates) => {
          setGpsCoords({ lat: coords.latitude, lng: coords.longitude });
        },
        onError: (errMsg) => {
          console.warn('GPS tracking warning:', errMsg);
        },
      });

      if (sessionId) {
        setActiveGpsSessionId(sessionId);
      }
    } catch (e) {
      console.error('Error starting live GPS tracking:', e);
    }
  };

  const handleStopGps = async () => {
    if (activeGpsSessionId) {
      await stopPalLiveTracking(activeGpsSessionId);
      setActiveGpsSessionId(null);
    }
    setIsStreamingGps(false);
    setGpsCoords(null);
  };

  // 1. Loading State
  if (isLoadingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#48A6A5] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-[#1F3449]">Verifying PAL Credentials & Session...</h2>
        <p className="text-xs text-gray-500">Checking authorized background check status and dispatch profile.</p>
      </div>
    );
  }

  // 2. Unauthenticated PAL Screen
  if (!authUser && !palInfo) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 animate-fade-in text-[#1F3449]">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-gray-200 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#48A6A5] text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <UserCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F3449]">PAL Companion Portal</h1>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Access your dispatch queue, accept patient escort requests, and manage hospital visits.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={`grid ${authMode === 'new_password' ? 'grid-cols-4' : 'grid-cols-3'} gap-1 bg-gray-100 p-1 rounded-2xl text-[11px] font-bold`}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                authMode === 'login' ? 'bg-white text-[#1F3449] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('setup');
                setSetupError(null);
                setSetupMessage(null);
                if (loginEmail && !setupEmail) setSetupEmail(loginEmail);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                authMode === 'setup' ? 'bg-white text-[#1F3449] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('reset');
                setResetError(null);
                setResetMessage(null);
                if (loginEmail && !resetEmail) setResetEmail(loginEmail);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                authMode === 'reset' ? 'bg-white text-[#1F3449] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Reset Password
            </button>
            {authMode === 'new_password' && (
              <button
                type="button"
                className="py-2 rounded-xl bg-white text-[#1F3449] shadow-xs text-center cursor-default font-bold"
              >
                Set Password
              </button>
            )}
          </div>

          {/* MODE 1: SIGN IN */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {loginError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div className="font-medium">{loginError}</div>
                  </div>

                  {/* Context-aware action buttons */}
                  {loginErrorDetails?.needsEmailVerification && (
                    <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-rose-700">Didn't receive the verification email?</span>
                      <button
                        type="button"
                        disabled={isResending}
                        onClick={() => handleResendVerification(loginEmail)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {isResending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        <span>Resend Email</span>
                      </button>
                    </div>
                  )}

                  {loginErrorDetails?.needsAccountSetup && (
                    <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-rose-700">Application approved but password not set:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSetupEmail(loginEmail);
                          setAuthMode('setup');
                        }}
                        className="px-3 py-1.5 bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0"
                      >
                        Set Up Password Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {resendFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendFeedback}</span>
                </div>
              )}

              <form onSubmit={handlePalLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    PAL Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="pal@hospitalpathpal.org"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail);
                        setAuthMode('reset');
                      }}
                      className="text-[11px] font-semibold text-[#48A6A5] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#48A6A5] hover:bg-[#48A6A5]/90 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to PAL Portal</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE 2: FIRST-TIME PAL ACCOUNT SETUP */}
          {authMode === 'setup' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Approved PAL Onboarding</span>
                </div>
                <p className="text-[11px] text-sky-700">
                  If your PAL companion application has been approved by our dispatch team, enter your application email below to activate your account and set your login password.
                </p>
              </div>

              {setupError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{setupError}</div>
                </div>
              )}

              {setupMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Account Created Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">{setupMessage}</p>
                </div>
              )}

              <form onSubmit={handleSetupPalAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Application Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@hospitalpathpal.org"
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Create Password (minimum 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSettingUp}
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#48A6A5] hover:bg-[#48A6A5]/90 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSettingUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Set Up PAL Password & Activate</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE 3: RESET PASSWORD */}
          {authMode === 'reset' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600 space-y-1">
                <div className="font-bold text-gray-800">Forgot your password?</div>
                <p className="text-[11px]">
                  Enter your registered PAL email address. We'll send you a secure link to reset your password.
                </p>
              </div>

              {resetError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{resetError}</div>
                </div>
              )}

              {resetMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Registered PAL Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="pal@hospitalpathpal.org"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#1F3449] hover:bg-[#1F3449]/90 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Password Reset Email</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE 4: SET NEW PASSWORD (RECOVERY) */}
          {authMode === 'new_password' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>Password Reset Recovery</span>
                </div>
                <p className="text-[11px] text-sky-700">
                  Please enter and confirm your new secure PAL password below.
                </p>
              </div>

              {newPasswordError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{newPasswordError}</div>
                </div>
              )}

              {newPasswordSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{newPasswordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateRecoveryPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    New Password (minimum 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      value={newRecoveryPassword}
                      onChange={(e) => setNewRecoveryPassword(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      value={confirmRecoveryPassword}
                      onChange={(e) => setConfirmRecoveryPassword(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 pl-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#48A6A5] hover:bg-[#48A6A5]/90 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving New Password...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {onBecomePal && (
            <div className="pt-4 border-t border-gray-100 text-center space-y-3">
              <p className="text-xs text-gray-500">Not an accredited PAL yet?</p>
              <button
                onClick={onBecomePal}
                className="w-full py-3 rounded-xl border-2 border-[#48A6A5] text-[#48A6A5] hover:bg-[#48A6A5]/5 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Apply to Become a PAL
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Authenticated PAL Portal Interface
  const activePal: Pal = palInfo || {
    id: authUser?.id || 'unlinked',
    name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'PAL Companion',
    rating: 5.0,
    completedVisits: 0,
    languages: ['English'],
    specialties: ['Hospital Wayfinding', 'Campus Companion'],
    bio: 'Accredited Community Health Companion.',
    isVerified: true,
    badgeNumber: 'PAL-ACTIVE',
  };

  const myAssignments = requests.filter((r) => {
    if (r.status === 'pending') return false;
    if (r.assignedPal?.id === activePal.id) return true;
    if (r.assignedPal?.auth_user_id && authUser?.id && r.assignedPal.auth_user_id === authUser.id) return true;
    if (r.assigned_pal_id && authUser?.id && r.assigned_pal_id === authUser.id) return true;
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#1F3449]">
      
      {/* PAL Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#48A6A5]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#48A6A5] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <UserCheck className="w-3.5 h-3.5" />
              PAL COMPANION PORTAL
            </span>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-3 py-1 rounded-full border border-[#48A6A5]/30 font-mono">
              Badge #{activePal.badgeNumber || 'PAL-ACTIVE'}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              ✓ Verified & Cleared
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">
            Welcome, {activePal.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Accept companion escort requests, guide patients safely on campus, and stream live GPS coordinates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Duty Status Toggle */}
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
              isOnDuty
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isOnDuty ? 'animate-ping' : ''}`} />
            <span>{isOnDuty ? 'ON-DUTY (RECEIVING FEED)' : 'OFF-DUTY'}</span>
          </button>

          <button
            onClick={loadPortalCollections}
            className="bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase px-4 py-3 rounded-xl border border-gray-300 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-3 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Escort Session Live Alert Banner */}
      {(() => {
        const activeEscort = escortSessions.find((s) => s.status === 'in_progress');
        if (!activeEscort) return null;
        const countdown = calculateEscortCountdown(activeEscort.started_at, activeEscort.included_minutes);

        return (
          <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-emerald-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100">
                    ESCORT IN PROGRESS • 2-HOUR DOOR-TO-DEPARTMENT WINDOW
                  </span>
                </div>
                <div className="text-base font-black">
                  {activeEscort.patient_name} at {activeEscort.hospital_name}
                </div>
                <div className="text-xs text-emerald-100">
                  Dept: {activeEscort.department} • Meeting: {activeEscort.meeting_location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-[11px] font-bold text-emerald-200 uppercase">
                  {countdown.isOvertime ? 'Overtime In Progress' : 'Window Timer'}
                </div>
                <div className="text-2xl font-black font-mono tracking-tight text-white">
                  {countdown.isOvertime
                    ? `+${countdown.overtimeMinutes}m`
                    : `${countdown.remainingMinutes}m ${String(countdown.remainingSeconds).padStart(2, '0')}s`}
                </div>
                <div className="text-[10px] text-emerald-200">
                  {countdown.isOvertime ? (
                    <span className="text-amber-200 font-bold">Escort exceeded included 120 minutes</span>
                  ) : (
                    `${countdown.elapsedMinutes}m elapsed of 120m`
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('my_active')}
                className="px-4 py-2.5 rounded-xl bg-white text-teal-800 font-black text-xs uppercase hover:bg-emerald-50 transition-all shadow-md cursor-pointer shrink-0"
              >
                Manage Escort
              </button>
            </div>
          </div>
        );
      })()}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-2xl border border-gray-200 text-xs font-bold shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('available_feed')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'available_feed'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Available Requests ({requests.filter((r) => r.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_active')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'my_active'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My Assignments ({myAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'visits'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Hospital Visits ({visits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('live_gps')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'live_gps'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Live GPS Tracking {isStreamingGps && '●'}</span>
        </button>

        <button
          onClick={() => setActiveTab('eta_calculator')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'eta_calculator'
              ? 'bg-[#48A6A5] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>ETA Predictor</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'earnings'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Stipend Log</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#1F3449] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Badge</span>
        </button>
      </div>

      {/* =========================================================================
       * TAB 1: AVAILABLE REQUESTS FEED
       * ========================================================================= */}
      {activeTab === 'available_feed' && (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">LIVE FEED</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Available Escort Requests</h2>
            <p className="text-xs text-gray-600">
              Patients requiring on-campus accompaniment, wayfinding, or mobility assistance.
            </p>
          </div>

          {actionFeedback && (
            <div
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-fade-in ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-2.5 text-xs">
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {actionFeedback.type === 'success' ? 'Assignment Accepted' : 'Unable to Claim Assignment'}
                  </div>
                  <div className="text-[11px] mt-0.5">{actionFeedback.message}</div>
                </div>
              </div>
              <button
                onClick={() => setActionFeedback(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests
              .filter((r) => r.status === 'pending')
              .map((req) => (
                <div
                  key={req.id}
                  id={`pal-req-card-${req.id}`}
                  className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:border-[#48A6A5] transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Request ID: {req.id}</span>
                      <h3 className="font-bold text-base text-[#1F3449]">{req.hospitalName}</h3>
                      <p className="text-xs text-gray-600 font-medium">{req.department}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                      Open Request
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <div><strong>Patient:</strong> {req.patientName}</div>
                    <div><strong>Date & Time:</strong> {req.appointmentDate} at {req.appointmentTime}</div>
                    <div><strong>Meeting Location:</strong> {req.meetingLocation || req.meetingPoint}</div>
                    {req.mobilityNeeds && req.mobilityNeeds.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {req.mobilityNeeds.map((m) => (
                          <span key={m} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-semibold">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setSelectedPalPatientSummary(req)}
                      className="text-xs font-bold text-[#48A6A5] hover:underline cursor-pointer"
                    >
                      View AI Briefing
                    </button>
                    <button
                      id={`accept-btn-${req.id}`}
                      disabled={acceptingId === req.id}
                      onClick={() => handleAcceptAssignment(req.id, req)}
                      className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 disabled:opacity-60 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {acceptingId === req.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Assignment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

            {requests.filter((r) => r.status === 'pending').length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p>No open patient requests pending acceptance at this moment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 2: MY ACTIVE ASSIGNMENTS
       * ========================================================================= */}
      {activeTab === 'my_active' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">My Confirmed Escorts</h2>
            <p className="text-xs text-gray-500">Upcoming hospital appointments you are assigned to escort.</p>
          </div>

          <div className="space-y-4">
            {myAssignments.map((req) => {
              const session = escortSessions.find((s) => s.request_id === req.id);
              const isSessionInProgress = session?.status === 'in_progress';
              const isSessionCompleted = session?.status === 'completed';
              const countdown = isSessionInProgress
                ? calculateEscortCountdown(session.started_at, session.included_minutes)
                : null;

              return (
                <div
                  key={req.id}
                  className={`bg-white p-6 rounded-3xl border-2 shadow-sm space-y-5 transition-all ${
                    isSessionInProgress
                      ? 'border-emerald-500 ring-4 ring-emerald-50'
                      : isSessionCompleted
                      ? 'border-gray-200'
                      : 'border-[#48A6A5]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 uppercase">
                          REQ ID: {req.id.slice(0, 8)}...
                        </span>
                        {isSessionInProgress && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            Live In-Progress
                          </span>
                        )}
                        {isSessionCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Escort Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-[#1F3449]">
                        {req.hospitalName} – {req.department}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Patient: <span className="font-bold text-[#1F3449]">{req.patientName}</span> ({req.patientPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                        Matched Assignment
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50/70 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-gray-400 font-bold block">Appointment Time:</span>
                      <span className="font-bold text-[#1F3449]">{req.appointmentDate} at {req.appointmentTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Campus Meeting Point:</span>
                      <span className="font-bold text-[#1F3449]">{req.meetingLocation || req.meetingPoint}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Patient Language:</span>
                      <span className="font-bold text-[#1F3449]">{req.languagePreference || 'English'}</span>
                    </div>
                  </div>

                  {/* 2-Hour Escort Session Module */}
                  <div className="p-4 rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Timer className={`w-4 h-4 ${isSessionInProgress ? 'text-emerald-600 animate-pulse' : 'text-[#48A6A5]'}`} />
                        <span className="text-xs font-black uppercase tracking-wider text-[#1F3449]">
                          Door-to-Department 2-Hour Escort Service
                        </span>
                      </div>

                      {isSessionInProgress && countdown && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-xs font-mono font-black text-emerald-800">
                            {countdown.remainingMinutes}m {String(countdown.remainingSeconds).padStart(2, '0')}s remaining
                          </span>
                        </div>
                      )}
                    </div>

                    {isSessionInProgress && countdown && (
                      <div className="space-y-3 bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
                        <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              countdown.isOvertime ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, countdown.progressPercent)}%` }}
                          />
                        </div>

                        {countdown.isOvertime ? (
                          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-xs">
                            <div className="font-black text-amber-900 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Escort exceeded included 120 minutes.</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                              <div>
                                <span className="font-bold text-amber-900">Actual duration:</span>{' '}
                                {countdown.elapsedMinutes} mins
                              </div>
                              <div>
                                <span className="font-bold text-amber-900">Overtime minutes:</span>{' '}
                                +{countdown.overtimeMinutes} mins
                              </div>
                              <div>
                                <span className="font-bold text-amber-900">Status:</span>{' '}
                                <span className="bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                                  Pending overtime review
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between text-[11px] text-emerald-900 font-medium">
                            <span>Started at {new Date(session.started_at || '').toLocaleTimeString()}</span>
                            <span>120m standard door-to-department coverage</span>
                          </div>
                        )}

                        {/* Completion notes field */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Escort Completion Summary & Notes (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Safely met at Lobby desk, escorted to 3rd floor clinic, and checked in with nurse..."
                            value={escortNotes[session.id] || ''}
                            onChange={(e) =>
                              setEscortNotes((prev) => ({ ...prev, [session.id]: e.target.value }))
                            }
                            className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {isSessionCompleted && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-gray-700">
                            Completed • Duration: {session.total_duration_minutes} minutes
                          </span>
                        </div>
                        {session.overtime_minutes && session.overtime_minutes > 0 ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            +{session.overtime_minutes}m Overtime Logged
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Escort Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {!isSessionInProgress && !isSessionCompleted && (
                        <button
                          disabled={escortActionLoadingId === req.id}
                          onClick={() => handleStartEscort(req)}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          {escortActionLoadingId === req.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Starting Escort...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Start Escort (2-Hour Service)</span>
                            </>
                          )}
                        </button>
                      )}

                      {isSessionInProgress && session && (
                        <button
                          disabled={escortActionLoadingId === session.id}
                          onClick={() => handleCompleteEscort(session, req)}
                          className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          {escortActionLoadingId === session.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Finalizing Visit...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Escort & Finalize Log</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => setActiveTab('live_gps')}
                        className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Live GPS Campus Tracking</span>
                      </button>

                      <button
                        onClick={() => setSelectedPalPatientSummary(req)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Patient Care Brief
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {myAssignments.length === 0 && (
              <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 space-y-2">
                <UserCheck className="w-8 h-8 mx-auto" />
                <p>You have no active assignments accepted right now.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: VISITS
       * ========================================================================= */}
      {activeTab === 'visits' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Hospital Visits Log</h2>
            <p className="text-xs text-gray-500">Completed and recorded visits from public.hospital_visits.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visit ID</th>
                  <th className="p-4">Hospital</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scheduled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold">#{v.id}</td>
                    <td className="p-4 font-bold text-[#1F3449]">{v.hospital_name || 'Hospital'}</td>
                    <td className="p-4">{v.department || 'Outpatient'}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {v.scheduled_at ? new Date(v.scheduled_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 4: NOTIFICATIONS
       * ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">PAL Dispatch Alerts</h2>
            <p className="text-xs text-gray-500">Real-time alerts from public.notifications table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-[#1F3449]">{n.title}</div>
                  <p className="text-xs text-gray-600">{n.message}</p>
                </div>
                <span className="text-[11px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-400">No alerts in your feed.</div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 5: LIVE GPS STREAMING
       * ========================================================================= */}
      {activeTab === 'live_gps' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-rose-600 tracking-wider">LIVE TELEMETRY</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Real-Time GPS Location Broadcast</h2>
            <p className="text-xs text-gray-600">
              Streams your current campus coordinates directly to public.location_sessions and location_points for patient tracking and hospital reception.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Interactive Map */}
            <div className="lg:col-span-2">
              <LiveLocationMap
                hospital={{
                  name: myAssignments[0]?.hospitalName || 'NYU Langone Health - Tisch Hospital',
                  address: myAssignments[0]?.hospitalAddress || '550 1st Avenue, New York, NY 10016',
                  latitude: myAssignments[0]?.hospitalLatitude || 40.7421,
                  longitude: myAssignments[0]?.hospitalLongitude || -73.9741,
                }}
                palLocation={
                  gpsCoords
                    ? {
                        latitude: gpsCoords.lat,
                        longitude: gpsCoords.lng,
                        accuracyMeters: 5,
                        recordedAt: new Date().toISOString(),
                      }
                    : null
                }
                palName={activePal.name}
                patientName={myAssignments[0]?.patientName}
                height="h-80 sm:h-96"
              />
            </div>

            {/* GPS Controls and Telemetry Status */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#1F3449]">GPS Streaming Status</div>
                    <div className="text-xs text-gray-500">
                      {isStreamingGps ? `Active Session #${activeGpsSessionId}` : 'Not currently streaming'}
                    </div>
                  </div>
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      isStreamingGps ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'
                    }`}
                  />
                </div>

                {gpsCoords && (
                  <div className="text-xs font-mono bg-white p-3 rounded-xl border border-gray-200 text-gray-700">
                    <div><strong>Lat:</strong> {gpsCoords.lat.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {gpsCoords.lng.toFixed(6)}</div>
                  </div>
                )}

                <div className="pt-1">
                  {!isStreamingGps ? (
                    <button
                      onClick={handleStartGps}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Start Live GPS Broadcast</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopGps}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Stop Broadcast</span>
                    </button>
                  )}
                </div>
              </div>

              {myAssignments[0] && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                  <div className="font-bold text-[#1F3449]">Active Escort Target</div>
                  <div className="text-gray-700">{myAssignments[0].hospitalName}</div>
                  <div className="text-gray-500 text-[11px]">Meeting Location: {myAssignments[0].meetingLocation || myAssignments[0].meetingPoint}</div>
                  <div className="text-blue-700 font-medium text-[11px] pt-1">
                    Patient: {myAssignments[0].patientName} ({myAssignments[0].patientPhone})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 6: ETA CALCULATOR
       * ========================================================================= */}
      {activeTab === 'eta_calculator' && (
        <div className="space-y-6">
          <EtaCalculatorWidget onOpenGpsModal={onOpenGpsModal} />
        </div>
      )}

      {/* =========================================================================
       * TAB 7: EARNINGS & STIPEND LOG
       * ========================================================================= */}
      {activeTab === 'earnings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">CHW STIPENDS</span>
            <h2 className="text-2xl font-black text-[#1F3449]">PAL Earnings & Disbursement</h2>
            <p className="text-xs text-gray-600">
              Community Health Worker companion stipends paid bi-weekly via direct deposit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-xs text-emerald-800 font-bold uppercase">Hourly Rate</div>
              <div className="text-2xl font-black text-emerald-700">${((activePal.hourly_rate_cents || 2600) / 100).toFixed(2)}/hr</div>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
              <div className="text-xs text-blue-800 font-bold uppercase">Visits Completed</div>
              <div className="text-2xl font-black text-blue-700">{activePal.completedVisits || 0}</div>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
              <div className="text-xs text-purple-800 font-bold uppercase">Next Payout</div>
              <div className="text-2xl font-black text-purple-700">Friday (Direct Deposit)</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 8: PROFILE & BADGE
       * ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#1F3449] tracking-wider">CREDENTIAL DETAILS</span>
            <h2 className="text-2xl font-black text-[#1F3449]">PAL Verified Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold uppercase block">Name:</span>
              <span className="font-bold text-[#1F3449]">{activePal.name}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold uppercase block">Badge ID:</span>
              <span className="font-mono font-bold text-[#48A6A5]">{activePal.badgeNumber || 'PAL-ACTIVE'}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold uppercase block">Languages:</span>
              <span className="font-medium text-gray-700">{activePal.languages?.join(', ') || 'English'}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-gray-400 font-bold uppercase block">Rating:</span>
              <span className="font-bold text-amber-600">★ {activePal.rating || '5.0'}</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Patient Briefing Modal */}
      {selectedPalPatientSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-[#48A6A5]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#48A6A5]" />
                <h3 className="font-black text-lg text-[#1F3449]">Patient Care Brief</h3>
              </div>
              <button
                onClick={() => setSelectedPalPatientSummary(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MedicalSummaryWidget
              request={selectedPalPatientSummary}
              onClose={() => setSelectedPalPatientSummary(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
