import React, { useState, useEffect } from 'react';
import { ShieldAlert, Radio, BellRing, PhoneCall } from 'lucide-react';
import { triggerEmergencySos, getActiveSosIncident, EmergencySosIncident } from '../lib/emergencyService';
import { EmergencySosModal } from './EmergencySosModal';

interface EmergencySosButtonProps {
  patientName?: string;
  patientPhone?: string;
  hospitalName?: string;
  locationDetail?: string;
  assignedPalName?: string;
  assignedPalPhone?: string;
}

export const EmergencySosButton: React.FC<EmergencySosButtonProps> = ({
  patientName = 'Eleanor Vance',
  patientPhone = '(555) 234-5678',
  hospitalName = 'Mount Sinai Medical Center',
  locationDetail = 'Main Clinical Pavilion - 2nd Floor Cardiology Corridor (Gate 4)',
  assignedPalName = 'Marcus Vance',
  assignedPalPhone = '(555) 392-1094',
}) => {
  const [activeIncident, setActiveIncident] = useState<EmergencySosIncident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [showToastNotification, setShowToastNotification] = useState(false);

  // Sync any existing active incident from localStorage on mount
  useEffect(() => {
    const existing = getActiveSosIncident();
    if (existing) {
      setActiveIncident(existing);
    }
  }, []);

  const handleTriggerSos = async () => {
    // If an incident is already active, open the live console modal
    if (activeIncident) {
      setIsModalOpen(true);
      return;
    }

    setIsTriggering(true);
    try {
      const incident = await triggerEmergencySos({
        patientName,
        patientPhone,
        hospitalName,
        locationDetail,
        assignedPalName,
        assignedPalPhone,
        emergencyType: 'general_sos',
      });

      setActiveIncident(incident);
      setIsModalOpen(true);
      setShowToastNotification(true);
      setTimeout(() => setShowToastNotification(false), 5000);
    } catch (err) {
      console.error('Failed to dispatch SOS alert:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleIncidentResolved = () => {
    setActiveIncident(null);
  };

  return (
    <>
      {/* Real-time In-App Push Notification Toast Banner when SOS is triggered */}
      {showToastNotification && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full bg-rose-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/40 animate-slide-in-right flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 font-black">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between font-black uppercase text-[10px] tracking-wider text-rose-200">
              <span>PUSH NOTIFICATION DELIVERED</span>
              <span>JUST NOW</span>
            </div>
            <p className="font-black text-sm mt-0.5">🚨 Emergency SOS Dispatched</p>
            <p className="text-rose-100 text-[11px] mt-0.5">
              Hospital Security Unit #S-14 & Pal {assignedPalName} alerted with your live location.
            </p>
          </div>
        </div>
      )}

      {/* Floating Emergency SOS Action Control in Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5">
        
        {/* If Active: Pulsing Banner Indicator */}
        {activeIncident ? (
          <button
            onClick={() => setIsModalOpen(true)}
            id="emergency-sos-active-btn"
            aria-label="View Active Emergency SOS Console"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-rose-600 text-white font-black uppercase text-xs tracking-wider shadow-2xl border-2 border-white hover:bg-rose-700 transition-all animate-pulse cursor-pointer"
          >
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span>SOS ACTIVE • RESCUE DISPATCHED</span>
          </button>
        ) : (
          /* Primary Floating Emergency SOS Trigger Button */
          <button
            onClick={handleTriggerSos}
            disabled={isTriggering}
            id="floating-emergency-sos-button"
            aria-label="Emergency SOS - Instantly alert hospital security and assigned Pal"
            title="Emergency SOS: Instantly notify Campus Security and your assigned Pal"
            className="group relative flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black uppercase text-xs tracking-wider shadow-2xl hover:shadow-rose-500/50 transition-all border-2 border-white/80 cursor-pointer disabled:opacity-50"
          >
            {/* Pulsing Radar Ring Glow */}
            <span className="absolute -inset-1 rounded-full bg-rose-600 opacity-75 blur-xs group-hover:opacity-100 animate-ping -z-10"></span>

            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-[11px] font-black tracking-widest text-white">EMERGENCY SOS</span>
              <span className="text-[9px] font-medium text-rose-100 normal-case tracking-normal opacity-90 hidden sm:inline">
                Alerts Security & Pal
              </span>
            </div>

            <Radio className="w-3.5 h-3.5 text-rose-200 animate-pulse ml-0.5" />
          </button>
        )}
      </div>

      {/* Emergency Management Console Modal */}
      <EmergencySosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incident={activeIncident}
        onIncidentResolved={handleIncidentResolved}
      />
    </>
  );
};
