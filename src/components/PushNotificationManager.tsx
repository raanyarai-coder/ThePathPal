import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, ShieldCheck, Navigation, Heart, AlertTriangle, X, Volume2, Settings, Send, Sparkles } from 'lucide-react';

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'escort' | 'gps' | 'medical' | 'system';
  read: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  escortUpdates: boolean;
  gpsProximity: boolean;
  medicalAccessAlerts: boolean;
  careBotReminders: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: true,
  escortUpdates: true,
  gpsProximity: true,
  medicalAccessAlerts: true,
  careBotReminders: true,
  soundEnabled: true,
};

const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [];

interface PushNotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTestPush?: (title: string, body: string) => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [settings, setSettings] = useState<PushNotificationSettings>(() => {
    const saved = localStorage.getItem('pathpal_push_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() => {
    const saved = localStorage.getItem('pathpal_push_history');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<PushNotificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  useEffect(() => {
    localStorage.setItem('pathpal_push_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pathpal_push_history', JSON.stringify(notifications));
  }, [notifications]);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermission(res);
        if (res === 'granted') {
          triggerPushNotification(
            'Push Notifications Enabled!',
            'You will now receive real-time Pal arrival alerts, GPS radar pings, and medical access logs.',
            'system'
          );
        }
      } catch (e) {
        console.error('Error requesting notification permission:', e);
      }
    } else {
      alert('Web Push Notifications are supported via in-app simulation in this browser context.');
    }
  };

  const triggerPushNotification = (title: string, body: string, type: 'escort' | 'gps' | 'medical' | 'system' = 'system') => {
    const newNotif: PushNotificationItem = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: 'Just now',
      type,
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Play subtle audio ping if enabled
    if (settings.soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (err) {
        // AudioContext silent catch
      }
    }

    // Trigger Browser Native Push if granted
    if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        // Fallback
      }
    }

    setTimeout(() => {
      setActiveToast(null);
    }, 5000);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#0A0D14] text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#00F0FF]/40 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                Push Notifications
                {unreadCount > 0 && (
                  <span className="bg-companion-coral text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-400">
                Real-time Pal arrival alerts, GPS radar, & HIPAA security pings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 bg-[#121824] rounded-xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-[#00F0FF] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts Log ({notifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#00F0FF] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab 1: Alerts Log */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            
            {/* Permission Banner if default */}
            {permission !== 'granted' && (
              <div className="bg-[#121824] p-4 rounded-2xl border border-companion-coral/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-companion-coral flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Browser Push Permission
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">{permission}</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Allow browser push notifications to receive background arrival pings when PathPal is minimized.
                </p>
                <button
                  onClick={requestBrowserPermission}
                  className="w-full py-2 rounded-xl bg-companion-coral text-white font-black text-xs uppercase tracking-wider hover:bg-companion-coral/90 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enable Browser Push Notifications</span>
                </button>
              </div>
            )}

            {/* Quick Test Push Dispatcher */}
            <div className="bg-[#1A2232] p-3 rounded-2xl border border-white/10 text-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-[#00F0FF] tracking-wider block">
                ⚡ Test Live Push Dispatcher
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => triggerPushNotification('Pal Arrived at Gate 2!', 'Your assigned companion Pal is standing at Main Entrance with wheelchair assistance.', 'escort')}
                  className="p-2 rounded-xl bg-[#080B12] hover:bg-white/10 text-gray-200 border border-white/10 text-[11px] font-bold text-left flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Test Pal Arrival</span>
                </button>
                <button
                  onClick={() => triggerPushNotification('Medical Record Verified', 'Hospital escort checked in with encrypted QR code.', 'medical')}
                  className="p-2 rounded-xl bg-[#080B12] hover:bg-white/10 text-gray-200 border border-white/10 text-[11px] font-bold text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test HIPAA Audit</span>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs space-y-2">
                  <BellOff className="w-8 h-8 mx-auto text-gray-600" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                      n.read
                        ? 'bg-[#121824] border-white/10 opacity-75'
                        : 'bg-[#1A2232] border-[#00F0FF]/40 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {n.type === 'escort' && <Heart className="w-3.5 h-3.5 text-companion-coral fill-companion-coral" />}
                        {n.type === 'gps' && <Navigation className="w-3.5 h-3.5 text-[#00F0FF]" />}
                        {n.type === 'medical' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        {n.type === 'system' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{n.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* List Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                <button
                  onClick={markAllRead}
                  className="text-[#00F0FF] hover:underline font-bold"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-gray-400 hover:text-rose-400 font-bold"
                >
                  Clear log
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#121824] p-4 rounded-2xl border border-white/10 space-y-3">
              <span className="font-bold text-[#00F0FF] uppercase tracking-wider text-[11px] block">
                Notification Categories
              </span>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A2232] border border-white/10 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Pal Status Updates</span>
                    <span className="text-[10px] text-gray-400">Matching, Pal acceptance, and trip completion</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.escortUpdates}
                    onChange={(e) => setSettings({ ...settings, escortUpdates: e.target.checked })}
                    className="accent-[#00F0FF] w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A2232] border border-white/10 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">GPS Proximity Radar Pings</span>
                    <span className="text-[10px] text-gray-400">Pal 5-min & 2-min arrival alerts at entrance doors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.gpsProximity}
                    onChange={(e) => setSettings({ ...settings, gpsProximity: e.target.checked })}
                    className="accent-[#00F0FF] w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A2232] border border-white/10 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Medical Record Access Alerts</span>
                    <span className="text-[10px] text-gray-400">HIPAA notifications when Pal views medical summary</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.medicalAccessAlerts}
                    onChange={(e) => setSettings({ ...settings, medicalAccessAlerts: e.target.checked })}
                    className="accent-[#00F0FF] w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A2232] border border-white/10 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Sound & Haptic Feedback</span>
                    <span className="text-[10px] text-gray-400">Play audio pings when notifications trigger</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="accent-[#00F0FF] w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#00F0FF] text-black font-black text-xs uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-all shadow-md"
            >
              Save Notification Preferences
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
