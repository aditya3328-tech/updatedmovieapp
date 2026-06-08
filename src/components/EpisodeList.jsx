import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function EpisodeList({
  subjectId,
  seasonNumbers = [],
  episodesBySeason = {},
  loadSeason,
  loadingSeason,
}) {
  const [selectedSeason, setSelectedSeason] = useState(seasonNumbers[0] || 1);

  useEffect(() => {
    if (seasonNumbers.length > 0 && !seasonNumbers.includes(selectedSeason)) {
      setSelectedSeason(seasonNumbers[0]);
    }
  }, [seasonNumbers, selectedSeason]);

  useEffect(() => {
    if (selectedSeason && loadSeason) {
      loadSeason(selectedSeason);
    }
  }, [selectedSeason, loadSeason]);

  const episodes = episodesBySeason[selectedSeason] || [];
  const isLoading = loadingSeason === selectedSeason && episodes.length === 0;

  useEffect(() => {
    if (episodes.length > 0) {
      console.log('[EpisodeList] Episodes loaded:', episodes);
      episodes.forEach((ep) => {
        console.log(`Episode ${ep.episodeNumber}:`, {
          name: ep.name,
          thumbnail: ep.thumbnail,
          hasOverview: !!ep.overview,
        });
      });
    }
  }, [episodes]);

  if (seasonNumbers.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mb-12"
      id="episodes-section"
    >
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Episodes</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full" />
      </div>

      <div className="mb-6">
        <label htmlFor="detail-season-select" className="sr-only">
          Select season
        </label>
        <select
          id="detail-season-select"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="px-4 py-2.5 rounded-lg glass border border-white/10 text-white text-sm font-semibold bg-black/40 focus:outline-none focus:border-red-600/50"
        >
          {seasonNumbers.map((season) => (
            <option key={season} value={season}>
              Season {season}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl glass border border-white/10 overflow-hidden animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-3 bg-white/5 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : episodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((ep) => (
            <Link
              key={ep.episodeNumber}
              to={`/watch/${subjectId}?season=${selectedSeason}&episode=${ep.episodeNumber}`}
              className="group rounded-xl glass border border-white/10 overflow-hidden hover:border-red-600/40 transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800/60 to-gray-900/60 overflow-hidden">
                {ep.thumbnail ? (
                  <img
                    src={ep.thumbnail}
                    alt={ep.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-white/30">
                    E{ep.episodeNumber}
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-red-400 mb-1">
                  Episode {ep.episodeNumber}
                </p>
                <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-red-300 transition-colors">
                  {ep.name}
                </h3>
                {ep.overview && (
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {ep.overview}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No episode metadata available for this season.</p>
      )}
    </motion.section>
  );
}
