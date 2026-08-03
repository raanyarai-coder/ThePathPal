import React from 'react';
import { Heart, MapPin, ShieldAlert, ArrowUp } from 'lucide-react';

interface FooterProps {
  onRequestPal: () => void;
  onBecomePal: () => void;
  onHospitalPartner: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRequestPal, onBecomePal, onHospitalPartner }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-companion-coral rounded-2xl flex items-center justify-center text-white shadow-md">
                <MapPin className="w-6 h-6 fill-white/20" />
              </div>
              <div className="text-2xl font-black tracking-tight text-white">
                Path<span className="text-companion-coral">Pal</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 max-w-sm leading-relaxed">
              PathPal is a healthcare navigation service pairing patients with trained, compassionate, non-clinical companions — Pals — supported by a smart digital platform that coordinates every step of the journey.
            </p>

            <div className="text-xs text-soft-rose font-bold">
              Prepared by Raanya Rai • July 2026 • Innovation Project
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-soft-rose">Navigation</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#about" className="hover:text-companion-coral transition-colors">About PathPal</a></li>
              <li><a href="#challenge" className="hover:text-companion-coral transition-colors">The Challenge</a></li>
              <li><a href="#how-it-works" className="hover:text-companion-coral transition-colors">5-Step Journey</a></li>
              <li><a href="#ecosystem" className="hover:text-companion-coral transition-colors">Interactive Portal</a></li>
              <li><a href="#policy" className="hover:text-companion-coral transition-colors">CMS & Policy Levers</a></li>
              <li><a href="#pricing" className="hover:text-companion-coral transition-colors">Access & Pricing</a></li>
            </ul>
          </div>

          {/* Action Callouts */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-soft-rose">Get Involved</h4>
            <div className="space-y-2">
              <button
                onClick={onRequestPal}
                className="w-full text-xs font-bold text-white bg-companion-coral hover:bg-companion-coral/90 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Request a Companion Pal</span>
              </button>
              <button
                onClick={onBecomePal}
                className="w-full text-xs font-bold text-navigation-teal bg-navigation-teal/20 hover:bg-navigation-teal/30 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Apply to Become a Pal</span>
              </button>
              <button
                onClick={onHospitalPartner}
                className="w-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Hospital System Licensing</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mandatory Non-Clinical Legal Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-[11px] text-gray-400">
          <ShieldAlert className="w-5 h-5 text-warm-gold shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white font-semibold">Non-Clinical Scope Notice:</strong> PathPal companions ("Pals") provide non-clinical navigation support, accompaniment, and physical environment guidance within healthcare facilities. Pals are strictly non-clinical personnel and do not provide medical advice, diagnosis, clinical nursing care, or medical decision-making.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 pt-4">
          <div>
            © 2026 PathPal Innovation Project. All rights reserved.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-bold text-soft-rose hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
