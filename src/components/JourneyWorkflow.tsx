import React, { useState } from 'react';
import { FileText, UserCheck, MapPin, Navigation, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export const JourneyWorkflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Request',
      badge: 'Step 1',
      color: 'bg-companion-coral text-white',
      border: 'border-companion-coral',
      icon: FileText,
      summary: 'Patient shares appointment and preferences',
      details: 'Patient or family member submits appointment details, hospital location, language preference, and any specific mobility accommodations needed.',
      highlights: ['No complex app download needed', 'Language & mobility preference tags', 'Real-time SMS / email confirmation'],
    },
    {
      num: '02',
      title: 'Match',
      badge: 'Step 2',
      color: 'bg-navigation-teal text-white',
      border: 'border-navigation-teal',
      icon: UserCheck,
      summary: 'Best available Pal is assigned',
      details: 'Our smart matching platform identifies verified Pals based on hospital credentialing, language fluency, availability, and specific care skills.',
      highlights: ['Automated background vetting check', 'Language & hospital experience match', 'Pal profile & photo preview shared'],
    },
    {
      num: '03',
      title: 'Meet',
      badge: 'Step 3',
      color: 'bg-warm-gold text-pathpal-navy',
      border: 'border-warm-gold',
      icon: MapPin,
      summary: 'Coordinate at an approved meeting point',
      details: 'Pal arrives 15 minutes early at a hospital-approved designated meeting point (e.g., Valet Desk, Garage Elevator, Main Entrance) wearing a visible ID badge.',
      highlights: ['Approved hospital meeting spots', 'Real-time GPS check-in alert', 'Direct SMS / call coordination'],
    },
    {
      num: '04',
      title: 'Navigate',
      badge: 'Step 4',
      color: 'bg-companion-coral text-white',
      border: 'border-companion-coral',
      icon: Navigation,
      summary: 'Pal guides the non-clinical journey',
      details: 'Pal accompanies the patient to check-in, waiting area, lab, radiology, and pharmacy — staying by their side until the visit is completely finished.',
      highlights: ['Door-to-clinic accompaniment', 'Wheelchair escort assistance', 'Calming companion presence'],
    },
    {
      num: '05',
      title: 'Review',
      badge: 'Step 5',
      color: 'bg-navigation-teal text-white',
      border: 'border-navigation-teal',
      icon: Star,
      summary: 'Complete visit and share feedback',
      details: 'Visit is logged in the system for quality assurance and hospital CHNA credits. Patient rates the experience and can save the Pal as a favorite for future visits.',
      highlights: ['1-click 5-star rating system', 'Option to favorite same Pal', 'CHNA Impact Credit logged for hospital'],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-care-blush/40 border-y border-soft-rose relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-navigation-teal text-xs font-bold uppercase tracking-wider border border-navigation-teal/20">
            <Navigation className="w-3.5 h-3.5" />
            <span>HOW PATHPAL WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            One coordinated journey from request to review
          </h2>
          <p className="text-base text-pathpal-navy/70">
            Five seamless steps ensuring every patient feels supported, confident, and never alone.
          </p>
        </div>

        {/* Horizontal Flow Stepper Bar (PPT Slide 5 layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-white shadow-md border-companion-coral scale-[1.03]'
                    : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-8 h-8 rounded-full ${step.color} text-xs font-bold flex items-center justify-center shrink-0`}>
                    {idx + 1}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-companion-coral/10 text-companion-coral' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-pathpal-navy line-clamp-1">{step.summary}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed View */}
        <div className="bg-white rounded-3xl p-8 border-2 border-soft-rose shadow-md transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-care-blush text-companion-coral text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-companion-coral"></span>
                <span>STEP {steps[activeStep].num} OF 05</span>
              </div>

              <h3 className="text-2xl font-black text-pathpal-navy">
                {steps[activeStep].title}: {steps[activeStep].summary}
              </h3>

              <p className="text-sm text-pathpal-navy/80 leading-relaxed font-medium">
                {steps[activeStep].details}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-navigation-teal">KEY PLATFORM CAPABILITIES</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {steps[activeStep].highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-pathpal-navy font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-care-blush/80 p-6 rounded-2xl border border-soft-rose text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-companion-coral text-white mx-auto flex items-center justify-center shadow-md">
                {React.createElement(steps[activeStep].icon, { className: 'w-8 h-8' })}
              </div>
              <div className="text-xs font-bold text-pathpal-navy uppercase tracking-wider">
                COORDINATED EXPERIENCE
              </div>
              <p className="text-xs text-pathpal-navy/70 italic">
                "PathPal coordinates non-clinical logistics so clinicians can focus purely on medical care."
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-pathpal-navy border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={activeStep === steps.length - 1}
                  onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-companion-coral text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
