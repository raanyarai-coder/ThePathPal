import React, { useState } from 'react';
import { Smartphone, Download, QrCode, ShieldCheck, Zap, Radio, MapPin, CheckCircle2, X, Share2, Sparkles, ExternalLink } from 'lucide-react';
import androidMockup from '../assets/images/android_app_mockup_1785622945336.jpg';

interface AndroidAppSectionProps {
  onRequestPal: () => void;
}

export const AndroidAppSection: React.FC<AndroidAppSectionProps> = ({ onRequestPal }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'gps' | 'indoor' | 'voice' | 'badge'>('gps');

  const handleDownloadApk = () => {
    setIsDownloading(true);
    setDownloadComplete(false);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadComplete(true);
    }, 2000);
  };

  return (
    <section id="android-app" className="py-20 bg-[#0B0F19] border-t border-b border-white/10 relative overflow-hidden text-white">
      {/* Background Neon Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-black uppercase tracking-widest">
            <Smartphone className="w-4 h-4" />
            <span>PathPal Native Android App</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Hospital Navigation in <span className="text-[#00F0FF] text-stroke-cyan">Your Pocket</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            Download the official PathPal Android app for instant emergency dispatch, live companion tracking, turn-by-turn indoor hospital maps, and hands-free voice guidance.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mobile Device Image Showcase */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative group max-w-sm w-full">
              {/* Outer Neon Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00F0FF] to-[#FF5C00] rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <div className="relative bg-[#121824] border border-white/20 rounded-3xl p-3 shadow-2xl overflow-hidden">
                <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-black">
                  <img
                    src={androidMockup}
                    alt="PathPal Android Mobile App Interface"
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating Overlay Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#0A0D14]/90 backdrop-blur-md border border-[#00F0FF]/40 rounded-xl p-3 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[#00F0FF] flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-[#00F0FF]" /> Live GPS Tracking
                      </span>
                      <span className="bg-[#00F0FF]/20 text-[#00F0FF] px-2 py-0.5 rounded text-[10px]">v2.4.0 APK</span>
                    </div>
                    <p className="text-[11px] text-gray-300">
                      Your assigned Pal is arriving at Main Valet Desk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Download Callouts & Interactive App Features */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Download Badges & Buttons */}
            <div className="bg-[#121824] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black uppercase text-white">Get PathPal for Android</h3>
                  <p className="text-xs text-gray-400">Requires Android 8.0+ • Size: 38MB • Free Download</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/30">
                  <ShieldCheck className="w-4 h-4" /> Verified Safe APK
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* APK Direct Download Button */}
                <button
                  onClick={handleDownloadApk}
                  disabled={isDownloading}
                  className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-black uppercase text-xs px-5 py-3.5 rounded-xl transition-all shadow-lg shadow-[#00F0FF]/20 flex items-center justify-center gap-2 group"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Downloading APK...</span>
                    </>
                  ) : downloadComplete ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>APK Saved (Tap to Install)</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      <span>Download Android APK</span>
                    </>
                  )}
                </button>

                {/* QR Code Modal Trigger */}
                <button
                  onClick={() => setShowQrModal(true)}
                  className="bg-[#1A2232] hover:bg-white/10 text-white border border-white/15 font-bold text-xs px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#00F0FF]" />
                  <span>Scan QR Code to Install</span>
                </button>
              </div>

              {downloadComplete && (
                <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-xs text-[#00F0FF] font-medium flex items-center justify-between">
                  <span>PathPal_Care_v2.4.0.apk successfully generated for real device installation.</span>
                  <button onClick={() => setDownloadComplete(false)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Feature Tabs */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-400">Core Android Capabilities</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveFeature('gps')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                    activeFeature === 'gps'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-[#121824] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0" /> Live Entrance Pinning
                </button>
                <button
                  onClick={() => setActiveFeature('indoor')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                    activeFeature === 'indoor'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-[#121824] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <Radio className="w-4 h-4 shrink-0" /> Indoor BLE Beacons
                </button>
                <button
                  onClick={() => setActiveFeature('voice')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                    activeFeature === 'voice'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-[#121824] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <Zap className="w-4 h-4 shrink-0" /> Hands-Free Voice Guidance
                </button>
                <button
                  onClick={() => setActiveFeature('badge')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                    activeFeature === 'badge'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-[#121824] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" /> NFC Companion Verification
                </button>
              </div>

              {/* Active Feature Detail Card */}
              <div className="p-4 bg-[#121824] border border-white/10 rounded-xl space-y-2">
                {activeFeature === 'gps' && (
                  <>
                    <div className="text-xs font-black uppercase text-[#00F0FF]">Real-Time Doorstep Dispatch</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Automatically senses when your vehicle approaches the hospital valet or entrance. Alerts your assigned Pal in advance so they are standing by with a wheelchair at the curb.
                    </p>
                  </>
                )}
                {activeFeature === 'indoor' && (
                  <>
                    <div className="text-xs font-black uppercase text-[#00F0FF]">Bluetooth BLE Indoor Wayfinding</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Works deep inside thick hospital walls where cellular signals fade. Communicates with hospital ceiling beacons to guide you through elevators and corridors seamlessly.
                    </p>
                  </>
                )}
                {activeFeature === 'voice' && (
                  <>
                    <div className="text-xs font-black uppercase text-[#00F0FF]">Hands-Free Voice Guidance & Navigation</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Auditory step-by-step turn guidance designed for visually impaired or elderly patients navigating hospital hallways, elevators, and clinic corridors effortlessly.
                    </p>
                  </>
                )}
                {activeFeature === 'badge' && (
                  <>
                    <div className="text-xs font-black uppercase text-[#00F0FF]">NFC & QR Pal Security Verification</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Tap your phone against your Pal's official PathPal smart badge to instantly verify their criminal background clearance, hospital clearance, and active session identity.
                    </p>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-[#00F0FF]/40 rounded-3xl p-6 max-w-sm w-full space-y-5 text-center relative shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex p-3 bg-[#00F0FF]/10 text-[#00F0FF] rounded-2xl">
              <QrCode className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black uppercase text-white">Scan to Install on Android</h3>
            <p className="text-xs text-gray-300">
              Point your Android camera at this QR code to download and install PathPal directly on your device.
            </p>

            {/* Simulated QR Code Canvas */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto border-4 border-[#00F0FF]/40">
              <div className="w-48 h-48 bg-[#0A0D14] p-3 flex flex-col items-center justify-between text-white rounded-lg relative overflow-hidden">
                <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2 bg-white">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i * 7 + 3) % 5 === 0 || i % 2 === 0 ? 'bg-[#0A0D14]' : 'bg-[#00F0FF]'
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-[#0A0D14] text-[#00F0FF] text-[9px] font-black uppercase px-2 py-1 rounded border border-[#00F0FF]">
                    PATHPAL APK
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 font-mono">
              Direct Link: <span className="text-[#00F0FF]">https://pathpal.care/download/android-apk</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-[#1A2232] hover:bg-white/10 text-white font-bold text-xs py-3 rounded-xl border border-white/10"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
