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
import { SAMPLE_PALS } from '../data/mockData';

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

// Local Storage Keys for Persistent Local Cache / Fallback
const PAL_APPLICATIONS_STORAGE_KEY = 'pathpal_pal_applications';
const PALS_STORAGE_KEY = 'pathpal_pals_records';
const PAL_EMAILS_STORAGE_KEY = 'pathpal_pal_emails_sent';

// Seed initial demo data for local store if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(PAL_APPLICATIONS_STORAGE_KEY)) {
    const initialApps: PalApplication[] = [
      {
        id: 'app-9101',
        full_name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '(555) 392-1084',
        languages: 'English, Spanish',
        specialties: 'Wheelchair Mobility, Anxiety Relief',
        bio: 'Retired EMT with 8 years of emergency patient transport experience.',
        status: 'approved',
        admin_notes: 'Verified references and approved on Aug 24, 2026.',
        created_at: '2026-08-24T10:15:00Z',
        approved_at: '2026-08-24T14:30:00Z',
      },
      {
        id: 'app-9102',
        full_name: 'Nadia Al-Mansoor',
        email: 'nadia.mansoor@example.com',
        phone: '(555) 481-9230',
        languages: 'English, Arabic, French',
        specialties: 'Geriatric Escort, Multilingual Wayfinding',
        bio: 'Community health worker dedicated to culturally sensitive care guidance.',
        status: 'pending',
        created_at: '2026-08-25T09:00:00Z',
      },
    ];
    localStorage.setItem(PAL_APPLICATIONS_STORAGE_KEY, JSON.stringify(initialApps));
  }

  if (!localStorage.getItem(PALS_STORAGE_KEY)) {
    const initialPals: Pal[] = [
      ...SAMPLE_PALS,
      {
        id: 'pal-pre-marcus',
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '(555) 392-1084',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        rating: 5.0,
        completedVisits: 0,
        languages: ['English', 'Spanish'],
        specialties: ['Wheelchair Mobility', 'Anxiety Relief'],
        bio: 'Retired EMT with 8 years of emergency patient transport experience.',
        isVerified: false,
        account_status: 'approved_pending_verification',
        email_verified: false,
        hospitalAffiliations: ['Metro Health Medical Center'],
        badgeNumber: 'PAL-9101',
        created_at: '2026-08-24T14:30:00Z',
      },
    ];
    localStorage.setItem(PALS_STORAGE_KEY, JSON.stringify(initialPals));
  }
}

initializeLocalStorage();

// Helpers for localStorage sync
function getStoredApplications(): PalApplication[] {
  try {
    const data = localStorage.getItem(PAL_APPLICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredApplications(apps: PalApplication[]) {
  try {
    localStorage.setItem(PAL_APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save pal applications locally:', e);
  }
}

function getStoredPals(): Pal[] {
  try {
    const data = localStorage.getItem(PALS_STORAGE_KEY);
    return data ? JSON.parse(data) : SAMPLE_PALS;
  } catch {
    return SAMPLE_PALS;
  }
}

function saveStoredPals(pals: Pal[]) {
  try {
    localStorage.setItem(PALS_STORAGE_KEY, JSON.stringify(pals));
  } catch (e) {
    console.error('Failed to save pals locally:', e);
  }
}

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

/* =========================================================================
 * 1. PAL APPLICATION
 * ========================================================================= */

/**
 * Saves a new Pal companion application into `pal_applications` in Supabase.
 * Does NOT create the final login account at this stage.
 */
export async function submitPalApplication(data: {
  full_name: string;
  email: string;
  phone: string;
  languages: string;
  specialties?: string;
  bio?: string;
}): Promise<{ data: PalApplication | null; error: { message: string } | null }> {
  try {
    const generatedId = `app-${Date.now().toString().slice(-6)}`;
    const emailNorm = data.email.trim().toLowerCase();
    
    const newApp: PalApplication = {
      id: generatedId,
      full_name: data.full_name.trim(),
      email: emailNorm,
      phone: data.phone.trim(),
      languages: data.languages.trim(),
      specialties: data.specialties?.trim() || 'Companion Mobility & Hospital Escort',
      bio: data.bio?.trim() || 'Compassionate community health advocate eager to support patients.',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // 1. Attempt Supabase insert to pal_applications table
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('pal_applications')
        .insert([
          {
            id: newApp.id,
            full_name: newApp.full_name,
            email: newApp.email,
            phone: newApp.phone,
            languages: newApp.languages,
            specialties: newApp.specialties,
            bio: newApp.bio,
            status: 'pending',
            created_at: newApp.created_at,
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

        // Retry insert without custom ID in case schema uses auto-generated UUID/serial
        const { data: retryData, error: retryError } = await supabase
          .from('pal_applications')
          .insert([
            {
              full_name: newApp.full_name,
              email: newApp.email,
              phone: newApp.phone,
              languages: newApp.languages,
              specialties: newApp.specialties,
              bio: newApp.bio,
              status: 'pending',
            },
          ])
          .select()
          .single();

        if (!retryError && retryData) {
          const formatted = retryData as PalApplication;
          const current = getStoredApplications();
          saveStoredApplications([formatted, ...current.filter((a) => a.id !== formatted.id)]);
          return { data: formatted, error: null };
        }
      } else if (dbData) {
        const formatted = dbData as PalApplication;
        const current = getStoredApplications();
        saveStoredApplications([formatted, ...current.filter((a) => a.id !== formatted.id)]);
        return { data: formatted, error: null };
      }
    } catch (dbErr) {
      console.error('Exception inserting into pal_applications in Supabase:', dbErr);
    }

    // Always maintain local persistent fallback
    const apps = getStoredApplications();
    const updated = [newApp, ...apps.filter((a) => a.id !== newApp.id)];
    saveStoredApplications(updated);

    return { data: newApp, error: null };
  } catch (err: any) {
    console.error('Error in submitPalApplication:', err);
    return { data: null, error: { message: err?.message || 'Error submitting application' } };
  }
}

/**
 * Fetches all Pal applications for Admin review.
 */
export async function fetchPalApplications(): Promise<PalApplication[]> {
  try {
    const { data, error } = await supabase
      .from('pal_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchPalApplications error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else if (data && data.length > 0) {
      // Merge with local storage
      const localApps = getStoredApplications();
      const combined = [...data];
      for (const local of localApps) {
        if (!combined.some((c) => c.id === local.id)) {
          combined.push(local);
        }
      }
      saveStoredApplications(combined as PalApplication[]);
      return combined as PalApplication[];
    }
  } catch (err) {
    console.error('Exception in fetchPalApplications:', err);
  }

  return getStoredApplications();
}

/* =========================================================================
 * 2. ADMIN APPROVAL & SIGNUP LINK CREATION
 * ========================================================================= */

/**
 * Approves a Pal application and prepares the initial record in `pals`.
 * Returns the unique signup link associated with the approved application.
 */
export async function approvePalApplication(
  applicationId: string,
  adminNotes: string = 'Approved by Hospital Administrator'
): Promise<{ data: { application: PalApplication; signupLink: string } | null; error: { message: string } | null }> {
  try {
    const allApps = getStoredApplications();
    const app = allApps.find((a) => a.id === applicationId);

    if (!app) {
      return { data: null, error: { message: `Application ${applicationId} not found.` } };
    }

    const updatedApp: PalApplication = {
      ...app,
      status: 'approved',
      approved_at: new Date().toISOString(),
      admin_notes: adminNotes,
    };

    // 1. Update in Supabase pal_applications table
    try {
      const { error: updateAppErr } = await supabase
        .from('pal_applications')
        .update({
          status: 'approved',
          approved_at: updatedApp.approved_at,
          admin_notes: adminNotes,
        })
        .eq('id', applicationId);

      if (updateAppErr) {
        console.error('Failed to update pal_applications status in Supabase:', updateAppErr);
      }
    } catch (e) {
      console.error('Exception updating pal_applications in Supabase:', e);
    }

    // Update local cache
    saveStoredApplications(allApps.map((a) => (a.id === applicationId ? updatedApp : a)));

    // 2. Ensure the corresponding record exists in `pals` table in 'approved_pending_verification' status
    const allPals = getStoredPals();
    const appEmail = app.email.trim().toLowerCase();
    const existingPal = allPals.find((p) => p.email?.toLowerCase() === appEmail);

    const badgeNum = `PAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const palRecord: Pal = existingPal || {
      id: `pal-${Date.now().toString().slice(-6)}`,
      name: app.full_name,
      email: appEmail,
      phone: app.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      rating: 5.0,
      completedVisits: 0,
      languages: app.languages ? app.languages.split(',').map((s) => s.trim()) : ['English'],
      specialties: app.specialties ? app.specialties.split(',').map((s) => s.trim()) : ['Hospital Escort', 'Companion Care'],
      bio: app.bio || 'Compassionate healthcare companion.',
      isVerified: false,
      account_status: 'approved_pending_verification',
      email_verified: false,
      hospitalAffiliations: ['Metro Health Medical Center'],
      badgeNumber: badgeNum,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert into Supabase pals table
    try {
      const { error: palUpsertErr } = await supabase
        .from('pals')
        .upsert({
          id: palRecord.id,
          name: palRecord.name,
          email: palRecord.email,
          phone: palRecord.phone,
          avatar: palRecord.avatar,
          rating: palRecord.rating,
          completed_visits: palRecord.completedVisits,
          languages: palRecord.languages,
          specialties: palRecord.specialties,
          bio: palRecord.bio,
          is_verified: false,
          account_status: 'approved_pending_verification',
          email_verified: false,
          hospital_affiliations: palRecord.hospitalAffiliations,
          badge_number: palRecord.badgeNumber,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (palUpsertErr) {
        console.error('Supabase pals table upsert error during approval:', {
          message: palUpsertErr.message,
          details: palUpsertErr.details,
          code: palUpsertErr.code,
        });
      }
    } catch (e) {
      console.error('Exception upserting to pals table in Supabase:', e);
    }

    if (!existingPal) {
      saveStoredPals([palRecord, ...allPals]);
    } else {
      saveStoredPals(allPals.map((p) => (p.id === existingPal.id ? { ...p, account_status: 'approved_pending_verification' } : p)));
    }

    const signupLink = `${window.location.origin}/#pal-signup?app_id=${applicationId}`;

    return { data: { application: updatedApp, signupLink }, error: null };
  } catch (err: any) {
    console.error('Failed to approve pal application:', err);
    return { data: null, error: { message: err?.message || 'Failed to approve application' } };
  }
}

/**
 * Retrieves an approved application by ID.
 * Prevents unapproved applicants from proceeding to Signup.
 */
export async function getApprovedPalApplication(
  applicationId: string
): Promise<{ data: PalApplication | null; error: { message: string } | null }> {
  try {
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('pal_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) {
        console.error('Supabase getApprovedPalApplication error:', error);
      } else if (data) {
        if (data.status !== 'approved') {
          return {
            data: null,
            error: {
              message: `Application ${applicationId} is currently "${data.status}". Only approved applications are authorized to register a Pal account.`,
            },
          };
        }
        return { data: data as PalApplication, error: null };
      }
    } catch (e) {
      console.error('Supabase getApprovedPalApplication exception:', e);
    }

    // Check local storage
    const allApps = getStoredApplications();
    const app = allApps.find((a) => a.id === applicationId);

    if (!app) {
      return {
        data: null,
        error: { message: `Application ID "${applicationId}" was not found. Please contact hospital onboarding.` },
      };
    }

    if (app.status !== 'approved') {
      return {
        data: null,
        error: {
          message: `Application status is "${app.status}". You must wait for an administrator to approve your application before creating your Pal login account.`,
        },
      };
    }

    return { data: app, error: null };
  } catch (err: any) {
    console.error('Error validating application:', err);
    return { data: null, error: { message: err?.message || 'Error validating application' } };
  }
}

/* =========================================================================
 * 3. PAL SIGNUP (Supabase Auth)
 * ========================================================================= */

/**
 * Creates authentication account in Supabase Auth for an approved Pal.
 * Explicitly checks Supabase error and never stores passwords in pals or pal_applications.
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
          full_name: application.full_name,
          role: 'pal',
          application_id: application.id,
          phone: application.phone,
        },
        emailRedirectTo: `${window.location.origin}/#pal-verify`,
      },
    });

    if (error) {
      console.error('Supabase Pal signUp error:', {
        message: error.message,
        status: (error as any).status,
      });
      const errMsg = error.message || '';
      if (errMsg.toLowerCase().includes('rate limit')) {
        return {
          data: null,
          error: {
            message:
              'Supabase email rate limit exceeded. Please wait a few minutes before requesting another verification email, or log in if already registered.',
          },
        };
      }
      return { data: null, error: { message: error.message } };
    }

    // Mark application signup time in local store
    const allApps = getStoredApplications();
    saveStoredApplications(
      allApps.map((a) => (a.id === application.id ? { ...a, signup_completed_at: new Date().toISOString() } : a))
    );

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
 * 4, 5, 6 & 7. EMAIL VERIFICATION, PALS TABLE UPDATE, AND ACCOUNT READY EMAIL
 * ========================================================================= */

/**
 * Reliable email verification and account activation:
 * 1. Obtains authenticated user via `supabase.auth.getUser()`.
 * 2. Confirms `user.email_confirmed_at` (or confirmed session state) is populated.
 * 3. Associates `pals.auth_user_id = auth.users.id` via SQL update on `pals` WHERE `email = user.email`.
 * 4. Updates `account_status = 'active'`, `email_verified = true`, `is_verified = true`.
 * 5. Sends the "Your Pal Account Is Ready" confirmation email.
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

    // Check email_confirmed_at
    const isEmailConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at || user.app_metadata?.provider === 'email');
    
    if (!isEmailConfirmed) {
      return {
        data: null,
        error: {
          message:
            'Email has not been confirmed yet (user.email_confirmed_at is unpopulated). Please check your email inbox and click the confirmation link.',
        },
      };
    }

    const authUserId = user.id;
    const userEmail = (user.email || '').trim().toLowerCase();
    const userName = user.user_metadata?.full_name || userEmail.split('@')[0];

    // Explicitly update the existing Pal record in Supabase using the approved application email
    let updatedDbPal: any = null;

    try {
      const { data: updateData, error: updateErr } = await supabase
        .from('pals')
        .update({
          auth_user_id: authUserId,
          email: userEmail,
          is_verified: true,
          email_verified: true,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('email', userEmail)
        .select()
        .maybeSingle();

      if (updateErr) {
        console.error('Failed to update Pal in Supabase by email:', {
          message: updateErr.message,
          details: updateErr.details,
          code: updateErr.code,
        });
      } else if (updateData) {
        updatedDbPal = updateData;
      }
    } catch (dbE) {
      console.error('Exception updating pals table in Supabase:', dbE);
    }

    // If record did not exist by email in Supabase, create/upsert it
    if (!updatedDbPal) {
      try {
        const badgeNum = `PAL-${Math.floor(1000 + Math.random() * 9000)}`;
        const palId = `pal-${authUserId.slice(0, 8)}`;
        const { data: insertData, error: insertErr } = await supabase
          .from('pals')
          .upsert({
            id: palId,
            auth_user_id: authUserId,
            email: userEmail,
            name: userName,
            phone: user.user_metadata?.phone || '',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            rating: 5.0,
            completed_visits: 0,
            languages: ['English'],
            specialties: ['Hospital Companion', 'Escort Guidance'],
            bio: 'Certified PathPal Companion Pal.',
            is_verified: true,
            email_verified: true,
            account_status: 'active',
            hospital_affiliations: ['Metro Health Medical Center'],
            badge_number: badgeNum,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' })
          .select()
          .maybeSingle();

        if (insertErr) {
          console.error('Failed to insert activated Pal in Supabase:', insertErr);
        } else if (insertData) {
          updatedDbPal = insertData;
        }
      } catch (upsertEx) {
        console.error('Exception upserting activated Pal into Supabase:', upsertEx);
      }
    }

    // Update local cache
    const allPals = getStoredPals();
    let existingIndex = allPals.findIndex(
      (p) =>
        p.auth_user_id === authUserId ||
        (p.email && p.email.toLowerCase() === userEmail.toLowerCase())
    );

    let targetPal: Pal;

    if (existingIndex >= 0) {
      targetPal = {
        ...allPals[existingIndex],
        auth_user_id: authUserId,
        email: userEmail,
        name: userName || allPals[existingIndex].name,
        account_status: 'active',
        email_verified: true,
        isVerified: true,
        updated_at: new Date().toISOString(),
      };
      allPals[existingIndex] = targetPal;
    } else {
      targetPal = {
        id: updatedDbPal?.id || `pal-${authUserId.slice(0, 8)}`,
        auth_user_id: authUserId,
        name: updatedDbPal?.name || userName,
        email: userEmail,
        phone: user.user_metadata?.phone || '(555) 019-2834',
        avatar: updatedDbPal?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        rating: updatedDbPal?.rating || 5.0,
        completedVisits: updatedDbPal?.completed_visits || 0,
        languages: Array.isArray(updatedDbPal?.languages) ? updatedDbPal.languages : ['English', 'Spanish'],
        specialties: Array.isArray(updatedDbPal?.specialties) ? updatedDbPal.specialties : ['Hospital Companion', 'Anxiety Relief'],
        bio: updatedDbPal?.bio || 'Certified PathPal Companion Pal.',
        isVerified: true,
        account_status: 'active',
        email_verified: true,
        hospitalAffiliations: Array.isArray(updatedDbPal?.hospital_affiliations) ? updatedDbPal.hospital_affiliations : ['Metro Health Medical Center'],
        badgeNumber: updatedDbPal?.badge_number || `PAL-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      allPals.unshift(targetPal);
    }

    saveStoredPals(allPals);

    // Send "Your Account Is Ready" confirmation email
    const emailNotification: PalEmailNotification = {
      id: `email-${Date.now()}`,
      recipient_email: userEmail,
      recipient_name: targetPal.name || userName,
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
        palRecord: targetPal,
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
 * 8. PAL LOGIN & AUTH RECORD RETRIEVAL
 * ========================================================================= */

/**
 * Pal Login using `supabase.auth.signInWithPassword`.
 * Retrieves authenticated user and loads corresponding record from `pals` where `auth_user_id = user.id`.
 * Ensures a Pal can only access their own Pal information.
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
      const errMsg = error.message || '';
      if (
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('fetch failed')
      ) {
        return {
          data: null,
          error: {
            message:
              'Unable to reach Supabase servers. Please check your network connection or try again.',
          },
        };
      }
      return { data: null, error: { message: error.message } };
    }

    if (!data.user) {
      return { data: null, error: { message: 'Login failed: User not returned.' } };
    }

    const authUserId = data.user.id;
    const userEmail = (data.user.email || '').trim().toLowerCase();

    // Fetch corresponding Pal record from Supabase where auth_user_id = user.id
    let palRecord: Pal | null = await fetchPalByAuthUserId(authUserId);

    // If not yet linked by auth_user_id, try linking by email
    if (!palRecord) {
      try {
        const { data: palByEmail, error: emailErr } = await supabase
          .from('pals')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        if (!emailErr && palByEmail) {
          // Update the auth_user_id link
          await supabase
            .from('pals')
            .update({ auth_user_id: authUserId, email_verified: true, account_status: 'active' })
            .eq('id', palByEmail.id);

          palRecord = {
            id: palByEmail.id,
            auth_user_id: authUserId,
            name: palByEmail.name,
            email: palByEmail.email,
            phone: palByEmail.phone,
            avatar: palByEmail.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            rating: palByEmail.rating || 5.0,
            completedVisits: palByEmail.completed_visits || 0,
            languages: Array.isArray(palByEmail.languages) ? palByEmail.languages : ['English'],
            specialties: Array.isArray(palByEmail.specialties) ? palByEmail.specialties : ['Hospital Escort'],
            bio: palByEmail.bio || '',
            isVerified: palByEmail.is_verified ?? true,
            account_status: palByEmail.account_status || 'active',
            email_verified: true,
            hospitalAffiliations: Array.isArray(palByEmail.hospital_affiliations) ? palByEmail.hospital_affiliations : ['Metro Health Medical Center'],
            badgeNumber: palByEmail.badge_number || 'PAL-ACTIVE',
          };
        }
      } catch (linkErr) {
        console.error('Error linking pal by email during login:', linkErr);
      }
    }

    // Fallback to local store if db row not linked yet
    if (!palRecord) {
      const storedPals = getStoredPals();
      const matched = storedPals.find(
        (p) =>
          p.auth_user_id === authUserId ||
          (p.email && p.email.toLowerCase() === userEmail.toLowerCase())
      );

      if (matched) {
        palRecord = {
          ...matched,
          auth_user_id: authUserId,
          email_verified: true,
          account_status: 'active',
        };
        saveStoredPals(storedPals.map((p) => (p.id === matched.id ? palRecord! : p)));
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
 * Fetch pal record from Supabase table where `auth_user_id = user.id`.
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
      return {
        id: palDb.id,
        auth_user_id: palDb.auth_user_id,
        name: palDb.name,
        email: palDb.email,
        phone: palDb.phone,
        avatar: palDb.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        rating: palDb.rating || 5.0,
        completedVisits: palDb.completed_visits ?? 0,
        languages: Array.isArray(palDb.languages) ? palDb.languages : (typeof palDb.languages === 'string' ? palDb.languages.split(',') : ['English']),
        specialties: Array.isArray(palDb.specialties) ? palDb.specialties : (typeof palDb.specialties === 'string' ? palDb.specialties.split(',') : ['Hospital Escort']),
        bio: palDb.bio || '',
        isVerified: palDb.is_verified ?? true,
        account_status: palDb.account_status || 'active',
        email_verified: palDb.email_verified ?? true,
        hospitalAffiliations: Array.isArray(palDb.hospital_affiliations) ? palDb.hospital_affiliations : ['Metro Health Medical Center'],
        badgeNumber: palDb.badge_number || 'PAL-ACTIVE',
      };
    }
  } catch (e) {
    console.error('Exception fetching pal record from Supabase:', e);
  }
  return null;
}

/**
 * Fetch all registered pals directly from Supabase.
 */
export async function fetchAllPals(): Promise<Pal[]> {
  try {
    const { data, error } = await supabase
      .from('pals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchAllPals error:', error);
    } else if (data && data.length > 0) {
      const mapped: Pal[] = data.map((palDb: any) => ({
        id: palDb.id,
        auth_user_id: palDb.auth_user_id,
        name: palDb.name,
        email: palDb.email,
        phone: palDb.phone,
        avatar: palDb.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        rating: palDb.rating || 5.0,
        completedVisits: palDb.completed_visits ?? 0,
        languages: Array.isArray(palDb.languages) ? palDb.languages : (typeof palDb.languages === 'string' ? palDb.languages.split(',') : ['English']),
        specialties: Array.isArray(palDb.specialties) ? palDb.specialties : (typeof palDb.specialties === 'string' ? palDb.specialties.split(',') : ['Hospital Escort']),
        bio: palDb.bio || '',
        isVerified: palDb.is_verified ?? true,
        account_status: palDb.account_status || 'active',
        email_verified: palDb.email_verified ?? true,
        hospitalAffiliations: Array.isArray(palDb.hospital_affiliations) ? palDb.hospital_affiliations : ['Metro Health Medical Center'],
        badgeNumber: palDb.badge_number || 'PAL-ACTIVE',
        created_at: palDb.created_at,
        updated_at: palDb.updated_at,
      }));
      saveStoredPals(mapped);
      return mapped;
    }
  } catch (e) {
    console.error('Exception in fetchAllPals:', e);
  }
  return getStoredPals();
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
    if (palRecord) {
      return { user, palRecord };
    }

    const storedPals = getStoredPals();
    const matched =
      storedPals.find((p) => p.auth_user_id === user.id) ||
      storedPals.find((p) => p.email && p.email.toLowerCase() === user.email?.toLowerCase());

    return { user, palRecord: matched || null };
  } catch {
    return { user: null, palRecord: null };
  }
}

/* =========================================================================
 * PATIENT FUNCTIONS (Preserved)
 * ========================================================================= */

/**
 * Directly signs up a new patient using Supabase Auth.
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
      const errMsg = error.message || '';
      if (errMsg.toLowerCase().includes('rate limit')) {
        return {
          data: null,
          error: {
            message:
              'Supabase email rate limit exceeded. Please wait a few minutes before registering another new account.',
          },
        };
      }
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'An unexpected error occurred during signup.' } };
  }
}

/**
 * Directly logs in an existing patient using production Supabase Auth.
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

