import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Phone, LogIn, UserPlus, LogOut, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { signUpPatient, loginPatient, signOutPatient } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: SupabaseUser, patientInfo?: { name: string; phone: string }) => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [patientRecord, setPatientRecord] = useState<any>(null);

  // Sync Auth Session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) fetchPatientRecord(user.id);
    }).catch(() => {
      setCurrentUser(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) fetchPatientRecord(user.id);
      else setPatientRecord(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPatientRecord = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setPatientRecord(data);
      } else {
        setPatientRecord(null);
      }
    } catch {
      setPatientRecord(null);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!email || !password || !name) {
        setErrorMessage('Please fill in all required fields (Name, Email, Password).');
        setLoading(false);
        return;
      }

      const res = await signUpPatient(email, password, name, phone);

      if (res.error) {
        setErrorMessage(res.error.message || 'Failed to register account.');
      } else if (res.data?.user && res.data?.session) {
        setSuccessMessage('Account registered and signed in successfully!');
        setCurrentUser(res.data.user);
        fetchPatientRecord(res.data.user.id);
        onAuthSuccess?.(res.data.user, { name, phone });
      } else if (res.data?.user && !res.data?.session) {
        setSuccessMessage(
          'Account created successfully. Please check your email to confirm your account before logging in.'
        );
        setCurrentUser(null);
        setPatientRecord(null);
      } else {
        setErrorMessage('Unable to complete signup. Please verify your credentials.');
      }
    } else {
      if (!email || !password) {
        setErrorMessage('Please enter both email and password.');
        setLoading(false);
        return;
      }

      const res = await loginPatient(email, password);

      if (res.error) {
        setErrorMessage(res.error.message || 'Failed to sign in.');
      } else if (res.data?.user && res.data?.session) {
        setSuccessMessage('Signed in successfully!');
        setCurrentUser(res.data.user);
        fetchPatientRecord(res.data.user.id);
        onAuthSuccess?.(res.data.user);
      } else if (res.data?.user && !res.data?.session) {
        setErrorMessage('Sign in pending email confirmation. Please check your inbox.');
        setCurrentUser(null);
        setPatientRecord(null);
      } else {
        setErrorMessage('Invalid credentials. Please check your email and password.');
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOutPatient();
    setCurrentUser(null);
    setPatientRecord(null);
    setSuccessMessage('Signed out successfully.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 overflow-hidden space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#48A6A5]/15 border border-[#48A6A5]/30 text-[#48A6A5] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#48A6A5]">
              PATIENT ACCESS PORTAL
            </div>
            <div className="text-xs text-gray-500 font-semibold">
              Secure Companion Coordination
            </div>
          </div>
        </div>

        {currentUser ? (
          /* Active User Session Details */
          <div className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Patient Session</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Signed In
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-base font-black text-[#1F3449]">
                  {patientRecord?.name || currentUser.user_metadata?.full_name || 'Patient'}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {currentUser.email}
                </div>
                {patientRecord?.phone && (
                  <div className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {patientRecord.phone}
                  </div>
                )}
              </div>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Continue</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign Up / Login Forms */
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#1F3449] shadow-sm'
                    : 'text-gray-500 hover:text-[#1F3449]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#1F3449] shadow-sm'
                    : 'text-gray-500 hover:text-[#1F3449]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#1F3449]">
                {mode === 'signup' ? 'Create Patient Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === 'signup'
                  ? 'Sign up to manage appointment companion escorts & campus navigation.'
                  : 'Sign in to access your active companion requests.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eleanor Vance"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="(555) 019-2834"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Patient Account</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security / Compliance Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Security Compliant
          </span>
          <span>Encrypted Patient Data</span>
        </div>
      </div>
    </div>
  );
};
