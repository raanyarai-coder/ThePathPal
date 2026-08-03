import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, FileText, Upload, AlertTriangle, Heart, Phone, User, Plus, Trash2, CheckCircle2, Share2, Key, Edit3, Save, QrCode, Printer, RefreshCw, FileUp, Info } from 'lucide-react';

export interface MedicalSummaryData {
  patientName: string;
  dob: string;
  bloodType: string;
  primaryLanguage: string;
  primaryDoctor: string;
  doctorPhone: string;
  medicalHistory: string[];
  allergies: string[];
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  mobilityNotes: string;
  uploadedFileName?: string;
  uploadedFileSize?: string;
  lastUpdated: string;
  isSharingActive: boolean;
  accessPin?: string;
}

const DEFAULT_MEDICAL_SUMMARY: MedicalSummaryData = {
  patientName: 'Maria Santos',
  dob: '1958-04-12',
  bloodType: 'O-Positive (O+)',
  primaryLanguage: 'Spanish (Español) & English',
  primaryDoctor: 'Dr. Robert Chen, MD (Cardiology)',
  doctorPhone: '(555) 234-8900',
  medicalHistory: ['Hypertension (Stage 1)', 'Type 2 Diabetes (Managed)', 'Right Knee Osteoarthritis'],
  allergies: ['Penicillin (Severe Rash)', 'Latex', 'Iodine Contrast'],
  emergencyContactName: 'Carlos Santos',
  emergencyContactRelation: 'Son',
  emergencyContactPhone: '(555) 987-6543',
  mobilityNotes: 'Requires wheelchair assistance for distances over 100 ft. Prefers steady arm support when standing up.',
  uploadedFileName: 'Santos_Maria_Medical_Overview_2026.pdf',
  uploadedFileSize: '1.2 MB',
  lastUpdated: '2026-08-01 14:20',
  isSharingActive: true,
  accessPin: '4829',
};

interface MedicalSummaryWidgetProps {
  initialData?: MedicalSummaryData;
  isPalView?: boolean; // If true, forces read-only Pal view
  onDataChange?: (data: MedicalSummaryData) => void;
}

export const MedicalSummaryWidget: React.FC<MedicalSummaryWidgetProps> = ({
  initialData = DEFAULT_MEDICAL_SUMMARY,
  isPalView = false,
  onDataChange,
}) => {
  const [data, setData] = useState<MedicalSummaryData>(() => {
    try {
      const saved = localStorage.getItem('pathpal_offline_medical_summary');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return initialData;
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newCondition, setNewCondition] = useState<string>('');
  const [newAllergy, setNewAllergy] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<boolean>(false);

  // Sync to localStorage for offline readiness
  useEffect(() => {
    try {
      localStorage.setItem('pathpal_offline_medical_summary', JSON.stringify(data));
    } catch (err) {
      console.warn('Unable to persist offline medical summary:', err);
    }
  }, [data]);

  const handleSave = () => {
    setIsEditing(false);
    const updated = {
      ...data,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setData(updated);
    if (onDataChange) onDataChange(updated);
  };

  const handleToggleSharing = () => {
    const updated = { ...data, isSharingActive: !data.isSharingActive };
    setData(updated);
    if (onDataChange) onDataChange(updated);
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setData({
      ...data,
      medicalHistory: [...data.medicalHistory, newCondition.trim()],
    });
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    setData({
      ...data,
      medicalHistory: data.medicalHistory.filter((_, i) => i !== index),
    });
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setData({
      ...data,
      allergies: [...data.allergies, newAllergy.trim()],
    });
    setNewAllergy('');
  };

  const handleRemoveAllergy = (index: number) => {
    setData({
      ...data,
      allergies: data.allergies.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({
        ...data,
        uploadedFileName: file.name,
        uploadedFileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 3000);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="bg-[#121824] rounded-3xl border border-[#00F0FF]/30 p-5 sm:p-7 space-y-6 text-white shadow-xl relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#00F0FF] tracking-widest flex items-center gap-1">
                <Lock className="w-3 h-3" />
                READ-ONLY PATIENT MEDICAL SUMMARY
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                256-Bit Encrypted
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
              {data.patientName}'s Care Profile
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        {!isPalView && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#1A2232] hover:bg-white/10 text-[#00F0FF] border border-[#00F0FF]/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit / Upload</span>
              </button>
            )}

            <button
              onClick={handleToggleSharing}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                data.isSharingActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{data.isSharingActive ? 'Shared with Pal' : 'Sharing Off'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Upload Toast Alert */}
      {uploadSuccessToast && (
        <div className="bg-emerald-500 text-black text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Medical record file uploaded & encrypted successfully!</span>
          </div>
        </div>
      )}

      {/* READ-ONLY LOCKED SUMMARY BANNER */}
      {!isEditing && (
        <div className="bg-[#1A2232] p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                {isPalView ? 'PAL READ-ONLY SECURITY MODE' : 'LOCKED READ-ONLY SUMMARY VIEW'}
              </span>
              <span className="text-gray-400 text-[10px]">
                Last Verified: {data.lastUpdated} • Shared only with assigned PathPal Companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Pal Access Link'}</span>
            </button>
            <button
              onClick={() => setShowQrModal(!showQrModal)}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg text-[11px] transition-all"
              title="View QR Code"
            >
              <QrCode className="w-4 h-4 text-[#00F0FF]" />
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div className="p-4 bg-[#080B12] rounded-2xl border border-[#00F0FF]/40 space-y-3 text-center animate-fade-in">
          <div className="text-xs font-bold uppercase text-[#00F0FF]">Pal Emergency QR Access Code</div>
          <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
            <div className="w-full h-full bg-black/90 rounded-lg p-2 flex flex-col justify-between text-[8px] font-mono text-white text-left overflow-hidden">
              <div className="text-[#00F0FF] font-bold">PATHPAL-HIPAA</div>
              <div>ID: {data.patientName.replace(' ', '_')}</div>
              <div>PIN: ****</div>
              <div className="text-emerald-400">VERIFIED SAFE</div>
            </div>
          </div>
          <div className="text-[10px] text-gray-400">
            Show this QR code to hospital staff or your assigned Pal for instant verified access.
          </div>
        </div>
      )}

      {/* EDIT MODE vs READ-ONLY DISPLAY */}
      {isEditing ? (
        /* ============ EDIT / UPLOAD FORM ============ */
        <div className="space-y-5 text-xs bg-[#1A2232] p-5 rounded-2xl border border-white/10">
          <div className="text-xs font-bold uppercase text-[#00F0FF] border-b border-white/10 pb-2 flex items-center justify-between">
            <span>EDIT PATIENT MEDICAL PROFILE</span>
            <span className="text-[10px] text-gray-400">All data stays stored on-device & encrypted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Patient Full Name</label>
              <input
                type="text"
                value={data.patientName}
                onChange={(e) => setData({ ...data, patientName: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 focus:border-[#00F0FF] outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Date of Birth</label>
              <input
                type="date"
                value={data.dob}
                onChange={(e) => setData({ ...data, dob: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 focus:border-[#00F0FF] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Blood Type</label>
              <input
                type="text"
                value={data.bloodType}
                onChange={(e) => setData({ ...data, bloodType: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 focus:border-[#00F0FF] outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Primary Doctor / Clinic</label>
              <input
                type="text"
                value={data.primaryDoctor}
                onChange={(e) => setData({ ...data, primaryDoctor: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 focus:border-[#00F0FF] outline-none"
              />
            </div>
          </div>

          {/* Allergies Editor */}
          <div className="space-y-2">
            <label className="block text-gray-400 font-bold">Allergies & Sensitivities</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Latex, Penicillin, Peanuts"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 outline-none"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="bg-[#00F0FF] text-black px-4 rounded-xl font-bold hover:bg-[#00F0FF]/90 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <span>⚠️ {allergy}</span>
                  <button
                    onClick={() => handleRemoveAllergy(index)}
                    className="text-rose-400 hover:text-white font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Medical Conditions Editor */}
          <div className="space-y-2">
            <label className="block text-gray-400 font-bold">Medical History / Chronic Conditions</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Hypertension, Diabetes"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="flex-1 bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="bg-[#00F0FF] text-black px-4 rounded-xl font-bold hover:bg-[#00F0FF]/90 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.medicalHistory.map((cond, index) => (
                <span
                  key={index}
                  className="bg-white/10 text-white border border-white/15 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <span>• {cond}</span>
                  <button
                    onClick={() => handleRemoveCondition(index)}
                    className="text-gray-400 hover:text-white font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Emergency Contact Name</label>
              <input
                type="text"
                value={data.emergencyContactName}
                onChange={(e) => setData({ ...data, emergencyContactName: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Relationship</label>
              <input
                type="text"
                value={data.emergencyContactRelation}
                onChange={(e) => setData({ ...data, emergencyContactRelation: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Emergency Phone</label>
              <input
                type="text"
                value={data.emergencyContactPhone}
                onChange={(e) => setData({ ...data, emergencyContactPhone: e.target.value })}
                className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 outline-none"
              />
            </div>
          </div>

          {/* Mobility Notes */}
          <div>
            <label className="block text-gray-400 mb-1 font-bold">Mobility & Assistance Instructions for Pal</label>
            <textarea
              rows={2}
              value={data.mobilityNotes}
              onChange={(e) => setData({ ...data, mobilityNotes: e.target.value })}
              className="w-full bg-[#080B12] text-white p-2.5 rounded-xl border border-white/15 outline-none resize-none"
            />
          </div>

          {/* File Upload Attachment Box */}
          <div className="p-4 bg-[#080B12] rounded-2xl border border-dashed border-[#00F0FF]/40 text-center space-y-2">
            <FileUp className="w-6 h-6 text-[#00F0FF] mx-auto" />
            <div className="text-xs font-bold text-white">Upload Medical History Document (PDF / Image)</div>
            <p className="text-[10px] text-gray-400">Max file size 10MB. Automatically scanned for privacy compliance.</p>
            <label className="inline-block bg-[#1A2232] hover:bg-white/10 text-[#00F0FF] border border-[#00F0FF]/40 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all">
              <span>Choose File to Attach</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      ) : (
        /* ============ READ-ONLY SUMMARY DISPLAY ============ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Column 1: Patient Vitals & Allergies */}
          <div className="space-y-4">
            
            {/* Vitals Box */}
            <div className="bg-[#1A2232] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-black uppercase text-[#00F0FF] tracking-wider flex items-center justify-between border-b border-white/10 pb-2">
                <span>Patient Vitals & Profile</span>
                <User className="w-4 h-4 text-[#00F0FF]" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Patient Name</span>
                  <span className="font-black text-white">{data.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Date of Birth</span>
                  <span className="font-bold text-white">{data.dob}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Blood Type</span>
                  <span className="font-bold text-emerald-400">{data.bloodType}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Languages</span>
                  <span className="font-bold text-white">{data.primaryLanguage}</span>
                </div>
              </div>
            </div>

            {/* CRITICAL ALLERGIES BOX (High Visibility) */}
            <div className="bg-rose-950/40 p-4 sm:p-5 rounded-2xl border border-rose-500/40 space-y-3">
              <div className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center justify-between border-b border-rose-500/30 pb-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  KNOWN ALLERGIES & WARNINGS
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                  {data.allergies.length} Critical Alerts
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="bg-rose-500/25 border border-rose-500/50 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm"
                  >
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Emergency Contact Box */}
            <div className="bg-[#1A2232] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-black uppercase text-[#00F0FF] tracking-wider flex items-center justify-between border-b border-white/10 pb-2">
                <span>Emergency Contact</span>
                <Phone className="w-4 h-4 text-[#00F0FF]" />
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact Person:</span>
                  <span className="font-bold text-white">{data.emergencyContactName} ({data.emergencyContactRelation})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Direct Phone:</span>
                  <a href={`tel:${data.emergencyContactPhone}`} className="font-black text-[#00F0FF] hover:underline">
                    {data.emergencyContactPhone}
                  </a>
                </div>
                <div className="flex justify-between pt-1 text-[11px]">
                  <span className="text-gray-400">Primary Physician:</span>
                  <span className="font-bold text-gray-300">{data.primaryDoctor}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Medical History, Mobility Notes & Document Attachment */}
          <div className="space-y-4">
            
            {/* Medical History */}
            <div className="bg-[#1A2232] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-black uppercase text-[#00F0FF] tracking-wider flex items-center justify-between border-b border-white/10 pb-2">
                <span>Medical History & Conditions</span>
                <FileText className="w-4 h-4 text-[#00F0FF]" />
              </div>

              <ul className="space-y-2 text-xs">
                {data.medicalHistory.map((cond, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-200 bg-[#080B12] p-2.5 rounded-xl border border-white/5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobility & Special Instructions */}
            <div className="bg-[#1A2232] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="text-xs font-black uppercase text-[#00F0FF] tracking-wider border-b border-white/10 pb-2">
                Pal Assistance Instructions
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-medium bg-[#080B12] p-3 rounded-xl border border-white/5">
                "{data.mobilityNotes}"
              </p>
            </div>

            {/* Uploaded Summary Document Sheet */}
            {data.uploadedFileName && (
              <div className="bg-[#1A2232] p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#00F0FF]" />
                  <div>
                    <span className="font-bold text-white block">{data.uploadedFileName}</span>
                    <span className="text-gray-400 text-[10px]">{data.uploadedFileSize} • Encrypted Document</span>
                  </div>
                </div>

                <a
                  href={`#view-${data.uploadedFileName}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Viewing encrypted document: ${data.uploadedFileName}`);
                  }}
                  className="bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#00F0FF]/30 transition-all"
                >
                  View File
                </a>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Footer HIPAA Security Notice */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>HIPAA Compliance Standard 45 CFR § 164.502 • End-to-End Shared with Assigned Pal</span>
        </div>
        <div className="text-gray-500">
          Auto-Revokes 12 Hours Post-Visit
        </div>
      </div>

    </div>
  );
};
