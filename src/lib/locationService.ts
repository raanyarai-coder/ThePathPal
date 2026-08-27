import { supabase } from './supabaseClient';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitude?: number | null;
  heading?: number | null;
  speedMps?: number | null;
  recordedAt: string;
}

export interface LocationSession {
  id: string;
  request_id?: string;
  match_id?: number;
  patient_id?: number;
  pal_id?: number;
  status: 'active' | 'paused' | 'ended';
  sharing_enabled: boolean;
  started_at: string;
  ended_at?: string | null;
  expires_at?: string | null;
  created_at: string;
}

// Distance calculation using Haversine formula (meters)
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatDistanceDisplay(meters: number): string {
  if (meters < 300) {
    const feet = Math.round(meters * 3.28084);
    return `${feet} ft`;
  }
  const miles = (meters / 1609.34).toFixed(2);
  return `${miles} mi`;
}

export function estimateWalkingEta(distanceMeters: number, currentSpeedMps?: number | null): {
  totalSeconds: number;
  formatted: string;
} {
  // Average human walking speed ~ 1.3 m/s (~3.0 mph)
  const effectiveSpeed = currentSpeedMps && currentSpeedMps > 0.4 ? currentSpeedMps : 1.3;
  const totalSeconds = Math.max(10, Math.round(distanceMeters / effectiveSpeed));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted =
    minutes > 0
      ? `${minutes} min${minutes > 1 ? 's' : ''} ${seconds < 10 ? '0' : ''}${seconds}s`
      : `${seconds}s`;

  return { totalSeconds, formatted };
}

// Active tracking watch ID and session reference
let activeWatchId: number | null = null;
let lastRecordedTime = 0;
let lastRecordedLat: number | null = null;
let lastRecordedLng: number | null = null;

/**
 * Starts real-time browser GPS tracking for a Pal and streams points to Supabase.
 */
export async function startPalLiveTracking(params: {
  sessionId?: string;
  requestId?: string;
  matchId?: number;
  patientId?: number;
  palId?: number;
  userId?: string;
  onPositionUpdate?: (coords: LocationCoordinates) => void;
  onError?: (errorMessage: string) => void;
}): Promise<{ sessionId: string | null; error: string | null }> {
  if (!('geolocation' in navigator)) {
    const err = 'GPS Location is not supported by your current browser.';
    params.onError?.(err);
    return { sessionId: null, error: err };
  }

  try {
    let currentSessionId = params.sessionId;

    // 1. Create or retrieve active session in location_sessions
    if (!currentSessionId) {
      const { data: sessionData, error: sessionErr } = await supabase
        .from('location_sessions')
        .insert({
          request_id: params.requestId || null,
          match_id: params.matchId || null,
          patient_id: params.patientId || null,
          pal_id: params.palId || null,
          status: 'active',
          sharing_enabled: true,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .maybeSingle();

      if (sessionErr) {
        console.warn('Location session creation note:', sessionErr.message);
        // Fallback local session ID if table is not yet accessible
        currentSessionId = `loc_sess_${Date.now()}`;
      } else if (sessionData) {
        currentSessionId = sessionData.id;
      } else {
        currentSessionId = `loc_sess_${Date.now()}`;
      }
    }

    // Clear any previous active watch
    if (activeWatchId !== null) {
      navigator.geolocation.clearWatch(activeWatchId);
      activeWatchId = null;
    }

    // 2. Start high-accuracy device GPS watch
    activeWatchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords: LocationCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy || 5),
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speedMps: pos.coords.speed,
          recordedAt: new Date().toISOString(),
        };

        params.onPositionUpdate?.(coords);

        // Throttle database inserts: at least every 4 seconds OR 3 meters moved
        const now = Date.now();
        const hasMovedSignificantly =
          lastRecordedLat !== null && lastRecordedLng !== null
            ? calculateDistanceMeters(
                lastRecordedLat,
                lastRecordedLng,
                coords.latitude,
                coords.longitude
              ) >= 3
            : true;

        if (now - lastRecordedTime > 4000 || hasMovedSignificantly) {
          lastRecordedTime = now;
          lastRecordedLat = coords.latitude;
          lastRecordedLng = coords.longitude;

          // Stream into location_points
          if (currentSessionId && !currentSessionId.startsWith('loc_sess_')) {
            Promise.resolve(
              supabase
                .from('location_points')
                .insert({
                  session_id: currentSessionId,
                  user_id: params.userId || null,
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  accuracy_meters: coords.accuracyMeters,
                  altitude: coords.altitude || null,
                  heading: coords.heading || null,
                  speed_mps: coords.speedMps || null,
                  recorded_at: coords.recordedAt,
                })
            )
              .then((res) => {
                if (res?.error) console.warn('Point insert note:', res.error.message);
              })
              .catch(() => {});
          }
        }
      },
      (err) => {
        let msg = 'Could not access GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow GPS location in your browser settings to share your live arrival status.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location signal is temporarily unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location acquisition timed out.';
        }
        params.onError?.(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      }
    );

    return { sessionId: currentSessionId, error: null };
  } catch (e: any) {
    const msg = e?.message || 'Failed to initialize live GPS tracking.';
    params.onError?.(msg);
    return { sessionId: null, error: msg };
  }
}

/**
 * Stops device GPS tracking and marks the session as ended in Supabase.
 */
export async function stopPalLiveTracking(sessionId?: string | null): Promise<void> {
  if (activeWatchId !== null) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
  }
  lastRecordedLat = null;
  lastRecordedLng = null;

  if (sessionId && !sessionId.startsWith('loc_sess_')) {
    try {
      await supabase
        .from('location_sessions')
        .update({
          status: 'ended',
          sharing_enabled: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    } catch (e) {
      console.warn('Error ending location session in database:', e);
    }
  }
}

/**
 * Checks if browser currently has active GPS watch running.
 */
export function isGpsTrackingActive(): boolean {
  return activeWatchId !== null;
}

/**
 * Subscribes to real-time location points of an active Pal session.
 */
export function subscribeToLiveLocationSession(
  sessionId: string,
  onPointReceived: (coords: LocationCoordinates) => void
) {
  if (!sessionId || sessionId.startsWith('loc_sess_')) return () => {};

  // 1. Fetch latest recorded point
  Promise.resolve(
    supabase
      .from('location_points')
      .select('*')
      .eq('session_id', sessionId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  )
    .then((res) => {
      if (res?.data) {
        onPointReceived({
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          accuracyMeters: res.data.accuracy_meters || 5,
          altitude: res.data.altitude,
          heading: res.data.heading,
          speedMps: res.data.speed_mps,
          recordedAt: res.data.recorded_at,
        });
      }
    })
    .catch(() => {});

  // 2. Realtime subscription for incoming live points
  const channel = supabase
    .channel(`loc_points_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_points',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new;
          onPointReceived({
            latitude: row.latitude,
            longitude: row.longitude,
            accuracyMeters: row.accuracy_meters || 5,
            altitude: row.altitude,
            heading: row.heading,
            speedMps: row.speed_mps,
            recordedAt: row.recorded_at,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
