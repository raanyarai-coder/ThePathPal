import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, Phone, Lock, HeartHandshake } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
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
      className="bg-[#161C2B] border-b border-[#00F0FF]/30 text-white px-4 py-3 shadow-2xl z-40 sticky top-0 animate-fade-in"
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-black uppercase text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30">
                OFFLINE MODE ACTIVE
              </span>
              <span className="text-xs font-bold text-white">Hospital Signal Unavailable</span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Saved HIPAA medical summaries, offline maps, and hospital helpline contacts remain <strong>100% accessible offline</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:18007284725"
            className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black text-xs uppercase px-4 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>Call Helpline</span>
          </a>
        </div>
      </div>
    </div>
  );
};
