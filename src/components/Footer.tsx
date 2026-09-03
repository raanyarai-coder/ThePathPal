import React from 'react';
import { Heart, MapPin, ShieldAlert, ArrowUp } from 'lucide-react';

interface FooterProps {
  onRequestPal: () => void;
  onBecomePal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRequestPal, onBecomePal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-[#1F3449] pt-16 pb-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {/* Primary Logo Icon Mark with Pin & Teal Arch */}
              <div className="relative flex flex-col items-center">
                <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                  <MapPin className="w-8 h-8 text-[#E85D75] fill-[#E85D75]" />
                  <Heart className="w-3.5 h-3.5 text-white fill-white absolute top-2" />
                </div>
                <div className="w-10 h-1.5 flex items-center justify-between -mt-1 px-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#48A6A5]"></span>
                  <div className="flex-1 h-[2px] bg-[#48A6A5] rounded-full mx-0.5"></div>
                  <span className="w-1 h-1 rounded-full bg-[#48A6A5]"></span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-[#1F3449] flex items-center gap-0.5">
                  Path<span className="text-[#E85D75]">Pal</span>
                </span>
                <span className="text-[8.5px] uppercase tracking-widest font-medium text-gray-500 -mt-0.5">
                  NEVER NAVIGATE THE HOSPITAL ALONE
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
              PathPal is a healthcare navigation service pairing patients with trained, compassionate, non-clinical companions — Pals — supported by a smart digital platform that coordinates every step of the journey.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3449]">Navigation</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#about" className="hover:text-[#E85D75] transition-colors">About PathPal</a></li>
              <li><a href="#challenge" className="hover:text-[#E85D75] transition-colors">The Challenge</a></li>
              <li><a href="#how-it-works" className="hover:text-[#E85D75] transition-colors">5-Step Journey</a></li>
              <li><a href="#ecosystem" className="hover:text-[#E85D75] transition-colors">Interactive Portal</a></li>
              <li><a href="#policy" className="hover:text-[#E85D75] transition-colors">CMS & Policy Levers</a></li>
              <li><a href="#pricing" className="hover:text-[#E85D75] transition-colors">Access & Pricing</a></li>
            </ul>
          </div>

          {/* Action Callouts */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3449]">Get Involved</h4>
            <div className="space-y-2">
              <button
                onClick={onRequestPal}
                className="w-full text-xs font-bold text-white bg-[#E85D75] hover:bg-[#E85D75]/90 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white" />
                Request a Companion Pal
              </button>
              <button
                onClick={onBecomePal}
                className="w-full text-xs font-bold text-white bg-[#48A6A5] hover:bg-[#48A6A5]/90 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                Apply to Become a Pal
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Non-Clinical Legal Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3 text-[11px] text-gray-600 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#1F3449] font-semibold">Non-Clinical Scope Notice:</strong> PathPal companions ("Pals") provide non-clinical navigation support, accompaniment, and physical environment guidance within healthcare facilities. Pals are strictly non-clinical personnel and do not provide medical advice, diagnosis, clinical nursing care, or medical decision-making.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 pt-4">
          <div>
            © 2026 PathPal. All rights reserved.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FCE9EC] hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
