import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Award,
  CheckCircle2,
  Calendar,
  HeartPulse,
  Compass,
  Zap,
  Target,
  ChevronUp,
  ChevronDown,
  Info,
  Sparkles,
  ShieldCheck,
  Footprints,
  Clock,
  ArrowUpRight
} from 'lucide-react';

// 30-day health trends mock dataset
const generate30DayHealthData = () => {
  const data = [];
  const now = new Date(2026, 7, 2); // Aug 2, 2026

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Recovery trend curve: pain decreases over time, mobility increases
    const progressFactor = (30 - i) / 30; // 0 to 1
    const pain = Math.max(1, Math.round(7.5 - progressFactor * 5.2 + (Math.sin(i * 0.8) * 0.6)));
    const mobilityDistMeters = Math.round(300 + progressFactor * 1600 + (Math.cos(i * 0.5) * 150));
    const vitalsScore = Math.min(98, Math.round(82 + progressFactor * 14 + (Math.sin(i * 0.4) * 2)));
    const ptMinutes = i % 3 === 0 ? Math.round(30 + Math.random() * 20) : (i % 2 === 0 ? 15 : 0);

    data.push({
      day: dateStr,
      fullDate: d.toLocaleDateString(),
      painLevel: pain,
      mobilityDistance: mobilityDistMeters,
      vitalsScore: vitalsScore,
      ptMinutes: ptMinutes,
    });
  }
  return data;
};

const THIRTY_DAY_DATA = generate30DayHealthData();

// 4-Week Milestone Breakdown
const WEEKLY_SUMMARY_DATA = [
  { week: 'Week 1 (Post-Op)', ptSessionsCompleted: 2, targetPt: 3, walkTargetMeters: 500, actualWalkMeters: 450, painAvg: 7.1 },
  { week: 'Week 2 (Rehab)', ptSessionsCompleted: 3, targetPt: 3, walkTargetMeters: 1000, actualWalkMeters: 1100, painAvg: 5.2 },
  { week: 'Week 3 (Ambulatory)', ptSessionsCompleted: 4, targetPt: 4, walkTargetMeters: 1500, actualWalkMeters: 1650, painAvg: 3.4 },
  { week: 'Week 4 (Current)', ptSessionsCompleted: 4, targetPt: 4, walkTargetMeters: 2000, actualWalkMeters: 2150, painAvg: 2.1 },
];

// Recovery Milestones Data
interface Milestone {
  id: string;
  title: string;
  category: 'mobility' | 'clinical' | 'therapy' | 'independence';
  targetDate: string;
  progressPercent: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  description: string;
  clinicalNote: string;
}

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'Unassisted 100m Hallway Walk',
    category: 'mobility',
    targetDate: 'July 15, 2026',
    progressPercent: 100,
    status: 'completed',
    description: 'Walk 100 meters without requiring Pal arm-assist or wheelchair escort.',
    clinicalNote: 'Achieved on July 14. Gait stability score: 92/100.',
  },
  {
    id: 'm2',
    title: 'Staircase Climb (Flight of 12)',
    category: 'mobility',
    targetDate: 'July 25, 2026',
    progressPercent: 100,
    status: 'completed',
    description: 'Safely negotiate physical therapy stairs with single handrail support.',
    clinicalNote: 'Mastered in PT Session #8 with zero balance loss.',
  },
  {
    id: 'm3',
    title: 'Pain Score Maintenance < 3.0',
    category: 'clinical',
    targetDate: 'August 1, 2026',
    progressPercent: 92,
    status: 'in_progress',
    description: 'Maintain baseline self-reported pain levels under 3/10 for 7 consecutive days.',
    clinicalNote: 'Currently at 2.1 avg over last 5 days. Non-opioid therapy effective.',
  },
  {
    id: 'm4',
    title: 'Outpatient Cardiology Clearance',
    category: 'clinical',
    targetDate: 'August 10, 2026',
    progressPercent: 75,
    status: 'in_progress',
    description: 'Final post-op ECG check and stress test at St. Jude Medical Center.',
    clinicalNote: 'Upcoming appointment scheduled with Dr. Sarah Chen.',
  },
  {
    id: 'm5',
    title: 'Full Ambulatory Independence',
    category: 'independence',
    targetDate: 'August 20, 2026',
    progressPercent: 60,
    status: 'in_progress',
    description: 'Graduate from Pal hospital escort program to independent visits.',
    clinicalNote: 'Requires 3 consecutive visits with 100% independent mobility rating.',
  },
];

// Custom Recharts Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0D14] border-2 border-[#00F0FF]/60 p-3 rounded-xl shadow-2xl space-y-1.5 text-xs text-white">
        <div className="font-black text-[#00F0FF] border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-gray-400 font-mono">Day {payload[0]?.payload?.fullDate}</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-mono font-bold">
              {entry.name.includes('Distance') ? `${entry.value} meters` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RecoveryTrendsWidget: React.FC = () => {
  const [activeMetricView, setActiveMetricView] = useState<'all' | 'mobility' | 'pain' | 'weekly'>('all');
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '14d' | '7d'>('30d');

  const filteredData = React.useMemo(() => {
    if (selectedTimeframe === '7d') return THIRTY_DAY_DATA.slice(-7);
    if (selectedTimeframe === '14d') return THIRTY_DAY_DATA.slice(-14);
    return THIRTY_DAY_DATA;
  }, [selectedTimeframe]);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const overallProgressPercent = Math.round(
    milestones.reduce((acc, curr) => acc + curr.progressPercent, 0) / milestones.length
  );

  return (
    <div className="space-y-6 text-white">
      
      {/* Header Banner */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border-2 border-[#00F0FF]/40 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-[10px] font-black uppercase tracking-widest shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                CLINICAL RECOVERY ANALYTICS
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                Recharts Engine Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Activity className="w-7 h-7 text-[#00F0FF]" />
              30-Day Recovery Trends & Milestones
            </h2>
            <p className="text-xs text-gray-300">
              Interactive visualization tracking your mobility range, pain management scores, and clinical outpatient goals over time.
            </p>
          </div>

          {/* Timeframe Selector Toggles */}
          <div className="flex items-center gap-1.5 bg-[#1A2232] p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                selectedTimeframe === '7d'
                  ? 'bg-[#00F0FF] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('14d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                selectedTimeframe === '14d'
                  ? 'bg-[#00F0FF] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                selectedTimeframe === '30d'
                  ? 'bg-[#00F0FF] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Top Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Overall Milestone Completion */}
          <div className="bg-[#1A2232] p-5 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-black uppercase tracking-wider text-gray-300">Recovery Index</span>
              <Award className="w-4 h-4 text-warm-gold" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">{overallProgressPercent}%</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14%
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-warm-gold to-[#00F0FF] h-full transition-all duration-700"
                style={{ width: `${overallProgressPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-400 block font-medium">
              {completedCount} of {milestones.length} Milestones Achieved
            </span>
          </div>

          {/* Card 2: Daily Mobility Walked */}
          <div className="bg-[#1A2232] p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-black uppercase tracking-wider text-gray-300">30-Day Walk Peak</span>
              <Footprints className="w-4 h-4 text-[#00F0FF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">1,910 <span className="text-sm font-sans font-normal text-[#00F0FF]">m/day</span></span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              ↑ 420% increase since Post-Op Day 1
            </span>
            <span className="text-[10px] text-gray-400 block">Step-free corridor walking distance</span>
          </div>

          {/* Card 3: Avg Pain Level */}
          <div className="bg-[#1A2232] p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-black uppercase tracking-wider text-gray-300">Current Pain Level</span>
              <HeartPulse className="w-4 h-4 text-companion-coral" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">2.1 <span className="text-sm font-sans text-gray-400">/ 10</span></span>
              <span className="text-xs text-emerald-400 font-bold">−5.4 pts</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              Optimal comfort range achieved
            </span>
            <span className="text-[10px] text-gray-400 block">Self-reported daily baseline</span>
          </div>

          {/* Card 4: Pal Assistance */}
          <div className="bg-[#1A2232] p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-black uppercase tracking-wider text-gray-300">Pal Attendance</span>
              <ShieldCheck className="w-4 h-4 text-navigation-teal" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">100%</span>
              <span className="text-xs text-navigation-teal font-bold">8/8 visits</span>
            </div>
            <span className="text-[11px] text-navigation-teal font-semibold block">
              Zero missed hospital appointments
            </span>
            <span className="text-[10px] text-gray-400 block">PathPal companion reliability</span>
          </div>

        </div>

      </div>

      {/* Main Charts Section */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
        
        {/* Chart View Selector Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              Health Trend Visualizations
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMetricView('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeMetricView === 'all'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF] font-black shadow-md'
                  : 'bg-[#1A2232] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              All Metrics Combined
            </button>

            <button
              onClick={() => setActiveMetricView('mobility')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeMetricView === 'mobility'
                  ? 'bg-navigation-teal text-white border-navigation-teal font-black shadow-md'
                  : 'bg-[#1A2232] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Mobility Range (m)
            </button>

            <button
              onClick={() => setActiveMetricView('pain')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeMetricView === 'pain'
                  ? 'bg-companion-coral text-white border-companion-coral font-black shadow-md'
                  : 'bg-[#1A2232] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Pain Score (1-10)
            </button>

            <button
              onClick={() => setActiveMetricView('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeMetricView === 'weekly'
                  ? 'bg-warm-gold text-black border-warm-gold font-black shadow-md'
                  : 'bg-[#1A2232] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Weekly Therapy Bar Chart
            </button>
          </div>
        </div>

        {/* 1. CHART: Daily Walked Distance vs Pain Score Over Time (Area + Line) */}
        {(activeMetricView === 'all' || activeMetricView === 'mobility' || activeMetricView === 'pain') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-white flex items-center gap-2">
                <Footprints className="w-4 h-4 text-[#00F0FF]" />
                30-Day Mobility Distance (Meters) vs Pain Level Index
              </span>
              <span className="text-[11px] font-mono text-[#00F0FF]">
                Cyan: Walked Distance (m) • Red/Coral: Pain Level (1-10)
              </span>
            </div>

            <div className="h-72 w-full bg-[#1A2232] p-4 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mobilityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3344" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF3344" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3447" />
                  <XAxis dataKey="day" stroke="#8A99AD" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#00F0FF" fontSize={11} tickLine={false} unit="m" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FF3344" fontSize={11} domain={[0, 10]} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                  {(activeMetricView === 'all' || activeMetricView === 'mobility') && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="mobilityDistance"
                      name="Mobility Distance (m)"
                      stroke="#00F0FF"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#mobilityGradient)"
                    />
                  )}

                  {(activeMetricView === 'all' || activeMetricView === 'pain') && (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="painLevel"
                      name="Pain Score (1-10)"
                      stroke="#FF3344"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#painGradient)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. CHART: Weekly Physical Therapy & Target Comparison (Bar Chart) */}
        {(activeMetricView === 'weekly' || activeMetricView === 'all') && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-warm-gold" />
                Weekly Physical Therapy Sessions & Walking Targets
              </span>
              <span className="text-[11px] text-gray-400">Target vs Actual Attained</span>
            </div>

            <div className="h-64 w-full bg-[#1A2232] p-4 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_SUMMARY_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3447" />
                  <XAxis dataKey="week" stroke="#8A99AD" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8A99AD" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0D14', borderColor: '#FFB000', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="ptSessionsCompleted" name="PT Sessions Attended" fill="#00F0FF" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="targetPt" name="Target PT Sessions" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Recovery Milestones Interactive Checklist */}
      <div className="bg-[#121824] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-warm-gold" />
              Clinical Recovery Milestones
            </h3>
            <p className="text-xs text-gray-300">
              Verified clinical achievements signed off by your care team & physical therapist.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 bg-[#1A2232] px-3.5 py-2 rounded-xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{completedCount} of {milestones.length} Completed</span>
          </div>
        </div>

        {/* Milestone Cards List */}
        <div className="space-y-3">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                m.status === 'completed'
                  ? 'bg-[#1A2232]/80 border-emerald-500/40'
                  : 'bg-[#1A2232] border-white/10 hover:border-[#00F0FF]/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      m.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40'
                    }`}
                  >
                    {m.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{m.title}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          m.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">{m.description}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right space-y-1">
                  <span className="text-[11px] text-gray-400 font-mono block">Target: {m.targetDate}</span>
                  <span className="text-xs font-bold text-[#00F0FF] block">{m.progressPercent}% Achieved</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    m.status === 'completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#00F0FF] to-warm-gold'
                  }`}
                  style={{ width: `${m.progressPercent}%` }}
                ></div>
              </div>

              {/* Clinical Note Footer */}
              <div className="text-[11px] text-gray-300 bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="font-mono text-gray-400">Clinical Log: {m.clinicalNote}</span>
                <span className="text-[10px] uppercase font-bold text-[#00F0FF]">Verified</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
