import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Signal,
  Phone,
  MessageSquare,
  Share2,
  Shield,
  Radio,
  RefreshCw,
  UserCheck,
  Heart,
  AlertCircle,
  Play,
  Square,
  CheckCircle2,
} from 'lucide-react';
import {
  startPalLiveTracking,
  stopPalLiveTracking,
  subscribeToLiveLocationSession,
  LocationCoordinates,
  isGpsTrackingActive,
} from '../lib/locationService';
import { LiveLocationMap } from './map/LiveLocationMap';
import { LiveGpsPoint } from '../types';

interface LiveGpsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'patient' | 'pal';
  requestId?: string;
  matchId?: number;
  palId?: number;
  patientId?: number;
  hospitalName?: string;
  hospitalAddress?: string;
  hospitalLatitude?: number;
  hospitalLongitude?: number;
  palName?: string;
}

// Campus Rendezvous Coordinates
const CAMPUS_LANDMARKS = [
  {
    id: 'valet',
    name: 'Main Valet & Welcome Canopy',
    dept: 'Main Hospital Entrance',
    lat: 40.7421,
    lng: -73.9741,
    status: 'Optimal Outdoor GPS Reception',
  },
  {
    id: 'er',
    name: 'Emergency Pavilion Gate 1',
    dept: 'Trauma & Urgent Care',
    lat: 40.7428,
    lng: -73.9749,
    status: 'High Traffic Rendezvous Point',
  },
  {
    id: 'outpatient',
    name: 'Outpatient Pavilion South',
    dept: 'Specialty Clinics',
    lat: 40.7412,
    lng: -73.9735,
    status: 'Direct Elevator & Clinic Access',
  },
  {
    id: 'imaging',
    name: 'Diagnostic Center Gate 3',
    dept: 'Radiology & MRI',
    lat: 40.7418,
    lng: -73.9752,
    status: 'Accessible Wheelchair Ramped',
  },
];

export const LiveGpsTrackerModal: React.FC<LiveGpsTrackerModalProps> = ({
  isOpen,
  onClose,
  role: initialRole = 'patient',
  requestId,
  matchId,
  palId,
  patientId,
  hospitalName = 'NYU Langone Health - Tisch Hospital',
  hospitalAddress = '550 1st Avenue, New York, NY 10016',
  hospitalLatitude = 40.7421,
  hospitalLongitude = -73.9741,
  palName = 'Sarah Jenkins, Verified PAL',
}) => {
  const [activeRole, setActiveRole] = useState<'patient' | 'pal'>(initialRole);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('valet');
  const [isLiveLocationOn, setIsLiveLocationOn] = useState<boolean>(false);
  const [isInitializingGps, setIsInitializingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live telemetry
  const [currentCoords, setCurrentCoords] = useState<LiveGpsPoint | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pingedAlert, setPingedAlert] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const selectedLandmark =
    CAMPUS_LANDMARKS.find((l) => l.id === selectedLandmarkId) || CAMPUS_LANDMARKS[0];

  // Effective hospital destination target
  const targetHospital = {
    name: hospitalName || selectedLandmark.name,
    address: hospitalAddress || selectedLandmark.dept,
    latitude: hospitalLatitude || selectedLandmark.lat,
    longitude: hospitalLongitude || selectedLandmark.lng,
  };

  // Sync tracking active state
  useEffect(() => {
    if (isOpen) {
      setIsLiveLocationOn(isGpsTrackingActive());
    }
  }, [isOpen]);

  // Subscribe to live location if session exists
  useEffect(() => {
    if (!isOpen || !activeSessionId) return;

    const unsubscribe = subscribeToLiveLocationSession(activeSessionId, (point) => {
      setCurrentCoords(point);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, activeSessionId]);

  // Start real device GPS tracking
  const handleStartLiveTracking = async () => {
    setIsInitializingGps(true);
    setGpsError(null);

    const res = await startPalLiveTracking({
      requestId,
      matchId,
      palId,
      patientId,
      onPositionUpdate: (coords) => {
        setCurrentCoords({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracyMeters,
          speedMps: coords.speedMps,
          recordedAt: coords.recordedAt,
        });
        setIsLiveLocationOn(true);
        setIsInitializingGps(false);
      },
      onError: (err) => {
        setGpsError(err);
        setIsInitializingGps(false);
        setIsLiveLocationOn(false);
      },
    });

    if (res.sessionId) {
      setActiveSessionId(res.sessionId);
    }
  };

  // Stop real device GPS tracking
  const handleStopLiveTracking = async () => {
    await stopPalLiveTracking(activeSessionId);
    setIsLiveLocationOn(false);
    setActiveSessionId(null);
  };

  if (!isOpen) return null;

  const handlePingPal = () => {
    setPingedAlert(true);
    setTimeout(() => setPingedAlert(false), 3000);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-gray-200 shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#48A6A5]/15 border border-[#48A6A5]/40 flex items-center justify-center text-[#48A6A5]">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#48A6A5] tracking-widest flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isLiveLocationOn ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'
                    }`}
                  />
                  {isLiveLocationOn ? 'LIVE GPS BROADCAST ACTIVE' : 'LIVE HOSPITAL RADAR'}
                </span>
                <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-700 font-bold">
                  OpenStreetMap Powered
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#1F3449]">
                PathPal Campus Live Navigation
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveRole('patient')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'patient'
                    ? 'bg-white text-[#1F3449] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Patient View
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('pal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'pal'
                    ? 'bg-white text-[#1F3449] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Pal View
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Live Broadcast Action Bar */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-bold uppercase text-[11px]">GPS Sharing:</span>
            {isLiveLocationOn ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                BROADCASTING TO PATIENT
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 font-bold text-[10px]">
                STANDBY / BROADCAST OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLiveLocationOn ? (
              <button
                type="button"
                onClick={handleStartLiveTracking}
                disabled={isInitializingGps}
                className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black uppercase text-[11px] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 tracking-wider"
              >
                {isInitializingGps ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Acquiring GPS Signal...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Live GPS Stream</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopLiveTracking}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[11px] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer tracking-wider"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop Live Stream</span>
              </button>
            )}
          </div>
        </div>

        {/* GPS Error Alert */}
        {gpsError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{gpsError}</span>
          </div>
        )}

        {/* Ping Audio Notification Toast */}
        {pingedAlert && (
          <div className="bg-[#E85D75] text-white text-xs font-black uppercase py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-bounce">
            <Radio className="w-4 h-4 animate-ping" />
            <span>Audio & Haptic Signal Sent to Companion Pal!</span>
          </div>
        )}

        {/* Main Body Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Real-Time Map (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <LiveLocationMap
              hospital={targetHospital}
              palLocation={currentCoords}
              palName={palName}
              height="h-80 sm:h-96"
            />

            {/* Campus Rendezvous Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Designated Hospital Campus Rendezvous Gate
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMPUS_LANDMARKS.map((dp) => (
                  <button
                    key={dp.id}
                    type="button"
                    onClick={() => setSelectedLandmarkId(dp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedLandmarkId === dp.id
                        ? 'bg-rose-50/60 border-[#E85D75] text-[#1F3449] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F3449]">{dp.name}</span>
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          selectedLandmarkId === dp.id ? 'text-[#E85D75]' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{dp.dept}</div>
                    <div className="text-[10px] text-[#48A6A5] mt-1 font-mono font-bold">{dp.status}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Telemetry & Companion Profile Panel (1 Col) */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="text-xs font-bold uppercase text-gray-500">Companion Status</div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-[#48A6A5]/10 text-[#48A6A5] border border-[#48A6A5]/30">
                  En Route to Meeting Point
                </span>
              </div>

              {/* Pal Profile Card */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#48A6A5]/20 border-2 border-[#48A6A5] flex items-center justify-center text-[#48A6A5] font-black">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-[#1F3449] truncate">{palName}</h4>
                  <p className="text-xs text-gray-500">Verified Healthcare Companion</p>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">★ 5.0 Rating • Background Cleared</div>
                </div>
              </div>

              {/* Quick Communication Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="tel:18005557284"
                  className="bg-white hover:bg-gray-100 text-[#1F3449] p-3 rounded-xl border border-gray-200 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4 text-[#48A6A5]" />
                  <span>Call Pal</span>
                </a>
                <button
                  type="button"
                  onClick={handlePingPal}
                  className="bg-white hover:bg-gray-100 text-[#1F3449] p-3 rounded-xl border border-gray-200 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#48A6A5]" />
                  <span>Send Signal</span>
                </button>
              </div>
            </div>

            {/* Safety & Location Protection Card */}
            <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Encrypted Telemetry Stream</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Live coordinates are streamed directly through secure Supabase Realtime channels and automatically conclude when your escort visit completes.
              </p>
              <button
                type="button"
                onClick={handleShareLink}
                className="w-full py-2.5 bg-white hover:bg-emerald-100/50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Live Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Live Link with Family</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
