import React, { useState } from 'react';
import { Building2, BarChart3, Clock, CheckCircle2, ShieldCheck, Users, Search, Filter, FileText, ChevronRight, Award } from 'lucide-react';
import { SAMPLE_HOSPITALS, INITIAL_REQUESTS } from '../data/mockData';
import { PalRequest } from '../types';

export const HospitalPortalPage: React.FC = () => {
  const [requests, setRequests] = useState<PalRequest[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery) {
      return (
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-white">
      
      {/* Hospital Portal Header Banner */}
      <div className="bg-[#1F3449] p-6 sm:p-8 rounded-3xl border-2 border-[#48A6A5]/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-white bg-[#48A6A5] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Building2 className="w-3.5 h-3.5" />
              HOSPITAL ADMIN HUB
            </span>
            <span className="text-xs font-bold text-[#48A6A5] bg-[#48A6A5]/15 px-3 py-1 rounded-full border border-[#48A6A5]/30 font-mono">
              Site License #HOSP-9901 Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Metro Health Medical Center</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Real-time companion dispatch oversight, campus wait-time optimization, HCAHPS patient experience scorecards, and Schedule H CHNA community benefit reporting.
          </p>

          <div className="bg-[#2B425B] p-4 rounded-2xl border border-white/10 flex items-center gap-4 max-w-md">
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">NO-SHOW REDUCTION</span>
              <span className="text-2xl font-black text-emerald-400">-38.4%</span>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">HCAHPS RATING BOOST</span>
              <span className="text-2xl font-black text-[#48A6A5]">+14.2%</span>
            </div>
          </div>
        </div>

        {/* Generated Hospital Command Center Preview Photo */}
        <div className="w-full lg:w-80 h-48 rounded-2xl overflow-hidden border-2 border-[#48A6A5]/40 shadow-xl relative group shrink-0">
          <img
            src={new URL('../assets/images/hospital_coordination_center_1785710719570.jpg', import.meta.url).href}
            alt="PathPal Hospital Command Center"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-2 left-3 right-3 text-xs flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#48A6A5] bg-black/60 px-2 py-0.5 rounded border border-[#48A6A5]/40">
              LIVE DISPATCH CENTER
            </span>
            <span className="text-[10px] font-mono text-emerald-400">24 Active Stations</span>
          </div>
        </div>
      </div>

      {/* Hospital Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Today</span>
          <div className="text-3xl font-black text-[#E85D75]">24 Pals Active</div>
          <span className="text-[10px] font-bold text-emerald-400">100% Pal Covered</span>
        </div>

        <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Match Speed</span>
          <div className="text-3xl font-black text-[#48A6A5]">3.2 Mins</div>
          <span className="text-[10px] font-bold text-gray-300">Target: &lt; 5 mins</span>
        </div>

        <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient Satisfaction</span>
          <div className="text-3xl font-black text-[#F1B84C]">98.6%</div>
          <span className="text-[10px] font-bold text-emerald-400">4.9 / 5.0 Star Rating</span>
        </div>

        <div className="bg-[#1F3449] p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Schedule H CHNA Hours</span>
          <div className="text-3xl font-black text-white">1,240 Hrs</div>
          <span className="text-[10px] font-bold text-[#48A6A5]">Tax-Exempt Credit Approved</span>
        </div>
      </div>

      {/* Hospital Dispatch Control Table */}
      <div className="bg-[#1F3449] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-[#48A6A5] tracking-wider">DISPATCH LOG</span>
            <h2 className="text-2xl font-black text-white">Live Campus Companion Dispatch Table</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient or clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-9 pr-4 py-2.5 rounded-xl bg-[#2B425B] border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-[#48A6A5]"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#2B425B] p-1 rounded-xl border border-white/15 text-xs font-bold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'all' ? 'bg-[#48A6A5] text-white font-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('matched')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'matched' ? 'bg-[#E85D75] text-white font-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                Matched
              </button>
              <button
                onClick={() => setFilterStatus('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'in_progress' ? 'bg-[#48A6A5] text-white font-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#2B425B] border-b border-white/10 text-gray-300 uppercase font-black text-[10px]">
                <th className="p-3">Req ID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Department / Clinic</th>
                <th className="p-3">Campus Gate Spot</th>
                <th className="p-3">Assigned Companion</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#48A6A5]">{req.id}</td>
                  <td className="p-3 font-bold text-white">{req.patientName}</td>
                  <td className="p-3 text-gray-300">{req.department}</td>
                  <td className="p-3 text-gray-400">{req.meetingPoint}</td>
                  <td className="p-3 font-bold text-[#E85D75]">
                    {req.assignedPal ? `${req.assignedPal.name} (#${req.assignedPal.badgeNumber})` : 'Unassigned'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      req.status === 'matched'
                        ? 'bg-[#E85D75]/20 text-[#E85D75] border border-[#E85D75]/30'
                        : req.status === 'in_progress'
                        ? 'bg-[#48A6A5]/20 text-[#48A6A5] border border-[#48A6A5]/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
