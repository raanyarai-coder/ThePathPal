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
} from 'lucide-react';
import { SAMPLE_HOSPITALS, INITIAL_REQUESTS, SAMPLE_PALS } from '../data/mockData';
import { PalRequest, PalApplication, Pal } from '../types';
import { fetchPalApplications, approvePalApplication } from '../lib/supabase';

export const HospitalPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'applications' | 'pals'>('dispatch');
  const [requests, setRequests] = useState<PalRequest[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Applications state
  const [applications, setApplications] = useState<PalApplication[]>([]);
  const [approvedLinks, setApprovedLinks] = useState<{ [key: string]: string }>({});
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Pals list state
  const [palsList, setPalsList] = useState<Pal[]>(SAMPLE_PALS);

  useEffect(() => {
    loadApplications();
    loadPals();
  }, []);

  const loadApplications = async () => {
    const apps = await fetchPalApplications();
    setApplications(apps);
  };

  const loadPals = () => {
    try {
      const stored = localStorage.getItem('pathpal_pals_records');
      if (stored) {
        setPalsList(JSON.parse(stored));
      }
    } catch {
      setPalsList(SAMPLE_PALS);
    }
  };

  const handleApprove = async (appId: string) => {
    const res = await approvePalApplication(appId, 'Approved by Chief Medical Officer / Care Coordinator');
    if (res.data) {
      setApprovedLinks((prev) => ({
        ...prev,
        [appId]: res.data!.signupLink,
      }));
      await loadApplications();
      loadPals();
    }
  };

  const handleCopyLink = (appId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedAppId(appId);
    setTimeout(() => setCopiedAppId(null), 2500);
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery) {
      return (
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-[#1F3449]">
      {/* Hospital Portal Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#48A6A5]/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#48A6A5] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Building2 className="w-3.5 h-3.5" />
              HOSPITAL ADMIN HUB
            </span>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-3 py-1 rounded-full border border-[#48A6A5]/30 font-mono">
              Site License #HOSP-9901 Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">Metro Health Medical Center</h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Real-time companion dispatch oversight, campus wait-time optimization, Pal applicant onboarding & approval gate, and credentialing.
          </p>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'dispatch'
                  ? 'bg-[#48A6A5] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dispatch Table
            </button>
            <button
              onClick={() => {
                setActiveTab('applications');
                loadApplications();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'applications'
                  ? 'bg-[#48A6A5] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Pal Applications & Approvals</span>
              {applications.filter((a) => a.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {applications.filter((a) => a.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('pals');
                loadPals();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'pals'
                  ? 'bg-[#48A6A5] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Database `pals` Table Status</span>
            </button>
          </div>
        </div>

        {/* Generated Hospital Command Center Preview Photo */}
        <div className="w-full lg:w-80 h-48 rounded-2xl overflow-hidden border-2 border-[#48A6A5]/40 shadow-xl relative group shrink-0">
          <img
            src={new URL('../assets/images/hospital_coordination_center_1785710719570.jpg', import.meta.url).href}
            alt="PathPal Hospital Command Center"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-2 left-3 right-3 text-xs flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#48A6A5] bg-black/60 px-2 py-0.5 rounded border border-[#48A6A5]/40">
              LIVE DISPATCH CENTER
            </span>
            <span className="text-[10px] font-mono text-emerald-400">24 Active Stations</span>
          </div>
        </div>
      </div>

      {/* Hospital Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Today</span>
          <div className="text-3xl font-black text-[#E85D75]">24 Pals Active</div>
          <span className="text-[10px] font-bold text-emerald-600">100% Pal Covered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Match Speed</span>
          <div className="text-3xl font-black text-[#48A6A5]">3.2 Mins</div>
          <span className="text-[10px] font-bold text-gray-600">Target: &lt; 5 mins</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pal Applications</span>
          <div className="text-3xl font-black text-[#1F3449]">{applications.length} Total</div>
          <span className="text-[10px] font-bold text-amber-600 font-mono">
            {applications.filter((a) => a.status === 'pending').length} Pending Approval
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Schedule H CHNA</span>
          <div className="text-3xl font-black text-[#1F3449]">1,240 Hrs</div>
          <span className="text-[10px] font-bold text-[#48A6A5]">Tax-Exempt Credit Approved</span>
        </div>
      </div>

      {/* TAB 1: Dispatch Table */}
      {activeTab === 'dispatch' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">DISPATCH LOG</span>
              <h2 className="text-2xl font-black text-[#1F3449]">Live Campus Companion Dispatch Table</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search patient or clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-[#1F3449] focus:outline-none focus:ring-2 focus:ring-[#48A6A5]"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-300 text-xs font-bold">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === 'all' ? 'bg-[#48A6A5] text-white font-black' : 'text-gray-700 hover:text-[#1F3449]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('matched')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === 'matched' ? 'bg-[#E85D75] text-white font-black' : 'text-gray-700 hover:text-[#1F3449]'
                  }`}
                >
                  Matched
                </button>
                <button
                  onClick={() => setFilterStatus('in_progress')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === 'in_progress' ? 'bg-[#48A6A5] text-white font-black' : 'text-gray-700 hover:text-[#1F3449]'
                  }`}
                >
                  Active
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase font-black text-[10px]">
                  <th className="p-3">Req ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Department / Clinic</th>
                  <th className="p-3">Campus Gate Spot</th>
                  <th className="p-3">Assigned Companion</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#48A6A5]">{req.id}</td>
                    <td className="p-3 font-bold text-[#1F3449]">{req.patientName}</td>
                    <td className="p-3 text-gray-600">{req.department}</td>
                    <td className="p-3 text-gray-500">{req.meetingPoint}</td>
                    <td className="p-3 font-bold text-[#E85D75]">
                      {req.assignedPal ? `${req.assignedPal.name} (#${req.assignedPal.badgeNumber})` : 'Unassigned'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'matched'
                            ? 'bg-[#E85D75]/15 text-[#E85D75] border border-[#E85D75]/30'
                            : req.status === 'in_progress'
                            ? 'bg-[#48A6A5]/15 text-[#48A6A5] border border-[#48A6A5]/30'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Pal Applications & Approvals */}
      {activeTab === 'applications' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">ONBOARDING PIPELINE</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Pal Applications & Signup Approval Gate</h2>
            <p className="text-xs text-gray-600 mt-1">
              Applications submitted through the Pal portal are stored in <code>pal_applications</code>. Approving an applicant authorizes them to register their Supabase Auth account.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase font-black text-[10px]">
                  <th className="p-3">App ID</th>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Email / Phone</th>
                  <th className="p-3">Languages / Specialties</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action & Signup Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const signupLink =
                    approvedLinks[app.id] || `${window.location.origin}/#pal-signup?app_id=${app.id}`;
                  const isApproved = app.status === 'approved';

                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#48A6A5]">{app.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-[#1F3449]">{app.full_name}</div>
                        <div className="text-[10px] text-gray-500 line-clamp-1">{app.bio}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-gray-800">{app.email}</div>
                        <div className="text-[10px] text-gray-500">{app.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-700">{app.languages}</div>
                        <div className="text-[10px] text-gray-500">{app.specialties}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {!isApproved ? (
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="px-3 py-1.5 bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Applicant</span>
                          </button>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyLink(app.id, signupLink)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold border border-gray-300 flex items-center gap-1"
                              >
                                {copiedAppId === app.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-gray-500" />
                                    <span>Copy Signup Link</span>
                                  </>
                                )}
                              </button>
                              <a
                                href={`#pal-signup?app_id=${app.id}`}
                                className="px-2.5 py-1 bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                              >
                                <span>Open Signup</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              #pal-signup?app_id={app.id}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Database Pals Table Status */}
      {activeTab === 'pals' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">DATABASE SYNCHRONIZATION</span>
            <h2 className="text-2xl font-black text-[#1F3449]">`pals` Table Live Records</h2>
            <p className="text-xs text-gray-600 mt-1">
              Shows records in the <code>pals</code> database table, including linked <code>auth_user_id</code> and verification status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase font-black text-[10px]">
                  <th className="p-3">Badge & Pal ID</th>
                  <th className="p-3">Companion Name</th>
                  <th className="p-3">Linked Supabase Auth UID</th>
                  <th className="p-3">Email Verified</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Affiliation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {palsList.map((pal) => (
                  <tr key={pal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#48A6A5]">{pal.badgeNumber}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{pal.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#1F3449]">{pal.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{pal.email || 'No email attached'}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-gray-600">
                      {pal.auth_user_id ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {pal.auth_user_id.slice(0, 16)}...
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unlinked (Awaiting verification)</span>
                      )}
                    </td>
                    <td className="p-3">
                      {pal.email_verified || pal.isVerified ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          UNVERIFIED
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          pal.account_status === 'active' || pal.isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pal.account_status || 'active'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{pal.hospitalAffiliations.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

