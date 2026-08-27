import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
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
  ShieldAlert,
  Play,
  Square,
  CheckCircle2,
} from 'lucide-react';
import {
  startPalLiveTracking,
  stopPalLiveTracking,
  subscribeToLiveLocationSession,
  calculateDistanceMeters,
  formatDistanceDisplay,
  estimateWalkingEta,
  LocationCoordinates,
  isGpsTrackingActive,
} from '../lib/locationService';

interface LiveGpsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'patient' | 'pal';
  requestId?: string;
  matchId?: number;
  palId?: number;
  patientId?: number;
}

// Metro Health Campus Rendezvous Coordinates
const METRO_HEALTH_LANDMARKS = [
  {
    id: 'valet',
    name: 'Main Valet Canopy',
    dept: 'Main Hospital Entrance',
    lat: 41.4674,
    lng: -81.7012,
    status: 'Optimal Outdoor GPS Reception',
  },
  {
    id: 'er',
    name: 'Emergency Room Gate 1',
    dept: 'Trauma & Urgent Care',
    lat: 41.4681,
    lng: -81.7018,
    status: 'High Traffic Rendezvous Point',
  },
  {
    id: 'outpatient',
    name: 'Outpatient Pavilion South',
    dept: 'Specialty Clinics',
    lat: 41.4665,
    lng: -81.7005,
    status: 'Direct Elevator & Clinic Access',
  },
  {
    id: 'imaging',
    name: 'Diagnostic Center Gate 3',
    dept: 'Radiology & MRI',
    lat: 41.4669,
    lng: -81.7025,
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
}) => {
  const [activeRole, setActiveRole] = useState<'patient' | 'pal'>(initialRole);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('valet');
  const [isLiveLocationOn, setIsLiveLocationOn] = useState<boolean>(false);
  const [isInitializingGps, setIsInitializingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live telemetry
  const [currentCoords, setCurrentCoords] = useState<LocationCoordinates | null>(null);
  const [lastUpdatedAgo, setLastUpdatedAgo] = useState<number>(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [simulatedOffset, setSimulatedOffset] = useState<number>(140);
  const [pingedAlert, setPingedAlert] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const selectedLandmark =
    METRO_HEALTH_LANDMARKS.find((l) => l.id === selectedLandmarkId) || METRO_HEALTH_LANDMARKS[0];

  // Monitor elapsed seconds since last GPS update
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLastUpdatedAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Sync tracking active state
  useEffect(() => {
    if (isOpen) {
      setIsLiveLocationOn(isGpsTrackingActive());
    }
  }, [isOpen]);

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
        setCurrentCoords(coords);
        setLastUpdatedAgo(0);
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

  // Handle Close & Cleanup
  const handleCloseModal = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Calculate real distance if coordinates available, else calculate from landmark
  const distanceMeters = currentCoords
    ? calculateDistanceMeters(
        currentCoords.latitude,
        currentCoords.longitude,
        selectedLandmark.lat,
        selectedLandmark.lng
      )
    : simulatedOffset;

  const formattedDistance = formatDistanceDisplay(distanceMeters);
  const etaInfo = estimateWalkingEta(distanceMeters, currentCoords?.speedMps);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#0D121F] rounded-3xl max-w-4xl w-full border border-[#00F0FF]/40 shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#121824] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#00F0FF] tracking-widest flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isLiveLocationOn ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'
                    }`}
                  ></span>
                  {isLiveLocationOn ? 'LIVE LOCATION BROADCAST ACTIVE' : 'LIVE RADAR TRACKER'}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300 border border-white/10 font-bold">
                  {currentCoords ? `±${currentCoords.accuracyMeters}m GPS Precision` : 'High Precision Mode'}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Metro Health Hospital Live GPS Radar
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="hidden sm:flex items-center bg-[#1A2232] p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveRole('patient')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeRole === 'patient'
                    ? 'bg-[#00F0FF] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Patient View
              </button>
              <button
                onClick={() => setActiveRole('pal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeRole === 'pal'
                    ? 'bg-[#00F0FF] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pal View
              </button>
            </div>

            <button
              onClick={handleCloseModal}
              className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Live Broadcast Action Bar */}
        <div className="bg-[#161F2E] px-4 sm:px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold uppercase text-[11px]">GPS Sharing Status:</span>
            {isLiveLocationOn ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-[10px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE LOCATION ON
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 font-bold text-[10px]">
                LIVE LOCATION OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLiveLocationOn ? (
              <button
                onClick={handleStartLiveTracking}
                disabled={isInitializingGps}
                className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black uppercase text-[11px] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isInitializingGps ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Acquiring GPS Signal...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Start Live Location</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStopLiveTracking}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[11px] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop Live Location</span>
              </button>
            )}
          </div>
        </div>

        {/* GPS Error Alert */}
        {gpsError && (
          <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{gpsError}</span>
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
          
          {/* Map & Visual Radar Canvas (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Interactive Map Visual Stage */}
            <div className="relative bg-[#080B12] rounded-3xl border border-white/15 h-80 sm:h-96 overflow-hidden shadow-inner flex flex-col justify-between p-4">
              
              {/* Grid Lines Overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#00F0FF 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px, 40px 40px, 40px 40px',
                }}
              />

              {/* Hospital Map Vector Blueprint Graphic */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-72 h-72 rounded-full border border-[#00F0FF]/30 flex items-center justify-center animate-spin-slow">
                  <div className="w-52 h-52 rounded-full border border-dashed border-[#00F0FF]/20 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-[#00F0FF]/40"></div>
                  </div>
                </div>
              </div>

              {/* Campus Landmark Badge */}
              <div className="absolute top-6 left-6 bg-[#121824]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-gray-300 z-20">
                <div className="text-[#00F0FF] font-bold uppercase">Metro Health Main Hospital</div>
                <div>{selectedLandmark.name} • {selectedLandmark.dept}</div>
              </div>

              {/* Patient Pin (At Rendezvous Spot) */}
              <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#E85D75]/20 border-2 border-[#E85D75] flex items-center justify-center shadow-lg shadow-[#E85D75]/30">
                    <Heart className="w-5 h-5 text-[#E85D75] fill-[#E85D75] animate-pulse" />
                  </div>
                  <div className="absolute -inset-2 rounded-full border border-[#E85D75]/50 animate-ping"></div>
                </div>
                <div className="bg-[#E85D75] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 shadow-md">
                  {activeRole === 'patient' ? 'You (Patient Spot)' : 'Patient Meeting Spot'}
                </div>
              </div>

              {/* Connecting Simulated Route Beam Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1="33%"
                  y1="75%"
                  x2="70%"
                  y2="30%"
                  stroke="#00F0FF"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              </svg>

              {/* Pal Pin (Active Companion) */}
              <div className="absolute top-1/4 left-2/3 flex flex-col items-center z-20">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#00F0FF]/20 border-2 border-[#00F0FF] flex items-center justify-center shadow-xl shadow-[#00F0FF]/40">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                      alt="Pal Elena"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -inset-1.5 rounded-full border border-[#00F0FF] animate-ping"></div>
                </div>
                <div className="bg-[#00F0FF] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 shadow-md flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Elena V. (Pal)</span>
                </div>
              </div>

              {/* Live Distance Floating Badge */}
              <div className="absolute top-6 right-6 bg-[#1A2232]/90 backdrop-blur-md p-3 rounded-2xl border border-[#00F0FF]/30 text-right space-y-0.5 shadow-lg z-20">
                <div className="text-[10px] font-black uppercase text-[#00F0FF]">DISTANCE TO RENDEZVOUS</div>
                <div className="text-2xl font-black text-white">{formattedDistance}</div>
                <div className="text-[10px] text-gray-300 font-bold">
                  ETA: <span className="text-[#00F0FF]">{etaInfo.formatted}</span>
                </div>
              </div>

              {/* Map Footer Telemetry Bar */}
              <div className="relative z-20 flex flex-wrap items-center justify-between bg-[#121824]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs gap-2">
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-gray-300 text-[11px] font-bold">
                    GPS Signal:{' '}
                    <span className="text-white">
                      {currentCoords
                        ? `Live Lat ${currentCoords.latitude.toFixed(4)}, Lng ${currentCoords.longitude.toFixed(4)} (±${currentCoords.accuracyMeters}m)`
                        : 'Active (Campus Gate High Precision Mode)'}
                    </span>
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Updated {lastUpdatedAgo}s ago
                </div>
              </div>

            </div>

            {/* Campus Rendezvous Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Selected Hospital Campus Rendezvous Spot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {METRO_HEALTH_LANDMARKS.map((dp) => (
                  <button
                    key={dp.id}
                    onClick={() => setSelectedLandmarkId(dp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedLandmarkId === dp.id
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white'
                        : 'bg-[#121824] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dp.name}</span>
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          selectedLandmarkId === dp.id ? 'text-[#00F0FF]' : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400">{dp.dept}</div>
                    <div className="text-[9px] text-[#00F0FF] mt-1 font-mono">{dp.status}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Side Telemetry & Companion Profile Panel (1 Col) */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className="bg-[#121824] p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="text-xs font-bold uppercase text-gray-400">Companion Status</div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase border bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30">
                  En Route to Meeting Point
                </span>
              </div>

              {/* Pal Profile Card */}
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                  alt="Elena Vance"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00F0FF]"
                />
                <div>
                  <h4 className="text-base font-black text-white">Elena Vance</h4>
                  <p className="text-xs text-gray-400">Badge #PP-7821 • Verified Pal</p>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">★ 4.95 Rating (142 Visits)</div>
                </div>
              </div>

              {/* Live Distance Telemetry Stats */}
              <div className="bg-[#1A2232] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Speed:</span>
                  <span className="font-bold text-white">
                    {currentCoords?.speedMps ? `${(currentCoords.speedMps * 2.23694).toFixed(1)} mph` : '2.8 mph (Walking)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance:</span>
                  <span className="font-bold text-[#00F0FF]">{formattedDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Arrival:</span>
                  <span className="font-bold text-white">{etaInfo.formatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Gate:</span>
                  <span className="font-bold text-emerald-400">Verified Cleared</span>
                </div>
              </div>

              {/* Quick Communication Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:18005557284"
                  className="bg-[#1A2232] hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#00F0FF]" />
                  <span>Call Pal</span>
                </a>
                <button
                  onClick={handlePingPal}
                  className="bg-[#1A2232] hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
                  <span>Send Signal</span>
                </button>
              </div>

            </div>

            {/* Safety & Location Protection Card */}
            <div className="bg-[#121824] p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#00F0FF]">
                <Shield className="w-4 h-4 text-[#00F0FF]" />
                <span>Encrypted Location Stream</span>
              </div>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Live coordinates are end-to-end encrypted and automatically destroyed once your escort visit concludes.
              </p>
              <button
                onClick={handleShareLink}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Live Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Live Arrival Link with Family</span>
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
