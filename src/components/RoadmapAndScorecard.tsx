import React from 'react';
import { Flag, TrendingUp, Award, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { PILOT_METRICS } from '../data/mockData';

export const RoadmapAndScorecard: React.FC = () => {
  const growthPhases = [
    { num: '1', title: 'LAUNCH', desc: 'Deploy 24/7 care escorts in primary hospital hubs' },
    { num: '2', title: 'INTEGRATE', desc: 'Epic/Cerner EHR API & care navigation billing setup' },
    { num: '3', title: 'EXPAND', desc: 'Scale Pal network across emergency & outpatient towers' },
    { num: '4', title: 'CREDENTIAL', desc: 'Statewide CHW certification pathways' },
    { num: '5', title: 'MOBILE APP', desc: 'Native Android BLE indoor navigation release' },
    { num: '6', title: 'NATIONWIDE', desc: 'Full health system partnerships across all 50 states' },
  ];

  const stagedGrowth = [
    { num: '1', name: 'Regional Hubs', desc: 'Anchor hospital systems in major metro centers' },
    { num: '2', name: 'Citywide Network', desc: 'Cover clinics, imaging centers and outpatient surgery' },
    { num: '3', name: 'Statewide Coverage', desc: 'Statewide CHW care coordination' },
    { num: '4', name: 'Nationwide Enterprise', desc: 'National health plan & health system licensing' },
    { num: '5', name: 'Global Health', desc: 'International expansion with global care partners' },
  ];

  return (
    <section id="roadmap" className="py-20 bg-[#1F3449] text-white border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#48A6A5]/20 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/40">
            <Flag className="w-4 h-4" />
            <span>NATIONWIDE GROWTH ROADMAP & OPERATIONAL SCORECARD</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Built for Scale. <span className="text-[#48A6A5]">Backed by Data.</span>
          </h2>
          <p className="text-base text-gray-300">
            A structured, enterprise-grade deployment model backed by rigorous safety standards and real-time operational scorecarding.
          </p>
        </div>

        {/* Scorecard Metrics */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-[#48A6A5]">
              OPERATIONAL PERFORMANCE SCORECARD
            </div>
            <h3 className="text-2xl font-black uppercase text-white">Proven Service Outcomes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILOT_METRICS.map((item) => (
              <div key={item.category} className="bg-[#2B425B] p-6 rounded-3xl border border-white/10 space-y-3 hover:border-[#48A6A5]/40 transition-all shadow-xl">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-[#48A6A5]/20 text-[#48A6A5] border border-[#48A6A5]/30`}>
                    {item.category}
                  </span>
                  <span className="text-2xl font-black text-[#48A6A5]">{item.metric}</span>
                </div>
                <h4 className="text-base font-bold text-white">{item.title}</h4>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Roadmap Timeline */}
        <div className="bg-[#2B425B] p-8 rounded-3xl border border-white/10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-[#48A6A5]">SYSTEM SCALE & ROLLOUT</div>
              <h3 className="text-2xl font-black uppercase text-white">6-Phase Enterprise Expansion Plan</h3>
            </div>
            <span className="text-xs font-bold text-gray-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              Phase 1-3 Currently Live in Partner Hospitals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {growthPhases.map((phase) => (
              <div key={phase.num} className="bg-[#1F3449] p-4 rounded-2xl border border-white/10 space-y-2 hover:border-[#48A6A5]/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#48A6A5] text-white font-black text-xs flex items-center justify-center">
                    {phase.num}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#48A6A5]" />
                </div>
                <div className="text-xs font-black uppercase text-[#48A6A5]">{phase.title}</div>
                <p className="text-[11px] text-gray-300 leading-tight">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Staged Growth Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stagedGrowth.map((stage) => (
            <div key={stage.num} className="bg-[#2B425B] p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-black text-[#48A6A5] uppercase tracking-widest">
                STAGE {stage.num}
              </span>
              <h4 className="text-sm font-black uppercase text-white">{stage.name}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
