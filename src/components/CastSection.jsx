import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function CastSection({ cast, loading = false }) {
  const scrollContainerRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 500);
    }
  };

  if (loading) {
    return (
      <section className="mt-16 mb-12">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Top Cast</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 text-center animate-pulse">
              <div className="mb-3 rounded-lg aspect-[3/4] bg-white/10" />
              <div className="h-4 bg-white/10 rounded mx-2 mb-2" />
              <div className="h-3 bg-white/5 rounded mx-4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!cast || cast.length === 0) return null;

  const castList = Array.isArray(cast) ? cast : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 mb-12"
    >
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Top Cast({castList.length})</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full" />
      </div>

      <div className="relative group">
        {/* Cast Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          onScroll={checkScroll}
        >
          {castList.map((actor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className="flex-shrink-0 w-44 group/card text-center cursor-pointer"
            >
              {/* Actor Image */}
              <div className="mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-white/10 aspect-[3/4] relative">
                {actor.image || actor.img || actor.photo ? (
                  <img
                    src={actor.image || actor.img || actor.photo}
                    alt={actor.name || actor.actor}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600/20 to-purple-600/20">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
              </div>

              {/* Actor Info */}
              <div className="px-1">
                <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">
                  {actor.name || actor.actor}
                </h3>

                {(actor.character || actor.role || actor.characterName) && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {actor.character || actor.role || actor.characterName}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-32 w-16 bg-gradient-to-l from-black/60 to-transparent flex items-center justify-center text-white hover:from-black/80 transition-all rounded-r-lg opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Scroll cast right"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </motion.section>
  );
}
