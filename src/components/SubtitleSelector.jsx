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

const SubtitleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 16V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
    <path d="M7 20h10" />
    <path d="M9 16v4" /><path d="M15 16v4" />
    <path d="M5 10h2" /><path d="M5 14h4" /><path d="M13 14h6" /><path d="M11 10h8" />
  </svg>
);

export default function SubtitleSelector({ captions = [], selectedCaption, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelectNone = () => {
    onSelect(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="subtitle-selector-btn"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
      >
        <SubtitleIcon />
        {selectedCaption ? selectedCaption.lanName || selectedCaption.lan : 'Subtitles'}
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 min-w-[180px] bg-[#1e1e42]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in" id="subtitle-dropdown">
            <div className="p-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a5a8a] px-3 py-1.5">
                Subtitles
              </p>

              {/* Off option */}
              <button
                onClick={handleSelectNone}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  !selectedCaption
                    ? 'bg-[#6366f1]/20 text-white'
                    : 'text-[#b0b0d0] hover:bg-white/5 hover:text-white'
                }`}
              >
                {!selectedCaption ? (
                  <span className="text-[#6366f1]"><CheckIcon /></span>
                ) : (
                  <span className="ml-5" />
                )}
                Off
              </button>

              {/* Language options */}
              {captions.map((caption) => {
                const isSelected = selectedCaption?.lan === caption.lan;
                return (
                  <button
                    key={caption.lan}
                    onClick={() => {
                      onSelect(caption);
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
                    {caption.lanName || caption.lan}
                  </button>
                );
              })}

              {captions.length === 0 && (
                <p className="px-3 py-2 text-xs text-[#5a5a8a]">No subtitles available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
