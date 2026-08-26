import React, { useState } from 'react';
import { Play, Volume2, Maximize2, X, CheckCircle2, Video, Globe, Users, Shield, ArrowRight, Pause, RotateCcw } from 'lucide-react';
import patientVideoThumb from '../assets/images/patient_video_guide_1785622955784.jpg';
import palVideoThumb from '../assets/images/pal_video_guide_1785622965752.jpg';
import hospitalVideoThumb from '../assets/images/hospital_companion_escort_1785620333346.jpg';

interface VideoGuidesSectionProps {
  onRequestPal: () => void;
  onBecomePal: () => void;
}

interface VideoGuideItem {
  id: string;
  title: string;
  category: 'Patient Guide' | 'Pal Training' | 'Hospital Integration';
  duration: string;
  description: string;
  thumbnail: string;
  keyPoints: string[];
}

export const VideoGuidesSection: React.FC<VideoGuidesSectionProps> = ({ onRequestPal, onBecomePal }) => {
  const [activeVideo, setActiveVideo] = useState<VideoGuideItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(35);
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'ES' | 'HI' | 'ZH' | 'TL'>('EN');

  const guides: VideoGuideItem[] = [
    {
      id: 'patient-guide',
      title: 'Patient & Family Guide: Booking & Meeting Your Pal at the Hospital',
      category: 'Patient Guide',
      duration: '3:45',
      description: 'Step-by-step visual explanation of how patients and family members request a companion pal, set curb meeting points, and navigate appointments stress-free.',
      thumbnail: patientVideoThumb,
      keyPoints: [
        'How to pin your hospital valet or entrance gate',
        'Recognizing your Pal’s verified badge & lanyard',
        'Wheelchair assistance & non-clinical guidance',
        'Sharing real-time visit updates with loved ones'
      ]
    },
    {
      id: 'pal-guide',
      title: 'Companion Pal Orientation: Safety, Empathy & Companion Protocols',
      category: 'Pal Training',
      duration: '5:10',
      description: 'Comprehensive orientation video for newly onboarded Companion Pals detailing hospital navigation routes, patient dignity protocols, and badge check-ins.',
      thumbnail: palVideoThumb,
      keyPoints: [
        'Hospital entrance greeting protocols',
        'Non-clinical boundaries & HIPAA compliance',
        'Handling appointment delays & waiting room support',
        'Submitting visit verification for CHW credits'
      ]
    },
    {
      id: 'hospital-guide',
      title: 'Hospital Leadership Overview: CMS G0511 & Schedule H Alignment',
      category: 'Hospital Integration',
      duration: '4:20',
      description: 'Executive video briefing for Chief Medical Officers and Patient Experience Leads detailing how PathPal integrates with hospital EHR and improves HCAHPS scores.',
      thumbnail: hospitalVideoThumb,
      keyPoints: [
        'Reducing no-show rates by up to 34%',
        'Improving HCAHPS Domain 3 & 5 satisfaction metrics',
        'Automated Schedule H Community Benefit reporting',
        'Turnkey API integration with Epic & Cerner'
      ]
    }
  ];

  return (
    <section id="video-guides" className="py-20 bg-[#1F3449] text-white border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#48A6A5]/20 border border-[#48A6A5]/40 text-[#48A6A5] text-xs font-black uppercase tracking-widest">
            <Video className="w-4 h-4" />
            <span>Interactive Video & AI Explainer Guides</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            See PathPal <span className="text-[#48A6A5]">In Action</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            Watch our visual walkthrough videos tailored for patients, companion pals, and care administrators.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-[#2B425B] border border-white/10 rounded-2xl overflow-hidden hover:border-[#48A6A5]/50 transition-all duration-300 flex flex-col group shadow-xl"
            >
              {/* Thumbnail with Play Button */}
              <div
                onClick={() => {
                  setActiveVideo(guide);
                  setIsPlaying(true);
                  setVideoProgress(15);
                }}
                className="relative aspect-video bg-black cursor-pointer overflow-hidden"
              >
                <img
                  src={guide.thumbnail}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#48A6A5] text-white flex items-center justify-center shadow-lg shadow-[#48A6A5]/30 group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </div>

                {/* Duration & Category Badges */}
                <div className="absolute top-3 left-3 bg-[#1F3449]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#48A6A5] border border-[#48A6A5]/30">
                  {guide.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-xs font-mono text-white">
                  {guide.duration}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-[#48A6A5] transition-colors line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>
                </div>

                {/* Key Points Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  {guide.keyPoints.slice(0, 2).map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#48A6A5] shrink-0" />
                      <span className="truncate">{point}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveVideo(guide);
                    setIsPlaying(true);
                    setVideoProgress(20);
                  }}
                  className="w-full text-xs font-bold uppercase text-white bg-[#1F3449] hover:bg-[#48A6A5] hover:text-white py-2.5 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Watch Video Guide
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#2B425B] border border-[#48A6A5]/40 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-0 relative">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#1F3449] border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="bg-[#48A6A5]/20 text-[#48A6A5] px-2.5 py-1 rounded text-xs font-black uppercase border border-[#48A6A5]/30">
                  {activeVideo.category}
                </span>
                <h3 className="text-sm font-bold truncate max-w-md sm:max-w-xl">{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Canvas Stage */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                className={`w-full h-full object-cover ${isPlaying ? 'opacity-90' : 'opacity-40 blur-xs'} transition-all`}
                referrerPolicy="no-referrer"
              />

              {/* Video Play/Pause Overlay Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-20 h-20 rounded-full bg-[#48A6A5] text-white flex items-center justify-center shadow-2xl shadow-[#48A6A5]/40 group-hover:scale-110 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-10 h-10 fill-white" />
                  ) : (
                    <Play className="w-10 h-10 fill-white ml-1" />
                  )}
                </div>
              </button>

              {/* Subtitles Overlay */}
              <div className="absolute bottom-16 left-6 right-6 text-center">
                <span className="bg-black/80 text-[#48A6A5] px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide border border-white/10">
                  {selectedLanguage === 'EN' && "“PathPal companions meet you directly at the hospital entrance with verified badge clearance.”"}
                  {selectedLanguage === 'ES' && "“Los compañeros de PathPal lo reciben directamente en la entrada del hospital con identificación verificada.”"}
                  {selectedLanguage === 'HI' && "“पाथपाल साथी आपसे सत्यापित पहचान पत्र के साथ सीधे अस्पताल के प्रवेश द्वार पर मिलेंगे।”"}
                  {selectedLanguage === 'ZH' && "“PathPal 陪伴员将在医院门口直接与您会面，并带有经认证的徽章。”"}
                  {selectedLanguage === 'TL' && "“Ang mga kasama sa PathPal ay nakikipagpalitan sa iyo sa pasukan ng ospital gamit ang na-verify na badge.”"}
                </span>
              </div>

              {/* Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 space-y-2">
                {/* Progress Slider */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setVideoProgress(Math.round((clickX / rect.width) * 100));
                }}>
                  <div className="bg-[#48A6A5] h-full transition-all" style={{ width: `${videoProgress}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-[#48A6A5]">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setVideoProgress(0)} className="hover:text-[#48A6A5]">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <Volume2 className="w-4 h-4 text-[#48A6A5]" />
                    <span className="font-mono text-[11px]">01:12 / {activeVideo.duration}</span>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#48A6A5]" />
                    <span className="text-[10px] font-bold text-gray-400">CC:</span>
                    {(['EN', 'ES', 'HI', 'ZH', 'TL'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedLanguage === lang ? 'bg-[#48A6A5] text-white' : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Transcript & Action Footer */}
            <div className="p-5 bg-[#1F3449] space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-gray-400">Video Highlights & Key Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeVideo.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-[#2B425B] rounded-lg border border-white/5 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-[#48A6A5] shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                <span className="text-xs text-gray-400">Ready to try PathPal for your next hospital visit?</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setActiveVideo(null);
                      onRequestPal();
                    }}
                    className="flex-1 sm:flex-none bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black uppercase text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#48A6A5]/20"
                  >
                    Request a Pal Now
                  </button>
                  <button
                    onClick={() => {
                      setActiveVideo(null);
                      onBecomePal();
                    }}
                    className="flex-1 sm:flex-none bg-[#2B425B] hover:bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10"
                  >
                    Join as a Companion Pal
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
