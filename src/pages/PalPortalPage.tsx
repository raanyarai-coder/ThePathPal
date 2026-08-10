import React, { useState } from 'react';
import { UserCheck, Star, Clock, MapPin, DollarSign, ShieldCheck, CheckCircle2, Navigation, Phone, Eye, Lock, Award, Heart, Radio, ChevronRight, X, AlertCircle, Calendar } from 'lucide-react';
import { SAMPLE_PALS, INITIAL_REQUESTS } from '../data/mockData';
import { PalRequest } from '../types';
import { MedicalSummaryWidget } from '../components/MedicalSummaryWidget';
import { EtaCalculatorWidget } from '../components/EtaCalculatorWidget';
import { Calculator } from 'lucide-react';
import { createGoogleCalendarUrl } from '../utils/calendarUtils';

interface PalPortalPageProps {
  onOpenGpsModal: () => void;
  onOpenChargesModal: (tab?: 'patient_charges' | 'pal_earnings') => void;
}

export const PalPortalPage: React.FC<PalPortalPageProps> = ({
  onOpenGpsModal,
  onOpenChargesModal,
}) => {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'available_feed' | 'my_active' | 'eta_calculator' | 'earnings' | 'profile'>('available_feed');
  const [requests, setRequests] = useState<PalRequest[]>(INITIAL_REQUESTS);
  const [selectedPalPatientSummary, setSelectedPalPatientSummary] = useState<PalRequest | null>(null);

  // Pal Stats
  const palInfo = SAMPLE_PALS[0]; // Elena Rostova

  const handleAcceptRequest = (reqId: string) => {
    setRequests(
      requests.map((r) =>
        r.id === reqId ? { ...r, status: 'in_progress', assignedPal: palInfo } : r
      )
    );
    setActiveTab('my_active');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-[#1F3449]">
      
      {/* Pal Portal Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#48A6A5]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#48A6A5] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <UserCheck className="w-3.5 h-3.5" />
              PAL COMPANION PORTAL
            </span>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-3 py-1 rounded-full border border-[#48A6A5]/30 font-mono">
              Badge #PAL-8802
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">Welcome, Elena Rostova</h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Accept companion escort assignments, guide patients safely through hospital campuses, and track your CHW stipend earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Duty Status Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 pl-2">Duty Status:</span>
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                isOnDuty ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-300 text-gray-700'
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
        </div>
      </div>

      {/* Pal Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed Visits</span>
          <div className="text-2xl sm:text-3xl font-black text-[#1F3449]">{palInfo.completedVisits} Visits</div>
          <span className="text-[10px] font-bold text-emerald-600">100% On-Time Record</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient Rating</span>
          <div className="text-2xl sm:text-3xl font-black text-[#F1B84C] flex items-center gap-1">
            <span>{palInfo.rating}</span>
            <Star className="w-5 h-5 fill-[#F1B84C]" />
          </div>
          <span className="text-[10px] font-bold text-gray-500">Based on 84 reviews</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hourly Stipend Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-[#48A6A5]">$26.00 / hr</div>
          <span className="text-[10px] font-bold text-[#48A6A5]">+ $5.00 Bonus Per Visit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Certifications</span>
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
          <span>Badge & Certifications</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE ESCORTS FEED */}
      {activeTab === 'available_feed' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">DISPATCH FEED</span>
              <h2 className="text-2xl font-black text-[#1F3449]">Pending Patient Pal Requests</h2>
            </div>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/10 px-3 py-1 rounded-full border border-[#48A6A5]/30">
              Nearby Hospitals
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#48A6A5] transition-all shadow-sm">
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
                    <span>{req.hospitalName} • Rendezvous: <strong>{req.meetingPoint}</strong></span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Clock className="w-3.5 h-3.5" /> {req.appointmentDate} at {req.appointmentTime}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      Est. Stipend: $52.00 (2 hrs)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {req.mobilityNeeds.map((m) => (
                      <span key={m} className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-0.5 rounded-md border border-gray-300">
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
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">ACTIVE ASSIGNMENT</span>
              <h2 className="text-2xl font-black text-[#1F3449]">Your Accepted Companion Assignments</h2>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              Live Pal
            </span>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-gray-50 p-6 rounded-2xl border-2 border-[#48A6A5]/50 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#48A6A5] uppercase">PATIENT:</span>
                    <h3 className="text-2xl font-black text-[#1F3449]">{req.patientName}</h3>
                    <p className="text-xs text-gray-600">{req.hospitalName} ({req.department})</p>
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
                    <span className="text-gray-500 block font-mono text-[10px]">RENDEZVOUS SPOT:</span>
                    <span className="text-[#1F3449] font-bold">{req.meetingPoint}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-mono text-[10px]">TIME:</span>
                    <span className="text-[#1F3449] font-bold">{req.appointmentDate} at {req.appointmentTime}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block font-mono text-[10px]">MOBILITY REQ:</span>
                    <span className="text-[#E85D75] font-bold">{req.mobilityNeeds.join(', ')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const gCalUrl = createGoogleCalendarUrl({
                        title: `PathPal Escort Duty: ${req.patientName} at ${req.hospitalName}`,
                        description: `Pal Escort Assignment for ${req.patientName}.\nACTION REQUIRED: Log into PathPal 45 minutes before departure to review read-only medical summary, mobility needs (${req.mobilityNeeds.join(', ')}), and allergy alerts.\nMeeting Point: ${req.meetingPoint}.`,
                        location: `${req.hospitalName}, ${req.meetingPoint}`,
                        startTime: new Date(`${req.appointmentDate}T10:00:00`),
                        endTime: new Date(`${req.appointmentDate}T12:00:00`),
                        reminderMinutesBefore: [1440, 120, 45, 15]
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
            onApplyEta={(mins, advice) => {
              setActiveTab('my_active');
            }}
          />
        </div>
      )}

      {/* TAB 3: EARNINGS & STIPEND LOG */}
      {activeTab === 'earnings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-lg">
          <div className="border-b border-gray-200 pb-4">
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">CHW STIPEND LOG</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Pal Earnings & Payout Breakdown</h2>
            <p className="text-xs text-gray-600">
              Pals earn $22-$28/hour plus hospital bonus credits disbursed weekly via direct deposit or debit card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-500">THIS WEEK EARNINGS</span>
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
            <span className="text-xs font-black uppercase text-[#F1B84C] tracking-wider">ACCREDITATION BADGE</span>
            <h2 className="text-2xl font-black text-[#1F3449]">Official PathPal Companion Badge & Clearances</h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 max-w-md space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#48A6A5] text-white font-black text-2xl flex items-center justify-center shadow-md">
                ER
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1F3449]">Elena Rostova</h3>
                <span className="text-xs text-[#48A6A5] font-mono font-bold block">Badge #PAL-8802</span>
                <span className="text-[10px] text-gray-500 block">San Francisco Medical Campus Division</span>
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
                primaryLanguage: selectedPalPatientSummary.languagePreference || 'Spanish & English',
                primaryDoctor: 'Dr. Robert Chen, MD',
                doctorPhone: '(555) 234-8900',
                medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'Post-Op Knee Recovery'],
                allergies: ['Penicillin (Severe Rash)', 'Latex'],
                emergencyContactName: 'Carlos Santos',
                emergencyContactRelation: 'Son',
                emergencyContactPhone: selectedPalPatientSummary.patientPhone || '(555) 987-6543',
                mobilityNotes: selectedPalPatientSummary.mobilityNeeds.join(', ') + ' - Requires steady arm support.',
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
