export default function HeroArrows({ onPrev, onNext, visible }) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-8 right-8 z-30 flex gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous slide"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/50 text-xl text-white backdrop-blur-md transition-all hover:bg-black/70 hover:border-white/30 hover:scale-105"
      >
        ◀
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next slide"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/50 text-xl text-white backdrop-blur-md transition-all hover:bg-black/70 hover:border-white/30 hover:scale-105"
      >
        ▶
      </button>
    </div>
  );
}
