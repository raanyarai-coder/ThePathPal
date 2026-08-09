import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Bell, 
  CheckCircle2, 
  X, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  AlertCircle, 
  Smartphone, 
  Sparkles,
  FileText,
  Send,
  Check
} from 'lucide-react';
import { 
  CalendarEventDetails, 
  createGoogleCalendarUrl, 
  downloadIcsFile, 
  addEventViaGoogleCalendarApi 
} from '../utils/calendarUtils';

interface CalendarIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails?: Partial<CalendarEventDetails>;
  userRole?: 'patient' | 'pal';
}

export const CalendarIntegrationModal: React.FC<CalendarIntegrationModalProps> = ({
  isOpen,
  onClose,
  eventDetails,
  userRole = 'patient',
}) => {
  if (!isOpen) return null;

  // Default event details if none passed
  const defaultDate = new Date(Date.now() + 86400000); // tomorrow same time
  defaultDate.setHours(10, 0, 0, 0);
  const defaultEndDate = new Date(defaultDate.getTime() + 7200000); // 2 hours later

  const initialTitle = eventDetails?.title || (
    userRole === 'patient' 
      ? 'PathPal Hospital Visit Appointment - St. Jude Medical Center'
      : 'PathPal Companion Visit: Review Summary & Meet Patient'
  );

  const initialDesc = eventDetails?.description || (
    userRole === 'patient'
      ? 'PathPal companion visit scheduled. Meet Companion Pal at Main Entrance Lobby. Remember to check your medical summary in PathPal prior to departure.'
      : 'Pal Assignment confirmed. REQUIRED ACTION: Review patient medical summary, allergy alerts, and mobility preferences in PathPal 30 mins prior to arrival.'
  );

  const initialLocation = eventDetails?.location || 'St. Jude Medical Center, Main Lobby Entrance (Zone A)';

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDesc);
  const [location, setLocation] = useState(initialLocation);
  const [dateStr, setDateStr] = useState(defaultDate.toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('10:00');
  
  // Reminders toggle
  const [remind24h, setRemind24h] = useState(true);
  const [remind2h, setRemind2h] = useState(true);
  const [remind30m, setRemind30m] = useState(true);
  const [palMedicalReviewReminder, setPalMedicalReviewReminder] = useState(true);

  // States
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedUrl, setSyncedUrl] = useState<string>('');
  const [simulatedSmsSent, setSimulatedSmsSent] = useState<boolean>(false);

  const getCombinedDates = () => {
    const start = new Date(`${dateStr}T${timeStr}:00`);
    const end = new Date(start.getTime() + 7200000); // +2 hrs
    return { start, end };
  };

  const buildEventObject = (): CalendarEventDetails => {
    const { start, end } = getCombinedDates();
    const reminders: number[] = [];
    if (remind24h) reminders.push(1440);
    if (remind2h) reminders.push(120);
    if (remind30m) reminders.push(30);
    if (palMedicalReviewReminder && userRole === 'pal') reminders.push(45); // 45m review alert

    return {
      title,
      description,
      location,
      startTime: start,
      endTime: end,
      reminderMinutesBefore: reminders,
    };
  };

  const handleDownloadIcs = () => {
    const eventObj = buildEventObject();
    downloadIcsFile(eventObj, `pathpal-${userRole}-appointment.ics`);
    setSyncStatus('success');
  };

  const handleOpenGoogleCalendarWeb = () => {
    const eventObj = buildEventObject();
    const url = createGoogleCalendarUrl(eventObj);
    window.open(url, '_blank', 'noopener,noreferrer');
    setSyncStatus('success');
  };

  const handleSyncGoogleCalendarApi = async () => {
    setSyncStatus('syncing');
    const eventObj = buildEventObject();

    // Check if user has an OAuth token stored in localStorage (or prompt demo sync)
    const storedToken = localStorage.getItem('google_calendar_access_token');

    if (storedToken) {
      const result = await addEventViaGoogleCalendarApi(storedToken, eventObj);
      if (result.success) {
        setSyncStatus('success');
        if (result.eventUrl) setSyncedUrl(result.eventUrl);
      } else {
        // Fallback to web link if token expired or API error
        handleOpenGoogleCalendarWeb();
      }
    } else {
      // Direct Web Redirect to Google Calendar
      setTimeout(() => {
        handleOpenGoogleCalendarWeb();
      }, 600);
    }
  };

  const handleSendTestSmsReminder = () => {
    setSimulatedSmsSent(true);
    setTimeout(() => setSimulatedSmsSent(false), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#1F3449] rounded-3xl border-2 border-[#48A6A5]/40 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#48A6A5]/20 text-[#48A6A5] border border-[#48A6A5]/40">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#48A6A5] tracking-widest bg-[#48A6A5]/10 px-2 py-0.5 rounded border border-[#48A6A5]/20">
                GOOGLE CALENDAR & iCAL INTEGRATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                {userRole === 'patient' ? 'Sync Hospital Appointment' : 'Pal Calendar & Medical Review Reminders'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Banner */}
        {userRole === 'pal' ? (
          <div className="bg-[#2B425B] p-4 rounded-2xl border border-[#48A6A5]/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#48A6A5] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-200 leading-relaxed">
              <strong className="text-white font-bold block mb-0.5">Automated Pal Readiness Alert Enabled</strong>
              This calendar event will automatically schedule a notification <strong>45 minutes before rendezvous</strong> reminding you to log in to PathPal and review the patient's HIPAA medical summary, mobility aids, and allergies.
            </div>
          </div>
        ) : (
          <div className="bg-[#2B425B] p-4 rounded-2xl border border-white/10 flex items-start gap-3">
            <Bell className="w-5 h-5 text-[#E85D75] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-200 leading-relaxed">
              <strong className="text-white font-bold block mb-0.5">Patient Departure & Pal Reminders</strong>
              Never miss a hospital visit. Sync this visit appointment directly to your Google Calendar or Apple iCal with pre-configured departure alerts.
            </div>
          </div>
        )}

        {/* Editable Form Details */}
        <div className="space-y-4 bg-[#2B425B] p-5 rounded-2xl border border-white/10">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-gray-300 block mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1F3449] text-white border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#48A6A5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-[#1F3449] text-white border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#48A6A5]"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-300 block mb-1">
                Rendezvous Time
              </label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full bg-[#1F3449] text-white border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#48A6A5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-gray-300 block mb-1">
              Hospital Campus & Meeting Zone
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#1F3449] text-white border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#48A6A5]"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-gray-300 block mb-1">
              Description & Clinical Review Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1F3449] text-white border border-white/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#48A6A5]"
            />
          </div>
        </div>

        {/* Reminder Configuration Toggles */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#48A6A5]" />
            Automated Reminder Timings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="p-3 rounded-2xl bg-[#2B425B] border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/30">
              <span className="text-xs font-medium text-gray-200">24 Hours Prior (Day Before Alert)</span>
              <input
                type="checkbox"
                checked={remind24h}
                onChange={(e) => setRemind24h(e.target.checked)}
                className="w-4 h-4 accent-[#48A6A5] rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl bg-[#2B425B] border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/30">
              <span className="text-xs font-medium text-gray-200">2 Hours Prior (Preparation Lead)</span>
              <input
                type="checkbox"
                checked={remind2h}
                onChange={(e) => setRemind2h(e.target.checked)}
                className="w-4 h-4 accent-[#48A6A5] rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl bg-[#2B425B] border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/30">
              <span className="text-xs font-medium text-gray-200">30 Mins Prior (Departure Alert)</span>
              <input
                type="checkbox"
                checked={remind30m}
                onChange={(e) => setRemind30m(e.target.checked)}
                className="w-4 h-4 accent-[#48A6A5] rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl bg-[#2B425B] border border-[#48A6A5]/30 flex items-center justify-between cursor-pointer hover:border-[#48A6A5]">
              <span className="text-xs font-bold text-[#48A6A5] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Pal Medical Summary Review Alert
              </span>
              <input
                type="checkbox"
                checked={palMedicalReviewReminder}
                onChange={(e) => setPalMedicalReviewReminder(e.target.checked)}
                className="w-4 h-4 accent-[#48A6A5] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Sync Success Feedback */}
        {syncStatus === 'success' && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                <strong>Appointment & Reminders Saved!</strong> Calendar event synchronized with pre-set alarm notifications.
              </span>
            </div>
            {syncedUrl && (
              <a
                href={syncedUrl}
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-white hover:text-[#48A6A5] shrink-0"
              >
                View Event
              </a>
            )}
          </div>
        )}

        {/* Test SMS/Push Trigger */}
        {simulatedSmsSent && (
          <div className="p-3 rounded-xl bg-[#48A6A5]/20 border border-[#48A6A5]/50 text-[#48A6A5] text-xs flex items-center gap-2 animate-fade-in">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Simulated SMS/Push reminder sent to patient and Pal device!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleSendTestSmsReminder}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-[#48A6A5]" />
            <span>Test SMS Reminder</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadIcs}
              className="bg-[#2B425B] hover:bg-white/10 text-white font-bold text-xs px-4 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#48A6A5]" />
              <span>Download .iCal / .ICS</span>
            </button>

            <button
              onClick={handleSyncGoogleCalendarApi}
              disabled={syncStatus === 'syncing'}
              className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Add to Google Calendar'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
