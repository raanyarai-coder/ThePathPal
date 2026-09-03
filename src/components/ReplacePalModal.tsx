import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, UserCheck, ShieldAlert, Heart, Calendar, MapPin } from 'lucide-react';
import { supabase, createNotification } from '../lib/supabase';
import { PalRequest } from '../types';

interface ReplacePalModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRequestId?: string;
  onSuccess?: () => void;
}

export const ReplacePalModal: React.FC<ReplacePalModalProps> = ({
  isOpen,
  onClose,
  preselectedRequestId,
  onSuccess,
}) => {
  const [requests, setRequests] = useState<PalRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(preselectedRequestId || '');
  const [reason, setReason] = useState<string>('Language preference / bilingual companion needed');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('Spanish');
  const [mobilityNeeds, setMobilityNeeds] = useState<string[]>(['Wheelchair Assistance']);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
      if (preselectedRequestId) {
        setSelectedRequestId(preselectedRequestId);
      }
    }
  }, [isOpen, preselectedRequestId]);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('pal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data.map((r: any) => ({
          id: r.id,
          hospitalId: r.hospital_id || '',
          patientName: r.patient_name || '',
          patientPhone: r.patient_phone || '',
          hospitalName: r.hospital_name || '',
          department: r.department || '',
          appointmentDate: r.appointment_date || '',
          appointmentTime: r.appointment_time || '',
          meetingLocation: r.meeting_location || '',
          meetingPoint: r.meeting_location || '',
          mobilityNeeds: r.mobility_needs || [],
          languagePreference: r.language_preference || 'English',
          status: r.status,
          assignedPalId: r.assigned_pal_id,
          createdAt: r.created_at || new Date().toISOString(),
        } as unknown as PalRequest)));

        if (!selectedRequestId && data.length > 0) {
          // Preselect the first matched or pending request
          const matched = data.find((r: any) => r.status === 'matched') || data[0];
          setSelectedRequestId(matched.id);
        }
      }
    } catch {
      // Ignored
    }
  };

  if (!isOpen) return null;

  const currentRequest = requests.find((r) => r.id === selectedRequestId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setErrorMessage('Please select an appointment request to replace the assigned PAL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Fetch current request to get previous assigned Pal
      const { data: targetReq, error: fetchErr } = await supabase
        .from('pal_requests')
        .select('*')
        .eq('id', selectedRequestId)
        .single();

      if (fetchErr || !targetReq) {
        setErrorMessage('Unable to locate the target request. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const previousPalId = targetReq.assigned_pal_id;

      // 2. Atomically update request back to 'pending' with unassigned pal
      const updatedNotes = [
        targetReq.assistance_needs || '',
        `[REPLACEMENT REQUESTED: ${reason}. Notes: ${notes}]`,
      ].filter(Boolean).join(' | ');

      const { error: updateErr } = await supabase
        .from('pal_requests')
        .update({
          status: 'pending',
          assigned_pal_id: null,
          assistance_needs: updatedNotes,
          language: preferredLanguage,
        })
        .eq('id', selectedRequestId);

      if (updateErr) {
        setErrorMessage(updateErr.message || 'Failed to update request.');
        setIsSubmitting(false);
        return;
      }

      // 3. Mark existing match record as 'cancelled_by_patient' or unlinked
      try {
        await supabase
          .from('matches')
          .update({ status: 'cancelled' })
          .eq('request_id', selectedRequestId);
      } catch {}

      // 4. Send notification to previous PAL if one was assigned
      if (previousPalId) {
        createNotification({
          user_id: previousPalId,
          title: 'Assignment Reassigned',
          message: `The companion escort for ${targetReq.hospital_name} on ${targetReq.appointment_date} was reopened for replacement (${reason}).`,
          type: 'info',
        }).catch(() => {});
      }

      // 5. Send notification to authenticated patient
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        createNotification({
          user_id: user.id,
          title: 'PAL Replacement Dispatched',
          message: `Your request for a replacement PAL at ${targetReq.hospital_name} has been broadcast to all verified PALs.`,
          type: 'success',
        }).catch(() => {});
      }

      setIsSubmitting(false);
      setSuccessMessage('Replacement request dispatched! The appointment is now live in the Open Requests queue for all verified PALs to accept.');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while requesting a replacement Pal.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-[#1F3449]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!successMessage ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E85D75] uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-[#E85D75]" />
                <span>COMPANION REPLACEMENT SERVICE</span>
              </div>
              <h3 className="text-2xl font-black text-[#1F3449]">Replace Your Assigned PAL</h3>
              <p className="text-xs text-gray-500 font-normal">
                Need a companion with specific language skills, mobility training, or a schedule adjustment? Submit a replacement request below.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Request */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Appointment Request</label>
                {requests.length > 0 ? (
                  <select
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#E85D75] focus:outline-none bg-white font-medium"
                  >
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.hospitalName} ({r.appointmentDate} at {r.appointmentTime}) - Status: {r.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter Request ID (e.g., 4F902A07-1937-4ABA-8566-DF58330640EC)"
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#E85D75] focus:outline-none font-medium"
                  />
                )}
              </div>

              {currentRequest && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                  <div className="font-bold text-[#1F3449]">{currentRequest.hospitalName}</div>
                  <div className="text-gray-600">
                    Patient: {currentRequest.patientName} • Date: {currentRequest.appointmentDate} at {currentRequest.appointmentTime}
                  </div>
                  <div className="text-gray-500">
                    Meeting Point: {currentRequest.meetingLocation}
                  </div>
                </div>
              )}

              {/* Reason for Replacement */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Requesting Replacement</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#E85D75] focus:outline-none bg-white font-medium"
                >
                  <option value="Language preference / bilingual companion needed">Language preference / bilingual companion needed</option>
                  <option value="Specialized mobility requirement (Wheelchair / Bariatric support)">Specialized mobility requirement (Wheelchair / Bariatric support)</option>
                  <option value="Appointment time / date changed by clinic">Appointment time / date changed by clinic</option>
                  <option value="Gender preference for companion">Gender preference for companion</option>
                  <option value="Previous PAL unable to attend on time">Previous PAL unable to attend on time</option>
                  <option value="General companion replacement request">General companion replacement request</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#E85D75] focus:outline-none bg-white font-medium"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="Mandarin">Mandarin (普通话)</option>
                    <option value="Cantonese">Cantonese (粵語)</option>
                    <option value="Russian">Russian (Русский)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Haitian Creole">Haitian Creole (Kreyòl)</option>
                    <option value="Korean">Korean (한국어)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobility Needs</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Wheelchair Assistance', 'Arm Support', 'Vision Guide'].map((item) => {
                      const isChecked = mobilityNeeds.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setMobilityNeeds(mobilityNeeds.filter((m) => m !== item));
                            } else {
                              setMobilityNeeds([...mobilityNeeds, item]);
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-[#E85D75] text-white border-[#E85D75]'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes for the New PAL</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Please meet at Entrance B; patient speaks Spanish and needs assistance with wheelchair ramp."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#E85D75] focus:outline-none font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Releasing this assignment will instantly make your request visible to all verified PALs in your area on a first-come, first-served basis.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#E85D75] hover:bg-[#E85D75]/90 disabled:opacity-60 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting Replacement Request...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Confirm & Dispatch Replacement Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-[#1F3449]">PAL Replacement Dispatched!</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              {successMessage}
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left space-y-1">
              <div className="font-bold text-[#1F3449]">Next Steps:</div>
              <div className="text-gray-600">• All verified PALs have been alerted about your appointment.</div>
              <div className="text-gray-600">• As soon as a PAL accepts, you will receive an SMS and in-app notification.</div>
              <div className="text-gray-600">• Track real-time acceptance in your Patient Portal "Matches" tab.</div>
            </div>
            <button
              onClick={() => {
                setSuccessMessage(null);
                onClose();
              }}
              className="bg-[#1F3449] hover:bg-[#1F3449]/90 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl cursor-pointer"
            >
              Back to Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
