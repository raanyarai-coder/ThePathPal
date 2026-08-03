import React, { useState } from 'react';
import { X, Heart, CheckCircle2, MapPin, Calendar, Clock, User } from 'lucide-react';
import { SAMPLE_HOSPITALS } from '../data/mockData';

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
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pathpal-navy/60 backdrop-blur-xs animate-fade-in">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Eleanor Vance"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-companion-coral focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Mobile Phone (for SMS)</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-companion-coral focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Language Preference</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Cantonese">Cantonese</option>
                    <option value="Tagalog">Tagalog</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Select Hospital Location</label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                >
                  {SAMPLE_HOSPITALS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city}, {h.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Appointment Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-companion-coral focus:outline-none bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-sm font-bold text-white bg-companion-coral hover:bg-companion-coral/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Confirm Request</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-navigation-teal text-white rounded-full mx-auto flex items-center justify-center shadow-md">
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
              className="bg-pathpal-navy text-white text-xs font-bold px-6 py-3 rounded-xl"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
