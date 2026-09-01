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
  Bell,
  Activity,
  Layers,
  Calculator,
  User,
  HeartHandshake,
} from 'lucide-react';
import {
  supabase,
  loginPal,
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
  startPalLiveTracking,
  stopPalLiveTracking,
  LocationCoordinates,
} from '../lib/locationService';
import { Pal, PalRequest, HospitalVisit, Notification, LiveGpsPoint } from '../types';
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
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [selectedPalPatientSummary, setSelectedPalPatientSummary] = useState<PalRequest | null>(null);

  // Live GPS Broadcast State
  const [activeGpsSessionId, setActiveGpsSessionId] = useState<string | null>(null);
  const [isStreamingGps, setIsStreamingGps] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadAuthenticatedPal();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchPalProfile(session.user);
      } else {
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
      const [liveReqs, visitsData, notifsData] = await Promise.all([
        fetchPalRequests(),
        fetchAllHospitalVisits(),
        fetchUserNotifications(),
      ]);

      setRequests(liveReqs || []);
      setVisits(visitsData || []);
      setNotifications(notifsData || []);
    } catch (err) {
      console.error('Error fetching PAL feed:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const { data, error } = await loginPal(loginEmail, loginPassword);

      if (error) {
        setLoginError(error.message);
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

  const handleAcceptAssignment = async (reqId: string) => {
    if (!palInfo) return;
    try {
      const res = await assignPalToRequest(reqId, palInfo.id, palInfo);
      if (res.data) {
        setRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'matched', assignedPal: palInfo } : r))
        );
        setActiveTab('my_active');
      }
    } catch (err: any) {
      alert(err?.message || 'Error accepting assignment');
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
              Sign in with your verified PAL email and password.
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium">{loginError}</div>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Password
              </label>
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

          {onBecomePal && (
            <div className="pt-4 border-t border-gray-100 text-center space-y-3">
              <p className="text-xs text-gray-500">Don't have an approved PAL account?</p>
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

  const myAssignments = requests.filter((r) => r.assignedPal?.id === activePal.id);

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests
              .filter((r) => r.status === 'pending')
              .map((req) => (
                <div
                  key={req.id}
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
                      onClick={() => handleAcceptAssignment(req.id)}
                      className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Accept Assignment
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
            {myAssignments.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-3xl border-2 border-[#48A6A5] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#1F3449]">{req.hospitalName} - {req.department}</h3>
                    <p className="text-xs text-gray-600">Patient: {req.patientName} ({req.patientPhone})</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                    Matched
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div><strong>Date:</strong> {req.appointmentDate} at {req.appointmentTime}</div>
                  <div><strong>Meet Location:</strong> {req.meetingLocation || req.meetingPoint}</div>
                  <div><strong>Language:</strong> {req.languagePreference || 'English'}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setActiveTab('live_gps')}
                    className="bg-[#48A6A5] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Start Campus Navigation</span>
                  </button>
                  <button
                    onClick={() => setSelectedPalPatientSummary(req)}
                    className="bg-gray-100 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-gray-200 cursor-pointer"
                  >
                    Medical Brief
                  </button>
                </div>
              </div>
            ))}

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
