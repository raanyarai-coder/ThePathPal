import React from 'react';
import { ShieldCheck, FileCheck2, Award, Landmark, Building, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegulatoryAndImpact: React.FC = () => {
  return (
    <section id="policy" className="py-20 bg-gray-50/80 border-y border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navigation-teal/10 text-navigation-teal text-xs font-bold uppercase tracking-wider border border-navigation-teal/20">
            <Landmark className="w-3.5 h-3.5" />
            <span>GOVERNMENT & REGULATORY ALIGNMENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            Real policy levers already reward this work
          </h2>
          <p className="text-base text-pathpal-navy/70">
            PathPal aligns with national healthcare quality incentives, care navigation billing, and CHW reimbursement programs.
          </p>
        </div>

        {/* 6 Policy Cards from PPT Slide 16 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border-l-4 border-navigation-teal border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-navigation-teal uppercase tracking-wider mb-2">CARE NAVIGATION CODES</div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Care navigation codes</h3>
            <p className="text-xs text-pathpal-navy/75 font-medium leading-relaxed">
              Care navigation codes reimburse non-clinical navigation support, billable for FQHCs and RHCs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-l-4 border-companion-coral border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-companion-coral uppercase tracking-wider mb-2">CHW REIMBURSEMENT</div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">State CHW plans</h3>
            <p className="text-xs text-pathpal-navy/75 font-medium leading-relaxed">
              20+ states now reimburse certified Community Health Worker (CHW) services for eligible patient populations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-l-4 border-warm-gold border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-pathpal-navy uppercase tracking-wider mb-2">QUALITY INCENTIVES</div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Hospital value-based purchasing</h3>
            <p className="text-xs text-pathpal-navy/75 font-medium leading-relaxed">
              Patient experience accounts for 25% of a hospital's VBP score, affecting overall quality reimbursement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-l-4 border-navigation-teal border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-navigation-teal uppercase tracking-wider mb-2">MANDATED BENEFIT</div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Medical transportation benefit</h3>
            <p className="text-xs text-pathpal-navy/75 font-medium leading-relaxed">
              Transportation assistance that Pals help coordinate from valet entrance to appointment check-in.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-l-4 border-companion-coral border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-companion-coral uppercase tracking-wider mb-2">FUTURE BENEFIT INTEGRATION</div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Health Plan Pilots</h3>
            <p className="text-xs text-pathpal-navy/75 font-medium leading-relaxed">
              PathPal is actively evaluating pilot partnerships with health plans as future coverage and reimbursement approvals progress.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border-l-4 border-warm-gold border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-pathpal-navy uppercase tracking-wider mb-2">COMMUNITY BENEFIT</div>
            <h3 className="text-lg font-bold text-pathpal-navy mb-2">Nonprofit community benefit</h3>
            <p className="text-xs text-pathpal-navy/75 font-medium leading-relaxed">
              Nonprofit hospitals report community benefit on Schedule H; Pal hours directly fulfill CHNA strategic plans.
            </p>
          </div>

        </div>

        {/* PathPal Impact Credits Flow (Slide 17) */}
        <div className="bg-care-blush/80 rounded-3xl p-8 sm:p-12 border border-soft-rose space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-companion-coral">
              PATHPAL IMPACT CREDITS
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-pathpal-navy">
              Turning partner hours into measurable community credit
            </h3>
            <p className="text-sm text-pathpal-navy/70">
              A 5-step verified workflow converting volunteer and staff navigation hours into compliant reporting data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-soft-rose text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-companion-coral text-white text-xs font-bold mx-auto flex items-center justify-center">1</span>
              <h4 className="text-sm font-bold text-pathpal-navy">Log</h4>
              <p className="text-[11px] text-pathpal-navy/75">Institutional Pals log hours, visits, and non-clinical outcomes in the app.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-soft-rose text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-navigation-teal text-white text-xs font-bold mx-auto flex items-center justify-center">2</span>
              <h4 className="text-sm font-bold text-pathpal-navy">Verify</h4>
              <p className="text-[11px] text-pathpal-navy/75">Supervising practitioner or program lead confirms eligible navigation activity.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-soft-rose text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-warm-gold text-pathpal-navy text-xs font-bold mx-auto flex items-center justify-center">3</span>
              <h4 className="text-sm font-bold text-pathpal-navy">Earn Credits</h4>
              <p className="text-[11px] text-pathpal-navy/75">Hours convert into PathPal Impact Credits, tracked per partner organization.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-soft-rose text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-companion-coral text-white text-xs font-bold mx-auto flex items-center justify-center">4</span>
              <h4 className="text-sm font-bold text-pathpal-navy">Apply</h4>
              <p className="text-[11px] text-pathpal-navy/75">Credits map to CHNA plans, CHW billing, or supplemental benefit docs.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-soft-rose text-center space-y-2">
              <span className="w-8 h-8 rounded-full bg-navigation-teal text-white text-xs font-bold mx-auto flex items-center justify-center">5</span>
              <h4 className="text-sm font-bold text-pathpal-navy">Report</h4>
              <p className="text-[11px] text-pathpal-navy/75">Quarterly Community Impact Report supports compliance and grant reporting.</p>
            </div>

          </div>
        </div>

        {/* Institutional Pal Network (Slide 15) */}
        <div className="bg-pathpal-navy text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-soft-rose">
              PARTNER ECOSYSTEM
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Beyond volunteers: an institutional Pal network
            </h3>
            <p className="text-sm text-gray-300">
              Integrating hospitals, community clinics, pharmacies, and global health alliances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Hospitals & Health Systems</div>
              <p className="text-xs text-gray-200">Staff and volunteer Pals; hours count toward Schedule H community benefit and CHNA plans.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Clinics, FQHCs & RHCs</div>
              <p className="text-xs text-gray-200">Certified Pals deliver billable navigation under standard care management codes.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Pharmacies</div>
              <p className="text-xs text-gray-200">Neighborhood Pal hubs extending support from pickup to the pharmacy counter.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">NGOs & Community Groups</div>
              <p className="text-xs text-gray-200">Volunteer pipeline of multilingual, accessibility-trained Pals with grant-funded hours.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Health Plans & Insurers</div>
              <p className="text-xs text-gray-200">Payers sponsor navigation through CHW programs and supplemental benefits.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Global Health Partners</div>
              <p className="text-xs text-gray-200">Long-term ally for professionalizing community health workers worldwide.</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
