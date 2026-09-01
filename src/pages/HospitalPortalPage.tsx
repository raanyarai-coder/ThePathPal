import React, { useState, useEffect } from 'react';
import {
  Building2,
  BarChart3,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Users,
  Search,
  Filter,
  FileText,
  ChevronRight,
  Award,
  UserCheck,
  Check,
  ExternalLink,
  Copy,
  Mail,
  Lock,
  LogOut,
  Key,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Radio,
  MapPin,
  HeartHandshake,
  Activity,
  Phone,
  Calendar,
  Layers,
  DollarSign,
  Star,
  Receipt,
  CreditCard,
  MessageSquare,
  Hospital,
  Bell,
  Navigation,
  CheckSquare,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  PalRequest,
  PalApplication,
  Pal,
  Patient,
  Match,
  HospitalVisit,
  Membership,
  Payment,
  Payout,
  Review,
  HospitalInquiry,
  Notification,
  AdminUser,
} from '../types';
import { LiveLocationMap } from '../components/map/LiveLocationMap';
import {
  fetchPalApplications,
  approvePalApplication,
  rejectPalApplication,
  fetchAllPals,
  fetchVerifiedPals,
  fetchAllPatients,
  fetchPalRequests,
  fetchAllMatches,
  fetchAllHospitalVisits,
  fetchAllMemberships,
  fetchAllPayments,
  fetchAllPayouts,
  fetchAllReviews,
  fetchHospitalInquiries,
  fetchAllNotifications,
  fetchActiveLocationSessions,
  fetchAdminDashboardStats,
  AdminDashboardMetrics,
  maskSSN,
  loginAdmin,
  validateAdminSession,
  signOutAdmin,
} from '../lib/supabase';

export const HospitalPortalPage: React.FC = () => {
  // Admin Authentication State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Portal Tab Navigation
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'applications'
    | 'verified_pals'
    | 'all_pals'
    | 'patients'
    | 'requests'
    | 'matches'
    | 'visits'
    | 'memberships'
    | 'payments'
    | 'payouts'
    | 'reviews'
    | 'inquiries'
    | 'notifications'
    | 'dispatch'
  >('dashboard');

  // Real Database State
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [applications, setApplications] = useState<PalApplication[]>([]);
  const [verifiedPals, setVerifiedPals] = useState<Pal[]>([]);
  const [allPalsList, setAllPalsList] = useState<Pal[]>([]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [requestsList, setRequestsList] = useState<PalRequest[]>([]);
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [visitsList, setVisitsList] = useState<HospitalVisit[]>([]);
  const [membershipsList, setMembershipsList] = useState<Membership[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [payoutsList, setPayoutsList] = useState<Payout[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [inquiriesList, setInquiriesList] = useState<HospitalInquiry[]>([]);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [activeGpsSessions, setActiveGpsSessions] = useState<any[]>([]);
  const [selectedGpsSession, setSelectedGpsSession] = useState<any | null>(null);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [palFilterStatus, setPalFilterStatus] = useState('all');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selected Detail & Security View State
  const [selectedApp, setSelectedApp] = useState<PalApplication | null>(null);
  const [revealedSsns, setRevealedSsns] = useState<{ [appId: string]: boolean }>({});
  const [approvedLinks, setApprovedLinks] = useState<{ [key: string]: string }>({});
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Strict Admin Session Check on Startup
  useEffect(() => {
    const verifySession = async () => {
      setIsCheckingAuth(true);
      try {
        const admin = await validateAdminSession();
        if (admin) {
          setAdminUser(admin);
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        setAdminUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifySession();
  }, []);

  // Fetch Live Database Data upon Admin Verification
  useEffect(() => {
    if (adminUser) {
      loadAllAdminData();
    }
  }, [adminUser]);

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    setActionMessage(null);
    try {
      const [
        stats,
        apps,
        vPals,
        aPals,
        patients,
        reqs,
        matches,
        visits,
        memberships,
        payments,
        payouts,
        reviews,
        inquiries,
        notifs,
        gpsSessions,
      ] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchPalApplications(),
        fetchVerifiedPals(true),
        fetchAllPals(true),
        fetchAllPatients(),
        fetchPalRequests(),
        fetchAllMatches(),
        fetchAllHospitalVisits(),
        fetchAllMemberships(),
        fetchAllPayments(),
        fetchAllPayouts(),
        fetchAllReviews(),
        fetchHospitalInquiries(),
        fetchAllNotifications(),
        fetchActiveLocationSessions(),
      ]);

      setMetrics(stats);
      setApplications(apps);
      setVerifiedPals(vPals);
      setAllPalsList(aPals);
      setPatientsList(patients);
      setRequestsList(reqs);
      setMatchesList(matches);
      setVisitsList(visits);
      setMembershipsList(memberships);
      setPaymentsList(payments);
      setPayoutsList(payouts);
      setReviewsList(reviews);
      setInquiriesList(inquiries);
      setNotificationsList(notifs);
      setActiveGpsSessions(gpsSessions);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await loginAdmin(loginEmail, loginPassword);

      if (res.error) {
        setLoginError(res.error.message);
        setIsLoggingIn(false);
        return;
      }

      if (res.data?.adminUser) {
        setAdminUser(res.data.adminUser);
        setLoginPassword('');
        setLoginEmail('');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminSignOut = async () => {
    await signOutAdmin();
    setAdminUser(null);
  };

  const handleApprove = async (app: PalApplication) => {
    try {
      const res = await approvePalApplication(app.id, `Approved by ${adminUser?.name || 'Admin'}`);
      if (res.data?.signupLink) {
        setApprovedLinks((prev) => ({
          ...prev,
          [app.id]: res.data!.signupLink,
        }));
        setActionMessage(`Application for ${app.name} approved successfully!`);
      }
      await loadAllAdminData();
    } catch (e: any) {
      alert(e?.message || 'Error approving application');
    }
  };

  const handleReject = async (appId: string) => {
    if (!confirm('Are you sure you want to reject this PAL application?')) return;
    try {
      const res = await rejectPalApplication(appId, `Rejected by ${adminUser?.name || 'Admin'}`);
      if (res.success) {
        setActionMessage('Application rejected.');
        await loadAllAdminData();
      }
    } catch (e: any) {
      alert(e?.message || 'Error rejecting application');
    }
  };

  const toggleSsnReveal = (appId: string) => {
    setRevealedSsns((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const handleCopyLink = (appId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedAppId(appId);
    setTimeout(() => setCopiedAppId(null), 3000);
  };

  // 1. Loading Verification State
  if (isCheckingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1F3449] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-[#1F3449]">Verifying Administrative Credentials...</h2>
        <p className="text-xs text-gray-500">Checking database roles and authorization tables.</p>
      </div>
    );
  }

  // 2. Unauthenticated Admin Login Screen
  if (!adminUser) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 animate-fade-in text-[#1F3449]">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-gray-200 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#1F3449] text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F3449]">Hospital & Admin Portal</h1>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Authorized access only. Sign in with verified administrative credentials registered in public.admin_users.
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium">{loginError}</div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@hospital.org"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F3449] focus:outline-none bg-gray-50 pl-10"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-gray-500 hover:text-[#1F3449] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1F3449] focus:outline-none bg-gray-50 pl-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#1F3449] hover:bg-[#1F3449]/90 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Admin Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Database role verification enforced on every session. SSN, credentials, and dispatch queues are restricted to confirmed hospital administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Portal View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-[#1F3449]">
      
      {/* Top Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#1F3449] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Building2 className="w-3.5 h-3.5" />
              HOSPITAL & CARE NETWORK ADMIN
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Active Admin: {adminUser.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F3449]">
            Administrative Operations & Credentialing
          </h1>
          <p className="text-xs text-gray-500">
            Authenticated via Supabase Auth ({adminUser.email}) • Badge: {adminUser.badgeNumber || 'ADM-001'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadAllAdminData}
            disabled={isLoadingData}
            className="bg-gray-100 hover:bg-gray-200 text-[#1F3449] font-bold text-xs uppercase px-4 py-3 rounded-xl border border-gray-300 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleAdminSignOut}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase px-4 py-3 rounded-xl border border-rose-200 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'dashboard' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 relative ${
            activeTab === 'applications' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>PAL Applications</span>
          {metrics && metrics.pendingPalApplications > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {metrics.pendingPalApplications}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('verified_pals')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'verified_pals' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Verified PALs ({verifiedPals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_pals')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'all_pals' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>All PALs ({allPalsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'patients' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patients ({patientsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'requests' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>PAL Requests ({requestsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'matches' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Matches ({matchesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'visits' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Visits ({visitsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('memberships')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'memberships' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Memberships ({membershipsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'payments' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payments ({paymentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'payouts' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payouts ({payoutsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'reviews' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews ({reviewsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'inquiries' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital Inquiries ({inquiriesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'notifications' ? 'bg-[#1F3449] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notificationsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'dispatch' ? 'bg-[#48A6A5] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Dispatch Radar ({activeGpsSessions.length})</span>
        </button>
      </div>

      {/* =========================================================================
       * TAB 1: DASHBOARD (REAL DATABASE METRICS)
       * ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1F3449]">Operations Health & Entity Counters</h2>
            <span className="text-xs text-gray-500">Real-time counts directly from Supabase DB</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">PAL Applications</div>
              <div className="text-3xl font-black text-[#1F3449]">{metrics?.totalPalApplications ?? 0}</div>
              <div className="text-[11px] text-amber-600 font-semibold">{metrics?.pendingPalApplications ?? 0} Pending Review</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Verified PALs</div>
              <div className="text-3xl font-black text-emerald-600">{metrics?.verifiedPals ?? 0}</div>
              <div className="text-[11px] text-gray-500">{metrics?.totalPals ?? 0} Total in Database</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Registered Patients</div>
              <div className="text-3xl font-black text-[#48A6A5]">{metrics?.totalPatients ?? 0}</div>
              <div className="text-[11px] text-gray-500">Active accounts</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Open Requests</div>
              <div className="text-3xl font-black text-rose-600">{metrics?.openPalRequests ?? 0}</div>
              <div className="text-[11px] text-gray-500">Awaiting assignment</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Active Matches</div>
              <div className="text-3xl font-black text-indigo-600">{metrics?.activeMatches ?? 0}</div>
              <div className="text-[11px] text-gray-500">In progress / accepted</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Hospital Visits</div>
              <div className="text-3xl font-black text-[#1F3449]">{metrics?.hospitalVisits ?? 0}</div>
              <div className="text-[11px] text-gray-500">Completed & scheduled</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Active Memberships</div>
              <div className="text-3xl font-black text-purple-600">{metrics?.memberships ?? 0}</div>
              <div className="text-[11px] text-gray-500">Family & patient plans</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Payments Recorded</div>
              <div className="text-3xl font-black text-teal-600">{metrics?.payments ?? 0}</div>
              <div className="text-[11px] text-gray-500">Processed invoices</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Pal Payouts</div>
              <div className="text-3xl font-black text-blue-600">{metrics?.payouts ?? 0}</div>
              <div className="text-[11px] text-gray-500">Disbursements</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Live GPS Sessions</div>
              <div className="text-3xl font-black text-rose-500">{metrics?.activeGpsSessions ?? 0}</div>
              <div className="text-[11px] text-gray-500">Streaming coordinates</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 2: PAL APPLICATIONS (WITH MASKED SSN & APPROVAL WORKFLOW)
       * ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#1F3449]">PAL Screening & Applications</h2>
              <p className="text-xs text-gray-500">
                Review applicant identity submissions, verify SSN compliance, and authorize signups.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs p-2.5 pl-8 rounded-xl border border-gray-300 bg-white"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Applicant Name</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">SSN (Masked)</th>
                    <th className="p-4">Languages</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
                  {applications
                    .filter((app) => {
                      if (filterStatus !== 'all' && app.status !== filterStatus) return false;
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        app.name.toLowerCase().includes(q) ||
                        app.email.toLowerCase().includes(q) ||
                        app.phone.includes(q)
                      );
                    })
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#1F3449]">{app.name}</div>
                          <div className="text-[11px] text-gray-500">ID: {app.id}</div>
                        </td>
                        <td className="p-4">
                          <div>{app.email}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{app.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                              {revealedSsns[app.id] && app.ssn ? app.ssn : maskSSN(app.ssn)}
                            </span>
                            {app.ssn && (
                              <button
                                onClick={() => toggleSsnReveal(app.id)}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
                                title={revealedSsns[app.id] ? 'Mask SSN' : 'Reveal SSN (Admin)'}
                              >
                                {revealedSsns[app.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-200">
                            {app.languages || 'English'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : app.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {new Date(app.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(app)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-rose-300 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            <span className="text-emerald-700 font-bold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {applications.length === 0 && (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto" />
                  <p>No PAL applications found in database.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: VERIFIED PALS (ACTIVATED ACCOUNTS WITH AUTH_USER_ID)
       * ========================================================================= */}
      {activeTab === 'verified_pals' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Verified & Active PAL Roster</h2>
            <p className="text-xs text-gray-500">
              PALs who have completed email confirmation and have linked Supabase authentication records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedPals.map((pal) => (
              <div key={pal.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#48A6A5]/10 text-[#48A6A5] font-black flex items-center justify-center text-sm border border-[#48A6A5]/20">
                      {pal.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1F3449]">{pal.name}</h3>
                      <p className="text-[11px] text-gray-500">{pal.badgeNumber || `PAL-${pal.id}`}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300">
                    VERIFIED
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{pal.bio || 'Hospital companion ready for dispatches.'}</p>

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Rating:</span>
                    <span className="font-bold text-[#1F3449]">★ {pal.rating || '5.0'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Visits:</span>
                    <span className="font-bold text-[#1F3449]">{pal.completedVisits || 0} completed</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Rate:</span>
                    <span className="font-bold text-[#1F3449]">${((pal.hourly_rate_cents || 2600) / 100).toFixed(2)}/hr</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Languages:</span>
                    <span className="font-semibold text-gray-700">{pal.languages?.join(', ') || 'English'}</span>
                  </div>
                </div>
              </div>
            ))}

            {verifiedPals.length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-400 space-y-2 bg-white rounded-2xl border border-gray-200">
                <Award className="w-8 h-8 mx-auto" />
                <p>No verified PALs found with active auth linking.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 4: ALL PALS DIRECTORY
       * ========================================================================= */}
      {activeTab === 'all_pals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1F3449]">All PAL Records</h2>
              <p className="text-xs text-gray-500">All registered records in public.pals table.</p>
            </div>
            <select
              value={palFilterStatus}
              onChange={(e) => setPalFilterStatus(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
            >
              <option value="all">All PALs</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">PAL Name & ID</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Auth Linked</th>
                  <th className="p-4">Background Status</th>
                  <th className="p-4">Hourly Rate</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {allPalsList
                  .filter((p) => {
                    if (palFilterStatus === 'verified') return p.isVerified || Boolean(p.auth_user_id);
                    if (palFilterStatus === 'unverified') return !p.isVerified && !p.auth_user_id;
                    return true;
                  })
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-[#1F3449]">{p.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{p.badgeNumber || `ID: ${p.id}`}</div>
                      </td>
                      <td className="p-4 font-mono">{p.phone || 'N/A'}</td>
                      <td className="p-4">
                        {p.auth_user_id ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                            Linked ({p.auth_user_id.slice(0, 6)}...)
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                            Unlinked
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {p.background_check_status || 'cleared'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#1F3449]">
                        ${((p.hourly_rate_cents || 2600) / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(p.created_at || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 5: PATIENTS DIRECTORY
       * ========================================================================= */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Registered Patients</h2>
            <p className="text-xs text-gray-500">Patient accounts stored in public.patients table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Auth User ID</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {patientsList.map((pt) => (
                  <tr key={pt.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-[#1F3449]">{pt.name}</td>
                    <td className="p-4">
                      <div>{pt.email || 'N/A'}</div>
                      <div className="text-gray-500 font-mono text-[11px]">{pt.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-mono text-gray-400 text-[11px]">
                      {pt.auth_user_id ? `${pt.auth_user_id.slice(0, 8)}...` : 'N/A'}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(pt.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {patientsList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No patient accounts recorded in database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 6: PAL REQUESTS
       * ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Patient Companion Requests</h2>
            <p className="text-xs text-gray-500">All booking requests loaded from public.pal_requests table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Hospital & Clinic</th>
                  <th className="p-4">Appointment</th>
                  <th className="p-4">Meeting Point</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned PAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {requestsList.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-[#1F3449]">{req.patientName}</div>
                      <div className="text-gray-400 text-[11px]">{req.patientPhone}</div>
                    </td>
                    <td className="p-4">
                      <div>{req.hospitalName}</div>
                      <div className="text-gray-500 text-[11px]">{req.department}</div>
                    </td>
                    <td className="p-4">
                      <div>{req.appointmentDate}</div>
                      <div className="text-gray-500 text-[11px]">{req.appointmentTime}</div>
                    </td>
                    <td className="p-4 text-gray-600">{req.meetingPoint}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'matched'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {req.assignedPal ? (
                        <div className="font-bold text-[#48A6A5]">{req.assignedPal.name}</div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 7: MATCHES
       * ========================================================================= */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">PAL Assignment Matches</h2>
            <p className="text-xs text-gray-500">Live records from public.matches table (ID: INTEGER).</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Match ID</th>
                  <th className="p-4">Request Ref</th>
                  <th className="p-4">PAL ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Matched Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {matchesList.map((m) => (
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
                {matchesList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No matches records currently in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 8: HOSPITAL VISITS
       * ========================================================================= */}
      {activeTab === 'visits' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Hospital Visits & Dispatches</h2>
            <p className="text-xs text-gray-500">Records from public.hospital_visits table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visit ID</th>
                  <th className="p-4">Hospital & Dept</th>
                  <th className="p-4">PAL ID / Patient ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scheduled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {visitsList.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-[#1F3449]">#{v.id}</td>
                    <td className="p-4">
                      <div className="font-bold">{v.hospital_name || 'Hospital'}</div>
                      <div className="text-gray-500 text-[11px]">{v.department || 'Outpatient'}</div>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      PAL #{v.pal_id || 'N/A'} • Patient #{v.patient_id || 'N/A'}
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
                {visitsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No visits recorded in database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 9: MEMBERSHIPS
       * ========================================================================= */}
      {activeTab === 'memberships' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Patient Care Memberships</h2>
            <p className="text-xs text-gray-500">Active subscription records from public.memberships table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Membership ID</th>
                  <th className="p-4">Patient ID</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Renewal Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {membershipsList.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-[#1F3449]">#{m.id}</td>
                    <td className="p-4 font-mono">Patient #{m.patient_id}</td>
                    <td className="p-4 font-bold text-[#48A6A5]">{m.plan_name}</td>
                    <td className="p-4 font-bold text-[#1F3449]">
                      ${((m.price_cents || 0) / 100).toFixed(2)}/mo
                    </td>
                    <td className="p-4">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {m.renewal_date ? new Date(m.renewal_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {membershipsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No membership records in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 10: PAYMENTS
       * ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Invoiced Payments</h2>
            <p className="text-xs text-gray-500">Transaction records from public.payments table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Patient ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {paymentsList.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-[#1F3449]">#{p.id}</td>
                    <td className="p-4 font-mono">Patient #{p.patient_id || 'N/A'}</td>
                    <td className="p-4 font-bold text-emerald-600">
                      ${((p.amount_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-600">{p.description || 'Companion visit fee'}</td>
                    <td className="p-4">
                      <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {paymentsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No payment records in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 11: PAYOUTS
       * ========================================================================= */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">PAL Disbursements & Payouts</h2>
            <p className="text-xs text-gray-500">Records from public.payouts table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Payout ID</th>
                  <th className="p-4">PAL ID</th>
                  <th className="p-4">Disbursement Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {payoutsList.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-[#1F3449]">#{po.id}</td>
                    <td className="p-4 font-mono text-[#48A6A5]">PAL #{po.pal_id}</td>
                    <td className="p-4 font-bold text-blue-600">
                      ${((po.amount_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {po.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {po.period_start ? `${new Date(po.period_start).toLocaleDateString()} - ${new Date(po.period_end || po.created_at).toLocaleDateString()}` : new Date(po.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {payoutsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No payout records in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 12: REVIEWS
       * ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Patient Ratings & Feedback</h2>
            <p className="text-xs text-gray-500">Review submissions from public.reviews table.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviewsList.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="ml-1 text-[#1F3449]">({r.rating}/5)</span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-700 italic">"{r.comment || 'Wonderful hospital accompaniment.'}"</p>
                <div className="text-[11px] text-gray-500 font-semibold pt-1 border-t border-gray-100 flex justify-between">
                  <span>PAL: {r.pal_name || `PAL #${r.pal_id}`}</span>
                  <span>Patient: {r.patient_name || `Patient #${r.patient_id}`}</span>
                </div>
              </div>
            ))}
            {reviewsList.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
                No patient reviews recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 13: HOSPITAL INQUIRIES
       * ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">Hospital Partnership Inquiries</h2>
            <p className="text-xs text-gray-500">Direct inquiries from healthcare systems via public.hospital_inquiries.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Hospital System</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Est. Annual Dispatches</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                {inquiriesList.map((inq) => (
                  <tr key={inq.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-[#1F3449]">{inq.hospital_name}</td>
                    <td className="p-4">
                      <div>{inq.contact_name}</div>
                      <div className="text-gray-400 text-[11px]">{inq.contact_email}</div>
                    </td>
                    <td className="p-4 font-bold text-[#48A6A5]">
                      {inq.estimated_annual_dispatches ? `${inq.estimated_annual_dispatches.toLocaleString()} visits` : 'N/A'}
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{inq.notes || 'N/A'}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {inquiriesList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No hospital inquiries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 14: NOTIFICATIONS
       * ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1F3449]">System & User Notifications</h2>
            <p className="text-xs text-gray-500">Alerts loaded from public.notifications table.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {notificationsList.map((n) => (
              <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1F3449]">{n.title}</span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                      {n.type || 'info'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{n.message}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {notificationsList.length === 0 && (
              <div className="p-8 text-center text-gray-400">No notifications in database.</div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 15: DISPATCH RADAR / LIVE GPS
       * ========================================================================= */}
      {activeTab === 'dispatch' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#1F3449]">Real-Time Dispatch & GPS Telemetry</h2>
              <p className="text-xs text-gray-500">
                Live broadcast telemetry from public.location_sessions and public.location_points.
              </p>
            </div>
            {selectedGpsSession && (
              <button
                onClick={() => setSelectedGpsSession(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Map Panel */}
            <div className="lg:col-span-2">
              <LiveLocationMap
                hospital={{
                  name: selectedGpsSession?.hospital_name || 'Hospital Main Campus',
                  address: selectedGpsSession?.hospital_address || 'Designated Hospital Meeting Entrance',
                  latitude: selectedGpsSession?.hospital_lat || 40.7421,
                  longitude: selectedGpsSession?.hospital_lng || -73.9741,
                }}
                palLocation={
                  selectedGpsSession?.last_lat && selectedGpsSession?.last_lng
                    ? {
                        latitude: selectedGpsSession.last_lat,
                        longitude: selectedGpsSession.last_lng,
                        accuracyMeters: 5,
                        recordedAt: new Date().toISOString(),
                      }
                    : null
                }
                palName={selectedGpsSession ? `PAL #${selectedGpsSession.pal_id || selectedGpsSession.id}` : 'Companion PAL'}
                height="h-96"
              />
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              <div className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Active Streaming Sessions ({activeGpsSessions.length})
              </div>

              <div className="space-y-2">
                {activeGpsSessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedGpsSession(sess)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedGpsSession?.id === sess.id
                        ? 'bg-[#48A6A5]/10 border-[#48A6A5] shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-xs text-[#1F3449]">Session #{sess.id}</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-200">
                        STREAMING
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 space-y-0.5">
                      <div><strong>PAL ID:</strong> #{sess.pal_id || sess.user_id || 'Active Pal'}</div>
                      <div><strong>Started:</strong> {new Date(sess.started_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}

                {activeGpsSessions.length === 0 && (
                  <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-200 space-y-2">
                    <Radio className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-xs">No active GPS location streaming sessions running currently.</p>
                    <p className="text-[11px] text-gray-400">PALs broadcast live coordinates during active hospital escorts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
