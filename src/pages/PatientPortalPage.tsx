import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, MapPin, Clock, Calendar, Phone, CheckCircle2, AlertCircle, Calculator, Navigation, ShieldAlert, FileText, ChevronRight, UserCheck, Lock, Globe, Activity, Database, UserPlus } from 'lucide-react';
import { SAMPLE_HOSPITALS, SAMPLE_PALS, INITIAL_REQUESTS } from '../data/mockData';
import { PalRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';
import { getCurrentPatientUser } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';

interface PatientPortalPageProps {
  onOpenGpsModal: () => void;
  onOpenChargesModal: (tab?: 'patient_charges' | 'pal_earnings') => void;
  onOpenSupabaseAuth?: () => void;
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({
  onOpenGpsModal,
  onOpenChargesModal,
  onOpenSupabaseAuth,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'request' | 'my_escorts' | 'financials'>('request');
  const [requests, setRequests] = useState<PalRequest[]>([]);
  
  // Supabase Auth state
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUser(user);
        if (user.email) setPatientName(user.user_metadata?.full_name || user.email.split('@')[0]);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user?.email) {
        setPatientName(user.user_metadata?.full_name || user.email.split('@')[0]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Patient Form State
  const [patientName, setPatientName] = useState('Maria Santos');
  const [patientPhone, setPatientPhone] = useState('(555) 019-2834');
  const [selectedHospitalId, setSelectedHospitalId] = useState(SAMPLE_HOSPITALS[0].id);
  const [appointmentDate, setAppointmentDate] = useState('2026-08-05');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [department, setDepartment] = useState('Cardiology Clinic');
  const [meetingPoint, setMeetingPoint] = useState(SAMPLE_HOSPITALS[0].meetingPoints[0]);
  const [languagePreference, setLanguagePreference] = useState('Spanish');
  const [selectedMobility, setSelectedMobility] = useState<string[]>(['Wheelchair Assistance', 'Arm Assistance']);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const selectedHospital = SAMPLE_HOSPITALS.find((h) => h.id === selectedHospitalId) || SAMPLE_HOSPITALS[0];

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    const newReq: PalRequest = {
      id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      patientPhone,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      appointmentDate,
      appointmentTime,
      department,
      meetingPoint,
      mobilityNeeds: selectedMobility,
      languagePreference,
      status: 'matched',
      assignedPal: SAMPLE_PALS[0],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setRequests([newReq, ...requests]);
    setFormSubmitted(true);
    setActiveTab('my_escorts');
  };

  const toggleMobilityOption = (opt: string) => {
    if (selectedMobility.includes(opt)) {
      setSelectedMobility(selectedMobility.filter((m) => m !== opt));
    } else {
      setSelectedMobility([...selectedMobility, opt]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-[#1F3449]">
      
      {/* Patient Portal Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E85D75]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#E85D75] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Heart className="w-3.5 h-3.5 fill-white" />
              PATIENT & FAMILY PORTAL
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Subsidized Vouchers Available
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">
            Welcome, {authUser ? (patientName || authUser.email) : 'Maria Santos'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Book compassionate companion escorts for hospital appointments, track your assigned Pal live on campus, and view your care benefits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          {onOpenSupabaseAuth && (
            <button
              onClick={onOpenSupabaseAuth}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs uppercase px-4 py-3 rounded-xl border border-emerald-300 flex items-center gap-2 shadow-sm transition-all"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{authUser ? 'Supabase Account' : 'Patient Sign Up / Login'}</span>
            </button>
          )}

          <button
            onClick={onOpenGpsModal}
            className="bg-gray-50 hover:bg-gray-100 text-[#48A6A5] font-bold text-xs uppercase px-4 py-3 rounded-xl border border-[#48A6A5]/30 flex items-center gap-2 shadow-sm"
          >
            <Navigation className="w-4 h-4 text-[#48A6A5]" />
            <span>Track Live GPS</span>
          </button>
        </div>
      </div>

      {/* Patient Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 text-xs font-bold shadow-sm">
        <button
          onClick={() => setActiveTab('request')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'request'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Request New Pal</span>
        </button>

        <button
          onClick={() => setActiveTab('my_escorts')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'my_escorts'
              ? 'bg-[#E85D75] text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#48A6A5]" />
          <span>My Scheduled Visits{requests.length > 0 ? ` (${requests.length})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'financials'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-700 hover:text-[#1F3449] hover:bg-gray-100'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-300" />
          <span>$0 Cost & Benefit Vouchers</span>
        </button>
      </div>

      {/* TAB 1: REQUEST NEW COMPANION PAL */}
      {activeTab === 'request' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-[#E85D75] tracking-wider">BOOK COMPANION PAL</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Schedule a Hospital Companion Pal</h2>
            <p className="text-xs text-gray-600">
              Fill out your visit details. We match you with an accredited, background-checked Community Health Worker or Pal.
            </p>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('patientName')}</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('phoneLabel')}</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('hospitalLabel')}</label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => {
                      setSelectedHospitalId(e.target.value);
                      const h = SAMPLE_HOSPITALS.find((x) => x.id === e.target.value);
                      if (h) setMeetingPoint(h.meetingPoints[0]);
                    }}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    {SAMPLE_HOSPITALS.map((h) => (
                      <option key={h.id} value={h.id} className="bg-white text-[#1F3449]">
                        {h.name} ({h.city}, {h.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Clinic / Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    {selectedHospital.departments.map((d) => (
                      <option key={d} value={d} className="bg-white text-[#1F3449]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Appointment Time</label>
                  <input
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Language</label>
                  <select
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    <option value="English" className="bg-white text-[#1F3449]">English</option>
                    <option value="Spanish" className="bg-white text-[#1F3449]">Spanish (Español)</option>
                    <option value="Hindi" className="bg-white text-[#1F3449]">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Meeting Point at Campus</label>
                <select
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white border border-gray-300 text-[#1F3449] focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                >
                  {selectedHospital.meetingPoints.map((mp) => (
                    <option key={mp} value={mp} className="bg-white text-[#1F3449]">
                      📍 {mp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Accommodations Needed</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Wheelchair Pal Assistance', 'Arm Assistance', 'Visual Aid', 'Anxiety Reassurance'].map((opt) => (
                    <label key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedMobility.includes(opt) ? 'bg-[#E85D75]/15 border-[#E85D75] text-[#1F3449]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                      <input
                        type="checkbox"
                        checked={selectedMobility.includes(opt)}
                        onChange={() => toggleMobilityOption(opt)}
                        className="rounded text-[#E85D75] focus:ring-[#E85D75]"
                      />
                      <span className="font-bold">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-black uppercase text-white bg-[#E85D75] hover:bg-[#E85D75]/90 py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Submit Pal Request</span>
              </button>
            </form>
          </div>
      )}

      {/* TAB 2: MY SCHEDULED ESCORTS */}
      {activeTab === 'my_escorts' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">SCHEDULED VISITS</span>
              <h2 className="text-2xl font-black text-[#1F3449]">Your Upcoming Companion Visits</h2>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              {requests.length} Active Pal {requests.length === 1 ? 'Visit' : 'Visits'}
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-10 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#48A6A5]/10 text-[#48A6A5] flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-[#1F3449]">No Scheduled Visits</h3>
                <p className="text-xs text-gray-600">
                  You do not have any upcoming companion visits scheduled. Submit a request to pair with a verified Pal for your next hospital visit.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('request')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E85D75] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#E85D75]/90 transition-all shadow-md"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Request a Companion Pal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-2.5 py-0.5 rounded border border-[#48A6A5]/30">
                        {req.id}
                      </span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded">
                        MATCHED & CONFIRMED
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#1F3449]">{req.hospitalName}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 font-medium">
                      <span className="flex items-center gap-1.5 text-[#E85D75] font-bold">
                        <Clock className="w-4 h-4" /> {req.appointmentDate} at {req.appointmentTime}
                      </span>
                      <span className="flex items-center gap-1.5 text-[#48A6A5]">
                        <MapPin className="w-4 h-4" /> Meeting: {req.meetingPoint}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-10 h-10 rounded-full bg-[#E85D75] text-white font-black flex items-center justify-center text-sm shadow-sm">
                        {req.assignedPal?.name.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1F3449]">Assigned Pal: {req.assignedPal?.name || 'Elena Rostova'}</div>
                        <div className="text-[11px] text-gray-500">Badge #{req.assignedPal?.badgeNumber || 'PAL-8802'} • CPR & CHW Certified</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 self-stretch md:self-center">
                    <button
                      onClick={() => {
                        const gCalUrl = createGoogleCalendarUrl({
                          title: `PathPal Companion Visit: ${req.hospitalName}`,
                          description: `Scheduled PathPal companion visit at ${req.hospitalName} (${req.department}). Assigned Pal: ${req.assignedPal?.name || 'Elena Rostova'}. Meeting Point: ${req.meetingPoint}.`,
                          location: `${req.hospitalName}, ${req.meetingPoint}`,
                          startTime: new Date(`${req.appointmentDate}T10:00:00`),
                          endTime: new Date(`${req.appointmentDate}T12:00:00`),
                          reminderMinutesBefore: [1440, 120, 30]
                        });
                        window.open(gCalUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#48A6A5] border border-[#48A6A5]/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                      title="Add appointment to Google Calendar"
                    >
                      <Calendar className="w-4 h-4 text-[#48A6A5]" />
                      <span>Sync Calendar</span>
                    </button>
                    <button
                      onClick={onOpenGpsModal}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#48A6A5] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-[#48A6A5]/90 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Track Pal Live GPS</span>
                    </button>
                    <a
                      href="tel:18007284725"
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#1F3449] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-gray-300 shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Pal</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FINANCIALS & VOUCHERS */}
      {activeTab === 'financials' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-lg">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">ZERO HIDDEN FEES</span>
            <h2 className="text-2xl font-black text-[#1F3449]">$0 Out-Of-Pocket Benefit Voucher Coverage</h2>
            <p className="text-xs text-gray-600">
              PathPal is covered under health benefit vouchers and hospital community assistance programs for eligible patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-700">BENEFIT VOUCHER PROGRAM</span>
              <h3 className="text-xl font-black text-[#1F3449]">100% Covered</h3>
              <p className="text-xs text-gray-600">
                Covers non-clinical navigation, appointment accompaniment, and language translation support.
              </p>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-700">STATE HEALTH PLAN BENEFIT</span>
              <h3 className="text-xl font-black text-[#1F3449]">$0 Patient Copay</h3>
              <p className="text-xs text-gray-600">
                Direct community health worker reimbursement ensures eligible patients pay zero dollars out of pocket.
              </p>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-700">HOSPITAL COMMUNITY BENEFIT</span>
              <h3 className="text-xl font-black text-[#1F3449]">CHNA Sponsored</h3>
              <p className="text-xs text-gray-600">
                Hospitals sponsor escort credits to reduce no-shows and improve patient HCAHPS care ratings.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenChargesModal('patient_charges')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Patient Charges & Subsidy Calculator</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
