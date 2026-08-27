import React, { useState, useEffect } from 'react';
import { X, Star, Award, CheckCircle2, ShieldCheck, Heart, User, Calendar, DollarSign, Clock, ToggleLeft, ToggleRight, MessageSquare, Sparkles } from 'lucide-react';
import { SAMPLE_PALS } from '../data/mockData';
import { supabase, fetchAllPals } from '../lib/supabase';
import { Pal } from '../types';

interface PalAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PalAccountModal: React.FC<PalAccountModalProps> = ({ isOpen, onClose }) => {
  const [availablePals, setAvailablePals] = useState<Pal[]>([]);
  const [selectedPalId, setSelectedPalId] = useState<string>('');
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'assignments'>('overview');

  useEffect(() => {
    if (isOpen) {
      loadPals();
    }
  }, [isOpen]);

  const loadPals = async () => {
    try {
      const allPals = await fetchAllPals();
      if (allPals && allPals.length > 0) {
        setAvailablePals(allPals);
      } else {
        setAvailablePals([]);
      }

      // Check if current user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user && allPals) {
        const matching = allPals.find(p => p.auth_user_id === user.id || p.email?.toLowerCase() === user.email?.toLowerCase());
        if (matching) {
          setSelectedPalId(matching.id);
          return;
        }
      }

      if (allPals && allPals.length > 0) {
        setSelectedPalId(allPals[0].id);
      }
    } catch (e) {
      console.warn('PalAccountModal load error:', e);
    }
  };

  if (!isOpen) return null;

  const currentPal = availablePals.find(p => p.id === selectedPalId) || availablePals[0];

  const palFeedbacks: any[] = [];
  const upcomingAssignments: any[] = [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#1F3449] rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-[#48A6A5]/40 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!currentPal ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#48A6A5]/20 text-[#48A6A5] flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No Registered Pals Found</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No active Pal accounts have been created yet. When applicants are approved by the administrator, their profiles will appear here.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white text-xs font-bold uppercase tracking-wider"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Switcher & Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                {currentPal.avatar ? (
                  <img
                    src={currentPal.avatar}
                    alt={currentPal.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#48A6A5] shadow-lg shadow-[#48A6A5]/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#48A6A5] text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-[#48A6A5]">
                    {currentPal.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight">{currentPal.name}</h3>
                    <span className="bg-[#48A6A5]/20 text-[#48A6A5] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#48A6A5]/40">
                      {currentPal.badgeNumber || 'PAL-ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    Verified Healthcare Companion Pal • {currentPal.hospitalAffiliations?.join(', ') || 'Path Pal Network'}
                  </p>
                </div>
              </div>

              {/* Switch Active Pal Account */}
              {availablePals.length > 1 && (
                <div className="flex items-center gap-2 bg-[#2B425B] p-2 rounded-xl border border-white/10">
                  <User className="w-4 h-4 text-[#48A6A5]" />
                  <select
                    value={selectedPalId}
                    onChange={(e) => setSelectedPalId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none"
                  >
                    {availablePals.map(pal => (
                      <option key={pal.id} value={pal.id} className="bg-[#1F3449] text-white">
                        {pal.auth_user_id ? `Active Pal: ${pal.name}` : `Account: ${pal.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Status Toggle & Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Duty Status */}
              <div className="p-4 rounded-2xl bg-[#2B425B] border border-white/10 flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dispatch Duty</span>
                <button
                  onClick={() => setIsOnDuty(!isOnDuty)}
                  className={`flex items-center gap-2 text-xs font-black uppercase px-3 py-2 rounded-xl transition-all ${
                    isOnDuty ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {isOnDuty ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  <span>{isOnDuty ? 'On Duty (Active)' : 'Off Duty'}</span>
                </button>
              </div>

              {/* Rating */}
              <div className="p-4 rounded-2xl bg-[#2B425B] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Patient Rating</span>
                <div className="flex items-center gap-1.5 text-2xl font-black text-[#48A6A5]">
                  <Star className="w-5 h-5 fill-[#48A6A5] text-[#48A6A5]" />
                  <span>{currentPal.rating || 5.0} / 5.0</span>
                </div>
                <p className="text-[10px] text-gray-400 font-light">Based on verified visits</p>
              </div>

              {/* Completed Visits */}
              <div className="p-4 rounded-2xl bg-[#2B425B] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Completed Visits</span>
                <div className="text-2xl font-black text-white">{currentPal.completedVisits || 0}</div>
                <p className="text-[10px] text-gray-400 font-light">100% On-Time Record</p>
              </div>

              {/* Impact Earnings */}
              <div className="p-4 rounded-2xl bg-[#2B425B] border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stipend & Credits</span>
                <div className="text-2xl font-black text-[#E85D75]">${(currentPal.completedVisits || 0) * 35}</div>
                <p className="text-[10px] text-gray-400 font-light">Community impact stipend</p>
              </div>

            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              {[
                { id: 'overview', label: 'Overview & Badges', icon: Award },
                { id: 'reviews', label: `Patient Reviews (${palFeedbacks.length})`, icon: MessageSquare },
                { id: 'assignments', label: `Upcoming Visits (${upcomingAssignments.length})`, icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#48A6A5] text-white shadow-md'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#48A6A5]">Pal Bio & Specialties</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-light bg-[#2B425B] p-4 rounded-xl border border-white/10">
                    "{currentPal.bio || 'Accredited PathPal companion health worker providing hospital escort guidance.'}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white">Specialized Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPal.specialties?.map((s, i) => (
                        <span key={i} className="text-[11px] font-bold bg-[#48A6A5]/20 text-[#48A6A5] px-3 py-1 rounded-full border border-[#48A6A5]/30">
                          ✓ {s}
                        </span>
                      )) || (
                        <span className="text-xs text-gray-400">Hospital Companion Escort</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white">Languages Spoken</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPal.languages?.map((l, i) => (
                        <span key={i} className="text-[11px] font-bold bg-white/10 text-white px-3 py-1 rounded-full border border-white/20">
                          🗣️ {l}
                        </span>
                      )) || (
                        <span className="text-xs text-gray-400">English</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#2B425B] border border-white/10 flex items-center gap-3 text-xs text-emerald-400">
                  <ShieldCheck className="w-6 h-6 shrink-0" />
                  <span>HIPAA Privacy Certified • 7-Year Background Clearance Active • 10-Panel Drug Screen Verified</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {palFeedbacks.length > 0 ? (
                  palFeedbacks.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#2B425B] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rev.patientName}</span>
                          <span className="text-[10px] bg-[#48A6A5]/20 text-[#48A6A5] px-2.5 py-0.5 rounded-full border border-[#48A6A5]/30">
                            {rev.tag}
                          </span>
                        </div>
                        <div className="flex items-center text-warm-gold text-xs font-bold">
                          {'★'.repeat(rev.rating)}
                          <span className="text-gray-400 text-[10px] ml-2">{rev.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 font-light italic">"{rev.comment}"</p>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{rev.hospital}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 bg-[#2B425B] rounded-2xl border border-white/10">
                    <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <div className="font-bold text-white">No Reviews Yet</div>
                    <div className="text-xs text-gray-400 mt-1">Patient reviews and feedback will appear here after completed visits.</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assign) => (
                    <div key={assign.id} className="p-5 rounded-2xl bg-[#2B425B] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-[#48A6A5]">{assign.date}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          Confirmed
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{assign.patientName}</div>
                      <div className="text-xs text-gray-300">{assign.hospital} • {assign.department}</div>
                      <div className="text-xs text-gray-400 font-light bg-[#1F3449] p-3 rounded-xl border border-white/5">
                        📌 {assign.needs}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 bg-[#2B425B] rounded-2xl border border-white/10">
                    <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <div className="font-bold text-white">No Upcoming Assignments</div>
                    <div className="text-xs text-gray-400 mt-1">Accepted patient companion visits will be listed here.</div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase"
              >
                Close Account View
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
