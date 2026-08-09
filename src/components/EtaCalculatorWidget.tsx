import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Clock, 
  MapPin, 
  Navigation, 
  Car, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Accessibility, 
  Users, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  Compass, 
  Info,
  Sliders,
  Timer
} from 'lucide-react';
import { SAMPLE_HOSPITALS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface EtaCalculatorWidgetProps {
  defaultHospitalId?: string;
  defaultMobility?: string[];
  onApplyEta?: (calculatedEtaMinutes: number, recommendedArrival: string) => void;
  compactMode?: boolean;
}

export const EtaCalculatorWidget: React.FC<EtaCalculatorWidgetProps> = ({
  defaultHospitalId = SAMPLE_HOSPITALS[0].id,
  defaultMobility = ['Wheelchair Assistance'],
  onApplyEta,
  compactMode = false,
}) => {
  const { t } = useLanguage();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(defaultHospitalId);
  const [selectedDept, setSelectedDept] = useState<string>('Cardiology & Heart Center');
  const [transitMode, setTransitMode] = useState<'valet' | 'garage' | 'rideshare' | 'transit'>('valet');
  const [trafficLevel, setTrafficLevel] = useState<'low' | 'moderate' | 'heavy' | 'gridlock'>('moderate');
  const [mobilityNeed, setMobilityNeed] = useState<'independent' | 'wheelchair' | 'arm_assist' | 'stretcher'>('wheelchair');
  const [triageStatus, setTriageStatus] = useState<'normal' | 'busy' | 'surge'>('busy');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiReportGenerated, setAiReportGenerated] = useState<boolean>(true);

  const selectedHospital = useMemo(() => {
    return SAMPLE_HOSPITALS.find(h => h.id === selectedHospitalId) || SAMPLE_HOSPITALS[0];
  }, [selectedHospitalId]);

  // Dynamic ETA Calculation Math Model
  const etaCalculation = useMemo(() => {
    let driveMinutes = 18;
    let parkingMinutes = 5;
    let entranceCheckInMinutes = 4;
    let internalWalkMinutes = 6;
    let triageWaitMinutes = 12;

    // Traffic Impact
    if (trafficLevel === 'low') driveMinutes = 12;
    if (trafficLevel === 'moderate') driveMinutes = 18;
    if (trafficLevel === 'heavy') driveMinutes = 28;
    if (trafficLevel === 'gridlock') driveMinutes = 42;

    // Transit & Parking Impact
    if (transitMode === 'valet') parkingMinutes = 4;
    if (transitMode === 'garage') parkingMinutes = 12; // Garage walking + elevator
    if (transitMode === 'rideshare') parkingMinutes = 2; // Drop-off at main entrance
    if (transitMode === 'transit') parkingMinutes = 10; // Bus/shuttle stop to entrance

    // Mobility Need Impact on internal campus travel
    if (mobilityNeed === 'independent') internalWalkMinutes = 5;
    if (mobilityNeed === 'arm_assist') internalWalkMinutes = 8;
    if (mobilityNeed === 'wheelchair') internalWalkMinutes = 12; // Ramp & elevator transfer
    if (mobilityNeed === 'stretcher') internalWalkMinutes = 16; // Specialized transport team

    // Triage / Department Congestion Wait
    if (triageStatus === 'normal') triageWaitMinutes = 5;
    if (triageStatus === 'busy') triageWaitMinutes = 15;
    if (triageStatus === 'surge') triageWaitMinutes = 35;

    const totalTravelTimeMinutes = driveMinutes + parkingMinutes + entranceCheckInMinutes + internalWalkMinutes;
    const totalDoorToDoctorMinutes = totalTravelTimeMinutes + triageWaitMinutes;

    // Recommended Departure Lead Time (add 10 min buffer)
    const departureBufferMinutes = totalDoorToDoctorMinutes + 10;

    return {
      driveMinutes,
      parkingMinutes,
      entranceCheckInMinutes,
      internalWalkMinutes,
      triageWaitMinutes,
      totalTravelTimeMinutes,
      totalDoorToDoctorMinutes,
      departureBufferMinutes,
    };
  }, [trafficLevel, transitMode, mobilityNeed, triageStatus]);

  const handleSimulateAiAnalysis = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setAiReportGenerated(true);
      if (onApplyEta) {
        onApplyEta(
          etaCalculation.totalDoorToDoctorMinutes,
          `Arrive ${etaCalculation.departureBufferMinutes} mins prior to appointment`
        );
      }
    }, 800);
  };

  return (
    <div className="bg-[#2B425B] rounded-3xl border-2 border-[#48A6A5]/40 p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
      {/* Background Ambient Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#48A6A5]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#48A6A5]/20 border border-[#48A6A5]/40 text-[#48A6A5] text-[10px] font-black uppercase tracking-widest shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              AI REAL-TIME ROUTE & ETA ENGINE
            </span>
            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              Live BLE Radar
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#48A6A5]" />
            AI Hospital ETA & Triage Predictor
          </h3>
          <p className="text-xs text-gray-300 font-normal">
            Precision door-to-door escort timing factoring in external traffic, parking queues, patient mobility needs, and department triage wait times.
          </p>
        </div>

        <button
          onClick={handleSimulateAiAnalysis}
          disabled={isAiAnalyzing}
          className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAiAnalyzing ? 'Calculating AI Route...' : 'Recalculate AI ETA'}</span>
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Target Hospital & Department */}
        <div className="bg-[#1F3449] p-4 rounded-2xl border border-white/10 space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#48A6A5]" />
            1. Medical Campus
          </label>
          <select
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="w-full bg-[#2B425B] text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#48A6A5]"
          >
            {SAMPLE_HOSPITALS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-[#2B425B] text-gray-200 border border-white/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#48A6A5]"
          >
            <option value="Cardiology & Heart Center">Cardiology Clinic (Bldg B, Fl 3)</option>
            <option value="Radiology & Imaging">Radiology & MRI (Bldg A, Fl 1)</option>
            <option value="Emergency Department">Emergency Dept / Triage (Main)</option>
            <option value="Outpatient Surgery">Outpatient Surgery (Plaza 2)</option>
            <option value="Oncology & Infusion">Oncology & Infusion Center</option>
            <option value="Central Pharmacy">Outpatient Pharmacy (Lobby)</option>
          </select>
        </div>

        {/* 2. Transit & Parking Mode */}
        <div className="bg-[#1F3449] p-4 rounded-2xl border border-white/10 space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-companion-coral" />
            2. Arrival & Parking
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setTransitMode('valet')}
              className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                transitMode === 'valet'
                  ? 'bg-companion-coral text-white border-companion-coral font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Valet Drop-Off
            </button>
            <button
              onClick={() => setTransitMode('garage')}
              className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                transitMode === 'garage'
                  ? 'bg-companion-coral text-white border-companion-coral font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Self Garage
            </button>
            <button
              onClick={() => setTransitMode('rideshare')}
              className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                transitMode === 'rideshare'
                  ? 'bg-companion-coral text-white border-companion-coral font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Rideshare / Taxi
            </button>
            <button
              onClick={() => setTransitMode('transit')}
              className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                transitMode === 'transit'
                  ? 'bg-companion-coral text-white border-companion-coral font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Shuttle / Bus
            </button>
          </div>
        </div>

        {/* 3. Patient Mobility Level */}
        <div className="bg-[#1F3449] p-4 rounded-2xl border border-white/10 space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-navigation-teal" />
            3. Patient Mobility
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setMobilityNeed('independent')}
              className={`p-2 rounded-xl text-[11px] font-bold transition-all text-center border ${
                mobilityNeed === 'independent'
                  ? 'bg-navigation-teal text-white border-navigation-teal font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Independent
            </button>
            <button
              onClick={() => setMobilityNeed('arm_assist')}
              className={`p-2 rounded-xl text-[11px] font-bold transition-all text-center border ${
                mobilityNeed === 'arm_assist'
                  ? 'bg-navigation-teal text-white border-navigation-teal font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Arm Assistance
            </button>
            <button
              onClick={() => setMobilityNeed('wheelchair')}
              className={`p-2 rounded-xl text-[11px] font-bold transition-all text-center border ${
                mobilityNeed === 'wheelchair'
                  ? 'bg-navigation-teal text-white border-navigation-teal font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Wheelchair Pal
            </button>
            <button
              onClick={() => setMobilityNeed('stretcher')}
              className={`p-2 rounded-xl text-[11px] font-bold transition-all text-center border ${
                mobilityNeed === 'stretcher'
                  ? 'bg-navigation-teal text-white border-navigation-teal font-black shadow-md'
                  : 'bg-[#2B425B] text-gray-300 border-white/10 hover:border-white/30'
              }`}
            >
              Gurney / Transport
            </button>
          </div>
        </div>

        {/* 4. Traffic & Department Triage Status */}
        <div className="bg-[#1F3449] p-4 rounded-2xl border border-white/10 space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-warm-gold" />
            4. Live Congestion
          </label>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-gray-400 block font-semibold mb-1">Road Traffic Level:</span>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'moderate', 'heavy', 'gridlock'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setTrafficLevel(lvl)}
                    className={`py-1 rounded-lg text-[10px] font-black uppercase transition-all border ${
                      trafficLevel === lvl
                        ? 'bg-warm-gold text-black border-warm-gold'
                        : 'bg-[#2B425B] text-gray-400 border-white/10'
                    }`}
                  >
                    {lvl.substring(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 block font-semibold mb-1">Dept Triage Queue:</span>
              <div className="grid grid-cols-3 gap-1">
                {(['normal', 'busy', 'surge'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setTriageStatus(status)}
                    className={`py-1 rounded-lg text-[10px] font-black uppercase transition-all border ${
                      triageStatus === status
                        ? 'bg-[#FF3344] text-white border-[#FF3344]'
                        : 'bg-[#2B425B] text-gray-400 border-white/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Calculated AI ETA Results Dashboard */}
      <div className="bg-[#1F3449] rounded-2xl p-6 border border-[#48A6A5]/40 space-y-6">
        
        {/* Main ETA Highlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-white/10 pb-6">
          
          {/* Estimated Total Travel & Walk Time */}
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#48A6A5] flex items-center justify-center md:justify-start gap-1">
              <Clock className="w-3.5 h-3.5" /> Total Door-To-Doctor Time
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {etaCalculation.totalDoorToDoctorMinutes} <span className="text-lg font-sans font-bold text-[#48A6A5]">mins</span>
            </div>
            <p className="text-xs text-gray-300">
              Drive + Garage/Valet + BLE Internal Pal Navigation + Triage Queue
            </p>
          </div>

          {/* Recommended Departure Buffer */}
          <div className="space-y-1 text-center md:text-left bg-[#2B425B] p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-companion-coral flex items-center justify-center md:justify-start gap-1">
              <Timer className="w-3.5 h-3.5" /> Recommended Departure Lead
            </span>
            <div className="text-2xl font-black text-white font-mono">
              Leave {etaCalculation.departureBufferMinutes} Mins Prior
            </div>
            <p className="text-[11px] text-gray-300">
              Includes 10-minute safety buffer for Pal rendezvous
            </p>
          </div>

          {/* Action to apply to request */}
          <div className="flex flex-col items-center md:items-end justify-center gap-2">
            <div className="text-[11px] text-right text-gray-300 font-medium">
              Hospital: <strong className="text-white">{selectedHospital.name}</strong> <br />
              Target: <span className="text-[#48A6A5]">{selectedDept}</span>
            </div>
            {onApplyEta && (
              <button
                onClick={() => onApplyEta(etaCalculation.totalDoorToDoctorMinutes, `Leave ${etaCalculation.departureBufferMinutes} mins prior`)}
                className="w-full sm:w-auto bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sync to Pal Schedule</span>
              </button>
            )}
          </div>

        </div>

        {/* Detailed Factor Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          
          <div className="bg-[#2B425B] p-3 rounded-xl border border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-400 block">Road Travel</span>
            <span className="text-lg font-black text-white font-mono">{etaCalculation.driveMinutes}m</span>
            <span className="text-[9px] text-gray-400 block capitalize">{trafficLevel} Traffic</span>
          </div>

          <div className="bg-[#2B425B] p-3 rounded-xl border border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-400 block">Valet / Parking</span>
            <span className="text-lg font-black text-companion-coral font-mono">{etaCalculation.parkingMinutes}m</span>
            <span className="text-[9px] text-gray-400 block capitalize">{transitMode}</span>
          </div>

          <div className="bg-[#2B425B] p-3 rounded-xl border border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-400 block">Lobby Check-in</span>
            <span className="text-lg font-black text-white font-mono">{etaCalculation.entranceCheckInMinutes}m</span>
            <span className="text-[9px] text-gray-400 block">Security Badge</span>
          </div>

          <div className="bg-[#2B425B] p-3 rounded-xl border border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-400 block">Campus Walk</span>
            <span className="text-lg font-black text-navigation-teal font-mono">{etaCalculation.internalWalkMinutes}m</span>
            <span className="text-[9px] text-gray-400 block capitalize">{mobilityNeed.replace('_', ' ')}</span>
          </div>

          <div className="bg-[#2B425B] p-3 rounded-xl border border-white/10">
            <span className="text-[10px] font-black uppercase text-gray-400 block">Triage Queue</span>
            <span className="text-lg font-black text-warm-gold font-mono">{etaCalculation.triageWaitMinutes}m</span>
            <span className="text-[9px] text-gray-400 block capitalize">{triageStatus} Intake</span>
          </div>

        </div>

        {/* AI Route Insights & Safety Advice */}
        <div className="bg-[#2B425B] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#48A6A5]/20 text-[#48A6A5] border border-[#48A6A5]/30 shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">
                AI ESCORT ROUTE RECOMMENDATION
              </span>
              <p className="text-xs text-gray-200 leading-relaxed font-normal">
                {mobilityNeed === 'wheelchair' || mobilityNeed === 'stretcher' ? (
                  <>
                    <strong className="text-white">Accessible Elevator Route:</strong> Meet Pal at {selectedHospital.meetingPoints[0]}. Use Elevator Bank B (South Wing) for direct step-free access to {selectedDept}.
                  </>
                ) : (
                  <>
                    <strong className="text-white">Express Walkway:</strong> Meet Pal at {selectedHospital.meetingPoints[1] || selectedHospital.meetingPoints[0]} for direct 5-minute escort to {selectedDept}.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-companion-coral" />
            <span>Pal GPS Tracking Synced</span>
          </div>
        </div>

      </div>

    </div>
  );
};
