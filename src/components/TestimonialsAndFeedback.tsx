import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, CheckCircle2, User, PlusCircle, ShieldCheck, Heart } from 'lucide-react';

interface FeedbackItem {
  id: string;
  authorName: string;
  role: 'Patient' | 'Family Member' | 'Hospital Staff' | 'Pal Companion';
  rating: number;
  comment: string;
  hospital: string;
  date: string;
  palName: string;
  verified: boolean;
}

const INITIAL_FEEDBACKS: FeedbackItem[] = [];

interface TestimonialsAndFeedbackProps {
  onOpenPalAccount: () => void;
}

export const TestimonialsAndFeedback: React.FC<TestimonialsAndFeedbackProps> = ({ onOpenPalAccount }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [role, setRole] = useState<'Patient' | 'Family Member' | 'Hospital Staff'>('Patient');
  const [rating, setRating] = useState(5);
  const [palName, setPalName] = useState('');
  const [hospital, setHospital] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FeedbackItem = {
      id: `f-${Date.now()}`,
      authorName,
      role,
      rating,
      comment,
      hospital,
      date: 'Just now',
      palName,
      verified: true
    };
    setFeedbacks([newItem, ...feedbacks]);
    setSubmitted(true);
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'patient') return f.role === 'Patient';
    if (activeFilter === 'family') return f.role === 'Family Member';
    if (activeFilter === 'staff') return f.role === 'Hospital Staff';
    return true;
  });

  return (
    <section id="feedback" className="py-24 bg-white border-t border-gray-200 relative overflow-hidden text-[#1F3449]">
      {/* Background Backlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#48A6A5]/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#48A6A5]/10 border border-[#48A6A5]/30 text-[#48A6A5] text-xs font-bold uppercase tracking-[0.25em]">
            <Star className="w-4 h-4 fill-[#48A6A5]" />
            <span>PATIENT & PAL REVIEWS</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-none text-[#1F3449]">
            VOICES OF <br />
            <span className="text-[#48A6A5]">CARE & GRATITUDE.</span>
          </h2>
          <p className="text-sm text-gray-600 font-light max-w-2xl mx-auto">
            Read verified reviews from patients, distant family members, and hospital leaders. Pals can also access their personal dashboard to track ratings and feedback.
          </p>
        </div>

        {/* Top Action Bar & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
          
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'patient', label: 'Patients' },
              { id: 'family', label: 'Family Members' },
              { id: 'staff', label: 'Hospital Staff' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all ${
                  activeFilter === filter.id
                    ? 'bg-[#48A6A5] text-white font-extrabold shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setSubmitted(false);
                setShowSubmitModal(true);
              }}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#48A6A5] text-white text-xs font-black uppercase tracking-wider hover:bg-[#48A6A5]/90 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Review</span>
            </button>

            <button
              onClick={onOpenPalAccount}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white border border-[#48A6A5]/40 text-[#48A6A5] text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>Pal Account Portal</span>
            </button>
          </div>

        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((f) => (
              <div key={f.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-4 hover:border-[#48A6A5] transition-all flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-500 text-xs">
                      {'★'.repeat(f.rating)}
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{f.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 font-light italic leading-relaxed">
                    "{f.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F3449]">{f.authorName}</span>
                    <span className="bg-[#48A6A5]/10 text-[#48A6A5] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#48A6A5]/30">
                      {f.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-light flex items-center justify-between">
                    <span>Companion: {f.palName}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Visit
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-50 p-12 rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-[#48A6A5]/50 mx-auto" />
              <h3 className="text-lg font-bold text-[#1F3449]">No Reviews Submitted Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Be the first patient, family member, or care coordinator to share your experience with a verified PathPal companion.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowSubmitModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#48A6A5] text-white text-xs font-bold uppercase tracking-wider shadow-sm inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit First Review</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-[#1F3449]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-500 hover:bg-gray-100"
            >
              ✕
            </button>

            {!submitted ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase text-[#48A6A5] tracking-widest">Feedback & Rating</div>
                  <h3 className="text-2xl font-black uppercase text-[#1F3449]">Rate Your Pal Companion</h3>
                  <p className="text-xs text-gray-600 font-light">Share your experience to help us continuously elevate patient care.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-gray-50 text-xs text-[#1F3449] p-3 rounded-xl border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-gray-50 text-xs text-[#1F3449] p-3 rounded-xl border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                    >
                      <option value="Patient" className="bg-white text-[#1F3449]">Patient</option>
                      <option value="Family Member" className="bg-white text-[#1F3449]">Family Member</option>
                      <option value="Hospital Staff" className="bg-white text-[#1F3449]">Hospital Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-gray-50 text-xs text-[#1F3449] p-3 rounded-xl border border-gray-300 focus:border-[#48A6A5] focus:outline-none font-bold text-amber-600"
                    >
                      <option value={5} className="bg-white text-[#1F3449]">★★★★★ (5 - Outstanding)</option>
                      <option value={4} className="bg-white text-[#1F3449]">★★★★☆ (4 - Great)</option>
                      <option value={3} className="bg-white text-[#1F3449]">★★★☆☆ (3 - Good)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Companion Pal Name</label>
                  <input
                    type="text"
                    required
                    value={palName}
                    onChange={(e) => setPalName(e.target.value)}
                    className="w-full bg-gray-50 text-xs text-[#1F3449] p-3 rounded-xl border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Feedback & Experience</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how your Pal helped you navigate the hospital..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-gray-50 text-xs text-[#1F3449] p-3 rounded-xl border border-gray-300 focus:border-[#48A6A5] focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#48A6A5] text-white font-black uppercase tracking-wider text-xs hover:bg-[#48A6A5]/90 shadow-md"
                >
                  Post Review & Rating
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#48A6A5]/10 border border-[#48A6A5] text-[#48A6A5] rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase text-[#1F3449]">Review Posted!</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto font-light">
                  Thank you! Your rating has been published and logged to your Pal's profile.
                </p>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="bg-[#48A6A5] text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-sm"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
