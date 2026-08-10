import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pzzrgstawlqxanfdjnbq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6enJnc3Rhd2xxeGFuZmRqbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNzAxOTMsImV4cCI6MjEwMTk0NjE5M30.W6E0k16XXSLqp2NmiTecviaXYOPEsX2wZjV3DacvlSA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface PatientAuthData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

/**
 * Sign up a new patient with Supabase Auth and insert record into 'patients' table.
 */
export async function signUpPatient(email: string, password: string, name: string, phone: string = '') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  if (data?.user) {
    const { error: patientInsertError } = await supabase.from('patients').insert({
      auth_user_id: data.user.id,
      name,
      phone,
      email,
    });

    if (patientInsertError) {
      console.warn('Supabase patients table insert notice:', patientInsertError.message);
    }
  }

  return { data, error: null };
}

/**
 * Log in an existing user with Supabase Auth.
 */
export async function loginPatient(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out current user session.
 */
export async function signOutPatient() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current authenticated user session.
 */
export async function getCurrentPatientUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
