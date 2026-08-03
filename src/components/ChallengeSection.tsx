import React from 'react';
import { AlertCircle, Building, Users, HelpCircle, CheckCircle2, UserCheck, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export const ChallengeSection: React.FC = () => {
  return (
    <section id="challenge" className="py-20 bg-gray-50/70 border-y border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-companion-coral/10 text-companion-coral text-xs font-bold uppercase tracking-wider border border-companion-coral/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>THE CHALLENGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            A hospital visit can become a navigation problem
          </h2>
          <p className="text-base text-pathpal-navy/70">
            For millions of patients, navigating vast medical campuses introduces stress, anxiety, and delays before care even begins.
          </p>
        </div>

        {/* 3 Core Challenge Cards from PPT Slide 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-7 border-t-4 border-companion-coral shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-companion-coral/10 text-companion-coral flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Complex environments</h3>
            <p className="text-xs text-pathpal-navy/75 leading-relaxed font-medium">
              Multiple entrances, parking garages, check-in desks, specialized departments, labs, elevators, pharmacies, and exits creates a confusing labyrinth.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border-t-4 border-navigation-teal shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-navigation-teal/10 text-navigation-teal flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Unequal barriers</h3>
            <p className="text-xs text-pathpal-navy/75 leading-relaxed font-medium">
              Mobility limitations, vision or hearing needs, language preferences, unfamiliar systems, and high anxiety make the journey significantly harder.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border-t-4 border-warm-gold shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-warm-gold/20 text-pathpal-navy flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5 text-pathpal-navy" />
            </div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Support gaps</h3>
            <p className="text-xs text-pathpal-navy/75 leading-relaxed font-medium">
              Family members are not always available due to work or distance, and clinical hospital staff cannot provide continuous one-on-one guidance.
            </p>
          </div>

        </div>

        {/* Highlight Banner Quote (Slide 3 bottom) */}
        <div className="bg-care-blush/90 rounded-3xl p-8 sm:p-10 border-2 border-soft-rose text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-companion-coral">
              THE CORE INSIGHT
            </div>
            <p className="text-2xl sm:text-3xl font-black text-pathpal-navy tracking-tight leading-snug">
              "Maps can show a route. They cannot meet you at the door."
            </p>
            <p className="text-sm font-medium text-pathpal-navy/75">
              Technology provides blue dots on a screen — PathPal provides a warm, reassuring human presence.
            </p>
          </div>
        </div>

        {/* Why PathPal is Different Section (Slide 9) */}
        <div className="bg-pathpal-navy text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-soft-rose">
              WHY IT IS DIFFERENT
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              The innovation is the integrated system
            </h3>
            <p className="text-sm text-gray-300">
              Moving beyond traditional maps or informal volunteering into a coordinated healthcare support layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 hover:bg-white/15 transition-colors">
              <div className="text-base font-bold text-soft-rose">Not just a map</div>
              <p className="text-xs text-gray-200 leading-relaxed">
                A real person can meet and accompany the patient door-to-door through every stage of their visit.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 hover:bg-white/15 transition-colors">
              <div className="text-base font-bold text-soft-rose">Not just volunteering</div>
              <p className="text-xs text-gray-200 leading-relaxed">
                Structured matching, standardized training, CHW credentialing, coordination, and quality measurement.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 hover:bg-white/15 transition-colors">
              <div className="text-base font-bold text-soft-rose">Not just reminders</div>
              <p className="text-xs text-gray-200 leading-relaxed">
                Support spans the full non-clinical hospital journey, from valet pickup to outpatient checkout.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 hover:bg-white/15 transition-colors">
              <div className="text-base font-bold text-soft-rose">Not just a consumer app</div>
              <p className="text-xs text-gray-200 leading-relaxed">
                Hospitals receive complete oversight, operational data, wait-time reductions, and CHNA impact reports.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
