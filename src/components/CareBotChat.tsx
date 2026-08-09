import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, PhoneCall, Sparkles, ShieldCheck, HeartHandshake, Headphones } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isHumanRequest?: boolean;
}

const PRESET_TOPICS = [
  { label: '🤝 How matching works', prompt: 'How does PathPal pair patients with a Pal?' },
  { label: '💳 Costs & Coverage', prompt: 'What does a visit cost and is insurance accepted?' },
  { label: '🛡️ Safety & Vetting', prompt: 'How are Pals background checked and screened?' },
  { label: '📞 Talk to Human Manager', prompt: 'I want to speak with a human Care Coordinator' }
];

export const CareBotChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: 'Hello! I am PathPal CareBot 🤖. How can I help you today? Ask me about companion pairing, costs, safety screening, or request a live Human Coordinator!',
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHumanModal, setShowHumanModal] = useState(false);

  // Human Callback Form
  const [humanName, setHumanName] = useState('');
  const [humanPhone, setHumanPhone] = useState('');
  const [humanSubmitted, setHumanSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateBotResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    if (q.includes('human') || q.includes('person') || q.includes('talk') || q.includes('phone') || q.includes('speak')) {
      return 'I can connect you directly with a live PathPal Care Coordinator! Click the button below to request an instant call or chat transfer.';
    }

    if (q.includes('match') || q.includes('pair') || q.includes('choose') || q.includes('language')) {
      return 'PathPal pairs you based on your mobility requirements, primary language (English or Spanish), appointment location, and personal preferences. Pals meet you directly at the hospital entrance valet or lobby check-in.';
    }

    if (q.includes('cost') || q.includes('price') || q.includes('insurance') || q.includes('free') || q.includes('pay') || q.includes('voucher')) {
      return 'Single visits are $35 / escort, and monthly memberships are $49/mo. Most importantly, eligible health plan members receive PathPal at $0 cost via insurance benefit vouchers!';
    }

    if (q.includes('safe') || q.includes('check') || q.includes('vet') || q.includes('background') || q.includes('hipaa')) {
      return 'Safety is our #1 mandate. All Pals undergo 7-year criminal background checks, 10-panel drug screening, HIPAA privacy training, non-clinical de-escalation, and real-time geotagged check-ins during every visit.';
    }

    if (q.includes('hospital') || q.includes('discharge') || q.includes('epic') || q.includes('cerner')) {
      return 'We integrate directly with hospital discharge planning and social work teams! Hospitals use our Enterprise Portal to dispatch Pals for high-risk or anxious patients.';
    }

    return 'Thank you for reaching out! PathPal connects patients with trained, compassionate companions for hospital visits. Would you like to check pricing, learn about safety, or speak to a live Human Care Coordinator?';
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const isHumanReq = text.toLowerCase().includes('human') || text.toLowerCase().includes('speak') || text.toLowerCase().includes('talk');
      const botReplyText = generateBotResponse(text);

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHumanRequest: isHumanReq
      };

      setMessages(prev => [...prev, botMsg]);

      if (isHumanReq) {
        setShowHumanModal(true);
      }
    }, 800);
  };

  const handleHumanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHumanSubmitted(true);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#00F0FF] text-black font-black uppercase text-xs tracking-wider shadow-2xl hover:bg-[#00F0FF]/90 transition-all border border-white/20 glow-cyan animate-bounce"
          >
            <Bot className="w-5 h-5" />
            <span>Ask CareBot AI</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </button>
        ) : null}
      </div>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-[#121824] border border-[#00F0FF]/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-fade-in max-h-[600px] h-[85vh]">
          
          {/* Header */}
          <div className="bg-[#1A2232] p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">PathPal Assistant</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-gray-400 font-light">Instant answers & human hand-off</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Topic Chips */}
          <div className="p-2.5 bg-[#0A0D14] border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {PRESET_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(topic.prompt)}
                className="shrink-0 text-[10px] font-bold bg-[#1A2232] text-gray-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/40 border border-white/10 px-2.5 py-1 rounded-full transition-all"
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-light">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#00F0FF] text-black font-medium rounded-br-none'
                      : 'bg-[#1A2232] text-gray-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {m.text}

                  {m.isHumanRequest && (
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setShowHumanModal(true)}
                        className="w-full py-2 rounded-xl bg-companion-coral text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Connect with Human Coordinator</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400 text-[11px] italic p-2 bg-[#1A2232] rounded-xl w-32 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />
                <span>CareBot typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Connect Human Banner */}
          <div className="px-4 py-2 bg-[#1A2232]/80 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Need immediate live phone support?</span>
            <button
              onClick={() => setShowHumanModal(true)}
              className="text-[#00F0FF] font-bold uppercase hover:underline flex items-center gap-1"
            >
              <Headphones className="w-3 h-3" /> Live Human
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#121824] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question or request human support..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#1A2232] text-xs text-white px-3 py-2.5 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#00F0FF] text-black rounded-xl hover:bg-[#00F0FF]/90 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Human Support Modal */}
      {showHumanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#121824] rounded-3xl max-w-md w-full p-6 border border-[#00F0FF]/40 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowHumanModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {!humanSubmitted ? (
              <form onSubmit={handleHumanSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#00F0FF] tracking-widest">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>HUMAN CARE COORDINATOR</span>
                  </div>
                  <h3 className="text-xl font-black uppercase italic text-white">Request Live Call / Support</h3>
                  <p className="text-xs text-gray-300 font-light">
                    Enter your phone number below and a PathPal Care Specialist will call you within 3 minutes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={humanName}
                    onChange={(e) => setHumanName(e.target.value)}
                    className="w-full bg-[#1A2232] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number for Callback</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 019-2831"
                    value={humanPhone}
                    onChange={(e) => setHumanPhone(e.target.value)}
                    className="w-full bg-[#1A2232] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00F0FF] text-black font-black uppercase tracking-wider text-xs hover:bg-[#00F0FF]/90 shadow-md shadow-[#00F0FF]/20 flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Request Instant Callback</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-[#00F0FF]/20 text-[#00F0FF] rounded-full mx-auto flex items-center justify-center border border-[#00F0FF]">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-lg font-black uppercase italic text-white">Coordinator Dispatched!</h4>
                <p className="text-xs text-gray-300 font-light">
                  A live PathPal Care Specialist is calling <span className="text-[#00F0FF] font-bold">{humanPhone}</span> right now.
                </p>
                <button
                  onClick={() => setShowHumanModal(false)}
                  className="px-5 py-2 rounded-xl bg-white/10 text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
