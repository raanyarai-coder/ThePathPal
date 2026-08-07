import React, { useState } from 'react';
import { X, UserCheck, CheckCircle2 } from 'lucide-react';

interface BecomePalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomePalModal: React.FC<BecomePalModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState('English, Spanish');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pathpal-navy/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-navigation-teal/30 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-navigation-teal uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>PAL COMPANION APPLICATION</span>
              </div>
              <h3 className="text-2xl font-black text-pathpal-navy">Be the Person Who Helps</h3>
              <p className="text-xs text-pathpal-navy/70">
                Join our network of compassionate non-clinical companions. Flexible scheduling & CHW credentialing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Martinez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navigation-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navigation-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pathpal-navy mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navigation-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pathpal-navy mb-1">Languages Spoken</label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g., English, Spanish"
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-navigation-teal focus:outline-none bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full text-sm font-bold text-white bg-navigation-teal hover:bg-navigation-teal/90 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Submit Pal Application</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-navigation-teal text-white rounded-full mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-pathpal-navy">Application Submitted!</h3>
            <p className="text-xs text-pathpal-navy/80 max-w-sm mx-auto">
              Thank you for stepping up to help. Our onboarding team will send you background check details and onboarding training instructions within 24 hours.
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
