export default function HeroDots({ count, current, onSelect }) {
  if (count <= 1) return null;

  return (
    <div
      className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2"
      role="tablist"
      aria-label="Hero carousel pagination"
    >
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === current}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => onSelect(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === current
              ? "w-8 bg-white"
              : "w-2 bg-white/40 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  );
}
