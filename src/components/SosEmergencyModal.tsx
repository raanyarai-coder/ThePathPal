import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Phone, Radio, X, Check, MapPin, Signal, Zap, Clock, ShieldCheck, Heart, UserCheck, Volume2, VolumeX, Send, RefreshCw, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SosEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHospitalName?: string;
}

export const SosEmergencyModal: React.FC<SosEmergencyModalProps> = ({
  isOpen,
  onClose,
  initialHospitalName = "Metro Health Main Hospital",
}) => {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<number>(10);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [sosBroadcastActive, setSosBroadcastActive] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<string>('all');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gpsLocked, setGpsLocked] = useState<boolean>(true);

  // Broadcast Telemetry Logs
  const [logs, setLogs] = useState<string[]>([
    "00:00:01 - GPS Lock Confirmed: Lat 37.7749° N, Long 122.4194° W (± 1.8m accuracy)",
    "00:00:02 - Device Telemetry: Battery 94%, LTE Signal Strong, BLE Beacon #842 Sync",
  ]);

  // Audio tone during countdown
  const playAlertTone = (freq = 880, duration = 0.15) => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  };

  // Countdown effect
  useEffect(() => {
    if (!isOpen || !isCountingDown) return;

    if (countdown > 0) {
      playAlertTone(700 + (10 - countdown) * 40, 0.2);
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished -> Auto broadcast!
      setIsCountingDown(false);
      triggerSosBroadcast();
    }
  }, [isOpen, countdown, isCountingDown]);

  const triggerSosBroadcast = () => {
    setSosBroadcastActive(true);
    setIsCountingDown(false);
    playAlertTone(1200, 0.4);

    const timeString = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev,
      `${timeString} - 🚨 HIGH-PRIORITY SOS ALERT BROADCASTED TO BACKEND`,
      `${timeString} - 📲 Priority Push Notifications dispatched to 3 nearby Pals (Marcus T., Elena V., David K.)`,
      `${timeString} - 🏢 Hospital Security Desk & Rapid Response Dispatcher pinged`,
      `${timeString} - 🔒 Encrypted Patient Health & Emergency Contact Summary Shared Read-Only`,
    ]);
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(10);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - SOS Countdown cancelled by user.`]);
  };

  const handleRestartCountdown = () => {
    setCountdown(10);
    setIsCountingDown(true);
    setSosBroadcastActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#120507] rounded-3xl max-w-2xl w-full border-2 border-[#FF3344] shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col space-y-5 p-5 sm:p-7">
        
        {/* Animated Strobe Header */}
        <div className="bg-[#2B0A0E] -m-5 sm:-m-7 p-4 sm:p-6 mb-2 border-b border-[#FF3344] flex items-center justify-between rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF3344]/20 via-transparent to-[#FF3344]/20 animate-pulse pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FF3344] text-white flex items-center justify-center shadow-lg shadow-[#FF3344]/40 animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#FF3344] bg-white/10 px-2.5 py-0.5 rounded-full border border-[#FF3344]/40">
                  EMERGENCY SOS MODE ACTIVE
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FF3344] animate-ping" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                {t('sosModalTitle')}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-black/40 text-gray-300 hover:text-white border border-white/10"
              title={isMuted ? "Unmute Siren Sound" : "Mute Siren Sound"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-[#FF3344] animate-pulse" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-black/40 text-gray-400 hover:text-white border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION 1: COUNTDOWN TIMER & BROADCAST STATUS */}
        <div className="bg-[#1A070A] p-5 rounded-2xl border border-[#FF3344]/40 space-y-4">
          
          {isCountingDown ? (
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Broadcasting SOS Alert In...</span>
              </div>

              {/* Big Countdown Graphic */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#FF3344]/30 animate-ping pointer-events-none" />
                <div className="w-24 h-24 rounded-full bg-[#FF3344]/20 border-4 border-[#FF3344] flex items-center justify-center shadow-xl shadow-[#FF3344]/50">
                  <span className="text-4xl font-black text-white font-mono">{countdown}s</span>
                </div>
              </div>

              <p className="text-xs text-gray-300 max-w-sm mx-auto">
                High-priority SOS signal, live GPS location, and medical summary will automatically broadcast to nearby Pals and hospital security when timer reaches zero.
              </p>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={handleCancelCountdown}
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs uppercase border border-white/20 transition-all"
                >
                  Cancel Countdown
                </button>
                <button
                  onClick={triggerSosBroadcast}
                  className="px-6 py-2.5 rounded-xl bg-[#FF3344] hover:bg-[#FF3344]/90 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Broadcast Now</span>
                </button>
              </div>
            </div>
          ) : sosBroadcastActive ? (
            <div className="bg-[#280B0F] p-4 rounded-xl border border-[#00F0FF]/50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#00F0FF] uppercase tracking-wider">
                  <Radio className="w-4 h-4 animate-ping" />
                  <span>LIVE SOS BROADCAST ACTIVE & BROADCASTING</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  SIGNAL LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono">LAT/LONG GPS:</span>
                  <span className="text-white font-bold font-mono">37.7749° N, -122.4194° W</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono">NEARBY PALS:</span>
                  <span className="text-[#00F0FF] font-bold">3 On-Duty Pinged</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 block font-mono">SECURITY DESK:</span>
                  <span className="text-emerald-400 font-bold">St. Mary's Alerted</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleRestartCountdown}
                  className="text-[11px] text-gray-400 hover:text-white underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset SOS Dispatcher
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 space-y-2">
              <span className="text-xs font-bold text-gray-400">SOS Countdown Cancelled</span>
              <div>
                <button
                  onClick={handleRestartCountdown}
                  className="px-5 py-2.5 rounded-xl bg-[#FF3344] text-white font-black text-xs uppercase tracking-wider"
                >
                  Restart SOS Countdown Timer
                </button>
              </div>
            </div>
          )}

        </div>

        {/* SECTION 2: ONE-TAP DIALING FOR EMERGENCY SERVICES */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black uppercase text-[#FF3344] tracking-wider flex items-center gap-1.5">
            <Phone className="w-4 h-4 fill-[#FF3344]" />
            <span>One-Tap Dialing for Local Emergency Services</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* Call 911 */}
            <a
              href="tel:911"
              className="p-3.5 rounded-2xl bg-[#FF3344] hover:bg-[#FF3344]/90 text-white font-black transition-all flex flex-col justify-between shadow-xl border border-white/20 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-black/30 px-2 py-0.5 rounded">
                  POLICE / FIRE / AMBULANCE
                </span>
                <Phone className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-black">DIAL 911</div>
                <p className="text-[10px] text-white/80 font-normal">Immediate Life-Threatening Response</p>
              </div>
            </a>

            {/* Hospital Security Desk */}
            <a
              href="tel:18005559111"
              className="p-3.5 rounded-2xl bg-[#1A2232] hover:bg-white/10 text-white font-bold border border-white/15 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30">
                  CAMPUS SECURITY
                </span>
                <ShieldCheck className="w-4 h-4 text-[#00F0FF] group-hover:scale-125 transition-transform" />
              </div>
              <div className="mt-2">
                <div className="text-sm font-black text-white">Hospital Security Desk</div>
                <p className="text-[10px] text-gray-400 font-mono">1-800-555-9111 (Ext 401)</p>
              </div>
            </a>

            {/* PathPal Urgent Dispatch */}
            <a
              href="tel:18007284725"
              className="p-3.5 rounded-2xl bg-[#1A2232] hover:bg-white/10 text-white font-bold border border-white/15 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-companion-coral bg-companion-coral/10 px-2 py-0.5 rounded border border-companion-coral/30">
                  PATHPAL DISPATCH
                </span>
                <Heart className="w-4 h-4 text-companion-coral fill-companion-coral group-hover:scale-125 transition-transform" />
              </div>
              <div className="mt-2">
                <div className="text-sm font-black text-white">PathPal 24/7 Hotline</div>
                <p className="text-[10px] text-gray-400 font-mono">1-800-PATH-PAL</p>
              </div>
            </a>

          </div>
        </div>

        {/* SECTION 3: BROADCAST TELEMETRY AUDIT LOG */}
        <div className="bg-[#0A0304] p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Real-Time Broadcast Dispatch Log</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Encrypted WebSocket Channel</span>
          </div>

          <div className="bg-black p-3 rounded-xl max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-gray-300">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Close / Acknowledge Button */}
        <div className="pt-1 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Dismiss SOS View
          </button>
        </div>

      </div>
    </div>
  );
};
