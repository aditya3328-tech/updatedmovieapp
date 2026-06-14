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

/* ── Icons ── */
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const AppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#E50914' : 'none'} stroke={filled ? '#E50914' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
  const [expanded, setExpanded] = useState(false);

  const favorited = isFavorite(id);

  /* Fetch details */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await movieService.getDetails(id);
        setDetails(data);
      } catch (err) {
        setError('Failed to load details.');
        console.error('[Details]', err);
      } finally {
        setLoading(false);
      }
    };
    run();
    window.scrollTo(0, 0);
  }, [id]);

  /* Fetch recommendations */
  useEffect(() => {
    const run = async () => {
      try {
        setRecLoading(true);
        const items = await movieService.getRecommendations(id);
        setRecommendations(Array.isArray(items) ? items : []);
      } catch {
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
    if (id) run();
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
        await navigator.share({ title: details?.title || 'CinemaDDA', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch { }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="dp-shell">
        <SkeletonDetail />
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !details) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dp-shell dp-error-shell">
        <div className="dp-error-box">
          <span className="dp-error-emoji">😞</span>
          <h2>Couldn't Load This Title</h2>
          <p>{error || 'Content not found.'}</p>
          <Link to="/" className="dp-back-home">Go Home</Link>
        </div>
      </motion.div>
    );
  }

  /* ── Derived values ── */
  const poster       = details?.cover?.url;
  const posterImg    = getOptimizedImageProps(poster, 'poster');
  const bannerImg    = getOptimizedImageProps(poster, 'banner');
  const trailerUrl   = details?.trailer?.videoAddress?.url;
  const title        = details?.title || '';
  const rating       = details?.imdbRatingValue;
  const description  = details?.description || '';
  const genres       = (details?.genre || '').split(',').map(g => g.trim()).filter(Boolean);
  const releaseDate  = details?.releaseDate;
  const releaseYear  = releaseDate ? String(releaseDate).slice(0, 4) : null;
  const country      = details?.countryName || details?.country || details?.area || '';
  const typeLabel    = details?.subjectType === 1 ? 'Movie' : details?.subjectType === 2 ? 'TV Series' : 'Title';
  const watchInAppUrl = details?.detailPath
    ? `https://movie-box.co/movies/${details.detailPath}?id=${details?.subjectId || id}`
    : 'https://movie-box.co';
  const CLAMP = 200;
  const descShown = expanded || description.length <= CLAMP
    ? description
    : description.slice(0, CLAMP).trimEnd() + '…';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="dp-shell"
    >
      {/* ═══════════════════════════════════════
          HERO SECTION — full-bleed backdrop
          ═══════════════════════════════════════ */}
      <div className="dp-hero">
        {/* Background image / video */}
        <div className="dp-hero-bg" aria-hidden="true">
          {trailerUrl ? (
            <video autoPlay muted loop playsInline className="dp-hero-media">
              <source src={trailerUrl} type="video/mp4" />
            </video>
          ) : poster ? (
            <img
              src={bannerImg.src}
              alt=""
              width={bannerImg.width}
              height={bannerImg.height}
              loading="eager"
              decoding="async"
              className="dp-hero-media"
              onError={(e) => fallbackToOriginalImage(e, poster)}
            />
          ) : null}
          {/* Gradient overlays */}
          <div className="dp-hero-gradient-left"  aria-hidden="true" />
          <div className="dp-hero-gradient-bottom" aria-hidden="true" />
          <div className="dp-hero-overlay"         aria-hidden="true" />
        </div>

        {/* Back button */}
        <Link to="/" className="dp-back-btn" aria-label="Go back">
          <BackIcon />
        </Link>

        {/* Content row: poster + info */}
        <div className="dp-hero-content">
          {/* Poster */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="dp-poster-wrap"
          >
            {poster ? (
              <img
                src={posterImg.src}
                alt={title}
                width={posterImg.width}
                height={posterImg.height}
                loading="eager"
                decoding="async"
                className="dp-poster-img"
                onError={(e) => fallbackToOriginalImage(e, poster)}
              />
            ) : (
              <div className="dp-poster-placeholder">🎬</div>
            )}
          </motion.div>

          {/* Info panel */}
          <div className="dp-info">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="dp-title"
            >
              {title}
            </motion.h1>

            {/* Meta row: rating · year · type · country */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="dp-meta"
            >
              {rating && (
                <span className="dp-badge dp-badge--imdb">
                  <StarIcon /> {rating}
                </span>
              )}
              {releaseYear && <span className="dp-badge dp-badge--plain">{releaseYear}</span>}
              <span className="dp-badge dp-badge--type">{typeLabel}</span>
              {country && <span className="dp-badge dp-badge--plain">{country}</span>}
            </motion.div>

            {/* Genres */}
            {genres.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
                className="dp-genres"
              >
                {genres.slice(0, 5).map((g) => (
                  <span key={g} className="dp-genre-chip">{g}</span>
                ))}
              </motion.div>
            )}

            {/* Description */}
            {description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="dp-description"
              >
                <p>{descShown}</p>
                {description.length > CLAMP && (
                  <button type="button" className="dp-expand-btn" onClick={() => setExpanded(v => !v)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </motion.div>
            )}

            {/* Available languages */}
            {details?.dubs?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.34 }}
                className="dp-languages"
              >
                <p className="dp-languages-label">
                  <GlobeIcon /> Languages ({details.dubs.length})
                </p>
                <div className="dp-languages-chips">
                  {details.dubs.map((dub) => (
                    <span key={dub.lanName} className="dp-lang-chip">{dub.lanName}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="dp-actions"
            >
              <Link to={`/watch/${details?.subjectId || id}`} id="watch-now-btn" className="dp-btn dp-btn--primary">
                <PlayIcon /> Watch Now
              </Link>

              {trailerUrl && (
                <a href={trailerUrl} target="_blank" rel="noreferrer" className="dp-btn dp-btn--secondary">
                  <PlayIcon /> Trailer
                </a>
              )}

              <a href={watchInAppUrl} target="_blank" rel="noreferrer" className="dp-btn dp-btn--secondary">
                <AppIcon /> Watch in App
              </a>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                type="button"
                onClick={handleFavorite}
                id="detail-favorite-btn"
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                className={`dp-icon-btn ${favorited ? 'dp-icon-btn--active' : ''}`}
              >
                <HeartIcon filled={favorited} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                type="button"
                onClick={handleShare}
                id="detail-share-btn"
                aria-label="Share"
                className="dp-icon-btn"
              >
                <ShareIcon />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BELOW-HERO CONTENT
          ═══════════════════════════════════════ */}
      <div className="dp-below">

        {/* Cast */}
        {details?.stars?.length > 0 && (
          <section className="dp-section" aria-label="Cast">
            <h2 className="dp-section-title">
              Top Cast
              <span className="dp-section-count">{details.stars.length}</span>
            </h2>

            <div className="dp-cast-row">
              {details.stars.map((actor) => (
                <Link
                  key={actor.staffId}
                  to={`/staff/${actor.staffId}`}
                  className="dp-cast-card"
                >
                  <div className="dp-cast-img-wrap">
                    <img
                      {...getOptimizedImageProps(
                        actor.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=1a1a2e&color=fff`,
                        'avatar'
                      )}
                      alt={actor.name}
                      loading="lazy"
                      decoding="async"
                      className="dp-cast-img"
                      onError={(e) => fallbackToOriginalImage(e, actor.avatarUrl)}
                    />
                  </div>
                  <p className="dp-cast-name">{actor.name}</p>
                  {actor.character && (
                    <p className="dp-cast-character">{actor.character}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          id="recommendations-section"
        >
          <MovieRow
            title="More Like This"
            movies={recommendations}
            isLoading={recLoading}
            isNested={true}
          />
        </motion.section>
      </div>
    </motion.div>
  );
}
