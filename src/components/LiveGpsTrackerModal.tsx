import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Compass, Signal, Phone, MessageSquare, Share2, Shield, Radio, RefreshCw, Eye, UserCheck, Heart, AlertCircle, ShieldAlert } from 'lucide-react';

interface LiveGpsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'patient' | 'pal';
  onOpenSosModal?: () => void;
}

export const LiveGpsTrackerModal: React.FC<LiveGpsTrackerModalProps> = ({
  isOpen,
  onClose,
  role: initialRole = 'patient',
  onOpenSosModal,
}) => {
  const [activeRole, setActiveRole] = useState<'patient' | 'pal'>(initialRole);
  const [selectedLocation, setSelectedLocation] = useState<string>('valet');
  const [simulatedDistance, setSimulatedDistance] = useState<number>(240); // distance in feet
  const [etaSeconds, setEtaSeconds] = useState<number>(165); // 2m 45s
  const [isBeaconActive, setIsBeaconActive] = useState<boolean>(true);
  const [pingedAlert, setPingedAlert] = useState<boolean>(false);
  const [palStatus, setPalStatus] = useState<'en_route' | 'arriving' | 'arrived'>('en_route');

  // Simulated live movement
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSimulatedDistance(prev => {
        if (prev <= 20) {
          setPalStatus('arrived');
          return 15;
        }
        if (prev <= 80) {
          setPalStatus('arriving');
        }
        return prev - 8;
      });

      setEtaSeconds(prev => (prev > 10 ? prev - 5 : 5));
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const dropoffPoints = [
    { id: 'valet', name: 'Main Valet Canopy', dept: 'Main Hospital Entrance', status: 'Optimal Outdoor Signal' },
    { id: 'er', name: 'Emergency Room Gate 1', dept: 'Trauma & Urgent Care', status: 'High Traffic Area' },
    { id: 'outpatient', name: 'Outpatient Pavilion South', dept: 'Specialty Clinics', status: 'Indoor BLE Beacon Active' },
    { id: 'imaging', name: 'Diagnostic Center Gate 3', dept: 'Radiology & MRI', status: 'Optimal Outdoor Signal' },
  ];

  const handlePingPal = () => {
    setPingedAlert(true);
    setTimeout(() => setPingedAlert(false), 3000);
  };

  const minutes = Math.floor(etaSeconds / 60);
  const seconds = etaSeconds % 60;
  const etaString = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

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
                <span className="text-xs font-black uppercase text-[#00F0FF] tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE GPS & BLE RADAR TRACKER
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300 border border-white/10 font-bold">
                  2.5m Accuracy
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Metro Health Hospital Pal Radar Map
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="hidden sm:flex items-center bg-[#1A2232] p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveRole('patient')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeRole === 'patient' ? 'bg-[#00F0FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Patient View
              </button>
              <button
                onClick={() => setActiveRole('pal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeRole === 'pal' ? 'bg-[#00F0FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Pal View
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="sm:hidden flex bg-[#1A2232] p-2 border-b border-white/10 text-xs">
          <button
            onClick={() => setActiveRole('patient')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
              activeRole === 'patient' ? 'bg-[#00F0FF] text-black' : 'text-gray-400'
            }`}
          >
            Patient View
          </button>
          <button
            onClick={() => setActiveRole('pal')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
              activeRole === 'pal' ? 'bg-[#00F0FF] text-black' : 'text-gray-400'
            }`}
          >
            Pal View
          </button>
        </div>

        {/* Alert Notification Toast */}
        {pingedAlert && (
          <div className="bg-companion-coral text-white text-xs font-black uppercase py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-bounce">
            <Radio className="w-4 h-4 animate-ping" />
            <span>Audio & Haptic Ping Sent to Pal's Device!</span>
          </div>
        )}

        {/* Main Body */}
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
                  backgroundSize: '20px 20px, 40px 40px, 40px 40px'
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

              {/* Simulated Map Landmarks */}
              <div className="absolute top-6 left-6 bg-[#121824]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-gray-300">
                <div className="text-[#00F0FF] font-bold uppercase">Metro Health Main Hospital</div>
                <div>Campus Building B • Entrance Gate</div>
              </div>

              {/* Patient Pin (Stationary at drop-off) */}
              <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-companion-coral/20 border-2 border-companion-coral flex items-center justify-center shadow-lg shadow-companion-coral/30">
                    <Heart className="w-5 h-5 text-companion-coral fill-companion-coral animate-pulse" />
                  </div>
                  <div className="absolute -inset-2 rounded-full border border-companion-coral/50 animate-ping"></div>
                </div>
                <div className="bg-companion-coral text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 shadow-md">
                  {activeRole === 'patient' ? 'You (Patient)' : 'Patient Location'}
                </div>
              </div>

              {/* Connecting Simulated Route Beam Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1="33%"
                  y1="75%"
                  x2={palStatus === 'arrived' ? '35%' : '70%'}
                  y2={palStatus === 'arrived' ? '72%' : '30%'}
                  stroke="#00F0FF"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              </svg>

              {/* Pal Pin (Moving towards Patient) */}
              <div 
                className={`absolute transition-all duration-1000 flex flex-col items-center z-20 ${
                  palStatus === 'arrived' ? 'top-3/4 left-1/3' : 'top-1/4 left-2/3'
                }`}
              >
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
                <div className="text-[10px] font-black uppercase text-[#00F0FF]">DISTANCE REMAINING</div>
                <div className="text-2xl font-black text-white">{simulatedDistance} ft</div>
                <div className="text-[10px] text-gray-300 font-bold">ETA: <span className="text-[#00F0FF]">{etaString}</span></div>
              </div>

              {/* Map Footer Controls Bar */}
              <div className="relative z-20 flex items-center justify-between bg-[#121824]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-gray-300 text-[11px] font-bold">
                    GPS Signal: <span className="text-white">STRONG (4G / BLE Beacon #842)</span>
                  </span>
                </div>
                <button
                  onClick={handlePingPal}
                  className="bg-companion-coral hover:bg-companion-coral/90 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Ping Audio Signal
                </button>
              </div>

            </div>

            {/* Drop-off Location Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Hospital Campus Rendezvous Point
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dropoffPoints.map((dp) => (
                  <button
                    key={dp.id}
                    onClick={() => setSelectedLocation(dp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedLocation === dp.id
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white'
                        : 'bg-[#121824] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dp.name}</span>
                      <MapPin className={`w-3.5 h-3.5 ${selectedLocation === dp.id ? 'text-[#00F0FF]' : 'text-gray-500'}`} />
                    </div>
                    <div className="text-[10px] text-gray-400">{dp.dept}</div>
                    <div className="text-[9px] text-[#00F0FF] mt-1 font-mono">{dp.status}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Side Telemetry & Pal Info Panel (1 Col) */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className="bg-[#121824] p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="text-xs font-bold uppercase text-gray-400">Pal Status</div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                  palStatus === 'arrived'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30'
                }`}>
                  {palStatus === 'arrived' ? 'Pal Has Arrived!' : 'Pal En Route'}
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
                  <p className="text-xs text-gray-400">Badge #PP-7821 • Verified CHW Pal</p>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">★ 4.95 Rating (142 Visits)</div>
                </div>
              </div>

              {/* Live Distance Stats */}
              <div className="bg-[#1A2232] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Speed:</span>
                  <span className="font-bold text-white">2.8 mph (Walking)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance:</span>
                  <span className="font-bold text-[#00F0FF]">{simulatedDistance} Feet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Arrival:</span>
                  <span className="font-bold text-white">{etaString}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Beacon Battery:</span>
                  <span className="font-bold text-emerald-400">96% Active</span>
                </div>
              </div>

              {/* Quick Communication Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:18005557284"
                  className="bg-[#1A2232] hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                >
                  <Phone className="w-4 h-4 text-[#00F0FF]" />
                  <span>Call Pal</span>
                </a>
                <button
                  onClick={handlePingPal}
                  className="bg-[#1A2232] hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
                  <span>Send SMS</span>
                </button>
              </div>

              {onOpenSosModal && (
                <button
                  onClick={onOpenSosModal}
                  className="w-full bg-[#FF3344] hover:bg-[#FF3344]/90 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF3344]/30 animate-pulse transition-all"
                >
                  <ShieldAlert className="w-4 h-4 fill-white" />
                  <span>Trigger Urgent SOS Dispatch Sequence</span>
                </button>
              )}

            </div>

            {/* Safety & HIPAA Verification Card */}
            <div className="bg-[#121824] p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#00F0FF]">
                <Shield className="w-4 h-4 text-[#00F0FF]" />
                <span>Live Location Protection</span>
              </div>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                GPS and BLE beacon data are end-to-end encrypted and automatically destroyed 30 minutes after your visit completes.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Live tracking link copied to clipboard! Share with family members.");
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Tracking Link with Family</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
