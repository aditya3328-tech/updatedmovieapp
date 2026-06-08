import { useState, useEffect, useCallback } from 'react';
import tmdbService from '../services/tmdbService';

export default function useTmdbMetadata(details) {
  const [cast, setCast] = useState([]);
  const [seasonNumbers, setSeasonNumbers] = useState([]);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [tmdbTvId, setTmdbTvId] = useState(null);
  const [loadingCast, setLoadingCast] = useState(false);
  const [loadingSeason, setLoadingSeason] = useState(null);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    if (!details?.title || !details?.subjectType) {
      setCast([]);
      setSeasonNumbers([]);
      setEpisodesBySeason({});
      setTmdbTvId(null);
      setMatched(false);
      return;
    }

    if (details.subjectType !== 1 && details.subjectType !== 2) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingCast(true);
      setCast([]);
      setSeasonNumbers([]);
      setEpisodesBySeason({});
      setTmdbTvId(null);
      setMatched(false);

      try {
        console.log('[useTmdbMetadata] Loading metadata for:', details.title);
        
        const meta = await tmdbService.getMetadata(
          details.title,
          details.subjectType,
          details.releaseDate,
        );

        if (cancelled || !meta) {
          console.log('[useTmdbMetadata] No TMDB match found');
          return;
        }

        console.log('[useTmdbMetadata] TMDB Match found:', {
          type: meta.type,
          tmdbId: meta.tmdbId,
          castCount: meta.cast?.length || 0,
          seasons: meta.seasonNumbers,
        });

        setCast(meta.cast || []);
        setMatched(true);

        if (meta.type === 'tv' && meta.tmdbId) {
          setTmdbTvId(meta.tmdbId);
          const seasons = meta.seasonNumbers || [1];
          console.log('[useTmdbMetadata] TV Show Seasons:', seasons);
          setSeasonNumbers(seasons);

          const firstSeason = seasons[0];
          console.log('[useTmdbMetadata] Loading episodes for first season:', firstSeason);
          const episodes = await tmdbService.getTvSeasonEpisodes(meta.tmdbId, firstSeason);
          if (!cancelled) {
            console.log('[useTmdbMetadata] First season episodes count:', episodes?.length || 0);
            setEpisodesBySeason({ [firstSeason]: episodes });
          }
        }
      } catch (err) {
        console.warn('[useTmdbMetadata]', err);
      } finally {
        if (!cancelled) {
          setLoadingCast(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [details?.title, details?.subjectType, details?.releaseDate]);

  const loadSeason = useCallback(
    async (seasonNumber) => {
      if (!tmdbTvId || episodesBySeason[seasonNumber]) {
        console.log('[useTmdbMetadata.loadSeason] Skipping - already loaded or no tmdbTvId');
        return;
      }

      console.log('[useTmdbMetadata.loadSeason] Loading season:', seasonNumber, 'tmdbTvId:', tmdbTvId);
      setLoadingSeason(seasonNumber);
      try {
        const episodes = await tmdbService.getTvSeasonEpisodes(tmdbTvId, seasonNumber);
        console.log('[useTmdbMetadata.loadSeason] Season', seasonNumber, 'episodes count:', episodes?.length || 0);
        setEpisodesBySeason((prev) => {
          const updated = { ...prev, [seasonNumber]: episodes };
          console.log('[useTmdbMetadata.loadSeason] Updated episodesBySeason:', Object.keys(updated).map(s => `S${s}:${updated[s]?.length || 0}`).join(', '));
          return updated;
        });
      } catch (err) {
        console.warn('[useTmdbMetadata] season load failed:', err);
      } finally {
        setLoadingSeason(null);
      }
    },
    [tmdbTvId, episodesBySeason],
  );

  return {
    cast,
    seasonNumbers,
    episodesBySeason,
    loadSeason,
    loadingCast,
    loadingSeason,
    matched,
  };
}
