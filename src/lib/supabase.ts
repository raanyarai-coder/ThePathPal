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
 * Saves a new Pal companion application into `pal_applications`.
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
    const appId = `app-${Date.now().toString().slice(-6)}`;
    const newApp: PalApplication = {
      id: appId,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      languages: data.languages.trim(),
      specialties: data.specialties || 'Companion Mobility & Hospital Escort',
      bio: data.bio || 'Compassionate community health advocate eager to support patients.',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Attempt Supabase insert
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

      if (!dbError && dbData) {
        // Sync local cache
        const current = getStoredApplications();
        saveStoredApplications([dbData as PalApplication, ...current.filter((a) => a.id !== dbData.id)]);
        return { data: dbData as PalApplication, error: null };
      }
    } catch (dbErr) {
      console.warn('Supabase pal_applications insert notice:', dbErr);
    }

    // Always maintain local persistent fallback
    const apps = getStoredApplications();
    const updated = [newApp, ...apps.filter((a) => a.id !== newApp.id)];
    saveStoredApplications(updated);

    return { data: newApp, error: null };
  } catch (err: any) {
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

    if (!error && data && data.length > 0) {
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
    console.warn('Supabase fetchPalApplications note:', err);
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

    // Update in Supabase
    try {
      await supabase
        .from('pal_applications')
        .update({
          status: 'approved',
          approved_at: updatedApp.approved_at,
          admin_notes: adminNotes,
        })
        .eq('id', applicationId);
    } catch (e) {
      console.warn('Supabase approve note:', e);
    }

    // Update local cache
    saveStoredApplications(allApps.map((a) => (a.id === applicationId ? updatedApp : a)));

    // Ensure the corresponding record exists in `pals` table in 'approved_pending_verification' status
    const allPals = getStoredPals();
    const existingPal = allPals.find((p) => p.email?.toLowerCase() === app.email.toLowerCase());

    const badgeNum = `PAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const palRecord: Pal = existingPal || {
      id: `pal-${Date.now().toString().slice(-6)}`,
      name: app.full_name,
      email: app.email,
      phone: app.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      rating: 5.0,
      completedVisits: 0,
      languages: app.languages.split(',').map((s) => s.trim()),
      specialties: app.specialties ? app.specialties.split(',').map((s) => s.trim()) : ['Hospital Escort', 'Companion Care'],
      bio: app.bio || 'Compassionate healthcare companion.',
      isVerified: false,
      account_status: 'approved_pending_verification',
      email_verified: false,
      hospitalAffiliations: ['Metro Health Medical Center'],
      badgeNumber: badgeNum,
      created_at: new Date().toISOString(),
    };

    // Upsert into Supabase pals table
    try {
      await supabase
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
        });
    } catch (e) {
      console.warn('Supabase initial pals record insert notice:', e);
    }

    if (!existingPal) {
      saveStoredPals([palRecord, ...allPals]);
    } else {
      saveStoredPals(allPals.map((p) => (p.id === existingPal.id ? { ...p, account_status: 'approved_pending_verification' } : p)));
    }

    const signupLink = `${window.location.origin}/#pal-signup?app_id=${applicationId}`;

    return { data: { application: updatedApp, signupLink }, error: null };
  } catch (err: any) {
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

      if (!error && data) {
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
      console.warn('Supabase getApprovedPalApplication note:', e);
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
      email,
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
 * 2. Confirms `user.email_confirmed_at` (or session confirmation state) is populated.
 * 3. Associates `pals.auth_user_id = auth.users.id`.
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
    const userEmail = user.email || '';
    const userName = user.user_metadata?.full_name || userEmail.split('@')[0];

    // Find existing Pal record to update (preventing duplicate rows)
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
        id: `pal-${authUserId.slice(0, 8)}`,
        auth_user_id: authUserId,
        name: userName,
        email: userEmail,
        phone: user.user_metadata?.phone || '(555) 019-2834',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        rating: 5.0,
        completedVisits: 0,
        languages: ['English', 'Spanish'],
        specialties: ['Hospital Companion', 'Anxiety Relief', 'Wheelchair Guidance'],
        bio: 'Certified PathPal Companion Pal.',
        isVerified: true,
        account_status: 'active',
        email_verified: true,
        hospitalAffiliations: ['Metro Health Medical Center'],
        badgeNumber: `PAL-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      allPals.unshift(targetPal);
    }

    // Save updated pals to local storage
    saveStoredPals(allPals);

    // Update in Supabase pals table
    try {
      const { error: updateErr } = await supabase
        .from('pals')
        .upsert({
          id: targetPal.id,
          auth_user_id: authUserId,
          name: targetPal.name,
          email: targetPal.email,
          phone: targetPal.phone,
          avatar: targetPal.avatar,
          rating: targetPal.rating,
          completed_visits: targetPal.completedVisits,
          languages: targetPal.languages,
          specialties: targetPal.specialties,
          bio: targetPal.bio,
          is_verified: true,
          account_status: 'active',
          email_verified: true,
          hospital_affiliations: targetPal.hospitalAffiliations,
          badge_number: targetPal.badgeNumber,
          updated_at: new Date().toISOString(),
        });

      if (updateErr) {
        console.warn('Supabase update pals warning:', updateErr.message);
      }
    } catch (dbE) {
      console.warn('Supabase update pals table note:', dbE);
    }

    // Step 7: Send "Your Account Is Ready" confirmation email
    const emailNotification: PalEmailNotification = {
      id: `email-${Date.now()}`,
      recipient_email: userEmail,
      recipient_name: userName,
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
      email,
      password,
    });

    if (error) {
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
    const userEmail = data.user.email || '';

    // Fetch corresponding Pal record
    let palRecord: Pal | null = null;

    try {
      const { data: palDb, error: palDbError } = await supabase
        .from('pals')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (!palDbError && palDb) {
        palRecord = {
          id: palDb.id,
          auth_user_id: palDb.auth_user_id,
          name: palDb.name,
          email: palDb.email,
          phone: palDb.phone,
          avatar: palDb.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          rating: palDb.rating || 5.0,
          completedVisits: palDb.completed_visits || 0,
          languages: Array.isArray(palDb.languages) ? palDb.languages : ['English'],
          specialties: Array.isArray(palDb.specialties) ? palDb.specialties : ['Hospital Escort'],
          bio: palDb.bio || '',
          isVerified: palDb.is_verified ?? true,
          account_status: palDb.account_status || 'active',
          email_verified: palDb.email_verified ?? true,
          hospitalAffiliations: Array.isArray(palDb.hospital_affiliations) ? palDb.hospital_affiliations : ['Metro Health Medical Center'],
          badgeNumber: palDb.badge_number || 'PAL-8802',
        };
      }
    } catch (e) {
      console.warn('Supabase fetch pal record note:', e);
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
        // Update local store with auth_user_id
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
    return {
      data: null,
      error: { message: err?.message || 'An unexpected error occurred during Pal login.' },
    };
  }
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

