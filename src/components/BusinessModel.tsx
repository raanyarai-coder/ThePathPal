import React, { useState } from 'react';
import { DollarSign, Building2, User, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export const BusinessModel: React.FC = () => {
  const [calculatorVisits, setCalculatorVisits] = useState(400);

  // Unit economics calculation
  const estimatedCostPerVisit = 20; // $20 avg cost
  const avgRevenuePerVisit = 25; // $25 fee
  const annualSavings = calculatorVisits * 45; // estimated hospital missed appointment cost savings ($45/visit)

  return (
    <section id="pricing" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-care-blush text-companion-coral text-xs font-bold uppercase tracking-wider border border-soft-rose">
            <DollarSign className="w-3.5 h-3.5" />
            <span>BUSINESS MODEL & ACCESS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-pathpal-navy tracking-tight">
            Multiple paths to access. Self-funding by design.
          </h2>
          <p className="text-base text-pathpal-navy/70">
            Sustainable pricing channels ensure no patient is ever turned away regardless of income.
          </p>
        </div>

        {/* 3 Main Tiers (Slide 13) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tier 1: Hospital Sponsored */}
          <div className="bg-white rounded-3xl p-8 border-2 border-navigation-teal/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <span className="inline-block bg-navigation-teal text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                ANCHOR CHANNEL
              </span>
              <h3 className="text-2xl font-black text-pathpal-navy">Hospital Sponsored</h3>
              <div className="text-3xl font-black text-pathpal-navy">
                FREE <span className="text-xs font-semibold text-gray-500">for Patients</span>
              </div>
              <p className="text-xs text-pathpal-navy/80 font-medium leading-relaxed">
                Partner hospitals pay per completed companion visit or purchase an annual site license. Completely free for all patients visiting partner facilities.
              </p>
              <div className="space-y-2 pt-2 border-t text-xs">
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                  <span>Zero cost at point of service</span>
                </div>
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                  <span>Fulfills Schedule H CHNA community credit</span>
                </div>
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-navigation-teal shrink-0" />
                  <span>Reduces no-shows & room wait times</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-navigation-teal">
              Ideal for health systems & hospital networks
            </div>
          </div>

          {/* Tier 2: Pay Per Visit */}
          <div className="bg-white rounded-3xl p-8 border-2 border-warm-gold/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <span className="inline-block bg-warm-gold text-pathpal-navy text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                PAY AS YOU GO
              </span>
              <h3 className="text-2xl font-black text-pathpal-navy">Pay Per Visit</h3>
              <div className="text-3xl font-black text-pathpal-navy">
                $25 <span className="text-xs font-semibold text-gray-500">/ visit (≤ 1 hr)</span>
              </div>
              <p className="text-xs text-pathpal-navy/80 font-medium leading-relaxed">
                Covers full visit cost for non-partner hospitals. Includes sliding scale options and NGO sponsorship for patients with financial hardship.
              </p>
              <div className="space-y-2 pt-2 border-t text-xs">
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-warm-gold shrink-0" />
                  <span>+$25 / hr for extended visits</span>
                </div>
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-warm-gold shrink-0" />
                  <span>Sliding scale for sponsored patients</span>
                </div>
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-warm-gold shrink-0" />
                  <span>Door-to-door accompaniment</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-pathpal-navy">
              Covers full visit operational cost
            </div>
          </div>

          {/* Tier 3: PathPal Plus */}
          <div className="bg-care-blush/80 rounded-3xl p-8 border-2 border-companion-coral shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <span className="inline-block bg-companion-coral text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                MEMBERSHIP
              </span>
              <h3 className="text-2xl font-black text-pathpal-navy">PathPal Plus</h3>
              <div className="text-3xl font-black text-pathpal-navy">
                $9.99 <span className="text-xs font-semibold text-gray-500">/ month ($99/yr)</span>
              </div>
              <p className="text-xs text-pathpal-navy/80 font-medium leading-relaxed">
                Predictable subscription providing 2 included visits per month (up to 2 hours) with priority companion matching and favorite Pal saving.
              </p>
              <div className="space-y-2 pt-2 border-t border-soft-rose text-xs">
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>2 included visits per month</span>
                </div>
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Priority Pal matching algorithm</span>
                </div>
                <div className="flex items-center gap-2 text-pathpal-navy font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-companion-coral shrink-0" />
                  <span>Save & request favorite Pals</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-soft-rose text-xs font-bold text-companion-coral">
              Predictable recurring revenue
            </div>
          </div>

        </div>

        {/* Financial Viability & Unit Economics Breakdown (Slide 14) */}
        <div className="bg-pathpal-navy text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-soft-rose">
              FINANCIAL VIABILITY
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Unit Economics & Funding Levers
            </h3>
            <p className="text-sm text-gray-300">
              Estimated $18–$22 cost per visit; every revenue channel is priced safely above cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Government Reimbursement</div>
              <p className="text-xs text-gray-200">
                Medicaid CHW billing (around $77 per service) where state programs allow.
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">NGO Grants & Sponsorship</div>
              <p className="text-xs text-gray-200">
                Community partners fund visits for patients who cannot pay, so no one is turned away.
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="text-sm font-bold text-soft-rose">Hospital Licensing</div>
              <p className="text-xs text-gray-200">
                Partner hospitals pay per completed visit or an annual site license.
              </p>
            </div>

          </div>

          {/* Interactive Hospital Value Calculator */}
          <div className="bg-white text-pathpal-navy p-6 rounded-2xl space-y-4">
            <h4 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-companion-coral" />
              <span>Interactive Hospital Value Calculator</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-2">
                <label className="text-xs font-bold text-gray-600 block">
                  Estimated Monthly Accompanied Patient Visits: <strong className="text-companion-coral text-sm">{calculatorVisits}</strong>
                </label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={calculatorVisits}
                  onChange={(e) => setCalculatorVisits(Number(e.target.value))}
                  className="w-full accent-companion-coral cursor-pointer"
                />
              </div>
              <div className="md:col-span-5 bg-care-blush p-4 rounded-xl border border-soft-rose text-center space-y-1">
                <div className="text-[10px] font-bold uppercase text-gray-500">Estimated Annual Cost Savings</div>
                <div className="text-2xl font-black text-navigation-teal">${annualSavings.toLocaleString()}</div>
                <div className="text-[10px] text-pathpal-navy/70">From reduced no-shows & faster clinic throughput</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
