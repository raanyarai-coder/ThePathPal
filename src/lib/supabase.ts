import {
  supabase,
  supabaseClient,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  getValidSupabaseUrl,
  getValidSupabaseAnonKey,
} from './supabaseClient';
import {
  Pal,
  PalApplication,
  PalEmailNotification,
  PalRequest,
  Match,
  HospitalVisit,
  Membership,
  Payment,
  Payout,
  Review,
  HospitalInquiry,
  Notification,
  Patient,
  AdminUser,
} from '../types';

export {
  supabase,
  supabaseClient,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  getValidSupabaseUrl,
  getValidSupabaseAnonKey,
};

export interface AuthResult {
  data: any | null;
  error: { message: string } | null;
}

const PAL_EMAILS_STORAGE_KEY = 'pathpal_pal_emails_sent';

export function getSentPalEmails(): PalEmailNotification[] {
  try {
    const data = localStorage.getItem(PAL_EMAILS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSentPalEmail(email: PalEmailNotification) {
  try {
    const list = getSentPalEmails();
    list.unshift(email);
    localStorage.setItem(PAL_EMAILS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to record sent pal email:', e);
  }
}

/**
 * Transforms raw database row from `pals` table into application `Pal` object.
 * Does NOT assign arbitrary fake ratings, languages, or avatars unless present in database.
 */
export function formatPalFromDb(row: any): Pal {
  if (!row) return null as any;
  const badgeNumber = `PAL-${String(row.id).padStart(4, '0')}`;

  let languagesList: string[] = [];
  if (Array.isArray(row.languages)) {
    languagesList = row.languages;
  } else if (typeof row.languages === 'string' && row.languages.trim()) {
    languagesList = row.languages.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  let specialtiesList: string[] = [];
  if (Array.isArray(row.specialties)) {
    specialtiesList = row.specialties;
  } else if (typeof row.specialties === 'string' && row.specialties.trim()) {
    specialtiesList = row.specialties.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  let affiliationsList: string[] = [];
  if (Array.isArray(row.hospital_affiliations || row.hospitalAffiliations)) {
    affiliationsList = row.hospital_affiliations || row.hospitalAffiliations;
  } else if (
    typeof (row.hospital_affiliations || row.hospitalAffiliations) === 'string' &&
    (row.hospital_affiliations || row.hospitalAffiliations).trim()
  ) {
    affiliationsList = (row.hospital_affiliations || row.hospitalAffiliations)
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  return {
    id: row.id,
    auth_user_id: row.auth_user_id || undefined,
    name: row.name || 'Pal Companion',
    phone: row.phone || '',
    bio: row.bio || '',
    availability: row.availability || '',
    background_check_status: row.background_check_status || 'pending',
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    hourly_rate_cents: row.hourly_rate_cents !== null && row.hourly_rate_cents !== undefined ? Number(row.hourly_rate_cents) : 0,
    stripe_account_id: row.stripe_account_id || undefined,
    created_at: row.created_at || new Date().toISOString(),
    badgeNumber,
    isVerified: row.background_check_status === 'cleared' || Boolean(row.auth_user_id),
    account_status: row.auth_user_id ? 'active' : 'approved_pending_verification',
    email_verified: Boolean(row.auth_user_id),
    completedVisits: row.completed_visits || row.completedVisits || 0,
    languages: languagesList,
    specialties: specialtiesList,
    hospitalAffiliations: affiliationsList,
    avatar: row.avatar_url || row.avatar || undefined,
    email: row.email || undefined,
  };
}

/**
 * Transforms raw database row from `pal_applications` into application `PalApplication` object.
 */
export function formatApplicationFromDb(row: any): PalApplication {
  return {
    id: row.id,
    name: row.name || row.full_name || '',
    full_name: row.name || row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    languages: row.languages || 'English',
    status: row.status || 'pending',
    created_at: row.created_at || new Date().toISOString(),
    bio: row.bio || '',
    specialties: row.specialties || '',
    admin_notes: row.admin_notes || '',
    approved_at: row.approved_at || undefined,
    signup_completed_at: row.signup_completed_at || undefined,
  };
}

/**
 * Formats a raw database row from `pal_requests` into `PalRequest` object.
 */
export function formatPalRequestFromDb(row: any, assignedPal?: Pal): PalRequest {
  let mobilityNeeds: string[] = [];
  if (Array.isArray(row.mobility_needs)) {
    mobilityNeeds = row.mobility_needs;
  } else if (typeof row.mobility_needs === 'string' && row.mobility_needs.trim()) {
    mobilityNeeds = row.mobility_needs.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (row.notes && row.notes.includes('Mobility:')) {
    const match = row.notes.match(/Mobility:\s*([^;]+)/);
    if (match && match[1]) {
      mobilityNeeds = match[1].split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  let appDate = row.scheduled_at ? row.scheduled_at.split('T')[0] : new Date().toISOString().split('T')[0];
  let appTime = row.scheduled_at && row.scheduled_at.includes('T')
    ? row.scheduled_at.split('T')[1].substring(0, 5)
    : '10:00 AM';

  return {
    id: row.id,
    patient_id: row.patient_id || undefined,
    patientName: row.patient_name || (row.patient ? row.patient.name : 'Patient'),
    patientPhone: row.patient_phone || (row.patient ? row.patient.phone : ''),
    hospitalId: row.hospital_id || 'hosp-01',
    hospitalName: row.hospital_name || 'Hospital Campus',
    appointmentDate: appDate,
    appointmentTime: appTime,
    department: row.department || 'General Clinic',
    meetingPoint: row.meeting_point || 'Main Lobby Entrance',
    mobilityNeeds: mobilityNeeds.length > 0 ? mobilityNeeds : ['Escort Assistance'],
    languagePreference: row.language_preference || 'English',
    notes: row.notes || '',
    status: row.status || 'pending',
    assignedPal,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/* =========================================================================
 * 1. PAL APPLICATIONS
 * ========================================================================= */

export async function submitPalApplication(data: {
  name?: string;
  full_name?: string;
  email: string;
  phone: string;
  languages?: string;
  specialties?: string;
  bio?: string;
}): Promise<{ success: boolean }> {
  const name = (data.name || data.full_name || '').trim();
  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();
  const languages = (data.languages || 'English').trim();

  const { error } = await supabase
    .from('pal_applications')
    .insert({
      name,
      email,
      phone,
      languages,
      status: 'pending',
    });

  if (error) {
    console.error('PAL application submission error:', error);
    throw new Error('Unable to submit application at this time.');
  }

  return { success: true };
}

export async function fetchPalApplications(): Promise<PalApplication[]> {
  try {
    const { data, error } = await supabase
      .from('pal_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Pal applications fetch note:', error.message);
      return [];
    }

    if (data) {
      return data.map(formatApplicationFromDb);
    }
  } catch (err) {
    console.error('Exception fetching pal applications:', err);
  }
  return [];
}

export async function approvePalApplication(
  applicationId: string,
  _adminNotes: string = 'Approved by Administrator'
): Promise<{ data: { application: PalApplication; signupLink: string } | null; error: { message: string } | null }> {
  try {
    const { data: updatedAppDb, error: updateAppErr } = await supabase
      .from('pal_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateAppErr) {
      console.error('Failed to update application status:', updateAppErr.message);
      return { data: null, error: { message: 'Failed to approve application.' } };
    }

    const application = formatApplicationFromDb(updatedAppDb);

    // Ensure corresponding record in `pals` matching name and phone
    const { data: existingPal } = await supabase
      .from('pals')
      .select('*')
      .eq('name', application.name)
      .eq('phone', application.phone)
      .maybeSingle();

    if (!existingPal) {
      await supabase.from('pals').insert([
        {
          name: application.name,
          phone: application.phone,
          bio: application.bio || 'Hospital Escort and Patient Companion Pal.',
          availability: 'Flexible (Weekdays & Weekends)',
          background_check_status: 'cleared',
          rating: 5.0,
          hourly_rate_cents: 2600,
        },
      ]);
    }

    const signupLink = `${window.location.origin}/#pal-signup?app_id=${application.id}`;
    return { data: { application, signupLink }, error: null };
  } catch (err: any) {
    console.error('Approval exception:', err);
    return { data: null, error: { message: 'Failed to approve application.' } };
  }
}

export async function rejectPalApplication(
  applicationId: string,
  _adminNotes: string = 'Application rejected by Administrator'
): Promise<{ success: boolean; error: { message: string } | null }> {
  try {
    const { error } = await supabase
      .from('pal_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: { message: err?.message || 'Failed to reject application.' } };
  }
}

export async function getApprovedPalApplication(
  applicationId: string
): Promise<{ data: PalApplication | null; error: { message: string } | null }> {
  try {
    const { data, error } = await supabase
      .from('pal_applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (error) {
      return { data: null, error: { message: 'Application could not be retrieved: ' + error.message } };
    }

    if (!data) {
      return {
        data: null,
        error: {
          message: `Application reference "${applicationId}" was not found. Please contact onboarding.`,
        },
      };
    }

    if (data.status !== 'approved') {
      return {
        data: null,
        error: {
          message: `Application is currently "${data.status}". You must wait for an administrator to approve your application before creating your Pal account.`,
        },
      };
    }

    return { data: formatApplicationFromDb(data), error: null };
  } catch {
    return { data: null, error: { message: 'Error validating application.' } };
  }
}

/* =========================================================================
 * 2. PAL AUTHENTICATION & PROFILE
 * ========================================================================= */

export async function signUpPal(
  email: string,
  password: string,
  application: PalApplication
): Promise<AuthResult> {
  try {
    if (!application || application.status !== 'approved') {
      return {
        data: null,
        error: {
          message: 'Cannot create Pal account: Application has not been approved by an administrator.',
        },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: application.name,
          phone: application.phone,
          role: 'pal',
        },
        emailRedirectTo: `${window.location.origin}/#pal-verify`,
      },
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || 'An unexpected error occurred during Pal signup.' },
    };
  }
}

export async function verifyPalEmailAndActivate(): Promise<{
  data: {
    user: any;
    palRecord: Pal | null;
    emailNotification: PalEmailNotification;
  } | null;
  error: { message: string } | null;
}> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: {
          message: 'No active session found. Please click the verification link in your email or log in.',
        },
      };
    }

    if (!user.email_confirmed_at) {
      return {
        data: null,
        error: {
          message: 'Your email address has not been confirmed yet. Please check your inbox and click the verification link.',
        },
      };
    }

    const { data: application } = await supabase
      .from('pal_applications')
      .select('*')
      .eq('email', user.email)
      .eq('status', 'approved')
      .maybeSingle();

    const appName = application?.name || user.user_metadata?.full_name;
    const appPhone = application?.phone || user.user_metadata?.phone;

    const { data: pal } = await supabase
      .from('pals')
      .select('*')
      .eq('name', appName)
      .eq('phone', appPhone)
      .maybeSingle();

    let updatedPal: any = null;
    if (pal) {
      const res = await supabase
        .from('pals')
        .update({ auth_user_id: user.id })
        .eq('id', pal.id)
        .select()
        .single();
      updatedPal = res.data;
    }

    if (!pal && !updatedPal) {
      return {
        data: null,
        error: {
          message: 'Your Pal profile has not been initialized. Please contact an administrator.',
        },
      };
    }

    const finalPal = formatPalFromDb(updatedPal || pal);

    const emailNotification: PalEmailNotification = {
      id: `email-${Date.now()}`,
      recipient_email: user.email || '',
      recipient_name: finalPal.name,
      subject: 'Your Pal Account Is Ready',
      message:
        'Your email has been successfully verified and your Pal account is active. You can log in using your registered credentials.',
      sent_at: new Date().toISOString(),
      status: 'delivered',
    };

    saveSentPalEmail(emailNotification);

    return {
      data: {
        user,
        palRecord: finalPal,
        emailNotification,
      },
      error: null,
    };
  } catch {
    return {
      data: null,
      error: { message: 'Verification failed. Please try again.' },
    };
  }
}

export async function loginPal(
  email: string,
  password: string
): Promise<{
  data: {
    user: any;
    session: any;
    palRecord: Pal | null;
  } | null;
  error: { message: string } | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (!data.user) {
      return { data: null, error: { message: 'Login failed: User not found.' } };
    }

    const authUserId = data.user.id;
    let palRecord: Pal | null = await fetchPalByAuthUserId(authUserId);

    if (!palRecord && data.user.email_confirmed_at) {
      const { data: application } = await supabase
        .from('pal_applications')
        .select('*')
        .eq('email', data.user.email)
        .eq('status', 'approved')
        .maybeSingle();

      const appName = application?.name || data.user.user_metadata?.full_name;
      const appPhone = application?.phone || data.user.user_metadata?.phone;

      if (appName && appPhone) {
        const { data: existingPal } = await supabase
          .from('pals')
          .select('*')
          .eq('name', appName)
          .eq('phone', appPhone)
          .maybeSingle();

        if (existingPal) {
          const { data: linkedPal } = await supabase
            .from('pals')
            .update({ auth_user_id: authUserId })
            .eq('id', existingPal.id)
            .select()
            .single();

          if (linkedPal) {
            palRecord = formatPalFromDb(linkedPal);
          }
        }
      }
    }

    return {
      data: {
        user: data.user,
        session: data.session,
        palRecord,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || 'Login failed.' },
    };
  }
}

export async function fetchPalByAuthUserId(authUserId: string): Promise<Pal | null> {
  try {
    const { data } = await supabase
      .from('pals')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (data) {
      return formatPalFromDb(data);
    }
  } catch {}
  return null;
}

export async function fetchAllPals(): Promise<Pal[]> {
  try {
    const { data, error } = await supabase
      .from('pals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(formatPalFromDb);
    }
  } catch {}
  return [];
}

export async function signOutPal() {
  try {
    await supabase.auth.signOut();
  } catch {}
  return { error: null };
}

export async function getCurrentPalUser(): Promise<{ user: any | null; palRecord: Pal | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, palRecord: null };

    const palRecord = await fetchPalByAuthUserId(user.id);
    return { user, palRecord };
  } catch {
    return { user: null, palRecord: null };
  }
}

/* =========================================================================
 * 3. PATIENTS
 * ========================================================================= */

export async function signUpPatient(
  email: string,
  password: string,
  name: string,
  phone: string = ''
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone,
          role: 'patient',
        },
      },
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    // Also register in patients table
    if (data.user) {
      try {
        await supabase.from('patients').insert({
          auth_user_id: data.user.id,
          name,
          phone,
        });
      } catch {}
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'Error during sign up.' } };
  }
}

export async function loginPatient(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'Login failed.' } };
  }
}

export async function signOutPatient() {
  try {
    await supabase.auth.signOut();
  } catch {}
  return { error: null };
}

export async function getCurrentPatientUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function fetchAllPatients(): Promise<Patient[]> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row: any) => ({
        id: row.id,
        auth_user_id: row.auth_user_id,
        name: row.name || 'Patient',
        phone: row.phone || '',
        email: row.email || '',
        created_at: row.created_at || new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
}

/* =========================================================================
 * 4. PAL REQUESTS & MATCHES
 * ========================================================================= */

export async function createPalRequest(requestData: {
  patient_id?: number;
  patient_name?: string;
  patientName?: string;
  patientPhone?: string;
  hospitalId?: string;
  hospitalName?: string;
  department?: string;
  meeting_point?: string;
  meetingPoint?: string;
  scheduled_at?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  status?: string;
  mobilityNeeds?: string[];
  languagePreference?: string;
}): Promise<{ data: PalRequest | null; error: { message: string } | null }> {
  try {
    const patient_name = requestData.patient_name || requestData.patientName || 'Patient';
    const department = requestData.department || 'Main Outpatient';
    const meeting_point = requestData.meeting_point || requestData.meetingPoint || 'Main Lobby Entrance';
    const scheduled_at =
      requestData.scheduled_at ||
      (requestData.appointmentDate && requestData.appointmentTime
        ? `${requestData.appointmentDate}T${requestData.appointmentTime}`
        : new Date().toISOString());

    const notesExtra = [
      requestData.notes,
      requestData.hospitalName ? `Hospital: ${requestData.hospitalName}` : '',
      requestData.patientPhone ? `Phone: ${requestData.patientPhone}` : '',
      requestData.languagePreference ? `Language: ${requestData.languagePreference}` : '',
      requestData.mobilityNeeds?.length ? `Mobility: ${requestData.mobilityNeeds.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const { data, error } = await supabase
      .from('pal_requests')
      .insert({
        patient_id: requestData.patient_id || null,
        patient_name,
        department,
        meeting_point,
        scheduled_at,
        notes: notesExtra,
        status: requestData.status || 'pending',
      })
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error: { message: 'Could not create companion request: ' + error.message } };
    }

    const formatted: PalRequest = {
      id: String(data?.id || `REQ-${Date.now()}`),
      patientName: data?.patient_name || patient_name,
      patientPhone: requestData.patientPhone || '',
      hospitalId: requestData.hospitalId || 'hosp-1',
      hospitalName: requestData.hospitalName || 'PathPal Partner Medical Center',
      appointmentDate: requestData.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: requestData.appointmentTime || '10:00 AM',
      department: data?.department || department,
      meetingPoint: data?.meeting_point || meeting_point,
      mobilityNeeds: requestData.mobilityNeeds || ['Companion Escort'],
      languagePreference: requestData.languagePreference || 'English',
      status: (data?.status as any) || 'pending',
      assignedPal: undefined,
      createdAt: data?.created_at || new Date().toISOString(),
    };

    return { data: formatted, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'Failed to create request.' } };
  }
}

export async function fetchPalRequests(): Promise<PalRequest[]> {
  try {
    const { data, error } = await supabase
      .from('pal_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching pal requests:', error.message);
      return [];
    }

    if (!data) return [];

    // Also fetch all matches to pair assigned Pals
    const { data: matchesData } = await supabase.from('matches').select('*');
    const { data: palsData } = await supabase.from('pals').select('*');

    const palsMap = new Map<number, Pal>();
    if (palsData) {
      palsData.forEach((p: any) => palsMap.set(p.id, formatPalFromDb(p)));
    }

    const matchesMap = new Map<string, any>();
    if (matchesData) {
      matchesData.forEach((m: any) => matchesMap.set(m.request_id, m));
    }

    return data.map((r: any) => {
      const match = matchesMap.get(r.id);
      const pal = match ? palsMap.get(match.pal_id) : undefined;
      return formatPalRequestFromDb(r, pal);
    });
  } catch {
    return [];
  }
}

export async function assignPalToRequest(
  requestId: string,
  palId: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 1. Update pal_requests
    const { error: reqErr } = await supabase
      .from('pal_requests')
      .update({ status: 'matched' })
      .eq('id', requestId);

    if (reqErr) {
      return { success: false, error: reqErr.message };
    }

    // 2. Create match record
    const { error: matchErr } = await supabase.from('matches').insert({
      request_id: requestId,
      pal_id: palId,
      status: 'accepted',
      matched_at: new Date().toISOString(),
    });

    if (matchErr) {
      return { success: false, error: matchErr.message };
    }

    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Assignment failed.' };
  }
}

export async function fetchAllMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const pals = await fetchAllPals();
    const palsMap = new Map(pals.map((p) => [p.id, p]));

    return data.map((row: any) => ({
      id: row.id,
      request_id: row.request_id,
      pal_id: row.pal_id,
      status: row.status || 'pending',
      matched_at: row.matched_at,
      created_at: row.created_at || new Date().toISOString(),
      pal: palsMap.get(row.pal_id),
    }));
  } catch {
    return [];
  }
}

/* =========================================================================
 * 5. HOSPITAL VISITS
 * ========================================================================= */

export async function fetchAllHospitalVisits(): Promise<HospitalVisit[]> {
  try {
    const { data, error } = await supabase
      .from('hospital_visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      match_id: row.match_id,
      pal_id: row.pal_id,
      patient_id: row.patient_id,
      hospital_name: row.hospital_name || 'Hospital Campus',
      department: row.department || 'Outpatient Clinic',
      scheduled_at: row.scheduled_at,
      started_at: row.started_at,
      completed_at: row.completed_at,
      status: row.status || 'scheduled',
      notes: row.notes || '',
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/* =========================================================================
 * 6. MEMBERSHIPS
 * ========================================================================= */

export async function fetchAllMemberships(): Promise<Membership[]> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      patient_id: row.patient_id,
      plan_name: row.plan_name || 'Care Access Plan',
      status: row.status || 'active',
      start_date: row.start_date,
      renewal_date: row.renewal_date,
      end_date: row.end_date,
      price_cents: row.price_cents || 0,
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/* =========================================================================
 * 7. PAYMENTS
 * ========================================================================= */

export async function fetchAllPayments(): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      patient_id: row.patient_id,
      amount_cents: row.amount_cents || 0,
      status: row.status || 'succeeded',
      stripe_payment_id: row.stripe_payment_id,
      description: row.description || 'Hospital Companion Escort',
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/* =========================================================================
 * 8. PAYOUTS
 * ========================================================================= */

export async function fetchAllPayouts(): Promise<Payout[]> {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      pal_id: row.pal_id,
      amount_cents: row.amount_cents || 0,
      status: row.status || 'paid',
      stripe_transfer_id: row.stripe_transfer_id,
      period_start: row.period_start,
      period_end: row.period_end,
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/* =========================================================================
 * 9. REVIEWS
 * ========================================================================= */

export async function fetchAllReviews(): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const pals = await fetchAllPals();
    const palsMap = new Map(pals.map((p) => [p.id, p.name]));

    return data.map((row: any) => ({
      id: row.id,
      visit_id: row.visit_id,
      match_id: row.match_id,
      pal_id: row.pal_id,
      patient_id: row.patient_id,
      rating: Number(row.rating) || 5,
      comment: row.comment || '',
      created_at: row.created_at || new Date().toISOString(),
      pal_name: palsMap.get(row.pal_id) || `Pal #${row.pal_id}`,
    }));
  } catch {
    return [];
  }
}

/* =========================================================================
 * 10. HOSPITAL INQUIRIES
 * ========================================================================= */

export async function submitHospitalInquiry(inquiry: {
  hospital_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  estimated_annual_dispatches?: number;
  notes?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('hospital_inquiries').insert({
      hospital_name: inquiry.hospital_name,
      contact_name: inquiry.contact_name,
      contact_email: inquiry.contact_email,
      contact_phone: inquiry.contact_phone || '',
      estimated_annual_dispatches: inquiry.estimated_annual_dispatches || 500,
      notes: inquiry.notes || '',
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Inquiry submission failed.' };
  }
}

export async function fetchHospitalInquiries(): Promise<HospitalInquiry[]> {
  try {
    const { data, error } = await supabase
      .from('hospital_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row: any) => ({
        id: row.id,
        hospital_name: row.hospital_name || 'Hospital',
        contact_name: row.contact_name || 'Contact',
        contact_email: row.contact_email || '',
        contact_phone: row.contact_phone || '',
        estimated_annual_dispatches: row.estimated_annual_dispatches || 0,
        notes: row.notes || '',
        status: row.status || 'new',
        created_at: row.created_at || new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
}

/* =========================================================================
 * 11. NOTIFICATIONS
 * ========================================================================= */

export async function fetchAllNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title || 'Notification',
        message: row.message || '',
        type: row.type || 'info',
        is_read: row.is_read ?? false,
        created_at: row.created_at || new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
}

/* =========================================================================
 * 12. ACTIVE LOCATION SESSIONS (RADAR)
 * ========================================================================= */

export async function fetchActiveLocationSessions(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('location_sessions')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false });

    if (!error && data) return data;
  } catch {}
  return [];
}

/* =========================================================================
 * 13. ADMIN AUTHENTICATION & ACCESS CONTROL (STRICT DB VERIFICATION)
 * ========================================================================= */

/**
 * Verifies if a given Supabase auth user UUID exists in `public.admin_users`
 * with `role = 'admin'` and `is_active = true`.
 */
export async function verifyAdminInDatabase(userId: string): Promise<{
  isAdmin: boolean;
  adminRecord: AdminUser | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { isAdmin: false, adminRecord: null, error: error.message };
    }

    if (!data) {
      return {
        isAdmin: false,
        adminRecord: null,
        error: 'Unauthorized: No administrator account record found for this user.',
      };
    }

    if (data.role !== 'admin' || !data.is_active) {
      return {
        isAdmin: false,
        adminRecord: null,
        error: 'Access denied: Admin account is inactive or lacks administrator privileges.',
      };
    }

    const adminUser: AdminUser = {
      id: data.id,
      email: data.email || '',
      name: data.name || data.full_name || 'Administrator',
      role: data.role,
      is_active: data.is_active,
      badgeNumber: data.badge_number || `ADM-${data.id.slice(0, 4).toUpperCase()}`,
      created_at: data.created_at,
    };

    return { isAdmin: true, adminRecord: adminUser, error: null };
  } catch (err: any) {
    return { isAdmin: false, adminRecord: null, error: err?.message || 'Database query error.' };
  }
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ data: { user: any; adminUser: AdminUser } | null; error: { message: string } | null }> {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        data: null,
        error: { message: 'Admin email and password are required.' },
      };
    }

    // 1. Authenticate with Supabase Auth
    const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (sbError) {
      return {
        data: null,
        error: { message: sbError.message || 'Invalid administrator login credentials.' },
      };
    }

    if (!sbData?.user) {
      return {
        data: null,
        error: { message: 'Supabase authentication failed: User not found.' },
      };
    }

    const user = sbData.user;

    // 2. Strict verification in public.admin_users table
    const verification = await verifyAdminInDatabase(user.id);

    if (!verification.isAdmin || !verification.adminRecord) {
      // Sign out immediately if not an authorized active admin
      await supabase.auth.signOut().catch(() => {});
      return {
        data: null,
        error: {
          message:
            verification.error ||
            'Access denied: You do not have verified administrator privileges in the database.',
        },
      };
    }

    return {
      data: {
        user,
        adminUser: verification.adminRecord,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: { message: err?.message || 'An error occurred during Admin authentication.' },
    };
  }
}

export async function validateAdminSession(): Promise<AdminUser | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await supabase.auth.signOut().catch(() => {});
      return null;
    }

    const verification = await verifyAdminInDatabase(user.id);
    if (!verification.isAdmin || !verification.adminRecord) {
      await supabase.auth.signOut().catch(() => {});
      return null;
    }

    return verification.adminRecord;
  } catch {
    return null;
  }
}

export async function signOutAdmin(): Promise<{ error: { message: string } | null }> {
  try {
    await supabase.auth.signOut().catch(() => {});
    return { error: null };
  } catch (err: any) {
    return { error: { message: err?.message || 'Error signing out administrator.' } };
  }
}
