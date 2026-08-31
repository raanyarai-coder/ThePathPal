import React, { useState } from 'react';
import { X, Heart, CheckCircle2, MapPin, Calendar, Clock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_HOSPITALS } from '../data/mockData';
import { createPalRequest } from '../lib/supabase';

interface RequestPalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestPalModal: React.FC<RequestPalModalProps> = ({ isOpen, onClose }) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState(SAMPLE_HOSPITALS[0].id);
  const [date, setDate] = useState('2026-08-05');
  const [time, setTime] = useState('10:00 AM');
  const [language, setLanguage] = useState('English');
  const [department, setDepartment] = useState('Outpatient Clinic');
  const [meetingPoint, setMeetingPoint] = useState('Main Entrance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const hospitalObj = SAMPLE_HOSPITALS.find((h) => h.id === hospitalId) || SAMPLE_HOSPITALS[0];

    const res = await createPalRequest({
      patientName,
      patientPhone: phone,
      hospitalId: hospitalObj.id,
      hospitalName: hospitalObj.name,
      appointmentDate: date,
      appointmentTime: time,
      department,
      meetingPoint,
      languagePreference: language,
      mobilityNeeds: ['General Companion Escort'],
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error.message);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pathpal-navy/60 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-soft-rose overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-companion-coral uppercase tracking-wider">
                <Heart className="w-4 h-4 fill-companion-coral" />
                <span>PATIENT COMPANION REQUEST</span>
              </div>
              <h3 className="text-2xl font-black text-pathpal-navy">Request a PathPal Companion</h3>
              <p className="text-xs text-pathpal-navy/70">
                We will pair you with a trained, verified Pal to meet you right at the hospital entrance.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
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
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none"
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
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Hospital Location</label>
                  <select
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  >
                    {SAMPLE_HOSPITALS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Cantonese">Cantonese</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Department / Clinic</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Cardiology Clinic"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Meeting Point / Gate</label>
                  <input
                    type="text"
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    placeholder="e.g. Main Entrance Gate 2"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm font-bold text-white bg-[#E85D75] hover:bg-[#E85D75]/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Pal Request...</span>
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
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-[#48A6A5] text-white rounded-full mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-pathpal-navy">Companion Request Received!</h3>
            <p className="text-xs text-pathpal-navy/80 max-w-sm mx-auto">
              We have dispatched your request to available certified Pals. You will receive an SMS confirmation with your Pal's photo & badge details.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-pathpal-navy text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
