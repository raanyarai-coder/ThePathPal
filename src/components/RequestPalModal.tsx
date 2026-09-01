import React, { useState, useEffect } from 'react';
import { X, Heart, CheckCircle2, AlertCircle, RefreshCw, Calendar, Clock, MapPin, Building2, User, Phone } from 'lucide-react';
import { createPalRequest, supabase } from '../lib/supabase';
import { PalRequest, HospitalLocation } from '../types';
import { HospitalSearch } from './map/HospitalSearch';
import { HospitalMap } from './map/HospitalMap';

interface RequestPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const RequestPalModal: React.FC<RequestPalModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<HospitalLocation | null>({
    name: 'NYU Langone Health - Tisch Hospital',
    address: '550 1st Avenue, New York, NY 10016',
    city: 'New York',
    state: 'NY',
    latitude: 40.7421,
    longitude: -73.9741,
    providerPlaceId: 'osm-node-nyu-langone',
    category: 'Hospital / Academic Medical Center',
  });
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [language, setLanguage] = useState('English');
  const [department, setDepartment] = useState('Outpatient Clinic');
  const [meetingLocation, setMeetingLocation] = useState('Main Entrance - Lobby Welcome Desk');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<PalRequest | null>(null);
  const [isAuthUser, setIsAuthUser] = useState<boolean | null>(null);

  // Load authenticated patient profile when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setHospitalError(null);
    setSubmittedRequest(null);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) {
        setIsAuthUser(true);
        // Look up patient database record
        const { data: pat } = await supabase
          .from('patients')
          .select('name, phone')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (pat?.name) setPatientName(pat.name);
        else if (user.user_metadata?.full_name) setPatientName(user.user_metadata.full_name);
        else if (user.email) setPatientName(user.email.split('@')[0]);

        if (pat?.phone) setPhone(pat.phone);
        else if (user.user_metadata?.phone) setPhone(user.user_metadata.phone);
      } else {
        setIsAuthUser(false);
      }
    }).catch(() => {
      setIsAuthUser(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHospitalError(null);

    // 1. Authenticated User Check
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;

    if (!user) {
      setErrorMessage('Please log in to book a PAL.');
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage('Please enter the patient full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }

    if (!selectedHospital) {
      setHospitalError('Please select a hospital from the search results.');
      return;
    }

    setIsSubmitting(true);

    const res = await createPalRequest({
      patientName: patientName.trim(),
      patientPhone: phone.trim(),
      hospitalId: selectedHospital.providerPlaceId || 'hosp-selected',
      hospitalName: selectedHospital.name,
      hospitalAddress: selectedHospital.address,
      hospitalLatitude: selectedHospital.latitude,
      hospitalLongitude: selectedHospital.longitude,
      hospitalPlaceId: selectedHospital.providerPlaceId,
      appointmentDate: date,
      appointmentTime: time,
      department: department.trim() || 'General Outpatient Clinic',
      meetingLocation: meetingLocation.trim() || 'Main Entrance Gate',
      meeting_location: meetingLocation.trim() || 'Main Entrance Gate',
      languagePreference: language,
      mobilityNeeds: ['General Companion Escort', 'Hospital Wayfinding Navigation'],
    });

    setIsSubmitting(false);

    if (res.error) {
      console.error('[PAL Request Modal] Submission error:', res.error);
      setErrorMessage(res.error.message || 'Unable to submit your PAL request right now. Please try again.');
      return;
    }

    if (res.data) {
      setSubmittedRequest(res.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pathpal-navy/60 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-soft-rose overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedRequest ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-companion-coral uppercase tracking-wider">
                <Heart className="w-4 h-4 fill-companion-coral" />
                <span>PATIENT COMPANION REQUEST</span>
              </div>
              <h3 className="text-2xl font-black text-pathpal-navy">Request a PathPal Companion</h3>
              <p className="text-xs text-pathpal-navy/70">
                Search your partner hospital and we will pair you with a verified Pal to meet you at the campus entrance.
              </p>
            </div>

            {isAuthUser === false && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please sign in before booking a companion.</span>
                </div>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer shrink-0"
                  >
                    Log In
                  </button>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Eleanor Vance"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Mobile Phone (SMS)</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Hospital Search & Map Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-pathpal-navy">
                  Partner Hospital Search & Coordinates
                </label>
                <HospitalSearch
                  selectedHospital={selectedHospital}
                  onSelectHospital={(h) => {
                    setSelectedHospital(h);
                    setHospitalError(null);
                  }}
                  onClear={() => setSelectedHospital(null)}
                  error={hospitalError}
                />

                {selectedHospital && (
                  <div className="mt-2">
                    <HospitalMap
                      latitude={selectedHospital.latitude}
                      longitude={selectedHospital.longitude}
                      hospitalName={selectedHospital.name}
                      hospitalAddress={selectedHospital.address}
                      height="h-44"
                      showCard={false}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Department / Clinic</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Cardiology Clinic"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Language Preference</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white font-medium"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Cantonese">Cantonese</option>
                    <option value="Tagalog">Tagalog</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-pathpal-navy">Campus Meeting Location</label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="e.g. Main Entrance - Near Information Desk"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-xs uppercase font-bold text-white bg-[#E85D75] hover:bg-[#E85D75]/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching to Public.Pal_Requests...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Request PathPal Companion</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-pathpal-navy">Companion Request Submitted!</h3>
              <p className="text-xs text-pathpal-navy/80 max-w-sm mx-auto">
                Your request has been securely persisted to the dispatch system and is awaiting companion matching.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Request ID</span>
                <span className="font-mono font-bold text-gray-800">{submittedRequest.id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  {submittedRequest.status}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Hospital</span>
                <span className="font-bold text-[#1F3449]">{submittedRequest.hospitalName}</span>
              </div>
              {submittedRequest.hospitalAddress && (
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Address</span>
                  <span className="font-medium text-gray-800 truncate max-w-xs">{submittedRequest.hospitalAddress}</span>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Appointment</span>
                <span className="font-medium text-gray-800">
                  {submittedRequest.appointmentDate} at {submittedRequest.appointmentTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Campus Meeting Location</span>
                <span className="font-medium text-gray-800">{submittedRequest.meetingLocation || submittedRequest.meetingPoint}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedRequest(null);
                  onClose();
                }}
                className="w-full bg-[#1F3449] text-white text-xs font-bold py-3 rounded-xl hover:bg-[#1F3449]/90 transition-all cursor-pointer shadow-md"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

