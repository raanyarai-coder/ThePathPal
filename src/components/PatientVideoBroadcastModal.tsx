import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  X, 
  Radio, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Camera, 
  RefreshCw, 
  Wifi, 
  Info, 
  MessageSquare, 
  Sliders, 
  Eye, 
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PatientVideoBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedPalName?: string;
  hospitalName?: string;
  meetingZone?: string;
}

export const PatientVideoBroadcastModal: React.FC<PatientVideoBroadcastModalProps> = ({
  isOpen,
  onClose,
  assignedPalName = 'Elena Rostova, RN',
  hospitalName = 'St. Jude Medical Center',
  meetingZone = 'Main Entrance Lobby (Zone A)',
}) => {
  const { t } = useLanguage();

  // Stream state
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [palConnected, setPalConnected] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Equipment & Mobility setup checklist overlay
  const [equipmentChecklist, setEquipmentChecklist] = useState([
    { id: 'e1', label: 'Folding Wheelchair in Trunk', active: true },
    { id: 'e2', label: 'Walker / Quad Cane', active: true },
    { id: 'e3', label: 'Portable Oxygen Concentrator', active: false },
    { id: 'e4', label: 'Service Animal / Guide Dog', active: false },
    { id: 'e5', label: 'Caregiver / Family Member Present', active: true },
  ]);

  const [palLiveFeedback, setPalLiveFeedback] = useState<string>(
    'Elena Rostova: "I see your folding wheelchair in the trunk! I am bringing the ramp escort chair to Main Entrance Zone A now."'
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isOpen && isVideoOn) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: facingMode },
          audio: true,
        })
        .then((stream) => {
          activeStream = stream;
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or device not found:', err);
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isVideoOn, facingMode]);

  const toggleEquipment = (id: string) => {
    setEquipmentChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !isVideoOn));
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !isAudioOn));
    }
    setIsAudioOn(!isAudioOn);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#121824] rounded-3xl border-2 border-[#00F0FF]/50 max-w-3xl w-full p-5 sm:p-7 space-y-5 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-2xl bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40">
                <Video className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-[#121824]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Radio className="w-3 h-3" /> LIVE ONE-WAY STREAM
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  Patient → Pal Preview
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2 mt-0.5">
                Transit Mobility Video Broadcast
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Pal Status Bar */}
        <div className="bg-[#1A2232] p-4 rounded-2xl border border-[#00F0FF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00F0FF] to-blue-600 p-0.5 shrink-0">
                <div className="w-full h-full bg-[#121824] rounded-full flex items-center justify-center font-black text-xs text-[#00F0FF]">
                  ER
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#121824] rounded-full"></span>
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{assignedPalName}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  VIEWING LIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                Hospital: <strong className="text-white">{hospitalName}</strong> • {meetingZone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>2.4 Mbps • 1080p Peer Link</span>
          </div>
        </div>

        {/* Video Viewport Container */}
        <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-white/10 aspect-video flex items-center justify-center shadow-inner group">
          
          {/* Live Video Element */}
          {isVideoOn && hasCameraPermission !== false ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center text-gray-400">
                <VideoOff className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Camera Feed Paused or Unavailable</h4>
                <p className="text-xs text-gray-400 max-w-sm">
                  {hasCameraPermission === false
                    ? 'Browser camera permission was denied. You can still transmit equipment status badges below.'
                    : 'Video camera is currently muted. Click "Turn On Camera" below to resume live video feed.'}
                </p>
              </div>
            </div>
          )}

          {/* Video Stream Overlays */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[11px] font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>LIVE PAL PREVIEW</span>
          </div>

          {/* Privacy Security Badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1-WAY HIPAA ENCRYPTED</span>
          </div>

          {/* Live Equipment Tags Overlay on Video Bottom */}
          <div className="absolute bottom-16 left-3 right-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
            {equipmentChecklist
              .filter((e) => e.active)
              .map((eq) => (
                <span
                  key={eq.id}
                  className="bg-[#00F0FF]/90 text-black font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-black" />
                  {eq.label}
                </span>
              ))}
          </div>

          {/* Floating Controls Bar */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#121824]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-3 shadow-2xl">
            <button
              onClick={toggleVideo}
              className={`p-2.5 rounded-xl transition-all ${
                isVideoOn
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-red-500 text-white font-bold'
              }`}
              title={isVideoOn ? 'Mute Video' : 'Unmute Video'}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-xl transition-all ${
                isAudioOn
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-red-500 text-white font-bold'
              }`}
              title={isAudioOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={switchCamera}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Flip Camera (Front/Rear)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Pal Real-time Response Banner */}
        <div className="bg-[#1A2232] p-4 rounded-2xl border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Live Feedback from {assignedPalName}
            </span>
            <span className="text-[10px] font-mono text-gray-400">Just Now</span>
          </div>
          <p className="text-xs text-gray-200 font-medium italic bg-black/40 p-3 rounded-xl border border-white/5">
            "{palLiveFeedback}"
          </p>
        </div>

        {/* Interactive Equipment Toggle Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#00F0FF]" />
              Tap Equipment Tags to Transmit to Pal's Screen
            </h3>
            <span className="text-[10px] text-gray-400">Broadcasting live in stream overlay</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {equipmentChecklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleEquipment(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  item.active
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF] font-black shadow-md'
                    : 'bg-[#1A2232] text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${item.active ? 'text-black' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#00F0FF] shrink-0" />
            <span>One-way feed automatically closes upon hospital entry rendezvous.</span>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs uppercase px-5 py-3 rounded-xl border border-red-500/40 transition-all flex items-center gap-2"
          >
            <span>End Stream</span>
          </button>
        </div>

      </div>
    </div>
  );
};
