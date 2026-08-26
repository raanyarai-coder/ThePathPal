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
import { Pal, PalApplication, PalEmailNotification } from '../types';

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
 * Existing `pals` columns:
 * - id: int4
 * - auth_user_id: uuid
 * - name: text
 * - phone: text
 * - bio: text
 * - availability: text
 * - background_check_status: text
 * - rating: numeric
 * - hourly_rate_cents: int4
 * - stripe_account_id: text
 * - created_at: timestamp
 * Note: `pals` does NOT have an `email` column.
 */
export function formatPalFromDb(row: any): Pal {
  if (!row) return null as any;
  const badgeNumber = `PAL-${String(row.id).padStart(4, '0')}`;
  return {
    id: row.id,
    auth_user_id: row.auth_user_id || undefined,
    name: row.name || 'PathPal Companion',
    phone: row.phone || '',
    bio: row.bio || 'Compassionate healthcare companion.',
    availability: row.availability || 'Weekdays & Weekends',
    background_check_status: row.background_check_status || 'cleared',
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 5.0,
    hourly_rate_cents: row.hourly_rate_cents || 2600,
    stripe_account_id: row.stripe_account_id || undefined,
    created_at: row.created_at || new Date().toISOString(),
    // UI helpers / computed values (not database columns)
    badgeNumber,
    isVerified: row.background_check_status === 'cleared' || Boolean(row.auth_user_id),
    account_status: row.auth_user_id ? 'active' : 'approved_pending_verification',
    email_verified: Boolean(row.auth_user_id),
    completedVisits: 0,
    languages: ['English', 'Spanish'],
    specialties: ['Hospital Escort', 'Patient Mobility Guidance'],
    hospitalAffiliations: ['Metro Health Medical Center'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  };
}

/**
 * Transforms raw database row from `pal_applications` table into application `PalApplication` object.
 * Existing `pal_applications` columns:
 * - id: uuid
 * - created_at: timestamptz
 * - name: text
 * - email: text
 * - phone: text
 * - languages: text
 * - status: text
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
    approved_at: row.approved_at,
  };
}

/* =========================================================================
 * 1. PAL APPLICATION SUBMISSION
 * ========================================================================= */

/**
 * Saves a new Pal companion application into `pal_applications` in Supabase.
 * Uses exact columns: `name`, `email`, `phone`, `languages`, `status: 'pending'`.
 */
export async function submitPalApplication(data: {
  name?: string;
  full_name?: string;
  email: string;
  phone: string;
  languages?: string;
  specialties?: string;
  bio?: string;
}): Promise<{ data: PalApplication | null; error: { message: string } | null }> {
  try {
    const applicantName = (data.name || data.full_name || '').trim();
    const applicantEmail = data.email.trim().toLowerCase();
    const applicantPhone = data.phone.trim();
    const applicantLanguages = (data.languages || 'English').trim();

    if (!applicantName || !applicantEmail) {
      return { data: null, error: { message: 'Name and email are required.' } };
    }

    const { data: dbData, error: dbError } = await supabase
      .from('pal_applications')
      .insert([
        {
          name: applicantName,
          email: applicantEmail,
          phone: applicantPhone,
          languages: applicantLanguages,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase pal_applications insert error:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code,
      });
      return { data: null, error: { message: dbError.message } };
    }

    const application = formatApplicationFromDb(dbData);
    return { data: application, error: null };
  } catch (err: any) {
    console.error('Error in submitPalApplication:', err);
    return { data: null, error: { message: err?.message || 'Error submitting application' } };
  }
}

/**
 * Fetches all Pal applications from Supabase `pal_applications` for Admin review.
 */
export async function fetchPalApplications(): Promise<PalApplication[]> {
  try {
    const { data, error } = await supabase
      .from('pal_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchPalApplications error:', error);
      return [];
    }

    if (data) {
      return data.map(formatApplicationFromDb);
    }
  } catch (err) {
    console.error('Exception in fetchPalApplications:', err);
  }
  return [];
}

/* =========================================================================
 * 2. ADMIN APPROVAL & PAL RECORD PREPARATION
 * ========================================================================= */

/**
 * Approves a Pal application:
 * 1. Updates `pal_applications` status to 'approved'.
 * 2. Checks and ensures a corresponding record exists in `pals` table (with name & phone).
 * 3. Returns the unique signup link.
 */
export async function approvePalApplication(
  applicationId: string,
  _adminNotes: string = 'Approved by Hospital Administrator'
): Promise<{ data: { application: PalApplication; signupLink: string } | null; error: { message: string } | null }> {
  try {
    // 1. Update in Supabase pal_applications table
    const { data: updatedAppDb, error: updateAppErr } = await supabase
      .from('pal_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateAppErr) {
      console.error('Failed to update pal_applications status in Supabase:', updateAppErr);
      return { data: null, error: { message: updateAppErr.message } };
    }

    const application = formatApplicationFromDb(updatedAppDb);

    // 2. Ensure a corresponding record exists in `pals` matching name and phone
    const { data: existingPal, error: palCheckErr } = await supabase
      .from('pals')
      .select('*')
      .eq('name', application.name)
      .eq('phone', application.phone)
      .maybeSingle();

    if (palCheckErr) {
      console.warn('Checking existing pal record error:', palCheckErr);
    }

    if (!existingPal) {
      // Insert with exact valid columns of the `pals` table
      const { data: newPal, error: insertPalErr } = await supabase
        .from('pals')
        .insert([
          {
            name: application.name,
            phone: application.phone,
            bio: 'Hospital Escort and Patient Companion Pal.',
            availability: 'Flexible (Weekdays & Weekends)',
            background_check_status: 'cleared',
            rating: 5.0,
            hourly_rate_cents: 2600,
          },
        ])
        .select()
        .maybeSingle();

      if (insertPalErr) {
        console.error('Supabase pals row creation error during approval:', insertPalErr);
      } else {
        console.log('Created corresponding pals record for approved applicant:', newPal);
      }
    }

    const signupLink = `${window.location.origin}/#pal-signup?app_id=${application.id}`;
    return { data: { application, signupLink }, error: null };
  } catch (err: any) {
    console.error('Failed to approve pal application:', err);
    return { data: null, error: { message: err?.message || 'Failed to approve application' } };
  }
}

/**
 * Retrieves an approved application by ID from `pal_applications`.
 * Validates that status is 'approved' before allowing signup.
 */
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
      console.error('Supabase getApprovedPalApplication error:', error);
      return { data: null, error: { message: error.message } };
    }

    if (!data) {
      return {
        data: null,
        error: {
          message: `Application ID "${applicationId}" was not found in pal_applications. Please contact hospital onboarding.`,
        },
      };
    }

    if (data.status !== 'approved') {
      return {
        data: null,
        error: {
          message: `Application is currently "${data.status}". You must wait for an administrator to approve your application before creating your Pal login account.`,
        },
      };
    }

    return { data: formatApplicationFromDb(data), error: null };
  } catch (err: any) {
    console.error('Error validating application:', err);
    return { data: null, error: { message: err?.message || 'Error validating application' } };
  }
}

/* =========================================================================
 * 3. PAL SIGNUP
 * ========================================================================= */

/**
 * Pal creates Supabase Auth user.
 * Explicitly checks the returned error and redirects to email verification.
 */
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
      console.error('Supabase Pal signUp error:', {
        message: error.message,
        status: (error as any).status,
      });
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error during Pal signup:', err);
    return {
      data: null,
      error: { message: err?.message || 'An unexpected error occurred during Pal signup.' },
    };
  }
}

/* =========================================================================
 * 4. EMAIL VERIFICATION & PALS RECORD UPDATE
 * ========================================================================= */

/**
 * Verifies email confirmation and links the authenticated user to their `pals` table row.
 * Flow:
 * 1. Uses authenticated user: `const { data: { user }, error } = await supabase.auth.getUser();`
 * 2. Confirms `user.email_confirmed_at` is populated.
 * 3. Retrieves approved application: `WHERE email = user.email AND status = 'approved'`.
 * 4. Locates existing Pal using `name` and `phone` (since `pals` has no `email` column):
 *    `WHERE name = application.name AND phone = application.phone`.
 * 5. Updates `pals` record: `UPDATE pals SET auth_user_id = user.id WHERE id = pal.id`.
 * 6. Logs diagnostic information.
 * 7. If no Pal record found, returns error and does NOT fall back to mock data.
 */
export async function verifyPalEmailAndActivate(): Promise<{
  data: {
    user: any;
    palRecord: Pal | null;
    emailNotification: PalEmailNotification;
  } | null;
  error: { message: string } | null;
}> {
  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Failed to get authenticated user during verification:', userError);
      return {
        data: null,
        error: {
          message:
            userError?.message ||
            'No active authentication session found. Please click the verification link in your email or log in.',
        },
      };
    }

    // 2. Confirm email verification
    if (!user.email_confirmed_at) {
      return {
        data: null,
        error: {
          message:
            'Your email address has not been confirmed yet. Please check your inbox and click the verification link sent by Supabase.',
        },
      };
    }

    // 3. Retrieve approved application by email
    const { data: application, error: applicationError } = await supabase
      .from('pal_applications')
      .select('*')
      .eq('email', user.email)
      .eq('status', 'approved')
      .maybeSingle();

    if (applicationError) {
      console.error('Error finding approved application for user:', applicationError);
    }

    const appName = application?.name || user.user_metadata?.full_name;
    const appPhone = application?.phone || user.user_metadata?.phone;

    // 4. Locate existing Pal record by name and phone
    const { data: pal, error: palLookupError } = await supabase
      .from('pals')
      .select('*')
      .eq('name', appName)
      .eq('phone', appPhone)
      .maybeSingle();

    if (palLookupError) {
      console.error('Error looking up existing Pal:', palLookupError);
    }

    let updatedPal: any = null;
    let updateError: any = null;

    if (pal) {
      // 5. Update pals.auth_user_id = user.id
      const res = await supabase
        .from('pals')
        .update({
          auth_user_id: user.id,
        })
        .eq('id', pal.id)
        .select()
        .single();

      updatedPal = res.data;
      updateError = res.error;
    }

    // 6. Log debugging info
    console.log('Auth user:', user.id);
    console.log('Application:', application);
    console.log('Existing Pal:', pal);
    console.log('Updated Pal:', updatedPal);
    if (updateError) {
      console.error('Pal update error:', updateError);
    }

    if (updateError) {
      return {
        data: null,
        error: { message: `Failed to update Pal profile: ${updateError.message}` },
      };
    }

    // 7. If no Pal record found in database
    if (!pal && !updatedPal) {
      console.warn('Pal profile missing on verification:', {
        authUserId: user.id,
        applicationId: application?.id,
        applicationName: application?.name || appName,
        applicationPhone: application?.phone || appPhone,
      });
      return {
        data: null,
        error: {
          message: 'Your Pal profile has not been created yet. Please contact the administrator.',
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
        'Your email has been successfully verified and your Pal account is now ready. You can log in using your registered email address and password.',
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
  } catch (err: any) {
    console.error('Verification & activation error:', err);
    return {
      data: null,
      error: { message: err?.message || 'Verification & activation failed.' },
    };
  }
}

/* =========================================================================
 * 5. PAL LOGIN & DASHBOARD DATA RETRIEVAL
 * ========================================================================= */

/**
 * Pal Login:
 * Authenticates user via Supabase Auth, then queries `pals` WHERE `auth_user_id = user.id`.
 * Does NOT query `pals.email`.
 * If no Pal record exists, returns `palRecord: null` (never falls back to Elena Rostova or SAMPLE_PALS).
 */
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
      console.error('Supabase loginPal error:', error);
      return { data: null, error: { message: error.message } };
    }

    if (!data.user) {
      return { data: null, error: { message: 'Login failed: User not returned.' } };
    }

    const authUserId = data.user.id;

    // Fetch corresponding Pal record from Supabase where auth_user_id = user.id
    let palRecord: Pal | null = await fetchPalByAuthUserId(authUserId);

    // If not yet linked, check if user's email is confirmed and link now via approved application
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
          const { data: linkedPal, error: linkErr } = await supabase
            .from('pals')
            .update({ auth_user_id: authUserId })
            .eq('id', existingPal.id)
            .select()
            .single();

          if (!linkErr && linkedPal) {
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
    console.error('Unexpected error during loginPal:', err);
    return {
      data: null,
      error: { message: err?.message || 'An unexpected error occurred during Pal login.' },
    };
  }
}

/**
 * Fetches Pal record from Supabase table where `auth_user_id = authUserId`.
 * Returns null if not found.
 */
export async function fetchPalByAuthUserId(authUserId: string): Promise<Pal | null> {
  try {
    const { data: palDb, error: palDbError } = await supabase
      .from('pals')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (palDbError) {
      console.error('Supabase fetchPalByAuthUserId error:', {
        message: palDbError.message,
        details: palDbError.details,
        code: palDbError.code,
      });
      return null;
    }

    if (palDb) {
      return formatPalFromDb(palDb);
    }
  } catch (e) {
    console.error('Exception fetching pal record from Supabase:', e);
  }
  return null;
}

/**
 * Fetches all registered pals directly from Supabase `pals` table.
 */
export async function fetchAllPals(): Promise<Pal[]> {
  try {
    const { data, error } = await supabase
      .from('pals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchAllPals error:', error);
      return [];
    }

    if (data) {
      return data.map(formatPalFromDb);
    }
  } catch (e) {
    console.error('Exception in fetchAllPals:', e);
  }
  return [];
}

/**
 * Signs out current Pal session.
 */
export async function signOutPal() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
  } catch (err: any) {
    return { error: { message: err?.message || 'Error signing out.' } };
  }
  return { error: null };
}

/**
 * Gets currently logged in Pal record if session exists.
 */
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
 * PATIENT FUNCTIONS
 * ========================================================================= */

/**
 * Signs up a new patient using Supabase Auth.
 */
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

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'An unexpected error occurred during signup.' } };
  }
}

/**
 * Logs in an existing patient using Supabase Auth.
 */
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
    return { data: null, error: { message: err?.message || 'An unexpected error occurred during login.' } };
  }
}

export async function signOutPatient() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
  } catch (err: any) {
    return { error: { message: err?.message || 'Error signing out.' } };
  }
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
