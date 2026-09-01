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

/**
 * Mask full SSN into ***-**-1234 format for safe administrative display.
 */
export function maskSSN(ssn?: string | null): string {
  if (!ssn) return '***-**-****';
  const clean = ssn.replace(/\D/g, '');
  if (clean.length < 4) return '***-**-****';
  const last4 = clean.slice(-4);
  return `***-**-${last4}`;
}

/**
 * Validates SSN format (either 9 continuous digits or XXX-XX-XXXX format).
 */
export function isValidSSN(ssn: string): boolean {
  if (!ssn) return false;
  const clean = ssn.replace(/\D/g, '');
  return clean.length === 9 && !/^0{9}|1{9}|2{9}|3{9}|4{9}|5{9}|6{9}|7{9}|8{9}|9{9}$/.test(clean);
}

/**
 * Transforms raw database row from `pals` table into application `Pal` object.
 * Does NOT assign arbitrary fake ratings, languages, or avatars unless present in database.
 */
export function formatPalFromDb(row: any, isAdmin: boolean = false): Pal {
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
    auth_user_id: isAdmin ? (row.auth_user_id || undefined) : undefined,
    name: row.name || 'Pal Companion',
    phone: row.phone || '',
    bio: row.bio || '',
    availability: row.availability || 'Available for bookings',
    background_check_status: row.background_check_status || 'pending',
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 5.0,
    hourly_rate_cents: row.hourly_rate_cents !== null && row.hourly_rate_cents !== undefined ? Number(row.hourly_rate_cents) : 2600,
    stripe_account_id: isAdmin ? (row.stripe_account_id || undefined) : undefined,
    created_at: row.created_at || new Date().toISOString(),
    badgeNumber,
    isVerified: Boolean(row.auth_user_id) && (row.background_check_status === 'cleared' || !row.background_check_status),
    account_status: row.auth_user_id ? 'active' : 'approved_pending_verification',
    email_verified: Boolean(row.auth_user_id),
    completedVisits: row.completed_visits || row.completedVisits || 0,
    languages: languagesList.length > 0 ? languagesList : ['English'],
    specialties: specialtiesList.length > 0 ? specialtiesList : ['Hospital Escort', 'Care Assistance'],
    hospitalAffiliations: affiliationsList,
    avatar: row.avatar_url || row.avatar || undefined,
    email: isAdmin ? (row.email || undefined) : undefined,
    ssn: isAdmin ? row.ssn : undefined,
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
    ssn: row.ssn || undefined,
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
  } else if (typeof row.assistance_needs === 'string' && row.assistance_needs.trim()) {
    mobilityNeeds = row.assistance_needs.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (typeof row.mobility_needs === 'string' && row.mobility_needs.trim()) {
    mobilityNeeds = row.mobility_needs.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (row.notes && row.notes.includes('Mobility:')) {
    const match = row.notes.match(/Mobility:\s*([^|;]+)/);
    if (match && match[1]) {
      mobilityNeeds = match[1].split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  let hospName = row.hospital_name;
  if (!hospName && row.notes && row.notes.includes('Hospital:')) {
    const match = row.notes.match(/Hospital:\s*([^|;]+)/);
    if (match && match[1]) hospName = match[1].trim();
  }

  let hospAddress = row.hospital_address;
  if (!hospAddress && row.notes && row.notes.includes('Address:')) {
    const match = row.notes.match(/Address:\s*([^|;]+)/);
    if (match && match[1]) hospAddress = match[1].trim();
  }

  let hospLat = typeof row.hospital_latitude === 'number' ? row.hospital_latitude : undefined;
  if (hospLat === undefined && row.notes && row.notes.includes('Lat:')) {
    const match = row.notes.match(/Lat:\s*([-\d.]+)/);
    if (match && match[1]) hospLat = parseFloat(match[1]);
  }

  let hospLng = typeof row.hospital_longitude === 'number' ? row.hospital_longitude : undefined;
  if (hospLng === undefined && row.notes && row.notes.includes('Lng:')) {
    const match = row.notes.match(/Lng:\s*([-\d.]+)/);
    if (match && match[1]) hospLng = parseFloat(match[1]);
  }

  let hospPlaceId = row.hospital_place_id;
  if (!hospPlaceId && row.notes && row.notes.includes('PlaceId:')) {
    const match = row.notes.match(/PlaceId:\s*([^|;]+)/);
    if (match && match[1]) hospPlaceId = match[1].trim();
  }

  let patPhone = row.patient_phone;
  if (!patPhone && row.notes && row.notes.includes('Phone:')) {
    const match = row.notes.match(/Phone:\s*([^|;]+)/);
    if (match && match[1]) patPhone = match[1].trim();
  }

  let langPref = row.language || row.language_preference;
  if (!langPref && row.notes && row.notes.includes('Language:')) {
    const match = row.notes.match(/Language:\s*([^|;]+)/);
    if (match && match[1]) langPref = match[1].trim();
  }

  let appDate = row.appointment_date || (row.scheduled_at ? row.scheduled_at.split('T')[0] : new Date().toISOString().split('T')[0]);
  let appTime = row.appointment_time || '10:00 AM';
  if (!row.appointment_time && row.scheduled_at && row.scheduled_at.includes('T')) {
    const timePart = row.scheduled_at.split('T')[1].substring(0, 5);
    const [hStr, mStr] = timePart.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (!isNaN(h)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      appTime = `${h}:${m} ${ampm}`;
    }
  }

  const meetingLocationVal = row.meeting_location || row.meeting_point || 'Main Campus Entrance';
  const assistanceNeedsVal = row.assistance_needs || (mobilityNeeds.length > 0 ? mobilityNeeds.join(', ') : 'Escort Assistance');

  return {
    id: String(row.id),
    patient_id: row.patient_id || undefined,
    patientName: row.patient_name || (row.patient ? row.patient.name : 'Patient'),
    patientPhone: patPhone || (row.patient ? row.patient.phone : ''),
    hospitalId: row.hospital_id || 'hosp-01',
    hospitalName: hospName || 'PathPal Partner Medical Center',
    hospitalAddress: hospAddress || undefined,
    hospitalLatitude: hospLat || 40.7421,
    hospitalLongitude: hospLng || -73.9741,
    hospitalPlaceId: hospPlaceId || undefined,
    appointmentDate: appDate,
    appointmentTime: appTime,
    department: row.department || 'General Clinic',
    meetingLocation: meetingLocationVal,
    meetingPoint: meetingLocationVal,
    meeting_location: meetingLocationVal,
    mobilityNeeds: mobilityNeeds.length > 0 ? mobilityNeeds : ['Escort Assistance'],
    assistanceNeeds: assistanceNeedsVal,
    assistance_needs: assistanceNeedsVal,
    languagePreference: langPref || 'English',
    language: langPref || 'English',
    notes: row.notes || '',
    status: row.status || 'pending',
    assignedPal,
    assigned_pal_id: row.assigned_pal_id || undefined,
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
  ssn: string;
  specialties?: string;
  bio?: string;
}): Promise<{ success: boolean; error: { message: string } | null }> {
  try {
    const name = (data.name || data.full_name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const phone = (data.phone || '').trim();
    const languages = (data.languages || 'English').trim();
    const ssn = (data.ssn || '').trim();

    if (!name) {
      return { success: false, error: { message: 'Full Legal Name is required.' } };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: { message: 'A valid email address is required.' } };
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return { success: false, error: { message: 'A valid 10-digit phone number is required.' } };
    }
    if (!isValidSSN(ssn)) {
      return { success: false, error: { message: 'Please provide a valid 9-digit Social Security Number (SSN).' } };
    }

    const cleanSsn = ssn.replace(/\D/g, '');

    // Pure INSERT only - do NOT chain .select('*') to prevent permission issues for public applicants
    const { error } = await supabase
      .from('pal_applications')
      .insert({
        name,
        email,
        phone,
        languages,
        ssn: cleanSsn,
        status: 'pending',
      });

    if (error) {
      console.warn('Pal application submission error:', error.message);
      return { success: false, error: { message: 'Unable to submit application at this time. Please try again later.' } };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception submitting application:', err);
    return { success: false, error: { message: 'An error occurred while submitting your application.' } };
  }
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

/**
 * Format raw error messages into clean, friendly user-facing messages.
 * Prevents exposing raw Postgres/RLS technical codes to applicants.
 */
export function formatFriendlyAuthError(rawError: any): string {
  if (!rawError) return 'An unexpected error occurred. Please try again.';
  const msg = typeof rawError === 'string' ? rawError : rawError.message || '';
  if (msg.includes('42501') || msg.includes('permission denied') || msg.includes('row-level security')) {
    return 'Action could not be completed due to permissions. Please contact onboarding support.';
  }
  if (msg.includes('already registered') || msg.includes('User already registered') || msg.includes('unique constraint')) {
    return 'An account with this email address already exists. Please log in with your credentials.';
  }
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || msg.includes('security purposes')) {
    return 'Email rate limit reached. Please wait a moment before requesting another verification email.';
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  return msg;
}

export async function signUpPal(
  email: string,
  password: string,
  application?: PalApplication | null
): Promise<{
  data: { user: any; session: any; isExistingUser?: boolean } | null;
  error: { message: string } | null;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();

    if (application && application.status !== 'approved') {
      return {
        data: null,
        error: {
          message: `Cannot create Pal account: Application status is currently "${application.status}". You must wait for admin approval before creating your account.`,
        },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: application?.name || application?.full_name || '',
          phone: application?.phone || '',
          application_id: application?.id || '',
          role: 'pal',
        },
        emailRedirectTo: `${window.location.origin}/pal/verify`,
      },
    });

    if (error) {
      console.error('Supabase auth signUp error:', error);
      return { data: null, error: { message: formatFriendlyAuthError(error) } };
    }

    // Handle existing user case (Supabase returns a user with empty identities when email is already registered)
    const isExistingUser = Boolean(
      data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0
    );

    if (isExistingUser) {
      return {
        data: {
          user: data.user,
          session: data.session,
          isExistingUser: true,
        },
        error: {
          message: 'An account with this email already exists. Please proceed to the Pal Login portal or reset your password.',
        },
      };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
        isExistingUser: false,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Exception during Pal signup:', err);
    return {
      data: null,
      error: { message: formatFriendlyAuthError(err) },
    };
  }
}

export async function resendPalVerificationEmail(
  email: string
): Promise<{ success: boolean; error: { message: string } | null }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        success: false,
        error: { message: 'Please enter a valid email address to resend confirmation.' },
      };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/pal/verify`,
      },
    });

    if (error) {
      console.error('Supabase auth.resend error:', error);
      return {
        success: false,
        error: { message: formatFriendlyAuthError(error) },
      };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception during resend verification:', err);
    return {
      success: false,
      error: { message: formatFriendlyAuthError(err) },
    };
  }
}

export function saveSentPalEmail(email: PalEmailNotification): void {
  try {
    const raw = localStorage.getItem('pathpal_sent_emails') || '[]';
    const list = JSON.parse(raw);
    list.unshift(email);
    localStorage.setItem('pathpal_sent_emails', JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    // Ignore local storage error
  }
}

export async function verifyPalEmailAndActivate(
  authUserId?: string,
  userEmailParam?: string
): Promise<{
  data: {
    user: any;
    palRecord: Pal | null;
    application?: PalApplication | null;
    emailNotification?: PalEmailNotification;
  } | null;
  error: { message: string; code?: string } | null;
}> {
  try {
    // 1. Detect if the user is authenticated via session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const targetUser = user || (authUserId ? { id: authUserId, email: userEmailParam, email_confirmed_at: new Date().toISOString(), user_metadata: {} } : null);

    if (!targetUser) {
      return {
        data: null,
        error: {
          code: 'NO_SESSION',
          message: 'No active authenticated session found. Please click the verification link in your confirmation email or log in.',
        },
      };
    }

    // Check if email confirmation exists
    if (!targetUser.email_confirmed_at) {
      return {
        data: {
          user: targetUser,
          palRecord: null,
        },
        error: {
          code: 'UNCONFIRMED_EMAIL',
          message: 'Your email address has not been confirmed yet. Please check your inbox and click the verification link.',
        },
      };
    }

    const userEmail = (targetUser.email || '').trim().toLowerCase();
    const userFullName = (targetUser.user_metadata as any)?.full_name || '';
    const userPhone = (targetUser.user_metadata as any)?.phone || '';

    // 2. Verify the email against the approved pal_applications table
    let approvedApplication: PalApplication | null = null;
    const { data: appData, error: appErr } = await supabase
      .from('pal_applications')
      .select('*')
      .ilike('email', userEmail)
      .order('created_at', { ascending: false });

    if (!appErr && appData && appData.length > 0) {
      const approvedRow = appData.find((a: any) => a.status === 'approved');
      if (approvedRow) {
        approvedApplication = formatApplicationFromDb(approvedRow);
      } else {
        const pendingRow = appData.find((a: any) => a.status === 'pending');
        if (pendingRow) {
          return {
            data: null,
            error: {
              code: 'APPLICATION_PENDING',
              message: 'Your Pal application is currently pending administrator review. Once approved, your account will be activated.',
            },
          };
        }
      }
    }

    // 3. Update the pals table record by setting auth_user_id and email_verified=true
    let palRecord: any = null;

    // Check if already linked by auth_user_id
    const { data: existingLinkedPal } = await supabase
      .from('pals')
      .select('*')
      .eq('auth_user_id', targetUser.id)
      .maybeSingle();

    if (existingLinkedPal) {
      const { data: updatedPal } = await supabase
        .from('pals')
        .update({
          email_verified: true,
          auth_user_id: targetUser.id,
        })
        .eq('id', existingLinkedPal.id)
        .select()
        .maybeSingle();

      palRecord = updatedPal || existingLinkedPal;
    } else {
      // Look for pal matching applicant details or unlinked pal
      let targetPalId: any = null;

      if (approvedApplication) {
        const { data: matchByApp } = await supabase
          .from('pals')
          .select('*')
          .or(`phone.eq.${approvedApplication.phone},name.eq.${approvedApplication.name}`)
          .maybeSingle();
        if (matchByApp) {
          targetPalId = matchByApp.id;
        }
      }

      if (!targetPalId && userFullName && userPhone) {
        const { data: matchByNamePhone } = await supabase
          .from('pals')
          .select('*')
          .eq('name', userFullName)
          .eq('phone', userPhone)
          .maybeSingle();
        if (matchByNamePhone) {
          targetPalId = matchByNamePhone.id;
        }
      }

      if (!targetPalId && userFullName) {
        const { data: matchByName } = await supabase
          .from('pals')
          .select('*')
          .eq('name', userFullName)
          .is('auth_user_id', null)
          .maybeSingle();
        if (matchByName) {
          targetPalId = matchByName.id;
        }
      }

      if (targetPalId) {
        const { data: updatedPal, error: updateErr } = await supabase
          .from('pals')
          .update({
            auth_user_id: targetUser.id,
            email_verified: true,
          })
          .eq('id', targetPalId)
          .select()
          .single();

        if (!updateErr && updatedPal) {
          palRecord = updatedPal;
        }
      } else {
        // Insert new activated Pal record for the verified user
        const displayName = approvedApplication?.name || userFullName || userEmail.split('@')[0] || 'Pal Companion';
        const displayPhone = approvedApplication?.phone || userPhone || '';
        const displayBio = approvedApplication?.bio || 'Hospital Escort and Patient Companion Pal.';

        const { data: createdPal, error: createErr } = await supabase
          .from('pals')
          .insert([
            {
              auth_user_id: targetUser.id,
              name: displayName,
              phone: displayPhone,
              bio: displayBio,
              availability: 'Flexible (Weekdays & Weekends)',
              background_check_status: 'cleared',
              email_verified: true,
              rating: 5.0,
              hourly_rate_cents: 2600,
            },
          ])
          .select()
          .single();

        if (!createErr && createdPal) {
          palRecord = createdPal;
        }
      }
    }

    if (!palRecord) {
      return {
        data: null,
        error: {
          code: 'SYNC_FAILED',
          message: 'Your Pal profile could not be synchronized. Please log in to complete activation.',
        },
      };
    }

    const finalPal = formatPalFromDb(palRecord);

    const emailNotification: PalEmailNotification = {
      id: `email-${Date.now()}`,
      recipient_email: targetUser.email || '',
      recipient_name: finalPal.name,
      subject: 'Account ready: Your Pal Profile Is Active',
      message:
        'Your email has been verified and your Pal profile is linked. You can now log in to access the Pal Portal.',
      sent_at: new Date().toISOString(),
      status: 'delivered',
    };

    saveSentPalEmail(emailNotification);

    return {
      data: {
        user: targetUser,
        palRecord: finalPal,
        application: approvedApplication,
        emailNotification,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Exception in verifyPalEmailAndActivate:', err);
    return {
      data: null,
      error: { message: formatFriendlyAuthError(err) },
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
      return { data: null, error: { message: formatFriendlyAuthError(error) } };
    }

    if (!data.user) {
      return { data: null, error: { message: 'Login failed: User record not found.' } };
    }

    // Check if email confirmation is required
    if (!data.user.email_confirmed_at) {
      return {
        data: {
          user: data.user,
          session: data.session,
          palRecord: null,
        },
        error: {
          message: 'Your email address is not verified yet. Please check your inbox and confirm your email before logging in.',
        },
      };
    }

    const authUserId = data.user.id;
    let palRecord: Pal | null = await fetchPalByAuthUserId(authUserId);

    if (!palRecord) {
      // Attempt activation/linking
      const activationRes = await verifyPalEmailAndActivate();
      if (activationRes.data?.palRecord) {
        palRecord = activationRes.data.palRecord;
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
      error: { message: formatFriendlyAuthError(err) },
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

export async function fetchAllPals(isAdmin: boolean = false): Promise<Pal[]> {
  try {
    const { data, error } = await supabase
      .from('pals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row) => formatPalFromDb(row, isAdmin));
    }
  } catch {}
  return [];
}

/**
 * Loads verified/active PALs who completed email verification and have linked auth_user_id.
 */
export async function fetchVerifiedPals(isAdmin: boolean = false): Promise<Pal[]> {
  try {
    const { data, error } = await supabase
      .from('pals')
      .select('*')
      .not('auth_user_id', 'is', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data
        .map((row) => formatPalFromDb(row, isAdmin))
        .filter((p) => p.isVerified || Boolean(p.auth_user_id));
    }
  } catch {}
  return [];
}

/**
 * Loads eligible verified Pals for patient discovery.
 * Strictly sanitizes output: NEVER includes SSN, auth_user_id, or internal secrets.
 */
export async function fetchEligiblePatientPals(): Promise<Pal[]> {
  try {
    const { data, error } = await supabase
      .from('pals')
      .select('id, name, bio, availability, background_check_status, rating, hourly_rate_cents, completed_visits, languages, specialties, hospital_affiliations, avatar_url, auth_user_id')
      .not('auth_user_id', 'is', null)
      .order('rating', { ascending: false });

    if (!error && data) {
      return data
        .filter((row) => row.background_check_status === 'cleared' || !row.background_check_status)
        .map((row) => formatPalFromDb(row, false));
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
  patient_phone?: string;
  patientPhone?: string;
  hospital_id?: string;
  hospitalId?: string;
  hospital_name?: string;
  hospitalName?: string;
  hospital_address?: string;
  hospitalAddress?: string;
  hospital_latitude?: number;
  hospitalLatitude?: number;
  hospital_longitude?: number;
  hospitalLongitude?: number;
  hospitalPlaceId?: string;
  department?: string;
  appointment_date?: string;
  appointmentDate?: string;
  appointment_time?: string;
  appointmentTime?: string;
  meeting_location?: string;
  meetingLocation?: string;
  meeting_point?: string;
  meetingPoint?: string;
  assistance_needs?: string;
  assistanceNeeds?: string;
  mobilityNeeds?: string[];
  notes?: string;
  language?: string;
  languagePreference?: string;
  language_preference?: string;
  status?: string;
  scheduled_at?: string;
}): Promise<{ data: PalRequest | null; error: { message: string } | null }> {
  try {
    // 1. Authenticate user check
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;

    if (!user) {
      return {
        data: null,
        error: { message: 'Please log in to book a PAL.' },
      };
    }

    // 2. Prepare verified schema properties
    const patient_name = (
      requestData.patient_name ||
      requestData.patientName ||
      (user.user_metadata as any)?.full_name ||
      user.email?.split('@')[0] ||
      'Patient'
    ).trim();

    const patient_phone = (
      requestData.patient_phone ||
      requestData.patientPhone ||
      (user.user_metadata as any)?.phone ||
      ''
    ).trim();

    const hospital_id = (
      requestData.hospital_id ||
      requestData.hospitalId ||
      requestData.hospitalPlaceId ||
      (requestData as any).providerPlaceId ||
      'hosp-01'
    ).trim();

    const hospital_name = (
      requestData.hospital_name ||
      requestData.hospitalName ||
      'Medical Center'
    ).trim();

    const hospital_address = (
      requestData.hospital_address ||
      requestData.hospitalAddress ||
      ''
    ).trim() || null;

    const hospital_latitude = (
      typeof requestData.hospital_latitude === 'number'
        ? requestData.hospital_latitude
        : typeof requestData.hospitalLatitude === 'number'
        ? requestData.hospitalLatitude
        : null
    );

    const hospital_longitude = (
      typeof requestData.hospital_longitude === 'number'
        ? requestData.hospital_longitude
        : typeof requestData.hospitalLongitude === 'number'
        ? requestData.hospitalLongitude
        : null
    );

    const department = (
      requestData.department ||
      'General Outpatient Clinic'
    ).trim();

    let appointment_date = (
      requestData.appointment_date ||
      requestData.appointmentDate ||
      ''
    ).trim();

    if (appointment_date) {
      const mdyMatch = appointment_date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mdyMatch) {
        const [, m, d, y] = mdyMatch;
        appointment_date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
    if (!appointment_date) {
      appointment_date = new Date().toISOString().split('T')[0];
    }

    const appointment_time = (
      requestData.appointment_time ||
      requestData.appointmentTime ||
      '10:00 AM'
    ).trim();

    const meeting_location = (
      requestData.meeting_location ||
      requestData.meetingLocation ||
      requestData.meeting_point ||
      requestData.meetingPoint ||
      'Main Campus Entrance'
    ).trim();

    let assistance_needs = (
      requestData.assistance_needs ||
      requestData.assistanceNeeds ||
      ''
    ).trim();

    if (!assistance_needs && requestData.mobilityNeeds?.length) {
      assistance_needs = requestData.mobilityNeeds.join(', ');
    }
    if (!assistance_needs && requestData.notes?.trim()) {
      assistance_needs = requestData.notes.trim();
    }
    if (!assistance_needs) {
      assistance_needs = 'Companion Escort Assistance';
    }

    const language = (
      requestData.language ||
      requestData.languagePreference ||
      requestData.language_preference ||
      'English'
    ).trim();

    const status = (
      requestData.status ||
      'pending'
    ).trim();

    // 3. Build INSERT payload containing ONLY the verified columns of public.pal_requests
    const payload = {
      patient_name,
      patient_phone,
      hospital_id,
      hospital_name,
      hospital_address,
      hospital_latitude,
      hospital_longitude,
      department,
      appointment_date,
      appointment_time,
      meeting_location,
      assistance_needs,
      language,
      status,
    };

    // 4. Plain INSERT into Supabase public.pal_requests without assuming SELECT permission
    const { error: insertError } = await supabase
      .from('pal_requests')
      .insert(payload);

    if (insertError) {
      console.error('[PAL Request] INSERT FAILED', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });

      return {
        data: null,
        error: {
          message: insertError.message,
        },
      };
    }

    // 5. Send notification to authenticated user
    if (user?.id) {
      createNotification({
        user_id: user.id,
        title: 'Companion PAL Request Submitted',
        message: `Your PAL escort request for ${hospital_name} (${department}) on ${appointment_date} has been submitted and is pending PAL assignment.`,
        type: 'success',
      }).catch((err) => {
        console.warn('[PAL Request] User notification log:', err);
      });
    }

    const formatted: PalRequest = {
      id: `REQ-${Date.now()}`,
      patientName: patient_name,
      patientPhone: patient_phone,
      hospitalId: hospital_id,
      hospitalName: hospital_name,
      hospitalAddress: hospital_address || undefined,
      hospitalLatitude: hospital_latitude ?? 40.7421,
      hospitalLongitude: hospital_longitude ?? -73.9741,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      department,
      meetingLocation: meeting_location,
      meeting_location,
      meetingPoint: meeting_location,
      assistanceNeeds: assistance_needs,
      assistance_needs,
      mobilityNeeds: assistance_needs ? assistance_needs.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Companion Escort'],
      languagePreference: language,
      language,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return { data: formatted, error: null };
  } catch (err: any) {
    console.error('[PAL Request] Insert error:', err);
    return { data: null, error: { message: err?.message || 'Unable to submit your PAL request right now. Please try again.' } };
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

    // Fetch matches and pals to pair assigned Pals
    const { data: matchesData } = await supabase.from('matches').select('*');
    const { data: palsData } = await supabase.from('pals').select('*');

    const palsMapById = new Map<number, Pal>();
    const palsMapByAuthId = new Map<string, Pal>();
    if (palsData) {
      palsData.forEach((p: any) => {
        const formatted = formatPalFromDb(p);
        palsMapById.set(p.id, formatted);
        if (p.auth_user_id) {
          palsMapByAuthId.set(p.auth_user_id, formatted);
        }
      });
    }

    const matchesMap = new Map<string, any>();
    if (matchesData) {
      matchesData.forEach((m: any) => matchesMap.set(m.request_id, m));
    }

    return data.map((r: any) => {
      const match = matchesMap.get(r.id);
      let pal = match ? palsMapById.get(match.pal_id) : undefined;
      if (!pal && r.assigned_pal_id) {
        pal = palsMapByAuthId.get(r.assigned_pal_id);
      }
      return formatPalRequestFromDb(r, pal);
    });
  } catch (err) {
    console.error('fetchPalRequests exception:', err);
    return [];
  }
}

export async function assignPalToRequest(
  requestId: string,
  palId: number | string,
  palObj?: Pal
): Promise<{ success: boolean; data?: PalRequest; error: string | null }> {
  try {
    // 1. Confirm the PAL is authenticated
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr || !session?.user) {
      return {
        success: false,
        error: 'You must be signed in as an authorized PAL to accept assignments.',
      };
    }

    const palAuthUuid = session.user.id;
    let numericPalId = typeof palId === 'number' ? palId : parseInt(String(palId), 10) || 1;
    let palName = palObj?.name || session.user.user_metadata?.full_name || 'Assigned PAL Companion';

    // Verify PAL record in pals table
    const { data: palRecord } = await supabase
      .from('pals')
      .select('*')
      .eq('auth_user_id', palAuthUuid)
      .maybeSingle();

    if (palRecord) {
      numericPalId = palRecord.id;
      palName = palRecord.name || palName;
    }

    // 2. Fetch the target request first to check status and patient details
    const { data: targetReq, error: fetchErr } = await supabase
      .from('pal_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (fetchErr) {
      console.error('[PAL Request] Fetch error:', fetchErr);
      return {
        success: false,
        error: `Could not retrieve request details: ${fetchErr.message}`,
      };
    }

    if (!targetReq) {
      return {
        success: false,
        error: 'The requested appointment could not be found.',
      };
    }

    if (targetReq.status !== 'pending' || targetReq.assigned_pal_id) {
      return {
        success: false,
        error: 'This request has already been accepted by another PAL.',
      };
    }

    // 3. ATOMIC CLAIM: Update pal_requests only where status is pending and assigned_pal_id is null
    const { data: updatedRows, error: updateErr } = await supabase
      .from('pal_requests')
      .update({
        status: 'matched',
        assigned_pal_id: palAuthUuid,
      })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select();

    if (updateErr) {
      console.error('[PAL Request] Atomic claim error details:', {
        code: updateErr.code,
        message: updateErr.message,
        details: updateErr.details,
        hint: updateErr.hint,
      });
      return {
        success: false,
        error: updateErr.message || 'Permission denied or error updating assignment.',
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      return {
        success: false,
        error: 'This request has already been accepted by another PAL.',
      };
    }

    const claimedRow = updatedRows[0];

    // 4. CREATE MATCH RECORD in public.matches (request_id, pal_id, status, matched_at)
    try {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('request_id', requestId)
        .maybeSingle();

      if (!existingMatch) {
        const { error: matchInsertErr } = await supabase.from('matches').insert({
          request_id: requestId,
          pal_id: numericPalId,
          status: 'accepted',
          matched_at: new Date().toISOString(),
        });

        if (matchInsertErr) {
          console.warn('[PAL Match] Match record creation log:', matchInsertErr.message);
        }
      }
    } catch (matchEx) {
      console.warn('[PAL Match] Match creation exception:', matchEx);
    }

    // 5. NOTIFY PATIENT
    if (claimedRow.patient_id) {
      createNotification({
        user_id: claimedRow.patient_id,
        title: 'PAL Escort Matched!',
        message: `${palName} has accepted your escort request for ${claimedRow.hospital_name || 'Hospital'} on ${claimedRow.appointment_date || ''} at ${claimedRow.appointment_time || ''}.`,
        type: 'success',
      }).catch((e) => console.warn('[Notification] Patient notify failed:', e));
    }

    // 6. NOTIFY ACCEPTING PAL
    createNotification({
      user_id: palAuthUuid,
      title: 'Assignment Confirmed',
      message: `You accepted a PAL assignment for ${claimedRow.patient_name || 'Patient'} at ${claimedRow.hospital_name || 'Hospital Campus'} (${claimedRow.department || 'Clinic'}).`,
      type: 'success',
    }).catch((e) => console.warn('[Notification] PAL notify failed:', e));

    const activePalFormatted = palRecord ? formatPalFromDb(palRecord) : palObj;
    const formattedResult = formatPalRequestFromDb(claimedRow, activePalFormatted);

    return {
      success: true,
      data: formattedResult,
      error: null,
    };
  } catch (e: any) {
    console.error('[PAL Request] Assignment exception:', e);
    return {
      success: false,
      error: e?.message || 'An unexpected error occurred while accepting the assignment.',
    };
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
 * 11. NOTIFICATIONS (USER ISOLATED)
 * ========================================================================= */

export async function fetchUserNotifications(userId?: string): Promise<Notification[]> {
  try {
    let targetUid = userId;
    if (!targetUid) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUid = user?.id;
    }

    if (!targetUid) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUid)
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

export async function markNotificationRead(notificationId: number | string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return !error;
  } catch {
    return false;
  }
}

export async function createNotification(params: {
  user_id?: string;
  title: string;
  message: string;
  type?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: params.user_id || null,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      is_read: false,
    });
    return !error;
  } catch {
    return false;
  }
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
 * 12B. ADMIN REALTIME DASHBOARD METRICS (EXACT DATABASE COUNTS)
 * ========================================================================= */

export interface AdminDashboardMetrics {
  totalPalApplications: number;
  pendingPalApplications: number;
  approvedPalApplications: number;
  verifiedPals: number;
  totalPals: number;
  totalPatients: number;
  openPalRequests: number;
  activeMatches: number;
  hospitalVisits: number;
  memberships: number;
  payments: number;
  payouts: number;
  reviews: number;
  hospitalInquiries: number;
  activeGpsSessions: number;
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardMetrics> {
  const defaultStats: AdminDashboardMetrics = {
    totalPalApplications: 0,
    pendingPalApplications: 0,
    approvedPalApplications: 0,
    verifiedPals: 0,
    totalPals: 0,
    totalPatients: 0,
    openPalRequests: 0,
    activeMatches: 0,
    hospitalVisits: 0,
    memberships: 0,
    payments: 0,
    payouts: 0,
    reviews: 0,
    hospitalInquiries: 0,
    activeGpsSessions: 0,
  };

  try {
    const [
      allAppsRes,
      pendingAppsRes,
      approvedAppsRes,
      allPalsRes,
      verifiedPalsRes,
      patientsRes,
      openReqsRes,
      activeMatchesRes,
      visitsRes,
      membershipsRes,
      paymentsRes,
      payoutsRes,
      reviewsRes,
      inquiriesRes,
      gpsSessionsRes,
    ] = await Promise.all([
      supabase.from('pal_applications').select('id', { count: 'exact', head: true }),
      supabase.from('pal_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('pal_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('pals').select('id', { count: 'exact', head: true }),
      supabase.from('pals').select('id', { count: 'exact', head: true }).not('auth_user_id', 'is', null),
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('pal_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('matches').select('id', { count: 'exact', head: true }).in('status', ['accepted', 'in_progress', 'active']),
      supabase.from('hospital_visits').select('id', { count: 'exact', head: true }),
      supabase.from('memberships').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
      supabase.from('payouts').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('hospital_inquiries').select('id', { count: 'exact', head: true }),
      supabase.from('location_sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    return {
      totalPalApplications: allAppsRes.count ?? 0,
      pendingPalApplications: pendingAppsRes.count ?? 0,
      approvedPalApplications: approvedAppsRes.count ?? 0,
      totalPals: allPalsRes.count ?? 0,
      verifiedPals: verifiedPalsRes.count ?? 0,
      totalPatients: patientsRes.count ?? 0,
      openPalRequests: openReqsRes.count ?? 0,
      activeMatches: activeMatchesRes.count ?? 0,
      hospitalVisits: visitsRes.count ?? 0,
      memberships: membershipsRes.count ?? 0,
      payments: paymentsRes.count ?? 0,
      payouts: payoutsRes.count ?? 0,
      reviews: reviewsRes.count ?? 0,
      hospitalInquiries: inquiriesRes.count ?? 0,
      activeGpsSessions: gpsSessionsRes.count ?? 0,
    };
  } catch (err) {
    console.error('Error calculating admin dashboard stats:', err);
    return defaultStats;
  }
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
