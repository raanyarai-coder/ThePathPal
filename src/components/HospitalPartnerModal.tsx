import React, { useState } from 'react';
import { X, Building2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { submitHospitalInquiry } from '../lib/supabase';

interface HospitalPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalPartnerModal: React.FC<HospitalPartnerModalProps> = ({ isOpen, onClose }) => {
  const [hospitalName, setHospitalName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitHospitalInquiry({
      hospital_name: hospitalName,
      contact_name: contactName,
      contact_email: email,
      contact_phone: phone,
      notes,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pathpal-navy/60 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-pathpal-navy/20 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#48A6A5] uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>HOSPITAL SYSTEM BRIEFING</span>
              </div>
              <h3 className="text-2xl font-black text-pathpal-navy">Schedule a Pilot Briefing</h3>
              <p className="text-xs text-pathpal-navy/70">
                Learn how PathPal boosts HCAHPS scores, reduces no-shows, and generates CHNA Community Benefit credits.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Health System / Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mount Sinai Health System"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Contact Person Name & Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. James Wilson, VP Patient Experience"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jwilson@healthsystem.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Notes / Program Needs (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Interested in outpatient mobility escort pilot..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm font-bold text-white bg-[#1F3449] hover:bg-[#1F3449]/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Request Executive Briefing</span>
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
            <h3 className="text-2xl font-black text-pathpal-navy">Briefing Requested!</h3>
            <p className="text-xs text-pathpal-navy/80 max-w-sm mx-auto">
              Our healthcare implementation director will reach out to schedule an executive walkthrough of pilot licensing, HCPCS G0511 setup, and Schedule H reporting.
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
