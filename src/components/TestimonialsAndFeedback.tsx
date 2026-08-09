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

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'f-1',
    authorName: 'Margaret Reynolds',
    role: 'Patient',
    rating: 5,
    comment: 'Navigating the Metro Health pavilion in a wheelchair used to panic me. Pal Elena was waiting right at the valet desk, took me through radiology and pharmacy, and held my hand during a scary diagnosis.',
    hospital: 'Metro Health Medical Center',
    date: 'July 29, 2026',
    palName: 'Elena Rostova',
    verified: true
  },
  {
    id: 'f-2',
    authorName: 'David K. (Son)',
    role: 'Family Member',
    rating: 5,
    comment: 'I live 400 miles away in Boston and couldn’t accompany my 82-year-old father to his cardiology follow-up. PathPal sent real-time updates and SMS check-ins. It gave our family total peace of mind.',
    hospital: 'St. Jude Regional Health Center',
    date: 'July 26, 2026',
    palName: 'Marcus Chen',
    verified: true
  },
  {
    id: 'f-3',
    authorName: 'Dr. Sarah Jenkins, Chief of Patient Experience',
    role: 'Hospital Staff',
    rating: 5,
    comment: 'PathPal reduced our outpatient no-show rate by 42% in 60 days! Patients arrive on time, calm, and prepared. It’s an invaluable asset for HCAHPS scores.',
    hospital: 'Valley Care Community Hospital',
    date: 'July 22, 2026',
    palName: 'PathPal System',
    verified: true
  }
];

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
  const [palName, setPalName] = useState('Elena Rostova');
  const [hospital, setHospital] = useState('Metro Health Medical Center');
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
    <section id="feedback" className="py-24 bg-[#1F3449] border-t border-white/10 relative overflow-hidden text-white">
      {/* Background Backlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#48A6A5]/10 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#48A6A5]/20 border border-[#48A6A5]/40 text-[#48A6A5] text-xs font-bold uppercase tracking-[0.25em]">
            <Star className="w-4 h-4 fill-[#48A6A5]" />
            <span>PATIENT & PAL REVIEWS</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-none text-white">
            VOICES OF <br />
            <span className="text-[#48A6A5]">CARE & GRATITUDE.</span>
          </h2>
          <p className="text-sm text-gray-300 font-light max-w-2xl mx-auto">
            Read verified reviews from patients, distant family members, and hospital leaders. Pals can also access their personal dashboard to track ratings and feedback.
          </p>
        </div>

        {/* Top Action Bar & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#2B425B] p-4 rounded-2xl border border-white/10">
          
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
                    ? 'bg-[#48A6A5] text-white font-extrabold shadow-lg shadow-[#48A6A5]/20'
                    : 'bg-[#1F3449] text-gray-300 hover:bg-white/10'
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
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#48A6A5] text-white text-xs font-black uppercase tracking-wider hover:bg-[#48A6A5]/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#48A6A5]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Review</span>
            </button>

            <button
              onClick={onOpenPalAccount}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#1F3449] border border-[#48A6A5]/40 text-[#48A6A5] text-xs font-bold uppercase tracking-wider hover:bg-[#48A6A5]/10 transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Pal Account Portal</span>
            </button>
          </div>

        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredFeedbacks.map((f) => (
            <div key={f.id} className="bg-[#2B425B] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-[#48A6A5]/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-warm-gold text-xs">
                    {'★'.repeat(f.rating)}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{f.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 font-light italic leading-relaxed">
                  "{f.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{f.authorName}</span>
                  <span className="bg-[#48A6A5]/20 text-[#48A6A5] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#48A6A5]/30">
                    {f.role}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-light flex items-center justify-between">
                  <span>Companion: {f.palName}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Visit
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#1F3449] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#48A6A5]/40 shadow-2xl relative">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-white/10"
            >
              ✕
            </button>

            {!submitted ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase text-[#48A6A5] tracking-widest">Feedback & Rating</div>
                  <h3 className="text-2xl font-black uppercase text-white">Rate Your Pal Companion</h3>
                  <p className="text-xs text-gray-300 font-light">Share your experience to help us continuously elevate patient care.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-[#2B425B] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#48A6A5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Your Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#2B425B] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#48A6A5] focus:outline-none"
                    >
                      <option value="Patient" className="bg-[#1F3449]">Patient</option>
                      <option value="Family Member" className="bg-[#1F3449]">Family Member</option>
                      <option value="Hospital Staff" className="bg-[#1F3449]">Hospital Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Rating (1 to 5 Stars)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-[#2B425B] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#48A6A5] focus:outline-none font-bold text-warm-gold"
                    >
                      <option value={5} className="bg-[#1F3449]">★★★★★ (5 - Outstanding)</option>
                      <option value={4} className="bg-[#1F3449]">★★★★☆ (4 - Great)</option>
                      <option value={3} className="bg-[#1F3449]">★★★☆☆ (3 - Good)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Companion Pal Name</label>
                  <input
                    type="text"
                    required
                    value={palName}
                    onChange={(e) => setPalName(e.target.value)}
                    className="w-full bg-[#2B425B] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#48A6A5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Your Feedback & Experience</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how your Pal helped you navigate the hospital..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[#2B425B] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#48A6A5] focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#48A6A5] text-white font-black uppercase tracking-wider text-xs hover:bg-[#48A6A5]/90 shadow-md shadow-[#48A6A5]/20"
                >
                  Post Review & Rating
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#48A6A5]/20 border border-[#48A6A5] text-[#48A6A5] rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase text-white">Review Posted!</h3>
                <p className="text-xs text-gray-300 max-w-sm mx-auto font-light">
                  Thank you! Your rating has been published and logged to your Pal's profile.
                </p>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="bg-[#48A6A5] text-white text-xs font-black uppercase px-6 py-3 rounded-xl"
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
