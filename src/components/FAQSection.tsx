import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, HeartHandshake, CreditCard, Building2, Search, UserCheck } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'pairing' | 'costs' | 'safety' | 'hospital' | 'general';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'pairing',
    question: 'How does PathPal pair patients with a Companion Pal?',
    answer: 'PathPal utilizes an intelligent matching algorithm that evaluates patient mobility requirements, primary language (English or Spanish), cultural background preferences, and appointment time. Matches are confirmed prior to arrival, ensuring a familiar, vetted Pal meets you directly at the hospital entrance valet or lobby.'
  },
  {
    id: 'faq-2',
    category: 'costs',
    question: 'What does a PathPal companion visit cost, and is it covered by insurance?',
    answer: 'Single hospital visits start at $35 per 2-hour session. PathPal is also available through $49/mo membership passes. Importantly, PathPal partners with Medicare Advantage plans under SSBCI (Special Supplemental Benefits for the Chronically Ill) and Medicaid Managed Care programs, allowing many eligible seniors and high-risk patients to receive PathPal at $0 out-of-pocket cost with an approved voucher.'
  },
  {
    id: 'faq-3',
    category: 'safety',
    question: 'What background checks and safety training do Pals undergo?',
    answer: 'Every PathPal companion undergoes rigorous 7-year multi-state criminal background screening, 10-panel drug testing, immunizations, HIPAA privacy certification, non-clinical de-escalation training, and wheelchair safety protocols. Pals wear photo identification lanyards and are continuously monitored via geotagged check-ins during every visit.'
  },
  {
    id: 'faq-4',
    category: 'hospital',
    question: 'How does PathPal coordinate with hospital staff and discharge planners?',
    answer: 'Hospital social workers and discharge planners can dispatch a Pal directly through our Hospital Enterprise Portal or via EMR integration (Epic/Cerner). Pals help reduce no-shows, guide patients through multi-building campuses, assist with outpatient pharmacy pick-up, and ensure safe transition to post-visit transit.'
  },
  {
    id: 'faq-5',
    category: 'general',
    question: 'What is the strict boundary between non-clinical Pals and clinical staff?',
    answer: 'Pals strictly provide non-clinical companionship, navigation guidance, wheelchair physical push assistance, emotional reassurance, and wayfinding. Pals DO NOT provide medical advice, administer medication, perform clinical nursing tasks, or make medical decisions. If a clinical issue arises, the Pal immediately notifies charge nurses.'
  },
  {
    id: 'faq-6',
    category: 'pairing',
    question: 'Can family members request a Pal for a loved one from a distance?',
    answer: 'Yes! Family members living in another city or state can book a Pal for their parent or family member. The family member receives live SMS/push status notifications (e.g., "Pal Elena met Eleanor at Main Entrance", "Elevator transition to Cardiology", "Appointment completed safely").'
  },
  {
    id: 'faq-7',
    category: 'costs',
    question: 'What payment methods are accepted for bookings and memberships?',
    answer: 'We accept all major Credit and Debit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, as well as Medicare Advantage / Medicaid Benefit Vouchers and Hospital Sponsorship IDs.'
  }
];

interface FAQSectionProps {
  onRequestPal?: () => void;
  onOpenPayment?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onRequestPal, onOpenPayment }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAccordion = (id: string) => {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="py-20 bg-[#0A0D14] border-t border-white/10 relative overflow-hidden text-white">
      {/* Background cyan ambient light */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#00F0FF]/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Eyebrow & Headline in Bold Typography style */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-bold uppercase tracking-[0.25em]">
            <HelpCircle className="w-4 h-4" />
            <span>KNOWLEDGE BASE & FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase italic leading-none text-white">
            CLEAR ANSWERS TO <br />
            <span className="text-[#00F0FF] text-stroke-cyan">EVERY QUESTION.</span>
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-2xl mx-auto">
            Everything you need to know about companion matching, safety protocols, non-clinical scope, hospital integration, and zero-cost insurance coverage.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121824] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions (e.g., costs, safety, Medicare)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A2232] text-xs text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'pairing', label: 'Companion Pairing' },
              { id: 'costs', label: 'Costs & Coverage' },
              { id: 'safety', label: 'Safety & Vetting' },
              { id: 'hospital', label: 'Hospital Integration' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#00F0FF] text-black font-extrabold shadow-lg shadow-[#00F0FF]/20'
                    : 'bg-[#1A2232] text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-300 border ${
                    isOpen
                      ? 'bg-[#121824] border-[#00F0FF]/50 shadow-xl shadow-[#00F0FF]/5'
                      : 'bg-[#121824]/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      {faq.category === 'pairing' && <UserCheck className="w-5 h-5 text-[#00F0FF] shrink-0" />}
                      {faq.category === 'costs' && <CreditCard className="w-5 h-5 text-companion-coral shrink-0" />}
                      {faq.category === 'safety' && <ShieldCheck className="w-5 h-5 text-navigation-teal shrink-0" />}
                      {faq.category === 'hospital' && <Building2 className="w-5 h-5 text-warm-gold shrink-0" />}
                      {faq.category === 'general' && <HeartHandshake className="w-5 h-5 text-[#00F0FF] shrink-0" />}
                      <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {faq.question}
                      </span>
                    </div>
                    <div className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#00F0FF] text-black' : 'bg-white/5 text-gray-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/10 text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-[#121824] rounded-2xl border border-white/10 text-gray-400">
              No questions found matching your search. Try adjusting terms or search "Medicare" or "Safety".
            </div>
          )}
        </div>

        {/* Bottom Quick Call To Action Box */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#121824] via-[#1A2232] to-[#121824] border border-[#00F0FF]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black uppercase text-white italic tracking-tight">
              STILL HAVE QUESTIONS ABOUT A VISITING PAL?
            </h3>
            <p className="text-xs text-gray-300 max-w-xl font-light">
              Our Care Coordinators are standing by to guide you through companion selection, hospital scheduling, or benefit voucher redemption.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onRequestPal && (
              <button
                onClick={onRequestPal}
                className="px-6 py-3 rounded-xl bg-[#00F0FF] text-black text-xs font-black uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-all shadow-lg shadow-[#00F0FF]/20"
              >
                Request a Pal
              </button>
            )}
            {onOpenPayment && (
              <button
                onClick={onOpenPayment}
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                View Plans & Pricing
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
