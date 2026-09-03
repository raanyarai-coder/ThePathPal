// =========================================================================
// PathPal Escort Service
// Server-backed lifecycle management for active companion escort sessions,
// 2-hour duration enforcement, overtime tracking, and Realtime sync.
// =========================================================================

import { supabase } from './supabaseClient';
import { EscortSession } from '../types';
import { startPalLiveTracking, stopPalLiveTracking } from './locationService';

export const STANDARD_INCLUDED_MINUTES = 120; // 2-hour door-to-department service

/**
 * Starts an escort session.
 * Records server start timestamp, transitions status to 'in_progress',
 * and initiates live location tracking.
 */
export async function startEscortSession(
  sessionId: string,
  coords?: { lat: number; lng: number }
): Promise<{ success: boolean; session: EscortSession | null; error: string | null }> {
  try {
    // 1. First attempt calling the atomic RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('start_escort_session', {
      p_session_id: sessionId,
      p_lat: coords?.lat ?? null,
      p_lng: coords?.lng ?? null,
    });

    if (!rpcError && rpcData) {
      // Start GPS broadcast
      try {
        const { data: currentPal } = await supabase.auth.getUser();
        await startPalLiveTracking({
          userId: currentPal?.user?.id,
          palId: rpcData.pal_id,
        });
      } catch (err) {
        console.warn('[EscortService] Background GPS start warning:', err);
      }

      return { success: true, session: rpcData as EscortSession, error: null };
    }

    // 2. Direct table fallback if RPC is not yet deployed
    console.warn('[EscortService] RPC start_escort_session error or fallback:', rpcError?.message);

    const now = new Date().toISOString();
    const { data: updatedSession, error: updateError } = await supabase
      .from('escort_sessions')
      .update({
        status: 'in_progress',
        started_at: now,
        start_latitude: coords?.lat ?? null,
        start_longitude: coords?.lng ?? null,
      })
      .eq('id', sessionId)
      .select('*')
      .single();

    if (updateError || !updatedSession) {
      return {
        success: false,
        session: null,
        error: updateError?.message || 'Failed to start escort session.',
      };
    }

    // Update parent request status
    if (updatedSession.request_id) {
      await supabase
        .from('pal_requests')
        .update({ status: 'in_progress' })
        .eq('id', updatedSession.request_id);
    }

    // Start GPS broadcast
    try {
      const { data: currentPal } = await supabase.auth.getUser();
      await startPalLiveTracking({
        userId: currentPal?.user?.id,
        palId: updatedSession.pal_id,
      });
    } catch (err) {
      console.warn('[EscortService] GPS stream warning:', err);
    }

    return { success: true, session: updatedSession as EscortSession, error: null };
  } catch (err: any) {
    console.error('[EscortService] startEscortSession exception:', err);
    return {
      success: false,
      session: null,
      error: err?.message || 'Error starting escort session.',
    };
  }
}

/**
 * Completes an escort session.
 * Records server completion timestamp, stops GPS tracking,
 * and calculates exact actual minutes and overtime minutes.
 */
export async function completeEscortSession(
  sessionId: string,
  coords?: { lat: number; lng: number },
  completionNotes?: string
): Promise<{ success: boolean; session: EscortSession | null; error: string | null }> {
  try {
    // 1. Stop GPS live tracking
    try {
      await stopPalLiveTracking();
    } catch (err) {
      console.warn('[EscortService] GPS stop error:', err);
    }

    // 2. Attempt calling the atomic RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('complete_escort_session', {
      p_session_id: sessionId,
      p_lat: coords?.lat ?? null,
      p_lng: coords?.lng ?? null,
      p_completion_notes: completionNotes ?? null,
    });

    if (!rpcError && rpcData) {
      return { success: true, session: rpcData as EscortSession, error: null };
    }

    // 3. Fallback direct update
    console.warn('[EscortService] RPC complete_escort_session fallback:', rpcError?.message);

    // Fetch session to determine started_at
    const { data: existing } = await supabase
      .from('escort_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const now = new Date();
    let actualMinutes = 60; // reasonable default
    let overtimeMinutes = 0;

    if (existing?.started_at) {
      const startMs = new Date(existing.started_at).getTime();
      const elapsedMs = Math.max(0, now.getTime() - startMs);
      actualMinutes = Math.max(1, Math.round(elapsedMs / (1000 * 60)));
      overtimeMinutes = Math.max(0, actualMinutes - (existing.included_minutes || STANDARD_INCLUDED_MINUTES));
    }

    const { data: completedSession, error: updateError } = await supabase
      .from('escort_sessions')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        actual_minutes: actualMinutes,
        overtime_minutes: overtimeMinutes,
        end_latitude: coords?.lat ?? null,
        end_longitude: coords?.lng ?? null,
        completion_notes: completionNotes ?? null,
      })
      .eq('id', sessionId)
      .select('*')
      .single();

    if (updateError || !completedSession) {
      return {
        success: false,
        session: null,
        error: updateError?.message || 'Failed to complete escort session.',
      };
    }

    // Update parent request status
    if (completedSession.request_id) {
      await supabase
        .from('pal_requests')
        .update({ status: 'completed' })
        .eq('id', completedSession.request_id);
    }

    return { success: true, session: completedSession as EscortSession, error: null };
  } catch (err: any) {
    console.error('[EscortService] completeEscortSession exception:', err);
    return {
      success: false,
      session: null,
      error: err?.message || 'Error completing escort session.',
    };
  }
}

/**
 * Retrieves the escort session record linked to a given request.
 * Creates a scheduled session if missing and request is matched.
 */
export async function getOrCreateEscortSession(
  requestId: string,
  palId?: number,
  patientId?: number
): Promise<EscortSession | null> {
  try {
    // 1. Check if session already exists
    const { data: existing, error } = await supabase
      .from('escort_sessions')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle();

    if (!error && existing) {
      return existing as EscortSession;
    }

    // 2. If not found and palId provided, create scheduled session
    if (palId) {
      const { data: newSession, error: insertError } = await supabase
        .from('escort_sessions')
        .insert({
          request_id: requestId,
          pal_id: palId,
          patient_id: patientId || null,
          status: 'scheduled',
          scheduled_start_at: new Date().toISOString(),
          included_minutes: STANDARD_INCLUDED_MINUTES,
          service_type: 'single_visit',
        })
        .select('*')
        .single();

      if (!insertError && newSession) {
        return newSession as EscortSession;
      }
    }
  } catch (err) {
    console.warn('[EscortService] getOrCreateEscortSession warning:', err);
  }
  return null;
}

/**
 * Fetches all escort sessions across all requests.
 */
export async function fetchAllEscortSessions(): Promise<EscortSession[]> {
  try {
    const { data, error } = await supabase
      .from('escort_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as EscortSession[];
    }
  } catch (err) {
    console.warn('[EscortService] fetchAllEscortSessions warning:', err);
  }
  return [];
}

export interface CreateEscortSessionParams {
  request_id: string;
  pal_id?: number | string | null;
  patient_id?: number | null;
  patient_name?: string;
  patient_phone?: string;
  hospital_name?: string;
  department?: string;
  meeting_location?: string;
  start_coords?: { lat: number; lng: number };
}

/**
 * Creates or initializes an escort session for a given PalRequest.
 */
export async function createEscortSession(
  params: CreateEscortSessionParams
): Promise<EscortSession | null> {
  try {
    // 1. Check if an active session already exists for this request
    const existing = await getOrCreateEscortSession(
      params.request_id,
      typeof params.pal_id === 'number' ? params.pal_id : parseInt(String(params.pal_id || 0), 10) || undefined,
      params.patient_id || undefined
    );

    if (existing) {
      return {
        ...existing,
        patient_name: params.patient_name || existing.patient_name,
        patient_phone: params.patient_phone || existing.patient_phone,
        hospital_name: params.hospital_name || existing.hospital_name,
        department: params.department || existing.department,
        meeting_location: params.meeting_location || existing.meeting_location,
      };
    }
  } catch (err) {
    console.warn('[EscortService] createEscortSession warning:', err);
  }
  return null;
}

/**
 * Fetches all escort sessions assigned to a PAL.
 */
export async function fetchPalEscortSessions(palId?: number | string): Promise<EscortSession[]> {
  try {
    let query = supabase.from('escort_sessions').select('*').order('created_at', { ascending: false });

    if (palId) {
      const numericId = typeof palId === 'string' ? parseInt(palId, 10) : palId;
      if (!isNaN(numericId)) {
        query = query.eq('pal_id', numericId);
      }
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as EscortSession[];
    }
  } catch (err) {
    console.warn('[EscortService] fetchPalEscortSessions warning:', err);
  }
  return [];
}

/**
 * Fetches all escort sessions for a patient.
 */
export async function fetchPatientEscortSessions(patientId?: number | string): Promise<EscortSession[]> {
  try {
    let query = supabase.from('escort_sessions').select('*').order('created_at', { ascending: false });

    if (patientId) {
      const numericId = typeof patientId === 'string' ? parseInt(String(patientId), 10) : patientId;
      if (!isNaN(numericId)) {
        query = query.eq('patient_id', numericId);
      }
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as EscortSession[];
    }
  } catch (err) {
    console.warn('[EscortService] fetchPatientEscortSessions warning:', err);
  }
  return [];
}

/**
 * Calculates countdown timer parameters for an in-progress session.
 */
export function calculateEscortCountdown(
  startedAt?: string | null,
  includedMinutes = STANDARD_INCLUDED_MINUTES
): {
  elapsedSeconds: number;
  remainingSeconds: number;
  totalRemainingSeconds: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  progressPercent: number;
  isOvertime: boolean;
  overtimeMinutes: number;
  formattedRemaining: string;
  formattedElapsed: string;
} {
  const totalAllocatedSec = includedMinutes * 60;

  if (!startedAt) {
    return {
      elapsedSeconds: 0,
      remainingSeconds: 0,
      totalRemainingSeconds: totalAllocatedSec,
      elapsedMinutes: 0,
      remainingMinutes: includedMinutes,
      progressPercent: 0,
      isOvertime: false,
      overtimeMinutes: 0,
      formattedRemaining: '02:00:00',
      formattedElapsed: '00:00:00',
    };
  }

  const startMs = new Date(startedAt).getTime();
  const nowMs = Date.now();
  const elapsedSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
  const remainingSec = totalAllocatedSec - elapsedSec;
  const isOvertime = remainingSec <= 0;
  const overtimeSec = Math.max(0, elapsedSec - totalAllocatedSec);
  const overtimeMinutes = Math.floor(overtimeSec / 60);

  const elapsedMinutes = Math.floor(elapsedSec / 60);
  const remainingMinutes = Math.floor(Math.max(0, remainingSec) / 60);
  const remainingSeconds = Math.max(0, remainingSec) % 60;
  const progressPercent = Math.min(100, Math.round((elapsedSec / Math.max(1, totalAllocatedSec)) * 100));

  // Format remaining as HH:MM:SS
  const formatTime = (secs: number) => {
    const s = Math.max(0, secs);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    elapsedSeconds: elapsedSec,
    remainingSeconds,
    totalRemainingSeconds: Math.max(0, remainingSec),
    elapsedMinutes,
    remainingMinutes,
    progressPercent,
    isOvertime,
    overtimeMinutes,
    formattedRemaining: formatTime(remainingSec),
    formattedElapsed: formatTime(elapsedSec),
  };
}

/**
 * Formats duration in human-readable terms: e.g. "1h 55m" or "45m".
 */
export function formatReadableDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours > 0) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }
  return `${remainingMins}m`;
}

/**
 * Exported alias for duration formatting
 */
export const formatDurationDisplay = formatReadableDuration;
