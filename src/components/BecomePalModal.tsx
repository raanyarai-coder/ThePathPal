import React, { useState } from 'react';
import { X, UserCheck, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { submitPalApplication } from '../lib/supabase';
import { PalApplication } from '../types';

interface BecomePalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSignup?: (appId: string) => void;
}

export const BecomePalModal: React.FC<BecomePalModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSignup,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState('English, Spanish');
  const [specialties, setSpecialties] = useState('Wheelchair Mobility, Elderly Care Support');
  const [bio, setBio] = useState('Compassionate healthcare companion ready to support patients during appointments.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<PalApplication | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitPalApplication({
      full_name: name,
      email,
      phone,
      languages,
      specialties,
      bio,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error.message);
      return;
    }

    if (res.data) {
      setSubmittedApp(res.data);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedApp(null);
    setErrorMessage(null);
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3449]/70 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border-2 border-[#48A6A5]/30 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedApp ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#48A6A5] uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>STEP 1: PAL COMPANION APPLICATION</span>
              </div>
              <h3 className="text-2xl font-black text-[#1F3449]">Be the Person Who Helps</h3>
              <p className="text-xs text-gray-600">
                Join our network of compassionate non-clinical companions. When your application is approved by the hospital care team, you will receive a secure signup link.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F3449] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Martinez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F3449] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Used for admin approval and login account creation.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3449] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3449] mb-1">Languages Spoken</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g., English, Spanish, Mandarin"
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3449] mb-1">Specialties & Care Skills</label>
                <input
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="e.g., Wheelchair Assistance, Anxiety Relief, Bilingual Escort"
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3449] mb-1">Short Bio & Experience</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell patients about your background..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#48A6A5] focus:outline-none bg-gray-50 resize-none"
                />
              </div>

              <div className="p-3 bg-[#48A6A5]/10 rounded-xl border border-[#48A6A5]/20 flex items-center gap-2 text-xs text-[#1F3449]">
                <ShieldCheck className="w-4 h-4 text-[#48A6A5] shrink-0" />
                <span className="text-[11px]">
                  <strong>Security Note:</strong> Passwords are not collected during application. Login accounts are created only after admin approval.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm font-bold text-white bg-[#48A6A5] hover:bg-[#48A6A5]/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to pal_applications...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Submit Pal Application</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-[#48A6A5] text-white rounded-full mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-[#1F3449]">Application Submitted!</h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase">Application Reference:</span>
                <span className="font-mono font-bold text-[#48A6A5]">{submittedApp.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase">Applicant Name:</span>
                <span className="font-bold text-[#1F3449]">{submittedApp.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase">Registered Email:</span>
                <span className="font-mono text-gray-700">{submittedApp.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase">Current Status:</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-300">
                  PENDING ADMIN REVIEW
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Your application has been stored in <code>pal_applications</code>. Once a hospital administrator approves your profile, you will receive an invitation link to complete your Supabase Auth registration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-[#1F3449] text-xs font-bold px-6 py-3 rounded-xl transition-all"
              >
                Close
              </button>
              <a
                href="#hospital"
                onClick={() => {
                  handleResetAndClose();
                  window.location.hash = 'hospital';
                }}
                className="w-full sm:w-auto bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md inline-block text-center"
              >
                Go to Hospital Admin Approvals Tab →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
