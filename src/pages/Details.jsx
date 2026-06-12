import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader, { SkeletonDetail } from '../components/Loader';
import MovieRow from '../components/MovieRow';
import { usePlayerContext } from '../context/PlayerContext';
import movieService from '../services/movieService';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

/* SVG Icons */
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#E50914' : 'none'} stroke={filled ? '#E50914' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export default function Details() {
  const { id } = useParams();
  const { toggleFavorite, isFavorite } = usePlayerContext();

  const [details, setDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [error, setError] = useState(null);

  const favorited = isFavorite(id);

  /* Fetch details */
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await movieService.getDetails(id);
        console.log("[Details] DETAIL PAGE MOVIE:", data);
        console.log("[Details] Movie info:", {
          id: data?.subjectId,
          title: data?.title,
          detailPath: data?.detailPath,
          subjectType: data?.subjectType
        });
        setDetails(data);
      } catch (err) {
        setError('Failed to load details.');
        console.error('[Details] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  /* Fetch recommendations */
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setRecLoading(true);
        const items = await movieService.getRecommendations(id);
        setRecommendations(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('[Details] Recommendations error:', err);
        try {
          const fallback = await movieService.getRankingContent('4516404531735022304', 1, 12);
          setRecommendations(fallback?.subjectList || []);
        } catch {
          setRecommendations([]);
        }
      } finally {
        setRecLoading(false);
      }
    };

    if (id) fetchRecs();
  }, [id]);

  const handleFavorite = () => {
    if (details) {
      toggleFavorite({
        subjectId: details.subjectId || id,
        title: details.title,
        cover: details.cover || { url: details.coverUrl },
        imdbRatingValue: details.imdbRatingValue,
        detailPath: details.detailPath,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: details?.title || 'CinemaDDA',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch { }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[90px] md:pt-[80px] pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SkeletonDetail />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-[90px] md:pt-[80px] pb-24 flex items-center justify-center px-4"
      >
        <div className="text-center glass rounded-lg p-12">
          <p className="text-6xl mb-4">😞</p>
          <h2 className="text-2xl font-bold text-white mb-3">Error Loading Details</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </motion.div>
    );
  }
  console.log(details);
  console.log(details.stars);

  const title = details?.title;

  const poster =
    details?.cover?.url;

  const rating =
    details?.imdbRatingValue;

  const description =
    details?.description;

  const genres =
    details?.genre?.split(",") || [];

  const releaseDate =
    details?.releaseDate;
    
console.log(details.dubs)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-24"
      id="details-page"
    >
      {/* Backdrop with Overlay */}
      <div className="relative h-80 sm:h-96 lg:h-[420px] overflow-hidden -mb-24 sm:-mb-32 lg:-mb-40">
        {poster && (
          <video
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          >
            <source
              src={details?.trailer?.videoAddress?.url}
              type="video/mp4"
            />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 md:top-24 left-4 sm:left-6 z-10"
        >
          <Link to="/" className="btn-icon">
            <BackIcon />
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 mb-12"
        >
          {/* Poster Card */}
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-40 sm:w-48 aspect-[2/3] rounded-lg overflow-hidden glass shadow-2xl border border-white/10"
            >
              {poster ? (
                <img
                  src={poster}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700/40 to-gray-800/40 flex items-center justify-center text-4xl">
                  🎬
                </div>
              )}
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="flex-1 pt-2">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 leading-tight"
            >
              {title}
            </motion.h1>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center gap-3 mb-5"
            >
              {rating && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-amber-500/30 text-sm">
                  <StarIcon />
                  <span className="font-bold text-amber-400">{rating}</span>
                </div>
              )}
              {releaseDate && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 text-sm">
                  <CalendarIcon />
                  <span className="text-gray-300">{releaseDate}</span>
                </div>
              )}
            </motion.div>

            {/* Genres */}
            {Array.isArray(genres) && genres.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 mb-5"
              >
                {genres.slice(0, 5).map((genre, i) => {
                  const genreName = typeof genre === 'string' ? genre : genre.name || genre.label;
                  return (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-red-600/20 text-red-300 text-xs font-semibold border border-red-600/30"
                    >
                      {genreName}
                    </span>
                  );
                })}
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl line-clamp-3"
            >
              {description}
            </motion.p>
{details?.dubs?.length > 0 && (
  <div className="mb-6">
    <h3 className="text-white text-xl font-bold mb-3">
      🌐 Available Languages
      <span className="text-gray-400 ml-2 text-base">
        ({details.dubs.length})
      </span>
    </h3>

    <div className="flex flex-wrap gap-2">
      {details.dubs.map((dub) => (
        <span
          key={dub.lanName}
          className="
            px-3 py-1
            rounded-full
            bg-red-500/10
            border border-red-500/20
            text-red-300
            text-sm
            font-medium
          "
        >
          {dub.lanName}
        </span>
      ))}
    </div>
  </div>
)}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                to={`/watch/${details?.subjectId || id}`}
                id="watch-now-btn"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-6 py-3"
                >
                  <PlayIcon /> Watch Now
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                id="detail-favorite-btn"
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold border transition-all text-sm ${favorited
                  ? 'bg-red-600/20 border-red-600/50 text-red-400'
                  : 'glass border-white/10 text-white hover:bg-white/10'
                  }`}
              >
                <HeartIcon filled={favorited} />
                {favorited ? 'Favorited' : 'Favorite'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                id="detail-share-btn"
                className="flex items-center gap-2 px-5 py-3 glass rounded-lg font-semibold text-white border border-white/10 hover:bg-white/10 text-sm transition-all"
              >
                <ShareIcon /> Share
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      {details?.stars?.length > 0 && (
  <section className="mb-12">
    <h2 className="text-3xl font-black text-white mb-6">
      Cast
    </h2>

    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={16}
      slidesPerView={2.2}
      breakpoints={{
        640: {
          slidesPerView: 3.2,
        },
        768: {
          slidesPerView: 4.2,
        },
        1024: {
          slidesPerView: 5.2,
        },
        1280: {
          slidesPerView: 6.2,
        },
      }}
    >
      {details.stars.map((actor) => (
        <SwiperSlide key={actor.staffId}>
          <Link
            to={`/staff/${actor.staffId}`}
            className="block group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">
              <img
                src={
                  actor.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    actor.name
                  )}`
                }
                alt={actor.name}
                className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition duration-300"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                <h4 className="text-white font-semibold text-sm line-clamp-1">
                  {actor.name}
                </h4>

                {actor.character && (
                  <p className="text-gray-300 text-xs line-clamp-1">
                    {actor.character}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
)}

        {/* Similar Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          id="recommendations-section"
        >
          <MovieRow
            title="More Like This"
            movies={recommendations}
            isLoading={recLoading}
          />
        </motion.section>
      </div>
    </motion.div>
  );
}
