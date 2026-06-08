import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import Player from '../components/Player';
import QualitySelector from '../components/QualitySelector';
import SubtitleSelector from '../components/SubtitleSelector';
import usePlayer from '../hooks/usePlayer';
import { usePlayerContext } from '../context/PlayerContext';
import movieService from '../services/movieService';
import './Watch.css';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

function formatGenreList(genres) {
  if (!genres) return null;
  if (typeof genres === 'string') return genres;
  if (!Array.isArray(genres) || genres.length === 0) return null;
  return genres
    .map((g) => (typeof g === 'string' ? g : g.name || g.label))
    .filter(Boolean)
    .join(' · ');
}

function extractYear(releaseDate) {
  if (!releaseDate) return null;
  const str = String(releaseDate);
  const match = str.match(/\d{4}/);
  return match ? match[0] : str;
}

export default function Watch() {
  const { subjectId } = useParams();
  const [details, setDetails] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const detailPath = details?.detailPath;

  const seasonsList = details?.resource?.seasons || [];

  console.log("details", details);
  console.log("details.seasons", details?.seasons);
  console.log("details.resource", details?.resource);
  console.log("details.resource.seasons", details?.resource?.seasons);
  console.log("seasonsList", seasonsList);

  const {
    streams,
    captions,
    selectedStream,
    selectedCaption,
    setSelectedCaption,
    season,
    setSeason,
    episode,
    setEpisode,
    episodes: playerEpisodes,
    isSeries,
    loading,
    error,
    status,
    playbackSpeed,
    setPlaybackSpeed,
    changeQuality,
    nextEpisode,
    prevEpisode,
    updateWatchHistory,
  } = usePlayer(details?.subjectId, detailPath, details?.subjectType, seasonsList);

  const { addToContinueWatching } = usePlayerContext();
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('watch-page-active');
    return () => document.body.classList.remove('watch-page-active');
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        console.log("[Watch] Fetching details for subjectId:", subjectId);
        
        const data = await movieService.getDetails(subjectId);
        
        if (data) {
          console.log("[Watch] Details received:", {
            subjectId: data.subjectId,
            title: data.title,
            subjectType: data.subjectType,
            hasResource: !!data.resource,
          });
          setDetails(data);
          
          addToContinueWatching({
            subjectId: data.subjectId,
            title: data.title,
            cover: data.cover,
            imdbRatingValue: data.imdbRatingValue,
          });
        }
      } catch (err) {
        console.error('[Watch] Details error:', err);
      }
    };
    if (subjectId) fetchDetails();
  }, [subjectId, addToContinueWatching]);
  
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setRecLoading(true);

        const items = await movieService.search('popular', 1);
        setRecommendations(items || []);
      } catch (err) {
        console.error(err);
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    };
    if (subjectId) fetchRecs();
  }, [subjectId]);

  const handleProgress = useCallback(
    (progress) => {
      updateWatchHistory(progress);
    },
    [updateWatchHistory]
  );

  const seasons = useMemo(() => {
    if (Array.isArray(seasonsList) && seasonsList.length > 0) {
      return seasonsList.map(s => s.se).sort((a, b) => a - b);
    }
    return [];
  }, [seasonsList]);

  const episodes = useMemo(() => {
    return (playerEpisodes || []).map((epNum) => ({
      number: epNum,
      name: `Episode ${epNum}`,
    }));
  }, [playerEpisodes]);

  const handleSeasonChange = (e) => {
    const next = Number(e.target.value);
    setSeason(next);
    setEpisode(1);
  };
  

  const title = details?.title || details?.name || 'Loading...';
  const isMovie = !isSeries;
  const rating = details?.imdbRatingValue || details?.rating;
  const year = extractYear(details?.releaseDate || details?.year);
  const releaseDate = details?.releaseDate;
  const genreText = formatGenreList(
  details?.genres || details?.genreList
);
  const country =
    details?.country || details?.area || details?.region || details?.countryName;
  const language =
    details?.language ||
    details?.lanName ||
    details?.originalLanguage ||
    details?.lang;
  const description =
    details?.description ||
    details?.synopsis ||
    details?.overview ||
    '';

  const metaItems = [
    rating ? { key: 'rating', node: <><StarIcon /> <span className="watch-meta-star">{rating}</span></> } : null,
    year ? { key: 'year', node: <span className="watch-meta-pill">{year}</span> } : null,
    genreText ? { key: 'genre', node: <span className="watch-meta-pill">{genreText}</span> } : null,
    country ? { key: 'country', node: <span className="watch-meta-pill">{country}</span> } : null,
  ].filter(Boolean);

  const episodeLabel = isMovie ? title : `${title}`;
  const episodeSubtitle = isMovie ? null : `Season ${season} • Episode ${episode}`;

  if (error) {
    return (
      <div className="watch-error">
        <div className="watch-error-card">
          <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>⚠️</p>
          <h2>Playback Error</h2>
          <p>{error}</p>
          <div className="watch-error-actions">
            <Link to="/">Go Home</Link>
            <button type="button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-page" id="watch-page">
      <Link
        to={`/details/${subjectId}`}
        id="watch-back-btn"
        className="watch-back"
        aria-label="Back to details"
      >
        <BackIcon />
      </Link>

      <div className="watch-page-inner">
        <div className="watch-player-wrap">
          {loading ? (
            <div className="watch-player-skeleton skeleton" aria-hidden />
          ) : (
            <Player
              streams={streams}
              captions={captions}
              selectedStream={selectedStream}
              selectedCaption={selectedCaption}
              onQualityChange={changeQuality}
              onCaptionChange={setSelectedCaption}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              onNextEpisode={nextEpisode}
              onPrevEpisode={episode > 1 ? prevEpisode : undefined}
              onProgress={handleProgress}
              title={episodeLabel}
            />
          )}
        </div>

        {status && !loading && (
          <p className="watch-status" aria-live="polite">
            {status}
          </p>
        )}

        <div className="watch-content">
          <h1 className="watch-title">{episodeLabel}</h1>
          {episodeSubtitle && (
            <p className="watch-episode-subtitle">{episodeSubtitle}</p>
          )}

          {metaItems.length > 0 && (
            <div className="watch-meta">
              {metaItems.map((item, index) => (
                <Fragment key={item.key}>
                  {index > 0 && <span className="watch-meta-divider">|</span>}
                  {item.node}
                </Fragment>
              ))}
            </div>
          )}

          {language && (
            <p className="watch-language">Language: {language}</p>
          )}

          {description && (
            <>
              <p className={`watch-description${descExpanded ? ' expanded' : ''}`}>
                {description}
              </p>
              {description.length > 160 && (
                <button
                  type="button"
                  className="watch-read-more"
                  onClick={() => setDescExpanded((v) => !v)}
                >
                  {descExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          )}

          <section aria-label="Season selection">
            <p className="watch-section-label">Season</p>
            <select
              id="watch-season-select"
              className="watch-season-select"
              value={season}
              onChange={handleSeasonChange}
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  Season {s}
                </option>
              ))}
            </select>
          </section>

          <section className="watch-episodes-section" aria-label="Episode selection">
            <p className="watch-section-label">Episodes</p>
            <div className="watch-episode-grid" id="watch-episode-grid">
              {episodes.map((ep) => {
                const epNumber = ep.number;
                const isActive = epNumber === episode;
                return (
                  <button
                    key={epNumber}
                    type="button"
                    className={`watch-episode-btn${isActive ? ' active' : ''}`}
                    onClick={() => setEpisode(epNumber)}
                    id={isActive ? 'watch-episode-active' : `watch-episode-${epNumber}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <div className="watch-episode-thumbnail-placeholder">
                      E{String(epNumber).padStart(2, '0')}
                    </div>
                    <div className="watch-episode-info">
                      <div className="watch-episode-number">{ep.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="watch-controls-row">
            <SubtitleSelector
              captions={captions}
              selectedCaption={selectedCaption}
              onSelect={setSelectedCaption}
            />
            <QualitySelector
              streams={streams}
              selectedStream={selectedStream}
              onSelect={changeQuality}
            />
          </div>

          <section className="watch-more-section" id="watch-more-like-this">
            <h2 className="watch-more-title">More Like This</h2>
            {recLoading ? (
              <div className="watch-more-scroll">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="watch-rec-skeleton" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="watch-more-scroll">
                {recommendations.map((item, i) => {
                  const recId = item.subjectId || item.id;
                  const recTitle = item.title || item.name || 'Untitled';
                  const recCover = item.cover?.url || item.coverUrl || '';
                  const recRating = item.imdbRatingValue;

                  return (
                    <Link
                      key={recId || i}
                      to={`/watch/${recId}`}
                      className="watch-rec-card"
                    >
                      <div className="watch-rec-thumb">
                        {recCover ? (
                          <img src={recCover} alt={recTitle} loading="lazy" />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                            }}
                          >
                            🎬
                          </div>
                        )}
                      </div>
                      <p className="watch-rec-title">{recTitle}</p>
                      {recRating && (
                        <p className="watch-rec-rating">⭐ {recRating}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                No recommendations available.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}