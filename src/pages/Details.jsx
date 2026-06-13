import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader, { SkeletonDetail } from '../components/Loader';
import MovieRow from '../components/MovieRow';
import { usePlayerContext } from '../context/PlayerContext';
import movieService from '../services/movieService';
import {
  fallbackToOriginalImage,
  getOptimizedImageProps,
} from '../utils/imageOptimizer';

/* SVG Icons */
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
);
const AppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
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
const MutedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const favorited = isFavorite(id);

  useEffect(() => {
    document.body.classList.add('details-page-active');

    return () => {
      document.body.classList.remove('details-page-active');
    };
  }, []);

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
  const posterImage = getOptimizedImageProps(poster, "poster");

  const rating =
    details?.imdbRatingValue;

  const description =
    details?.description;

  const genres =
    details?.genre?.split(",") || [];

  const releaseDate =
    details?.releaseDate;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const typeLabel =
    details?.subjectType === 2
      ? 'TV Series'
      : details?.subjectType === 1
        ? 'Movie'
        : 'Title';
  const country = details?.countryName || details?.country || details?.area;
  const bannerImage = getOptimizedImageProps(poster, "banner");
  const trailerUrl = details?.trailer?.videoAddress?.url;
  const watchInAppUrl = details?.detailPath
    ? `https://movie-box.co/movies/${details.detailPath}?id=${details?.subjectId || id}`
    : 'https://movie-box.co';
  const descriptionLimit = 120;
  const shownDescription =
    descriptionExpanded || !description || description.length <= descriptionLimit
      ? description
      : `${description.slice(0, descriptionLimit).trim()}...`;

  console.log(details.dubs)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-24"
      id="details-page"
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1840px] mx-auto pt-[92px] md:pt-[116px] relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative mb-10 min-h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/90 shadow-[0_32px_90px_rgba(0,0,0,0.72)] md:h-[calc(100vh-132px)] md:min-h-[600px] md:max-h-[700px]"
        >
          <div className="absolute inset-0">
            {trailerUrl ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                controls
                poster={posterImage.src}
                className="h-full w-full scale-110 object-cover opacity-70 brightness-70 saturate-110"
              >
                <source src={trailerUrl} type="video/mp4" />
              </video>
            ) : poster ? (
              <img
                src={bannerImage.src}
                alt=""
                width={bannerImage.width}
                height={bannerImage.height}
                loading="eager"
                decoding="async"
                className="h-full w-full scale-110 object-cover opacity-90 brightness-110 saturate-110"
                onError={(event) => fallbackToOriginalImage(event, poster)}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
            )}
            <div className="absolute inset-0 bg-black/[0.55]" />
          </div>

          <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
            <Link to="/" className="btn-icon bg-black/35 backdrop-blur-md">
              <BackIcon />
            </Link>
          </div>

          <div className="relative z-10 flex min-h-[620px] items-center justify-center px-5 py-10 pt-24 sm:px-8 md:h-full md:min-h-[600px] md:px-12 lg:px-16 xl:px-20">
            <div className="flex w-full max-w-[1180px] flex-col items-center gap-8 md:h-[460px] md:flex-row md:items-stretch md:gap-12 lg:gap-16">
            <motion.div
              whileHover={{ scale: 1.025 }}
              className="h-[300px] w-[200px] shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-zinc-900 shadow-[0_18px_42px_rgba(0,0,0,0.62)] transition-transform duration-500 sm:h-[330px] sm:w-[220px] md:h-full md:w-[307px]"
            >
              {poster ? (
                <img
                  src={posterImage.src}
                  alt={title}
                  width={posterImage.width}
                  height={posterImage.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[2/3] h-full w-full object-cover"
                  onError={(event) => fallbackToOriginalImage(event, poster)}
                />
              ) : (
                <div className="flex aspect-[2/3] h-full w-full items-center justify-center bg-gradient-to-br from-gray-700/40 to-gray-800/40 text-4xl">
                  ðŸŽ¬
                </div>
              )}
            </motion.div>

            <div className="flex h-full w-full min-w-0 max-w-[760px] flex-1 flex-col justify-between p-5 sm:p-6 md:p-7">
              <div className="min-w-0">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-3 max-w-[760px] text-4xl font-black leading-[1.02] tracking-normal text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.65)] sm:text-5xl md:line-clamp-2 md:text-[46px] lg:text-[58px]"
              >
                {title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-base font-semibold text-zinc-200 md:text-lg"
              >
                {rating && (
                  <div className="inline-flex w- justify-center items-center gap-2 rounded-lg border border-amber-400/[0.35] bg-amber-500/10 px-3 py-1.5 text-amber-200 shadow-[0_10px_30px_rgba(245,158,11,0.12)]">
                    <StarIcon />
                    <span>{rating}</span>
                  </div>
                )}
                {releaseYear && <span>{releaseYear}</span>}
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-base text-white">{typeLabel}</span>
                {country && <span>{country}</span>}
              </motion.div>

              {Array.isArray(genres) && genres.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 flex gap-2.5"
                >
                  {genres.slice(0, 5).map((genre, i) => {
                    const genreName = typeof genre === 'string' ? genre : genre.name || genre.label;
                    return (
                      <span
                        key={i}
                        className="rounded w-16 text-center border border-white/[0.18] bg-black/30 px-4 py-4 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-colors hover:bg-white/[0.12]"
                      >
                        {genreName}
                      </span>
                    );
                  })}
                </motion.div>
              )}

              {description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mb-4 max-w-[600px]"
                >
                  <p className="text-base font-medium leading-7 text-zinc-200/90 md:text-lg md:leading-8">
                    {shownDescription}
                  </p>
                  {description.length > descriptionLimit && (
                    <button
                      type="button"
                      onClick={() => setDescriptionExpanded((value) => !value)}
                      className="mt-1 inline-flex text-sm font-bold text-white/90 hover:text-white"
                    >
                      {descriptionExpanded ? 'Less' : 'More'}
                    </button>
                  )}
                </motion.div>
              )}

              {details?.dubs?.length > 0 && (
                <div className="w-full max-w-[1000px]">
                  <h3 className="mb-2.5 text-sm font-bold tracking-normal text-white">
                    Available Languages
({details.dubs.length})
                   
                  </h3>

                  <div className="flex max-h-[100px] max-w-[1000px] flex-wrap gap-1.5 overflow-hidden">
                    {details.dubs.map((dub) => (
                      <span
                        key={dub.lanName}
                        className="inline-flex h-8 w-30  justify-center cursor-default items-center rounded-full border border-white/10 bg-black/25 px-3.5 text-sm font-semibold tracking-normal text-zinc-100 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        {dub.lanName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-5 flex flex-wrap items-center gap-4 md:flex-nowrap"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
                  <Link
                    to={`/watch/${details?.subjectId || id}`}
                    id="watch-now-btn"
                    className="flex h-12 w-40 items-center justify-center gap-2.5  rounded-xl bg-[#E50914]  text-base font-extrabold text-white shadow-[0_16px_38px_rgba(229,9,20,0.48)] transition-all hover:bg-[#ff1f2d] hover:shadow-[0_20px_52px_rgba(229,9,20,0.62)]"
                  >
                    <PlayIcon /> Watch Online
                  </Link>
                </motion.div>

                {trailerUrl && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 w-28 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.08] px-6 text-base font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/15"
                  >
                    <PlayIcon /> Trailer
                  </motion.a>
                )}

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={watchInAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-40 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.08] px-6 text-base font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/15"
                >
                  <AppIcon /> Watch in App
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavorite}
                  id="detail-favorite-btn"
                  className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all ${favorited
                    ? 'border-red-500/40 bg-red-500/15 text-red-400'
                    : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                    }`}
                  aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  title={favorited ? 'Favorited' : 'Favorite'}
                >
                  <HeartIcon filled={favorited} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  id="detail-share-btn"
                  className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/15"
                  aria-label="Share"
                  title="Share"
                >
                  <ShareIcon />
                </motion.button>
              </motion.div>
            </div>
            </div>
          </div>

          <button
            type="button"
            className="absolute bottom-6 right-6 z-20 hidden h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white md:inline-flex"
            aria-label="Video is muted"
            title="Muted"
          >
            <MutedIcon />
          </button>
        </motion.div>
        {false && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 mb-12 bg-zinc-950/50 backdrop-blur-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl"
        >
          {/* Poster Card */}
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-32 sm:w-36 md:w-40 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
            >
              {poster ? (
                <img
                  src={posterImage.src}
                  alt={title}
                  width={posterImage.width}
                  height={posterImage.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(event) => fallbackToOriginalImage(event, poster)}
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
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 leading-snug"
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
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm font-semibold">
                  <StarIcon />
                  <span className="font-bold text-amber-400">{rating}</span>
                </div>
              )}
              {releaseDate && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
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
                      className="px-3 py-1 rounded-full bg-red-950/20 border border-red-900/20 text-red-400 text-[11px] font-bold uppercase tracking-wider"
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
              className="text-zinc-400 text-sm md:text-[15px] leading-relaxed mb-8 max-w-[850px]"
            >
              {description}
            </motion.p>

            {details?.dubs?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-white text-lg font-bold mb-3 tracking-tight">
                  🌐 Available Languages
                  <span className="text-zinc-500 ml-2 text-sm">
                    ({details.dubs.length})
                  </span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {details.dubs.map((dub) => (
                    <span
                      key={dub.lanName}
                      className="
                        px-3.5 py-1.5
                        rounded-full
                        bg-red-950/20
                        border border-red-900/20
                        text-red-300
                        text-xs
                        font-semibold
                        tracking-wide
                        cursor-default
                        hover:bg-red-900/20
                        transition-colors
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
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-lg bg-[#E50914] text-white hover:bg-[#FF1B2D] transition-all font-bold text-base shadow-[0_4px_15px_rgba(229,9,20,0.4)] hover:shadow-[0_6px_20px_rgba(229,9,20,0.6)] cursor-pointer"
                >
                  <PlayIcon /> Watch Now
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                id="detail-favorite-btn"
                className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold border transition-all text-sm cursor-pointer shadow-md ${favorited
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
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
                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-lg font-semibold text-white hover:bg-white/10 text-sm transition-all shadow-md cursor-pointer"
              >
                <ShareIcon /> Share
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
        )}
        {details?.stars?.length > 0 && (
          <section className="mb-14">
            <p className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.1em] text-zinc-400">
              Top Cast ({details.stars.length})
            </p>

            <div className="flex gap-4 overflow-x-auto px-1 pb-4 pt-2 [scrollbar-color:rgba(255,255,255,0.1)_transparent] [scrollbar-width:thin]">
              {details.stars.map((actor) => (
                <Link
                  key={actor.staffId}
                  to={`/staff/${actor.staffId}`}
                  className="group w-[130px] shrink-0 scroll-ml-1 text-left no-underline transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <div className="mb-2 aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 transition-all duration-300 group-hover:border-cyan-400/60 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(0,194,255,0.15)]">
                    <img
                      {...getOptimizedImageProps(
                        actor.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            actor.name
                          )}`,
                        "avatar"
                      )}
                      alt={actor.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onError={(event) => fallbackToOriginalImage(event, actor.avatarUrl)}
                    />
                  </div>

                  <div className="w-full px-0.5">
                    <p className="truncate text-sm font-semibold leading-snug text-white">
                      {actor.name}
                    </p>

                    {actor.character && (
                      <p className="mt-1 truncate text-xs leading-snug text-zinc-400">
                        {actor.character}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
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
