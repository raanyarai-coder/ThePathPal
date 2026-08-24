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
 * Directly signs up a new patient using Supabase Auth.
 * Profile creation in the 'patients' table is handled by a PostgreSQL database trigger on auth.users.
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
              'Supabase email rate limit exceeded. Please wait a few minutes before registering another new account, or log in with an existing account.',
          },
        };
      }
      if (
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('fetch failed')
      ) {
        return {
          data: null,
          error: {
            message:
              'Unable to reach Supabase servers (Failed to fetch). Please check your network connection, verify your Supabase project URL & Anon Key, or disable any ad-blocker blocking supabase.co.',
          },
        };
      }
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: any) {
    const msg = err?.message || 'An unexpected error occurred during signup.';
    if (msg.includes('Failed to fetch') || msg.includes('fetch failed')) {
      return {
        data: null,
        error: {
          message:
            'Network connection issue connecting to Supabase. Please check your internet connection or URL settings.',
        },
      };
    }
    return { data: null, error: { message: msg } };
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
      const errMsg = error.message || '';
      if (errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('fetch failed')) {
        return {
          data: null,
          error: {
            message: 'Unable to reach Supabase servers (Failed to fetch). Please check your network connection, verify your Supabase project URL & Anon Key, or disable any ad-blocker blocking supabase.co.'
          }
        };
      }
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (err: any) {
    const msg = err?.message || 'An unexpected error occurred during login.';
    if (msg.includes('Failed to fetch')) {
      return {
        data: null,
        error: {
          message: 'Network connection issue connecting to Supabase. Please check your internet connection or URL settings.'
        }
      };
    }
    return { data: null, error: { message: msg } };
  }
}

/**
 * Signs out the current patient session.
 */
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

/**
 * Gets current authenticated patient user.
 */
export async function getCurrentPatientUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
