import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  Phone,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Navigation,
  ShieldAlert,
  FileText,
  ChevronRight,
  UserCheck,
  Lock,
  Globe,
  Activity,
  Database,
  UserPlus,
  Users,
  Award,
  Bell,
  Star,
  DollarSign,
  HeartHandshake,
  User,
  RefreshCw,
} from 'lucide-react';
import { SAMPLE_HOSPITALS } from '../data/mockData';
import { Pal, PalRequest, Match, HospitalVisit, Notification, EscortSession } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';
import {
  createPalRequest,
  fetchPalRequests,
  fetchEligiblePatientPals,
  fetchAllMatches,
  fetchAllHospitalVisits,
  fetchUserNotifications,
  markNotificationRead,
  createNotification,
} from '../lib/supabase';
import { fetchAllEscortSessions, calculateEscortCountdown } from '../lib/escortService';
import { supabase } from '../lib/supabaseClient';

interface PatientPortalPageProps {
  onOpenGpsModal: () => void;
  onOpenChargesModal: (tab?: 'patient_charges' | 'pal_earnings') => void;
  onOpenSupabaseAuth?: () => void;
  onOpenRequestPal?: () => void;
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({
  onOpenGpsModal,
  onOpenChargesModal,
  onOpenSupabaseAuth,
  onOpenRequestPal,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'available_pals' | 'request' | 'requests' | 'matches' | 'visits' | 'notifications' | 'financials' | 'profile'
  >('available_pals');

  // Supabase Data State
  const [authUser, setAuthUser] = useState<any>(null);
  const [availablePals, setAvailablePals] = useState<Pal[]>([]);
  const [requests, setRequests] = useState<PalRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [visits, setVisits] = useState<HospitalVisit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [escortSessions, setEscortSessions] = useState<EscortSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setTimerTick] = useState<number>(0);

  // Patient Booking Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [hospitalName, setHospitalName] = useState('NYU Langone Health – Tisch Hospital');
  const [selectedHospitalId, setSelectedHospitalId] = useState(SAMPLE_HOSPITALS[0].id);
  const [appointmentDate, setAppointmentDate] = useState('2026-09-08');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [department, setDepartment] = useState('Outpatient Clinic');
  const [meetingLocation, setMeetingLocation] = useState('Main Entrance – Lobby Welcome Desk');
  const [languagePreference, setLanguagePreference] = useState('English');
  const [selectedMobility, setSelectedMobility] = useState<string[]>(['Wheelchair Assistance', 'Arm Assistance']);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<PalRequest | null>(null);

  const selectedHospital = SAMPLE_HOSPITALS.find((h) => h.id === selectedHospitalId) || SAMPLE_HOSPITALS[0];

  useEffect(() => {
    loadPatientData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) {
        setAuthUser(user);
        if (user.email) setPatientName(user.user_metadata?.full_name || user.email.split('@')[0]);
      }
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user?.email) {
        setPatientName(user.user_metadata?.full_name || user.email.split('@')[0]);
      }
    });

    // Realtime listeners for pal_requests and matches
    const patientRequestsChannel = supabase
      .channel('patient_requests_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pal_requests' },
        () => {
          loadPatientData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          loadPatientData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(patientRequestsChannel);
    };
  }, []);

  // Real-time ticking for active escort session timers
  useEffect(() => {
    const hasActiveSession = escortSessions.some((s) => s.status === 'in_progress');
    if (!hasActiveSession) return;

    const timer = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [escortSessions]);

  const loadPatientData = async () => {
    setIsLoading(true);
    try {
      const [palsData, reqsData, matchesData, visitsData, notifsData, sessionsData] = await Promise.all([
        fetchEligiblePatientPals(),
        fetchPalRequests(),
        fetchAllMatches(),
        fetchAllHospitalVisits(),
        fetchUserNotifications(),
        fetchAllEscortSessions(),
      ]);

      setAvailablePals(palsData);
      setRequests(reqsData);
      setMatches(matchesData);
      setVisits(visitsData);
      setNotifications(notifsData);
      setEscortSessions(sessionsData || []);
    } catch (err) {
      console.error('Error loading patient portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Authenticated Patient check
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;

    if (!user) {
      setFormError('Please log in to book a PAL.');
      return;
    }

    if (!patientName.trim()) {
      setFormError('Please provide patient full legal name.');
      return;
    }
    if (!patientPhone.trim()) {
      setFormError('Please provide a contact phone number.');
      return;
    }

    setIsSubmitting(true);
    const finalHospitalName = hospitalName.trim() || selectedHospital.name;
    const res = await createPalRequest({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      hospitalId: selectedHospital.id || 'hosp-custom',
      hospitalName: finalHospitalName,
      appointmentDate,
      appointmentTime,
      department: department.trim(),
      meetingLocation: meetingLocation.trim(),
      meeting_location: meetingLocation.trim(),
      languagePreference,
      mobilityNeeds: selectedMobility,
      notes: notes.trim(),
    });
    setIsSubmitting(false);

    if (res.error) {
      console.error('[PAL Request] Supabase insert error:', res.error);
      setFormError(res.error.message || 'Unable to submit your PAL request right now. Please try again.');
      return;
    }

    if (res.data) {
      setLastSubmittedRequest(res.data);
      setBookingSuccess(true);
      setRequests((prev) => [res.data!, ...prev.filter((r) => r.id !== res.data!.id)]);
      // Refresh patient data from Supabase
      loadPatientData();
    }
  };

  const toggleMobilityOption = (opt: string) => {
    if (selectedMobility.includes(opt)) {
      setSelectedMobility(selectedMobility.filter((m) => m !== opt));
    } else {
      setSelectedMobility([...selectedMobility, opt]);
    }
  };

  const handleMarkNotifRead = async (id: number | string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#1F3449]">
      
      {/* Patient Portal Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E85D75]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#E85D75] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Heart className="w-3.5 h-3.5 fill-white" />
              PATIENT & FAMILY PORTAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">
            {authUser ? `Welcome, ${patientName || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Patient'}` : 'Welcome to Patient & Family Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Book compassionate companion escorts for hospital appointments, discover available accredited PALs, and track your visits in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={loadPatientData}
            className="bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase px-4 py-3 rounded-xl border border-gray-300 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenGpsModal}
            className="bg-gray-50 hover:bg-gray-100 text-[#48A6A5] font-bold text-xs uppercase px-4 py-3 rounded-xl border border-[#48A6A5]/30 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#48A6A5]" />
            <span>Track Live GPS</span>
          </button>
        </div>
      </div>

      {/* Active Escort Session Live Alert Banner */}
      {(() => {
        const activeEscort = escortSessions.find((s) => s.status === 'in_progress');
        if (!activeEscort) return null;
        const countdown = calculateEscortCountdown(activeEscort.started_at, activeEscort.included_minutes);

        return (
          <div
            className={`text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 transition-all ${
              countdown.isOvertime
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 border-amber-300'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${countdown.isOvertime ? 'bg-amber-300' : 'bg-emerald-300'} animate-ping`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${countdown.isOvertime ? 'text-amber-100' : 'text-emerald-100'}`}>
                    {countdown.isOvertime
                      ? 'ESCORT WINDOW EXCEEDED 120 MINUTES • PENDING OVERTIME REVIEW'
                      : 'YOUR PAL IS ESCORTING YOU RIGHT NOW • 2-HOUR DOOR-TO-DEPARTMENT WINDOW'}
                  </span>
                </div>
                <div className="text-base font-black">
                  Escort Active at {activeEscort.hospital_name}
                </div>
                <div className={`text-xs ${countdown.isOvertime ? 'text-amber-100' : 'text-emerald-100'}`}>
                  Meeting at {activeEscort.meeting_location} • Heading to {activeEscort.department}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className={`text-[11px] font-bold uppercase ${countdown.isOvertime ? 'text-amber-200' : 'text-emerald-200'}`}>
                  {countdown.isOvertime ? 'Overtime In Progress' : 'Window Timer'}
                </div>
                <div className="text-2xl font-black font-mono tracking-tight text-white">
                  {countdown.isOvertime
                    ? `+${countdown.overtimeMinutes}m`
                    : `${countdown.remainingMinutes}m ${String(countdown.remainingSeconds).padStart(2, '0')}s`}
                </div>
                <div className={`text-[10px] ${countdown.isOvertime ? 'text-amber-200 font-bold' : 'text-emerald-200'}`}>
                  {countdown.isOvertime
                    ? `${countdown.elapsedMinutes}m elapsed (120m included)`
                    : `${countdown.elapsedMinutes}m elapsed of 120m`}
                </div>
              </div>
              <button
                onClick={onOpenGpsModal}
                className="px-4 py-2.5 rounded-xl bg-white text-gray-900 font-black text-xs uppercase hover:bg-gray-100 transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-[#48A6A5]" />
                <span>Track Live GPS</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Patient Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-2xl border border-gray-200 text-xs font-bold shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('available_pals')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'available_pals'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Available PALs ({availablePals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'request'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Request PAL Template</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'requests'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'matches'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Matches ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'visits'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Visits ({visits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'financials'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>$0 Cost & Benefits</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Care Profile</span>
        </button>
      </div>

      {/* =========================================================================
       * TAB 1: AVAILABLE PALS (REAL SUPABASE VERIFIED PALS DISCOVERY)
       * ========================================================================= */}
      {activeTab === 'available_pals' && (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#E85D75] tracking-wider">ACCREDITED COMPANIONS</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Available Hospital PALs</h2>
            <p className="text-xs text-gray-600">
              Only verified and active PALs who have completed background checks and hospital credentialing appear here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePals.map((pal) => (
              <div
                key={pal.id}
                className="bg-white p-6 rounded-3xl border-2 border-gray-200 hover:border-[#48A6A5] transition-all shadow-sm hover:shadow-md space-y-4 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#48A6A5]/10 text-[#48A6A5] font-black flex items-center justify-center text-base border border-[#48A6A5]/20">
                      {pal.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1F3449]">{pal.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{pal.rating || '5.0'}</span>
                        <span className="text-gray-400 font-normal">({pal.completedVisits || 0} visits)</span>
                      </div>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {pal.bio || 'Compassionate healthcare companion ready to assist with hospital navigation, waiting support, and mobility assistance.'}
                </p>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="font-bold">Availability:</span>
                    <span className="text-[#48A6A5] font-medium">{pal.availability || 'Weekdays & Weekends'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="font-bold">Languages:</span>
                    <span className="font-medium text-gray-700">{pal.languages?.join(', ') || 'English'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="font-bold">Covered Rate:</span>
                    <span className="font-bold text-emerald-700">$0 with Plan / ${(pal.hourly_rate_cents || 2600) / 100}/hr</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('request');
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Request Companion</span>
                </button>
              </div>
            ))}

            {availablePals.length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 space-y-2">
                <Users className="w-10 h-10 mx-auto text-gray-400" />
                <h3 className="font-bold text-[#1F3449]">No PALs Active for Discovery Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  PAL applications that complete hospital admin approval and email verification will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 2: REQUEST NEW PAL COMPANION
       * ========================================================================= */}
      {activeTab === 'request' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase text-[#E85D75] tracking-wider">BOOK COMPANION PAL</span>
              <h2 className="text-2xl font-black text-[#1F3449]">Schedule a Hospital Companion Pal</h2>
              <p className="text-xs text-gray-600">
                Fill out your appointment details to be paired with an accredited PAL companion.
              </p>
            </div>
            {bookingSuccess && (
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setFormError(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 self-start cursor-pointer"
              >
                + Book Another Visit
              </button>
            )}
          </div>

          {/* User Auth Reminder Banner if not signed in */}
          {!authUser && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900">Patient Authentication Required</div>
                  <div className="text-[11px] text-amber-700">Please sign in or create an account to book your hospital companion.</div>
                </div>
              </div>
              {onOpenSupabaseAuth && (
                <button
                  type="button"
                  onClick={onOpenSupabaseAuth}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
                >
                  Log In / Sign Up
                </button>
              )}
            </div>
          )}

          {/* Submission Error Banner */}
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-900">Booking Submission Error</div>
                  <div className="text-[11px] text-rose-700">{formError}</div>
                </div>
              </div>
              {formError.includes('log in') && onOpenSupabaseAuth && (
                <button
                  type="button"
                  onClick={onOpenSupabaseAuth}
                  className="px-4 py-2 rounded-xl bg-[#E85D75] hover:bg-[#E85D75]/90 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
                >
                  Log In Now
                </button>
              )}
            </div>
          )}

          {/* Success Confirmation Card */}
          {bookingSuccess && lastSubmittedRequest ? (
            <div className="bg-emerald-50/70 border-2 border-emerald-300 p-6 sm:p-8 rounded-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-950">Companion PAL Request Submitted!</h3>
                  <p className="text-xs text-emerald-800">
                    Your request has been successfully recorded in the hospital dispatch network.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Request ID</span>
                  <span className="font-mono font-bold text-gray-800">{lastSubmittedRequest.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                    {lastSubmittedRequest.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Hospital Campus</span>
                  <span className="font-bold text-[#1F3449]">{lastSubmittedRequest.hospitalName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Department / Clinic</span>
                  <span className="font-bold text-gray-800">{lastSubmittedRequest.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Appointment</span>
                  <span className="font-bold text-gray-800">
                    {lastSubmittedRequest.appointmentDate} at {lastSubmittedRequest.appointmentTime}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Campus Meeting Location</span>
                  <span className="font-medium text-gray-800">{lastSubmittedRequest.meetingLocation || lastSubmittedRequest.meetingPoint}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className="px-5 py-3 rounded-xl font-bold text-xs text-white bg-[#1F3449] hover:bg-[#1F3449]/90 transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View in My Requests ({requests.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(false);
                    setFormError(null);
                  }}
                  className="px-5 py-3 rounded-xl font-bold text-xs text-[#E85D75] bg-white border border-[#E85D75]/30 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Schedule Another Companion</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateRequest} className="space-y-4 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Gonzalez"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 234-5678"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Hospital / Medical Center</label>
                    <span className="text-[10px] text-gray-400 font-semibold">Request Pal Template</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. NYU Langone Health – Tisch Hospital"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setHospitalName('NYU Langone Health – Tisch Hospital');
                        setDepartment('Outpatient Clinic');
                        setMeetingLocation('Main Entrance – Lobby Welcome Desk');
                      }}
                      className="text-[10px] bg-gray-100 hover:bg-[#E85D75]/10 hover:text-[#E85D75] text-gray-600 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                    >
                      NYU Langone
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHospitalName('St. Jude Regional Health Center');
                        setDepartment('Cardiology Clinic');
                        setMeetingLocation('Main Entrance Valet Desk');
                      }}
                      className="text-[10px] bg-gray-100 hover:bg-[#E85D75]/10 hover:text-[#E85D75] text-gray-600 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                    >
                      St. Jude
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHospitalName('Valley Care Regional Hospital');
                        setDepartment('Orthopedic Center');
                        setMeetingLocation('North Tower Lobby Information Desk');
                      }}
                      className="text-[10px] bg-gray-100 hover:bg-[#E85D75]/10 hover:text-[#E85D75] text-gray-600 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                    >
                      Valley Care
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department / Clinic</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Outpatient Clinic, Cardiology"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Appointment Time</label>
                  <input
                    type="text"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Campus Meeting Location</label>
                <input
                  type="text"
                  required
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="e.g. Main Entrance Valet Desk"
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobility & Assistance Needs</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Wheelchair Assistance',
                    'Arm Assistance',
                    'Visual Guide',
                    'Hearing Support',
                    'Bilingual Translation',
                    'Cognitive / Anxiety Support',
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleMobilityOption(opt)}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-left cursor-pointer ${
                        selectedMobility.includes(opt)
                          ? 'bg-[#E85D75]/10 border-[#E85D75] text-[#E85D75]'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Additional Care Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for your companion..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-xs uppercase text-white bg-[#E85D75] hover:bg-[#E85D75]/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Request to Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Submit Hospital PAL Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* =========================================================================
       * TAB 3: MY REQUESTS
       * ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1F3449]">My Companion Requests</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('request')}
                className="text-xs font-bold text-[#E85D75] hover:underline cursor-pointer"
              >
                + Book Another Visit
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {requests.map((req) => {
              const session = escortSessions.find((s) => s.request_id === req.id);
              const isSessionActive = session?.status === 'in_progress';

              return (
                <div key={req.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold">Request ID: {req.id}</div>
                      <h3 className="font-bold text-base text-[#1F3449]">{req.hospitalName} - {req.department}</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        req.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'matched'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {isSessionActive && session && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {(() => {
                        const countdown = calculateEscortCountdown(session.started_at, session.included_minutes);
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${countdown.isOvertime ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping`} />
                              <div>
                                <span className={`text-xs font-bold ${countdown.isOvertime ? 'text-amber-900' : 'text-emerald-800'}`}>
                                  {countdown.isOvertime
                                    ? `Door-to-Department Escort in Overtime (+${countdown.overtimeMinutes}m)`
                                    : 'Door-to-Department 2-Hour Escort Active Now!'}
                                </span>
                                <div className="text-[11px] text-gray-500">
                                  {countdown.isOvertime
                                    ? `Elapsed: ${countdown.elapsedMinutes}m (Standard 120m exceeded • Review pending)`
                                    : `${countdown.remainingMinutes}m ${String(countdown.remainingSeconds).padStart(2, '0')}s remaining (${countdown.elapsedMinutes}m elapsed of 120m)`}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={onOpenGpsModal}
                              className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs self-start sm:self-auto"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Live GPS Tracker</span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400 font-bold block">Appointment:</span>
                      <span className="font-bold text-[#1F3449]">{req.appointmentDate} at {req.appointmentTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Meeting Location:</span>
                      <span>{req.meetingLocation || req.meetingPoint}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Assigned PAL:</span>
                      {req.assignedPal ? (
                        <span className="font-bold text-[#48A6A5]">{req.assignedPal.name}</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Matching with active PAL...</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <a
                      href={createGoogleCalendarUrl({
                        title: `Path Pal Escort at ${req.hospitalName}`,
                        description: `Hospital companion visit for ${req.patientName}. Meeting at: ${req.meetingLocation || req.meetingPoint}`,
                        location: `${req.hospitalName}, ${req.meetingLocation || req.meetingPoint}`,
                        startTime: new Date(`${req.appointmentDate}T10:00:00`),
                        endTime: new Date(`${req.appointmentDate}T12:00:00`),
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Add to Google Calendar
                    </a>
                    <button
                      onClick={() =>
                        downloadIcsFile({
                          title: `Path Pal Escort at ${req.hospitalName}`,
                          description: `Hospital companion visit for ${req.patientName}. Meeting at: ${req.meetingLocation || req.meetingPoint}`,
                          location: `${req.hospitalName}, ${req.meetingLocation || req.meetingPoint}`,
                          startTime: new Date(`${req.appointmentDate}T10:00:00`),
                          endTime: new Date(`${req.appointmentDate}T12:00:00`),
                        })
                      }
                      className="text-[11px] font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Download .iCal File
                    </button>
                  </div>
                </div>
              );
            })}

            {requests.length === 0 && (
              <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 space-y-2">
                <Calendar className="w-8 h-8 mx-auto" />
                <p>No companion requests submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 4: MATCHES
       * ========================================================================= */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">PAL Escort Matches</h2>
            <p className="text-xs text-gray-500">Confirmed companion matches for your care journeys.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Match ID</th>
                  <th className="p-4">Request Ref</th>
                  <th className="p-4">PAL ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-[#1F3449]">#{m.id}</td>
                    <td className="p-4 font-mono text-gray-500">{m.request_id}</td>
                    <td className="p-4 font-mono text-[#48A6A5]">PAL-{m.pal_id}</td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {m.matched_at ? new Date(m.matched_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {matches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No active matches recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 5: VISITS
       * ========================================================================= */}
      {activeTab === 'visits' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Hospital Visits</h2>
            <p className="text-xs text-gray-500">History and upcoming visits recorded in the care network.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visit ID</th>
                  <th className="p-4">Hospital & Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scheduled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-[#1F3449]">#{v.id}</td>
                    <td className="p-4">
                      <div className="font-bold">{v.hospital_name || 'Hospital'}</div>
                      <div className="text-gray-500 text-[11px]">{v.department || 'Outpatient'}</div>
                    </td>
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
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No visits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 6: NOTIFICATIONS (USER-SPECIFIC)
       * ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Care Alerts & Notifications</h2>
            <p className="text-xs text-gray-500">Live dispatch updates, match confirmations, and visit reminders.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${n.is_read ? 'text-gray-500' : 'text-[#1F3449]'}`}>
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span className="bg-rose-500 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkNotifRead(n.id)}
                      className="text-[11px] text-[#48A6A5] font-bold hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-400">No notifications in your feed.</div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 7: $0 COST & FINANCIALS
       * ========================================================================= */}
      {activeTab === 'financials' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">CARE BENEFITS</span>
            <h2 className="text-2xl font-black text-[#1F3449]">$0 Out-of-Pocket Hospital Escorts</h2>
            <p className="text-xs text-gray-600">
              Path Pal services are covered through partner hospital community health initiatives, Medicare Advantage, and Medicaid transportation benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="text-emerald-800 font-bold text-sm">Hospital Covered</div>
              <div className="text-2xl font-black text-emerald-700">$0.00 Copay</div>
              <p className="text-xs text-emerald-800">Directly subsidized at participating care partner health centers.</p>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="text-blue-800 font-bold text-sm">Benefit Vouchers</div>
              <div className="text-2xl font-black text-blue-700">100% Eligible</div>
              <p className="text-xs text-blue-800">Automated claims verification for mobility and translation coverage.</p>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <div className="text-purple-800 font-bold text-sm">Family Sharing</div>
              <div className="text-2xl font-black text-purple-700">Unlimited</div>
              <p className="text-xs text-purple-800">Family members can track campus arrivals and companion progress.</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 8: CARE PROFILE
       * ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#E85D75] tracking-wider">PATIENT PROFILE</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Patient Care Preferences</h2>
          </div>

          <div className="space-y-4 max-w-lg text-xs">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div><strong>Name:</strong> {patientName || 'Registered Patient'}</div>
              <div><strong>Email:</strong> {authUser?.email || 'N/A'}</div>
              <div><strong>Auth Status:</strong> {authUser ? 'Signed In (Verified)' : 'Guest / Booking Mode'}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
