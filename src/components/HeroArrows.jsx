export default function HeroArrows({ onPrev, onNext, visible }) {
  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-2xl text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105"
      >
        ◀
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-2xl text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105"
      >
        ▶
      </button>
    </>
  );
}
