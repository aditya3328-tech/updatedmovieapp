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

export default function QualitySelector({ streams = [], selectedStream, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!streams.length) return null;

  const sortedStreams = [...streams].sort(
    (a, b) => parseInt(b.resolutions || '0') - parseInt(a.resolutions || '0')
  );

  const getQualityLabel = (resolution) => {
    const res = parseInt(resolution || '0');
    if (res >= 1080) return '1080p HD';
    if (res >= 720) return '720p HD';
    if (res >= 480) return '480p';
    if (res >= 360) return '360p';
    return `${resolution}p`;
  };

  const getQualityBadge = (resolution) => {
    const res = parseInt(resolution || '0');
    if (res >= 1080) return 'HD';
    if (res >= 720) return 'HD';
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="quality-selector-btn"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
        </svg>
        {selectedStream ? getQualityLabel(selectedStream.resolutions) : 'Quality'}
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 min-w-[180px] bg-[#1e1e42]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-fade-in" id="quality-dropdown">
            <div className="p-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a5a8a] px-3 py-1.5">
                Video Quality
              </p>
              {sortedStreams.map((stream) => {
                const isSelected = selectedStream?.id === stream.id;
                const badge = getQualityBadge(stream.resolutions);

                return (
                  <button
                    key={stream.id}
                    onClick={() => {
                      onSelect(stream);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-[#6366f1]/20 text-white'
                        : 'text-[#b0b0d0] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="text-[#6366f1]">
                        <CheckIcon />
                      </span>
                    )}
                    <span className={isSelected ? '' : 'ml-5'}>
                      {getQualityLabel(stream.resolutions)}
                    </span>
                    {badge && (
                      <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-1.5 py-0.5 rounded">
                        {badge}
                      </span>
                    )}
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
