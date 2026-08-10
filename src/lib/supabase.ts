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
 * Directly signs up a new patient using production Supabase Auth.
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
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          data: null,
          error: {
            message: 'Supabase email rate limit exceeded. Please wait a few minutes before registering another new account, or log in with an existing account.'
          }
        };
      }
      return { data: null, error: { message: error.message } };
    }

    // Try inserting metadata into 'patients' table if available
    if (data?.user) {
      try {
        await supabase.from('patients').insert({
          auth_user_id: data.user.id,
          name,
          phone,
        });
      } catch (insertErr) {
        console.info('Notice inserting to patients table:', insertErr);
      }
    }

    return { data, error: null };
  } catch (err: any) {
    const msg = err?.message || 'An unexpected error occurred during signup.';
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
