import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldAlert, CheckCircle2, RefreshCw, Phone, Lock, HeartHandshake } from 'lucide-react';

interface OfflineStatusBannerProps {
  onOpenSosModal?: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({ onOpenSosModal }) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div 
        className="bg-[#00F0FF] text-black font-black text-xs px-4 py-2 flex items-center justify-center gap-2 shadow-lg transition-all animate-fade-in z-40 sticky top-0"
        role="status"
      >
        <CheckCircle2 className="w-4 h-4 text-black" />
        <span>HOSPITAL WI-FI & CELLULAR SIGNAL RESTORED • PathPal Online Sync Active</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div 
      className="bg-[#2B0A0E] border-b-2 border-[#FF3344] text-white px-4 py-3 shadow-2xl z-40 sticky top-0 animate-fade-in"
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FF3344]/20 text-[#FF3344] border border-[#FF3344]/40 animate-pulse shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-black uppercase text-[#FF3344] bg-[#FF3344]/10 px-2 py-0.5 rounded border border-[#FF3344]/30">
                OFFLINE MODE ACTIVE
              </span>
              <span className="text-xs font-bold text-white">Hospital Signal Unavailable</span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Emergency SOS contacts (911), campus safety protocols, and saved HIPAA medical summaries remain <strong>100% accessible offline</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenSosModal && (
            <button
              onClick={onOpenSosModal}
              className="bg-[#FF3344] hover:bg-[#FF3344]/90 text-white font-black text-xs uppercase px-4 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 fill-white" />
              <span>Offline SOS (911)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
