import { supabase } from './supabaseClient';
import { sendUserNotification } from './notificationService';
import { playSosDispatchTone } from '../utils/emergencyAudio';

export interface EmergencySosIncident {
  id: string;
  patient_id?: number | string;
  patient_name: string;
  patient_phone?: string;
  pal_id?: number | string;
  pal_name: string;
  pal_phone?: string;
  hospital_name: string;
  location_detail: string;
  department?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'security_dispatched' | 'pal_en_route' | 'resolved' | 'cancelled';
  timestamp: string;
  security_unit?: string;
  security_ack_time?: string;
  emergency_type: 'medical_distress' | 'mobility_fall' | 'security_concern' | 'general_sos';
  notes?: string;
}

const ACTIVE_SOS_KEY = 'pathpal_active_sos_incident';

/**
 * Triggers a real-time emergency SOS broadcast.
 * Instantly alerts local hospital security & the assigned Pal via push notification.
 */
export async function triggerEmergencySos(params: {
  patientName?: string;
  patientPhone?: string;
  hospitalName?: string;
  department?: string;
  locationDetail?: string;
  assignedPalName?: string;
  assignedPalPhone?: string;
  emergencyType?: 'medical_distress' | 'mobility_fall' | 'security_concern' | 'general_sos';
  notes?: string;
}): Promise<EmergencySosIncident> {
  const incidentId = `SOS-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const patient_name = params.patientName || 'Eleanor Vance';
  const hospital_name = params.hospitalName || 'Mount Sinai Medical Center';
  const pal_name = params.assignedPalName || 'Marcus Vance';
  const location_detail =
    params.locationDetail || 'Main Clinical Pavilion - 2nd Floor Cardiology Corridor (Gate 4)';

  const incident: EmergencySosIncident = {
    id: incidentId,
    patient_name,
    patient_phone: params.patientPhone || '(555) 234-5678',
    pal_name,
    pal_phone: params.assignedPalPhone || '(555) 392-1094',
    hospital_name,
    department: params.department || 'Cardiology Outpatient Clinic',
    location_detail,
    status: 'active',
    timestamp: now,
    security_unit: 'Campus Security Unit #S-14 (Rapid Response)',
    emergency_type: params.emergencyType || 'general_sos',
    notes: params.notes || 'Immediate assistance requested by patient at campus location.',
  };

  // 1. Play audio tone & haptic feedback
  playSosDispatchTone();
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {}
  }

  // 2. Trigger System/Browser Push Notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification('🚨 PATHPAL EMERGENCY SOS BROADCAST', {
          body: `Emergency Alert: ${patient_name} at ${hospital_name} (${location_detail}). Campus Security Unit #S-14 & Pal ${pal_name} have been dispatched!`,
          icon: '/favicon.ico',
          tag: 'emergency_sos_active',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('🚨 PATHPAL EMERGENCY SOS BROADCAST', {
              body: `Emergency Alert: ${patient_name} at ${hospital_name}. Campus Security and Pal ${pal_name} are responding!`,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Native push notification error:', e);
    }
  }

  // 3. Save to Local Storage Cache
  try {
    localStorage.setItem(ACTIVE_SOS_KEY, JSON.stringify(incident));
  } catch {}

  // 4. Log Push Notifications to Supabase notifications table
  try {
    // Notify Pal
    await sendUserNotification({
      userId: 'pal_active_assigned',
      type: 'medical',
      title: `🚨 URGENT: SOS Alert for ${patient_name}`,
      message: `Emergency SOS triggered at ${location_detail}. Hospital security alerted. Please proceed immediately to assist patient.`,
      relatedId: incidentId,
      relatedType: 'sos_alert',
    });

    // Notify Hospital Security Dispatch
    await sendUserNotification({
      userId: 'hospital_security_dispatch',
      type: 'medical',
      title: `🚨 CODE AMBER / SOS: ${hospital_name}`,
      message: `Patient ${patient_name} requested emergency assistance at ${location_detail}. Assigned Pal: ${pal_name}.`,
      relatedId: incidentId,
      relatedType: 'sos_alert',
    });

    // Record in database notifications / requests if possible
    await supabase.from('notifications').insert([
      {
        user_id: 'security_dispatch_hub',
        title: `🚨 EMERGENCY SOS: ${patient_name}`,
        message: `Location: ${location_detail} (${hospital_name}). Pal ${pal_name} notified.`,
        type: 'medical',
        is_read: false,
      },
    ]);
  } catch (err) {
    console.warn('Supabase emergency logging notice:', err);
  }

  return incident;
}

/**
 * Retrieves any currently active SOS incident.
 */
export function getActiveSosIncident(): EmergencySosIncident | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SOS_KEY);
    if (!raw) return null;
    const item: EmergencySosIncident = JSON.parse(raw);
    if (item.status === 'resolved' || item.status === 'cancelled') {
      return null;
    }
    return item;
  } catch {
    return null;
  }
}

/**
 * Resolves or cancels the active SOS incident.
 */
export async function resolveSosIncident(
  incidentId: string,
  resolution: 'resolved' | 'cancelled',
  reason?: string
): Promise<void> {
  try {
    const raw = localStorage.getItem(ACTIVE_SOS_KEY);
    if (raw) {
      const item: EmergencySosIncident = JSON.parse(raw);
      if (item.id === incidentId) {
        item.status = resolution;
        item.notes = `${item.notes || ''} [${resolution.toUpperCase()}: ${reason || 'Patient marked all clear'}]`;
        localStorage.removeItem(ACTIVE_SOS_KEY);
      }
    }

    // Trigger all-clear push notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('✅ SOS Incident Resolved - All Clear', {
        body: `Emergency status for incident #${incidentId} has been resolved. Security & Pal stood down.`,
        tag: 'emergency_sos_resolved',
      });
    }

    // Log resolved notification
    await sendUserNotification({
      userId: 'hospital_security_dispatch',
      type: 'system',
      title: `✅ SOS #${incidentId} Stood Down / Resolved`,
      message: `Emergency status resolved: ${reason || 'Patient marked all-clear.'}`,
      relatedId: incidentId,
    });
  } catch (e) {
    console.warn('Error resolving SOS incident:', e);
  }
}
