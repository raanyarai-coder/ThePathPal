import React, { useState } from 'react';
import { Heart, UserCheck, Building2, Send, Clock, MapPin, CheckCircle2, AlertCircle, Plus, Star, Filter, BarChart3, ShieldCheck, Phone, ChevronRight, FileText, Eye, X, Lock } from 'lucide-react';
import { SAMPLE_HOSPITALS, SAMPLE_PALS, INITIAL_REQUESTS } from '../data/mockData';
import { PalRequest } from '../types';
import { MedicalSummaryWidget } from './MedicalSummaryWidget';

export const EcosystemPortals: React.FC = () => {
  const [activePortal, setActivePortal] = useState<'patient' | 'pal' | 'hospital'>('patient');
  const [patientSubTab, setPatientSubTab] = useState<'request' | 'medical_summary'>('request');
  const [selectedPalPatientSummary, setSelectedPalPatientSummary] = useState<PalRequest | null>(null);
  const [requests, setRequests] = useState<PalRequest[]>(INITIAL_REQUESTS);
  
  // Interactive Patient Request Form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(SAMPLE_HOSPITALS[0].id);
  const [appointmentDate, setAppointmentDate] = useState('2026-08-05');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [department, setDepartment] = useState('Cardiology');
  const [meetingPoint, setMeetingPoint] = useState(SAMPLE_HOSPITALS[0].meetingPoints[0]);
  const [languagePreference, setLanguagePreference] = useState('English');
  const [selectedMobility, setSelectedMobility] = useState<string[]>(['Wheelchair Pal Assistance']);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Hospital Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedHospital = SAMPLE_HOSPITALS.find((h) => h.id === selectedHospitalId) || SAMPLE_HOSPITALS[0];

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    const newReq: PalRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
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
  };

  const toggleMobilityOption = (opt: string) => {
    if (selectedMobility.includes(opt)) {
      setSelectedMobility(selectedMobility.filter((m) => m !== opt));
    } else {
      setSelectedMobility([...selectedMobility, opt]);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <section id="ecosystem" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-care-blush text-companion-coral text-xs font-bold uppercase tracking-wider border border-soft-rose">
            <Building2 className="w-3.5 h-3.5" />
            <span>THE PLATFORM ECOSYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            Three experiences. One service ecosystem.
          </h2>
          <p className="text-base text-pathpal-navy/70">
            Try out the live interactive prototype for Patients, Companions (Pals), and Hospital Administrators.
          </p>
        </div>

        {/* Portal Switcher Tabs (Slide 6 inspired styling) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => {
              setActivePortal('patient');
              setFormSubmitted(false);
            }}
            className={`p-6 rounded-3xl text-left border-2 transition-all flex items-center justify-between ${
              activePortal === 'patient'
                ? 'bg-companion-coral text-white border-companion-coral shadow-lg scale-[1.02]'
                : 'bg-care-blush text-pathpal-navy border-soft-rose hover:bg-care-blush/80'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${activePortal === 'patient' ? 'bg-white/20' : 'bg-companion-coral/20 text-companion-coral'}`}>
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <span className="text-lg font-black tracking-wide">PATIENT PORTAL</span>
              </div>
              <p className={`text-xs ${activePortal === 'patient' ? 'text-white/90' : 'text-pathpal-navy/70'}`}>
                Request support • Manage appointments • Message • Navigate • Review
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${activePortal === 'patient' ? 'text-white' : 'text-gray-400'}`} />
          </button>

          <button
            onClick={() => setActivePortal('pal')}
            className={`p-6 rounded-3xl text-left border-2 transition-all flex items-center justify-between ${
              activePortal === 'pal'
                ? 'bg-navigation-teal text-white border-navigation-teal shadow-lg scale-[1.02]'
                : 'bg-navigation-teal/10 text-pathpal-navy border-navigation-teal/20 hover:bg-navigation-teal/20'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${activePortal === 'pal' ? 'bg-white/20' : 'bg-navigation-teal/20 text-navigation-teal'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-wide">PAL PORTAL</span>
              </div>
              <p className={`text-xs ${activePortal === 'pal' ? 'text-white/90' : 'text-pathpal-navy/70'}`}>
                Apply • Train • Accept assignments • Guide • Log Impact Credits
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${activePortal === 'pal' ? 'text-white' : 'text-gray-400'}`} />
          </button>

          <button
            onClick={() => setActivePortal('hospital')}
            className={`p-6 rounded-3xl text-left border-2 transition-all flex items-center justify-between ${
              activePortal === 'hospital'
                ? 'bg-pathpal-navy text-white border-pathpal-navy shadow-lg scale-[1.02]'
                : 'bg-gray-100 text-pathpal-navy border-gray-200 hover:bg-gray-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${activePortal === 'hospital' ? 'bg-white/20' : 'bg-pathpal-navy/10 text-pathpal-navy'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-wide">HOSPITAL PORTAL</span>
              </div>
              <p className={`text-xs ${activePortal === 'hospital' ? 'text-white/90' : 'text-pathpal-navy/70'}`}>
                Approve • Oversee • Assign • Monitor wait times • Analyze CHNA
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${activePortal === 'hospital' ? 'text-white' : 'text-gray-400'}`} />
          </button>

        </div>

        {/* Dynamic Portal Interactive Content Container */}
        <div className="bg-gray-50/80 rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-md">
          
          {/* ================= PATIENT PORTAL DEMO ================= */}
          {activePortal === 'patient' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-companion-coral uppercase tracking-wider">
                    <Heart className="w-4 h-4 fill-companion-coral" />
                    <span>PATIENT EXPERIENCE PORTAL</span>
                  </div>
                  <h3 className="text-2xl font-black text-pathpal-navy">Patient Dashboard & Companion Hub</h3>
                </div>

                {/* Sub-Tabs Selector */}
                <div className="flex items-center p-1 bg-gray-200/80 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setPatientSubTab('request')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      patientSubTab === 'request'
                        ? 'bg-companion-coral text-white shadow-sm'
                        : 'text-pathpal-navy hover:text-companion-coral'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Request Companion</span>
                  </button>

                  <button
                    onClick={() => setPatientSubTab('medical_summary')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      patientSubTab === 'medical_summary'
                        ? 'bg-pathpal-navy text-white shadow-sm'
                        : 'text-pathpal-navy hover:text-companion-coral'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Secure Medical Summary</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: Companion Request Form */}
              {patientSubTab === 'request' && (
                <>
                  {!formSubmitted ? (
                    <form onSubmit={handleCreateRequest} className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 max-w-3xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Patient Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Maria Santos"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Mobile Phone (SMS updates)</label>
                          <input
                            type="tel"
                            required
                            placeholder="(555) 019-2834"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Hospital Location</label>
                          <select
                            value={selectedHospitalId}
                            onChange={(e) => {
                              setSelectedHospitalId(e.target.value);
                              const h = SAMPLE_HOSPITALS.find((x) => x.id === e.target.value);
                              if (h) setMeetingPoint(h.meetingPoints[0]);
                            }}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                          >
                            {SAMPLE_HOSPITALS.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.name} ({h.city}, {h.state})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Department / Clinic</label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                          >
                            {selectedHospital.departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Appointment Date</label>
                          <input
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Appointment Time</label>
                          <input
                            type="text"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            placeholder="e.g., 10:30 AM"
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-pathpal-navy mb-1">Language</label>
                          <select
                            value={languagePreference}
                            onChange={(e) => setLanguagePreference(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish (Español)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-pathpal-navy mb-1">Meeting Spot at Hospital</label>
                        <select
                          value={meetingPoint}
                          onChange={(e) => setMeetingPoint(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                        >
                          {selectedHospital.meetingPoints.map((mp) => (
                            <option key={mp} value={mp}>
                              📍 {mp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-pathpal-navy mb-2">Accommodations Needed</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {['Wheelchair Pal Assistance', 'Walking / Arm Assistance', 'Visual Navigation Aid', 'Anxiety Reassurance'].map((opt) => (
                            <label key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedMobility.includes(opt) ? 'bg-companion-coral/10 border-companion-coral text-companion-coral font-bold' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                              <input
                                type="checkbox"
                                checked={selectedMobility.includes(opt)}
                                onChange={() => toggleMobilityOption(opt)}
                                className="rounded text-companion-coral focus:ring-companion-coral"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full text-sm font-bold text-white bg-companion-coral hover:bg-companion-coral/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Submit Request & Match Pal</span>
                      </button>
                    </form>
                  ) : (
                    <div className="bg-white p-8 rounded-3xl border-2 border-navigation-teal/30 space-y-6 text-center animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-navigation-teal text-white mx-auto flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-navigation-teal uppercase tracking-widest">VISIT MATCHED & CONFIRMED</span>
                        <h4 className="text-2xl font-black text-pathpal-navy">Your Companion Pal is Assigned!</h4>
                        <p className="text-xs text-pathpal-navy/80 max-w-lg mx-auto">
                          We have matched <strong className="text-pathpal-navy">{patientName}</strong> with <strong className="text-companion-coral">{SAMPLE_PALS[0].name}</strong> for {appointmentDate} at {appointmentTime}.
                        </p>
                      </div>

                      <div className="max-w-md mx-auto bg-care-blush p-4 rounded-2xl border border-soft-rose text-left space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-pathpal-navy">
                          <span>Assigned Pal:</span>
                          <span className="text-companion-coral">{SAMPLE_PALS[0].name} (Badge #{SAMPLE_PALS[0].badgeNumber})</span>
                        </div>
                        <div className="flex items-center justify-between text-pathpal-navy/80">
                          <span>Hospital:</span>
                          <span>{selectedHospital.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-pathpal-navy/80">
                          <span>Meeting Point:</span>
                          <span className="font-bold text-navigation-teal">{meetingPoint}</span>
                        </div>
                        <div className="flex items-center justify-between text-pathpal-navy/80">
                          <span>Medical Summary Shared:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Read-Only
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                        <button
                          onClick={() => setPatientSubTab('medical_summary')}
                          className="text-xs font-bold bg-[#121824] text-[#00F0FF] border border-[#00F0FF]/30 px-6 py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Review Shared Medical Summary Widget</span>
                        </button>
                        <button
                          onClick={() => setFormSubmitted(false)}
                          className="text-xs font-bold bg-pathpal-navy text-white px-6 py-3 rounded-xl"
                        >
                          Create Another Request
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Sub-Tab 2: Medical Summary Widget */}
              {patientSubTab === 'medical_summary' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-pathpal-navy text-white p-4 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />
                      <span>
                        <strong className="text-[#00F0FF]">HIPAA Privacy Guard:</strong> This medical summary is stored securely on your device and shared read-only with your assigned Pal during active escorts.
                      </span>
                    </div>
                  </div>

                  <MedicalSummaryWidget />
                </div>
              )}

            </div>
          )}

          {/* ================= PAL PORTAL DEMO ================= */}
          {activePortal === 'pal' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-navigation-teal uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" />
                    <span>PAL COMPANION DASHBOARD</span>
                  </div>
                  <h3 className="text-2xl font-black text-pathpal-navy">Welcome Back, Elena Rostova</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-navigation-teal text-white px-3 py-1.5 rounded-full">
                    Badge #PAL-8802 • Active
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Completed Visits</div>
                  <div className="text-2xl font-black text-pathpal-navy">84</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Patient Rating</div>
                  <div className="text-2xl font-black text-warm-gold flex items-center gap-1">
                    <span>4.95</span>
                    <Star className="w-4 h-4 fill-warm-gold" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Impact Credits</div>
                  <div className="text-2xl font-black text-navigation-teal">168 Hrs</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Certifications</div>
                  <div className="text-xs font-bold text-companion-coral mt-1">HIPAA + CHW Certified</div>
                </div>
              </div>

              {/* Upcoming Visits List */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="text-base font-bold text-pathpal-navy flex items-center justify-between">
                  <span>Assigned Patient Companion Visits</span>
                  <span className="text-xs font-bold text-navigation-teal bg-navigation-teal/10 px-2.5 py-1 rounded-lg">
                    {requests.length} Visits Scheduled
                  </span>
                </h4>

                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-pathpal-navy">{req.patientName}</span>
                          <span className="text-[10px] font-bold bg-companion-coral/10 text-companion-coral px-2 py-0.5 rounded-md">
                            {req.department}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-navigation-teal" /> {req.appointmentDate} at {req.appointmentTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-companion-coral" /> {req.meetingPoint}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {req.mobilityNeeds.map((m) => (
                            <span key={m} className="text-[10px] font-semibold bg-white text-pathpal-navy px-2 py-0.5 rounded border border-gray-200">
                              ♿ {m}
                            </span>
                          ))}
                          <span className="text-[10px] font-semibold bg-white text-navigation-teal px-2 py-0.5 rounded border border-navigation-teal/30">
                            🗣️ {req.languagePreference}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => setSelectedPalPatientSummary(req)}
                          className="text-xs font-bold text-pathpal-navy bg-[#00F0FF]/15 hover:bg-[#00F0FF]/30 border border-[#00F0FF]/50 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-navigation-teal" />
                          <span>View Read-Only Medical Summary</span>
                        </button>

                        <button className="text-xs font-bold text-white bg-navigation-teal hover:bg-navigation-teal/90 px-4 py-2 rounded-xl transition-all">
                          Check-In at Entrance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= HOSPITAL ADMIN PORTAL DEMO ================= */}
          {activePortal === 'hospital' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-pathpal-navy uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>HOSPITAL OVERSIGHT & ANALYTICS PORTAL</span>
                  </div>
                  <h3 className="text-2xl font-black text-pathpal-navy">Metro Health Medical Center</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-pathpal-navy text-white px-3 py-1.5 rounded-full">
                    Site License #HOSP-9901 Active
                  </span>
                </div>
              </div>

              {/* Hospital Overview Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Active Visits Today</div>
                  <div className="text-2xl font-black text-companion-coral">24</div>
                  <div className="text-[10px] text-navigation-teal font-semibold mt-1">100% Pal Covered</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Avg Match Time</div>
                  <div className="text-2xl font-black text-navigation-teal">3.2 Mins</div>
                  <div className="text-[10px] text-gray-500 font-semibold mt-1">Target: &lt; 5 Mins</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Patient Satisfaction</div>
                  <div className="text-2xl font-black text-warm-gold">98.6%</div>
                  <div className="text-[10px] text-gray-500 font-semibold mt-1">+14% HCAHPS Boost</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Impact Credits Earned</div>
                  <div className="text-2xl font-black text-pathpal-navy">1,240 Hrs</div>
                  <div className="text-[10px] text-companion-coral font-semibold mt-1">Schedule H CHNA Ready</div>
                </div>
              </div>

              {/* Patient Request Control Table */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h4 className="text-base font-bold text-pathpal-navy">Active Companion Navigation Log</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-500">Filter:</span>
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        filterStatus === 'all' ? 'bg-pathpal-navy text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus('matched')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        filterStatus === 'matched' ? 'bg-companion-coral text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Matched
                    </button>
                    <button
                      onClick={() => setFilterStatus('in_progress')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        filterStatus === 'in_progress' ? 'bg-navigation-teal text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      In Progress
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-pathpal-navy uppercase font-bold text-[10px]">
                        <th className="p-3">Req ID</th>
                        <th className="p-3">Patient</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Meeting Point</th>
                        <th className="p-3">Assigned Pal</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/80">
                          <td className="p-3 font-mono font-bold text-gray-500">{req.id}</td>
                          <td className="p-3 font-bold text-pathpal-navy">{req.patientName}</td>
                          <td className="p-3">{req.department}</td>
                          <td className="p-3 text-gray-600">{req.meetingPoint}</td>
                          <td className="p-3 font-bold text-companion-coral">
                            {req.assignedPal ? req.assignedPal.name : 'Unassigned'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === 'matched'
                                ? 'bg-companion-coral/10 text-companion-coral'
                                : req.status === 'in_progress'
                                ? 'bg-navigation-teal/10 text-navigation-teal'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {req.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* PAL PATIENT READ-ONLY MEDICAL SUMMARY MODAL */}
      {selectedPalPatientSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0A0D14] rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-[#00F0FF]/40 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 text-white">
            <button
              onClick={() => setSelectedPalPatientSummary(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
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
                className="bg-[#00F0FF] text-black font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-all"
              >
                Close Medical Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
