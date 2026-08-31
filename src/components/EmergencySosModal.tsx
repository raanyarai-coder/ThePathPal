import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  Phone,
  Radio,
  MapPin,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  UserCheck,
  RefreshCw,
  BellRing,
  HeartPulse,
  Navigation,
} from 'lucide-react';
import { EmergencySosIncident, resolveSosIncident } from '../lib/emergencyService';
import { startAcousticBeacon, stopAcousticBeacon } from '../utils/emergencyAudio';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: EmergencySosIncident | null;
  onIncidentResolved: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  incident,
  onIncidentResolved,
}) => {
  const [beaconActive, setBeaconActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('Accidental press');
  const [isResolving, setIsResolving] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('Medical Distress / Dizziness');

  useEffect(() => {
    let interval: any = null;
    if (isOpen && incident) {
      setSecondsElapsed(0);
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, incident]);

  useEffect(() => {
    return () => {
      stopAcousticBeacon();
    };
  }, []);

  if (!isOpen || !incident) return null;

  const toggleBeacon = () => {
    if (beaconActive) {
      stopAcousticBeacon();
      setBeaconActive(false);
    } else {
      startAcousticBeacon();
      setBeaconActive(true);
    }
  };

  const handleResolveAlert = async (type: 'resolved' | 'cancelled') => {
    setIsResolving(true);
    stopAcousticBeacon();
    setBeaconActive(false);

    await resolveSosIncident(incident.id, type, cancelReason);
    setIsResolving(false);
    setShowCancelConfirm(false);
    onIncidentResolved();
    onClose();
  };

  const handleSendDistressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyMessage && !selectedTag) return;
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 3500);
    setEmergencyMessage('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border-2 border-rose-500 overflow-hidden max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Animated Warning Stripe Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Header Alert Ribbon */}
        <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg animate-pulse shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-rose-600 tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  SOS BROADCAST ACTIVE • PRIORITY 1
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">
                  {incident.id}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F3449] tracking-tight mt-0.5">
                Emergency Alert Dispatched
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Minimize alert overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Active Status Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-rose-900 font-medium">
            <BellRing className="w-5 h-5 text-rose-600 animate-bounce shrink-0" />
            <div>
              <p className="font-bold text-rose-950">
                Hospital Campus Security & Pal have received your emergency signal.
              </p>
              <p className="text-[11px] text-rose-800">
                Keep this window open or phone ready. Responders are tracking your campus coordinates.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-white px-3 py-1.5 rounded-xl border border-rose-200 font-mono font-black text-rose-700 text-sm shadow-xs">
            ⏱ Active: {formatTimer(secondsElapsed)}
          </div>
        </div>

        {/* Responder Dual Cards: Hospital Security & Assigned Pal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Local Hospital Security */}
          <div className="bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1F3449] text-[#48A6A5] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
                    HOSPITAL SECURITY COMMAND
                  </span>
                  <h4 className="text-sm font-black text-[#1F3449]">
                    {incident.hospital_name}
                  </h4>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                DISPATCHED
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Security Unit:</span>
                <span className="font-bold text-[#1F3449]">{incident.security_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Response:</span>
                <span className="font-bold text-rose-600 animate-pulse">&lt; 90 Seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Channel:</span>
                <span className="font-mono text-gray-700">Rapid Campus Escort Line</span>
              </div>
            </div>

            <a
              href="tel:18005554677"
              className="w-full py-2.5 rounded-xl bg-[#1F3449] text-white font-bold text-xs hover:bg-[#1F3449]/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-[#48A6A5]" />
              <span>Call Hospital Security Direct</span>
            </a>
          </div>

          {/* Card 2: Assigned Pal Companion */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
                    ASSIGNED PATHPAL COMPANION
                  </span>
                  <h4 className="text-sm font-black text-[#1F3449]">{incident.pal_name}</h4>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                PUSH ALERTED
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Pal Mobile:</span>
                <span className="font-bold text-[#1F3449]">{incident.pal_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700">En Route to your Floor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Credentials:</span>
                <span className="text-gray-700 font-bold">Badge #PAL-4092 (Vetted)</span>
              </div>
            </div>

            <a
              href={`tel:${incident.pal_phone?.replace(/[^0-9]/g, '') || '5553921094'}`}
              className="w-full py-2.5 rounded-xl bg-[#48A6A5] text-white font-bold text-xs hover:bg-[#48A6A5]/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Pal {incident.pal_name}</span>
            </a>
          </div>
        </div>

        {/* Live Campus Location Broadcast Box */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Live Patient Geolocation Pinpoint</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● Transmitting GPS Coordinates
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-[#1F3449] flex items-center justify-between">
            <div>
              <p className="font-bold">{incident.location_detail}</p>
              <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                Department: {incident.department}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-gray-400 font-mono block">Accuracy ± 3 meters</span>
            </div>
          </div>
        </div>

        {/* Acoustic Beacon & One-Touch Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Audio Safety Beacon */}
          <button
            onClick={toggleBeacon}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs font-black cursor-pointer shadow-sm ${
              beaconActive
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-gray-50 hover:bg-gray-100 text-[#1F3449] border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {beaconActive ? (
                <Volume2 className="w-5 h-5 animate-bounce" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <div className="text-left">
                <span className="block">
                  {beaconActive ? 'Sound Beacon ACTIVE' : 'Sound Safety Beacon'}
                </span>
                <span className="text-[10px] font-normal opacity-85 block">
                  {beaconActive ? 'Emitting locator chime for guards' : 'Play loud chime to help guards find you'}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-black/10">
              {beaconActive ? 'STOP' : 'PLAY'}
            </span>
          </button>

          {/* Direct 911 Call */}
          <a
            href="tel:911"
            className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 transition-all flex items-center justify-between text-xs font-black shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-white animate-pulse" />
              <div className="text-left">
                <span className="block">Dial 911 Emergency</span>
                <span className="text-[10px] font-normal text-rose-100 block">
                  Connect immediately with municipal services
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-white/20">
              DIAL
            </span>
          </a>
        </div>

        {/* Quick Responder Note / Distress Tag */}
        <form onSubmit={handleSendDistressUpdate} className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
            <span>Send Quick Status Update to Responders:</span>
            {messageSent && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched to Responders!
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Need Wheelchair Escort',
              'Feeling Dizzy / Short of Breath',
              'Security Escort Needed',
              'Lost / Confused in Hallway',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#1F3449] text-white border-[#1F3449]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Details (e.g. ${selectedTag})...`}
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#1F3449] text-white text-xs font-bold hover:bg-[#1F3449]/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#48A6A5]" />
              <span>Update</span>
            </button>
          </div>
        </form>

        {/* Resolution / Stand Down Footer */}
        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {!showCancelConfirm ? (
            <>
              <p className="text-[11px] text-gray-500">
                Press Stand Down only when assistance has arrived or situation is resolved.
              </p>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-700 text-xs font-bold border border-gray-300 transition-all cursor-pointer"
              >
                Cancel / Stand Down SOS Alert
              </button>
            </>
          ) : (
            <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Confirm SOS Stand Down</span>
              </div>
              <p className="text-[11px] text-amber-800">
                This will notify Hospital Security and your Pal that you are safe and cancel the active dispatch.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleResolveAlert('resolved')}
                  disabled={isResolving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isResolving ? 'Resolving...' : '✓ Pal / Security Has Arrived (All Clear)'}
                </button>
                <button
                  onClick={() => handleResolveAlert('cancelled')}
                  disabled={isResolving}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isResolving ? 'Cancelling...' : 'Cancel (False Alarm)'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-2 rounded-xl bg-white text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Keep Alert Active
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
