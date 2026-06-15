import { useState, useRef } from 'react';

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function AudioLanguageSelector({ dubs = [], selectedDub, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!dubs.length) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="audio-language-btn"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        {selectedDub?.lanName || 'Audio'}
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 min-w-[180px] bg-[#1e1e42]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in" id="audio-language-dropdown">
            <div className="p-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a5a8a] px-3 py-1.5">
                Audio Language
              </p>
              {dubs.map((dub) => {
                const isSelected = selectedDub?.subjectId === dub.subjectId;
                return (
                  <button
                    key={dub.subjectId}
                    onClick={() => {
                      onChange(dub);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-[#6366f1]/20 text-white'
                        : 'text-[#b0b0d0] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <span className="text-[#6366f1]"><CheckIcon /></span>
                    ) : (
                      <span className="ml-5" />
                    )}
                    {dub.lanName}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
