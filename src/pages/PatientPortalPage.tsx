import React, { useState } from 'react';
import { Heart, ShieldCheck, MapPin, Clock, Calendar, Phone, CheckCircle2, AlertCircle, Calculator, Navigation, ShieldAlert, FileText, ChevronRight, UserCheck, Lock, Globe, Activity, Video } from 'lucide-react';
import { SAMPLE_HOSPITALS, SAMPLE_PALS, INITIAL_REQUESTS } from '../data/mockData';
import { PalRequest } from '../types';
import { MedicalSummaryWidget } from '../components/MedicalSummaryWidget';
import { EtaCalculatorWidget } from '../components/EtaCalculatorWidget';
import { RecoveryTrendsWidget } from '../components/RecoveryTrendsWidget';
import { PatientVideoBroadcastModal } from '../components/PatientVideoBroadcastModal';
import { useLanguage } from '../context/LanguageContext';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';

interface PatientPortalPageProps {
  onOpenGpsModal: () => void;
  onOpenChargesModal: (tab?: 'patient_charges' | 'pal_earnings') => void;
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({
  onOpenGpsModal,
  onOpenChargesModal,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'request' | 'my_escorts' | 'eta_calculator' | 'recovery_trends' | 'medical_summary' | 'financials'>('request');
  const [requests, setRequests] = useState<PalRequest[]>(INITIAL_REQUESTS);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [activeBroadcastReq, setActiveBroadcastReq] = useState<PalRequest | null>(null);
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-white">
      
      {/* Patient Portal Header Banner */}
      <div className="bg-[#1F3449] p-6 sm:p-8 rounded-3xl border-2 border-[#E85D75]/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#E85D75] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Heart className="w-3.5 h-3.5 fill-white" />
              PATIENT & FAMILY PORTAL
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Subsidized Vouchers Available
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Welcome, Maria Santos</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Book compassionate companion escorts for hospital appointments, track your assigned Pal live on campus, and view your encrypted HIPAA medical summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={onOpenGpsModal}
            className="bg-[#2B425B] hover:bg-white/10 text-[#48A6A5] font-bold text-xs uppercase px-4 py-3 rounded-xl border border-[#48A6A5]/30 flex items-center gap-2"
          >
            <Navigation className="w-4 h-4 text-[#48A6A5]" />
            <span>Track Live GPS</span>
          </button>
        </div>
      </div>

      {/* Patient Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#1F3449] rounded-2xl border border-white/10 text-xs font-bold">
        <button
          onClick={() => setActiveTab('request')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'request'
              ? 'bg-[#E85D75] text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Request New Pal</span>
        </button>

        <button
          onClick={() => setActiveTab('my_escorts')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'my_escorts'
              ? 'bg-[#E85D75] text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#48A6A5]" />
          <span>My Scheduled Visits ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('eta_calculator')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'eta_calculator'
              ? 'bg-[#48A6A5] text-white font-black shadow-lg shadow-[#48A6A5]/20'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#48A6A5]" />
          <span>AI Hospital ETA Predictor</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery_trends')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'recovery_trends'
              ? 'bg-[#48A6A5] text-white font-black shadow-lg shadow-[#48A6A5]/20'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4 text-[#48A6A5]" />
          <span>30-Day Recovery Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('medical_summary')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'medical_summary'
              ? 'bg-[#1F3449] text-white border border-[#48A6A5] shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#48A6A5]" />
          <span>Secure Medical Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'financials'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-300" />
          <span>$0 Cost & Benefit Vouchers</span>
        </button>
      </div>

      {/* TAB 1: REQUEST NEW COMPANION PAL */}
      {activeTab === 'request' && (
        <div className="bg-[#1F3449] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase text-[#E85D75] tracking-wider">BOOK COMPANION PAL</span>
            <h2 className="text-2xl font-black text-white">Schedule a Hospital Companion Pal</h2>
            <p className="text-xs text-gray-300">
              Fill out your visit details. We match you with an accredited, background-checked Community Health Worker or Pal.
            </p>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4 bg-[#2B425B] p-6 sm:p-8 rounded-2xl border border-white/10 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">{t('patientName')}</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">{t('phoneLabel')}</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">{t('hospitalLabel')}</label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => {
                      setSelectedHospitalId(e.target.value);
                      const h = SAMPLE_HOSPITALS.find((x) => x.id === e.target.value);
                      if (h) setMeetingPoint(h.meetingPoints[0]);
                    }}
                    className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    {SAMPLE_HOSPITALS.map((h) => (
                      <option key={h.id} value={h.id} className="bg-[#1F3449]">
                        {h.name} ({h.city}, {h.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Clinic / Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    {selectedHospital.departments.map((d) => (
                      <option key={d} value={d} className="bg-[#1F3449]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Appointment Time</label>
                  <input
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Language</label>
                  <select
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    <option value="English" className="bg-[#1F3449]">English</option>
                    <option value="Spanish" className="bg-[#1F3449]">Spanish (Español)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Meeting Point at Campus</label>
                <select
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#152535] border border-white/15 text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                >
                  {selectedHospital.meetingPoints.map((mp) => (
                    <option key={mp} value={mp} className="bg-[#1F3449]">
                      📍 {mp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">Accommodations Needed</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Wheelchair Pal Assistance', 'Arm Assistance', 'Visual Aid', 'Anxiety Reassurance'].map((opt) => (
                    <label key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedMobility.includes(opt) ? 'bg-[#E85D75]/20 border-[#E85D75] text-white' : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/5'}`}>
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
                className="w-full text-xs font-black uppercase text-white bg-[#E85D75] hover:bg-[#E85D75]/90 py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 mt-4"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Submit Pal Request</span>
              </button>
            </form>
          </div>
      )}

      {/* TAB 2: MY SCHEDULED ESCORTS */}
      {activeTab === 'my_escorts' && (
        <div className="bg-[#1F3449] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">SCHEDULED VISITS</span>
              <h2 className="text-2xl font-black text-white">Your Upcoming Companion Visits</h2>
            </div>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
              {requests.length} Active Pal Visit
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-[#2B425B] p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-2.5 py-0.5 rounded border border-[#48A6A5]/30">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded">
                      MATCHED & CONFIRMED
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">{req.hospitalName}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-medium">
                    <span className="flex items-center gap-1.5 text-[#E85D75] font-bold">
                      <Clock className="w-4 h-4" /> {req.appointmentDate} at {req.appointmentTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#48A6A5]">
                      <MapPin className="w-4 h-4" /> Meeting: {req.meetingPoint}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-[#E85D75] text-white font-black flex items-center justify-center text-sm shadow">
                      {req.assignedPal?.name.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Assigned Pal: {req.assignedPal?.name || 'Elena Rostova'}</div>
                      <div className="text-[11px] text-gray-400">Badge #{req.assignedPal?.badgeNumber || 'PAL-8802'} • CPR & CHW Certified</div>
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
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#1F3449] hover:bg-white/10 text-[#48A6A5] border border-[#48A6A5]/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    title="Add appointment to Google Calendar"
                  >
                    <Calendar className="w-4 h-4 text-[#48A6A5]" />
                    <span>Sync Calendar</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveBroadcastReq(req);
                      setIsBroadcastOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                    title="Start one-way live video stream to Pal during transit"
                  >
                    <Video className="w-4 h-4 text-red-400" />
                    <span>Transit Video Broadcast</span>
                  </button>
                  <button
                    onClick={onOpenGpsModal}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#48A6A5] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-[#48A6A5]/90 transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Track Pal Live GPS</span>
                  </button>
                  <a
                    href="tel:18007284725"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Pal</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2.5: AI HOSPITAL ETA PREDICTOR */}
      {activeTab === 'eta_calculator' && (
        <div className="space-y-4">
          <EtaCalculatorWidget
            defaultHospitalId={selectedHospital.id}
            defaultMobility={selectedMobility}
            onApplyEta={(mins, arrivalAdvice) => {
              setActiveTab('request');
            }}
          />
        </div>
      )}

      {/* TAB 2.8: RECOVERY TRENDS & RECHARTS ANALYTICS */}
      {activeTab === 'recovery_trends' && (
        <div className="space-y-4">
          <RecoveryTrendsWidget />
        </div>
      )}

      {/* TAB 3: SECURE MEDICAL SUMMARY */}
      {activeTab === 'medical_summary' && (
        <div className="space-y-4">
          <div className="bg-[#1F3449] p-4 rounded-2xl border border-[#48A6A5]/40 text-xs text-gray-300 flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#48A6A5] shrink-0" />
            <span>
              <strong className="text-white">HIPAA Privacy Control:</strong> Your health summary is stored encrypted on your device. You choose when to grant read-only access to your assigned Pal during active companion escorts.
            </span>
          </div>

          <MedicalSummaryWidget />
        </div>
      )}

      {/* TAB 4: FINANCIALS & VOUCHERS */}
      {activeTab === 'financials' && (
        <div className="bg-[#1F3449] p-6 sm:p-8 rounded-3xl border border-emerald-500/40 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">ZERO HIDDEN FEES</span>
            <h2 className="text-2xl font-black text-white">$0 Out-Of-Pocket Benefit Voucher Coverage</h2>
            <p className="text-xs text-gray-300">
              PathPal is covered under health benefit vouchers and hospital community assistance programs for eligible patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2B425B] p-6 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400">BENEFIT VOUCHER PROGRAM</span>
              <h3 className="text-xl font-black text-white">100% Covered</h3>
              <p className="text-xs text-gray-300">
                Covers non-clinical navigation, appointment accompaniment, and language translation support.
              </p>
            </div>

            <div className="bg-[#2B425B] p-6 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400">STATE HEALTH PLAN BENEFIT</span>
              <h3 className="text-xl font-black text-white">$0 Patient Copay</h3>
              <p className="text-xs text-gray-300">
                Direct community health worker reimbursement ensures eligible patients pay zero dollars out of pocket.
              </p>
            </div>

            <div className="bg-[#2B425B] p-6 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400">HOSPITAL COMMUNITY BENEFIT</span>
              <h3 className="text-xl font-black text-white">CHNA Sponsored</h3>
              <p className="text-xs text-gray-300">
                Hospitals sponsor escort credits to reduce no-shows and improve patient HCAHPS care ratings.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenChargesModal('patient_charges')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Patient Charges & Subsidy Calculator</span>
            </button>
          </div>
        </div>
      )}

      {/* ONE-WAY TRANSIT VIDEO BROADCAST MODAL */}
      <PatientVideoBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        assignedPalName={activeBroadcastReq?.assignedPal?.name || 'Elena Rostova, RN'}
        hospitalName={activeBroadcastReq?.hospitalName || 'St. Jude Medical Center'}
        meetingZone={activeBroadcastReq?.meetingPoint || 'Main Entrance Lobby (Zone A)'}
      />

    </div>
  );
};
