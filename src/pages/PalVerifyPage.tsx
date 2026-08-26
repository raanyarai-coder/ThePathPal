import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  LogIn,
  Send,
  Sparkles,
} from 'lucide-react';
import { verifyPalEmailAndActivate, getCurrentPalUser, getSentPalEmails, supabase } from '../lib/supabase';
import { Pal, PalEmailNotification } from '../types';

interface PalVerifyPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToPortal?: () => void;
}

export const PalVerifyPage: React.FC<PalVerifyPageProps> = ({
  onNavigateToLogin,
  onNavigateToPortal,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedPal, setActivatedPal] = useState<Pal | null>(null);
  const [emailNotification, setEmailNotification] = useState<PalEmailNotification | null>(null);
  const [sentEmailsList, setSentEmailsList] = useState<PalEmailNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Check auth session on load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsVerifying(true);
    setErrorMessage(null);

    // Refresh sent emails log
    setSentEmailsList(getSentPalEmails());

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUser(user);
        // Automatically attempt activation if user session exists and email is confirmed
        const res = await verifyPalEmailAndActivate();
        if (res.error) {
          // If unconfirmed or error
          setErrorMessage(res.error.message);
          setVerifyStatus('error');
        } else if (res.data) {
          setActivatedPal(res.data.palRecord);
          setEmailNotification(res.data.emailNotification);
          setVerifyStatus('success');
          setSentEmailsList(getSentPalEmails());
        }
      } else {
        setVerifyStatus('idle');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Verification initialization error');
      setVerifyStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerificationTrigger = async () => {
    setIsVerifying(true);
    setErrorMessage(null);

    const res = await verifyPalEmailAndActivate();
    setIsVerifying(false);

    if (res.error) {
      setErrorMessage(res.error.message);
      setVerifyStatus('error');
      return;
    }

    if (res.data) {
      setCurrentUser(res.data.user);
      setActivatedPal(res.data.palRecord);
      setEmailNotification(res.data.emailNotification);
      setVerifyStatus('success');
      setSentEmailsList(getSentPalEmails());
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-[#1F3449]">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48A6A5]/10 text-[#48A6A5] text-xs font-black uppercase tracking-wider border border-[#48A6A5]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EMAIL VERIFICATION & DATABASE ACTIVATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F3449]">Pal Email Verification</h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Confirming email status with Supabase Auth, updating the <code>pals</code> database record, and issuing confirmation.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-[#48A6A5]/30 shadow-xl space-y-6">
        
        {isVerifying && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#48A6A5] mx-auto" />
            <h3 className="text-lg font-bold text-[#1F3449]">Validating Supabase Email Confirmation...</h3>
            <p className="text-xs text-gray-500">Checking <code>user.email_confirmed_at</code> and updating <code>pals</code> record.</p>
          </div>
        )}

        {!isVerifying && verifyStatus === 'success' && activatedPal && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#1F3449]">Email Verified & Pal Account Activated!</h2>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Your email has been confirmed. The <code>pals</code> record for <strong>{activatedPal.name}</strong> has been linked with your Supabase Auth user ID.
              </p>
            </div>

            {/* Database Record Update Details */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <code>pals</code> Table Record Synchronized:
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Status: {activatedPal.account_status || 'active'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-950 pt-2 border-t border-emerald-200/80">
                <div><strong>Auth User ID:</strong> <span className="font-mono">{activatedPal.auth_user_id || currentUser?.id}</span></div>
                <div><strong>Pal Name:</strong> {activatedPal.name}</div>
                <div><strong>Badge Number:</strong> <span className="font-mono">{activatedPal.badgeNumber}</span></div>
                <div><strong>Email Verified:</strong> <span className="font-mono text-emerald-700 font-bold">true ({currentUser?.email_confirmed_at ? new Date(currentUser.email_confirmed_at).toLocaleTimeString() : 'Verified'})</span></div>
                <div><strong>Account Status:</strong> <span className="font-bold text-emerald-700">active</span></div>
                <div><strong>Hospital Affiliation:</strong> {activatedPal.hospitalAffiliations.join(', ')}</div>
              </div>
            </div>

            {/* Simulated / Dispatched Email Message Box */}
            {emailNotification && (
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#48A6A5]">
                    <Mail className="w-4 h-4" />
                    <span>DELIVERED EMAIL: "{emailNotification.subject}"</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    STATUS: DELIVERED
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 space-y-2">
                  <div className="text-[11px] text-gray-500 border-b border-gray-100 pb-2 flex justify-between">
                    <span><strong>To:</strong> {emailNotification.recipient_name} &lt;{emailNotification.recipient_email}&gt;</span>
                    <span className="font-mono text-[10px]">{new Date(emailNotification.sent_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="font-semibold text-[#1F3449]">{emailNotification.subject}</p>
                  <p className="text-gray-600 leading-relaxed">
                    {emailNotification.message}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#pal"
                onClick={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else window.location.hash = 'pal';
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Pal Login Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {!isVerifying && verifyStatus !== 'success' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2">
              <h3 className="font-bold flex items-center gap-1.5 text-sky-950">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Verification Flow Overview</span>
              </h3>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                When a Pal clicks the Supabase confirmation link in their email, their browser is redirected here.
                We confirm <code>user.email_confirmed_at</code>, update the corresponding record in <code>pals</code> to <code>account_status = 'active'</code> and <code>email_verified = true</code>, and issue the "Your Pal Account Is Ready" confirmation message.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <strong className="block font-bold">Verification Notice:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleManualVerificationTrigger}
                className="w-full py-4 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Verify Active Pal Session & Update `pals` Record</span>
              </button>

              <div className="flex justify-between items-center text-xs pt-2">
                <a
                  href="#pal-signup"
                  className="text-[#48A6A5] hover:underline font-bold"
                >
                  ← Back to Pal Signup
                </a>
                <a
                  href="#pal"
                  className="text-gray-600 hover:text-[#1F3449] font-bold"
                >
                  Already Verified? Pal Login →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log of Ready Emails */}
        {sentEmailsList.length > 0 && (
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
              <span>Account Ready Emails Sent Log ({sentEmailsList.length})</span>
              <span className="text-[10px] text-[#48A6A5]">Automated Notification Queue</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sentEmailsList.map((em) => (
                <div
                  key={em.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#1F3449]">{em.recipient_name} &lt;{em.recipient_email}&gt;</div>
                    <div className="text-[11px] text-gray-500">{em.subject}</div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DELIVERED
                    </span>
                    <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{new Date(em.sent_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
