import React from 'react';
import { Keyboard, X, Navigation, MapPin, Heart, HelpCircle, Check, Info } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: "Main Page Navigation",
      items: [
        { keys: ["Alt", "1"], label: "Go to Home Page" },
        { keys: ["Alt", "2"], label: "Go to Patient & Family Portal" },
        { keys: ["Alt", "3"], label: "Go to Companion Pal Portal" },
        { keys: ["Alt", "4"], label: "Go to Admin Portal" },
        { keys: ["Alt", "5"], label: "Go to About Us & Mission" },
      ]
    },
    {
      category: "Quick Actions & Tools",
      items: [
        { keys: ["Alt", "R"], label: "Request a Companion Pal" },
        { keys: ["Alt", "G"], label: "Open Live Indoor GPS Radar" },
        { keys: ["Alt", "K"], label: "Open Keyboard Accessibility Guide" },
        { keys: ["Esc"], label: "Close active modal / dialog" },
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-modal-title"
    >
      <div className="bg-[#1F3449] rounded-3xl border-2 border-[#48A6A5]/40 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#48A6A5]/20 text-[#48A6A5] border border-[#48A6A5]/40">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#48A6A5] tracking-widest bg-[#48A6A5]/10 px-2 py-0.5 rounded border border-[#48A6A5]/20">
                WCAG 2.1 AA ACCESSIBILITY
              </span>
              <h2 id="keyboard-modal-title" className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Keyboard Navigation Shortcuts
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Close shortcuts guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <p className="text-xs text-gray-300 leading-relaxed font-normal bg-[#2B425B] p-3.5 rounded-2xl border border-white/10 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#48A6A5] shrink-0" />
          <span>
            PathPal includes universal keyboard shortcuts for rapid hospital assistance and effortless navigation without requiring a mouse.
          </span>
        </p>

        {/* Shortcut Groups */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 bg-[#2B425B] border-white/10 hover:border-[#48A6A5]/40"
                  >
                    <span className="text-xs text-gray-200 font-medium leading-tight">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded-lg text-xs font-mono font-black border shadow-inner bg-black/60 text-[#48A6A5] border-[#48A6A5]/40"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-[#48A6A5] hover:bg-[#48A6A5]/90 text-white font-black text-xs uppercase px-6 py-3 rounded-xl transition-all"
          >
            Got It (Esc)
          </button>
        </div>

      </div>
    </div>
  );
};
