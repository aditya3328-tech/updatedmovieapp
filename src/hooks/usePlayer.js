import { useState, useEffect, useCallback, useMemo } from "react";
import movieService from "../services/movieService";

function generateEpisodes(seasonObj) {
  if (!seasonObj) return [];
  if (seasonObj.allEp && String(seasonObj.allEp).trim()) {
    return String(seasonObj.allEp)
      .split(',')
      .map((ep) => {
        const num = Number(ep.trim());
        return isNaN(num) ? ep.trim() : num;
      })
      .filter((ep) => ep !== '' && ep !== 0);
  }
  const max = Number(seasonObj.maxEp) || 0;
  return Array.from({ length: max }, (_, i) => i + 1);
}

/**
 * usePlayer hook — manages playback state, season/episode navigation,
 * and stream fetching.
 *
 * TV series detection uses seasonsList (from MovieBox resource.seasons),
 * NOT subjectType. If seasonsList has entries, it's a series.
 *
 * @param {string} subjectId
 * @param {string} detailPath
 * @param {number} subjectType - MovieBox subjectType (1=movie, 2=series) — used as hint only
 * @param {Array} seasonsList - MovieBox resource.seasons array (source of truth)
 */
export default function usePlayer(subjectId, detailPath, subjectType, seasonsList = []) {
  const [streams, setStreams] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedCaption, setSelectedCaption] = useState(null);

  const [season, setSeasonState] = useState(1);
  const [episode, setEpisode] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // TV series detection: subjectType 2 (number or string) OR seasons from MovieBox
  // MovieBox resource.seasons is the source of truth for TV series detection
 const isSeries = useMemo(
  () => Number(subjectType) === 2,
  [subjectType]
);

  console.log("[usePlayer] Series Detection:", {
    subjectType,
    subjectTypeNumber: Number(subjectType),
    seasonsCount: seasonsList?.length || 0,
    isSeries,
  });

  // Derive episode list for the active season
  // Works with or without seasonsList enrichment
  const episodes = useMemo(() => {
    if (!isSeries) return [];
    if (!Array.isArray(seasonsList) || seasonsList.length === 0) return [];
    const currentSeasonObj =
      seasonsList.find((s) => s.se === season) || seasonsList[0];
    if (!currentSeasonObj) return [];
    return generateEpisodes(currentSeasonObj);
  }, [seasonsList, season, isSeries]);

  // Sync state when seasons list first loads (optional enrichment)
  // This only applies if seasonsList has data; TV series work without it
  useEffect(() => {
    if (!isSeries || !Array.isArray(seasonsList) || seasonsList.length === 0) {
      return;
    }

    const validSeason = seasonsList.find((s) => s.se === season);
    if (!validSeason) {
      const firstSeason = seasonsList[0];
      if (firstSeason && firstSeason.se) {
        setSeasonState(firstSeason.se);
        const eps = generateEpisodes(firstSeason);
        if (eps.length > 0) setEpisode(eps[0]);
      }
    } else {
      const eps = generateEpisodes(validSeason);
      if (eps.length > 0 && !eps.includes(episode)) {
        setEpisode(eps[0]);
      }
    }
  }, [seasonsList]); // eslint-disable-line react-hooks/exhaustive-deps

  // Custom season setter — auto-selects first episode of new season
  // Works with or without seasonsList enrichment
  const setSeason = useCallback(
    (nextSeasonNum) => {
      setSeasonState(nextSeasonNum);
      if (isSeries && Array.isArray(seasonsList) && seasonsList.length > 0) {
        const target = seasonsList.find((s) => s.se === nextSeasonNum);
        if (target) {
          const eps = generateEpisodes(target);
          if (eps.length > 0) setEpisode(eps[0]);
        }
      }
    },
    [seasonsList, isSeries]
  );

  // ---- Captions ----
  const fetchCaptions = useCallback(
    async (streamId) => {
      if (!subjectId || !detailPath) return;
      try {
        const captionList = await movieService.getCaptions(
          streamId,
          subjectId,
          detailPath
        );
        setCaptions(captionList);
        const englishCaption = captionList.find((c) => c.lan === "en");
        setSelectedCaption(englishCaption || captionList[0] || null);
      } catch (err) {
        console.error("[usePlayer] Captions error:", err);
        setCaptions([]);
      }
    },
    [subjectId, detailPath]
  );

  // ---- Streams ----
  const fetchStreams = useCallback(async () => {
    if (!subjectId || !detailPath) {
      setStatus("Waiting for playback details...");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedStream(null);

      // For movies: se=0, ep=0. For TV series: minimum se=1, ep=1.
      let se = isSeries ? season : 0;
      let ep = isSeries ? episode : 0;

      // TV series must never send se=0 or ep=0
      if (isSeries) {
        se = Math.max(1, se);
        ep = Math.max(1, ep);
      }

      console.log("[usePlayer] resolve-streams request:", {
        subjectId,
        detailPath,
        isSeries,
        season,
        episode,
        se,
        ep,
      });

      const response = await movieService.getStreams(subjectId, detailPath, se, ep);
      const streamList = Array.isArray(response?.streams) ? response.streams : [];

      setStreams(streamList);

      if (streamList.length > 0) {
        const sortedStreams = [...streamList].sort(
          (a, b) =>
            Number(b.resolutions ?? b.resolution ?? 0) -
            Number(a.resolutions ?? a.resolution ?? 0)
        );
        const bestStream = sortedStreams[0];
        setSelectedStream(bestStream);
        setStatus(`Stream Ready (${bestStream?.resolutions || "Auto"}p)`);

        if (bestStream?.id) {
          fetchCaptions(bestStream.id);
        }
      } else {
        setSelectedStream(null);
        setStatus("No Streams Found");
      }
    } catch (err) {
      console.error("[usePlayer] Stream Error:", err);
      setSelectedStream(null);
      setStreams([]);
      setError("Failed to load video");
      setStatus("Playback Failed");
    } finally {
      setLoading(false);
    }
  }, [subjectId, detailPath, isSeries, season, episode, fetchCaptions]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // ---- Quality change ----
  const changeQuality = useCallback(
    (stream) => {
      setSelectedStream(stream);
      if (stream?.id) fetchCaptions(stream.id);
    },
    [fetchCaptions]
  );

  // ---- Episode navigation ----
  // Navigation is only available if seasonsList has data
  const nextEpisode = useCallback(() => {
    if (!isSeries || !Array.isArray(seasonsList) || seasonsList.length === 0) {
      return;
    }
    const currentSeasonObj =
      seasonsList.find((s) => s.se === season) || seasonsList[0];
    const eps = generateEpisodes(currentSeasonObj);
    const index = eps.indexOf(episode);

    if (index !== -1 && index < eps.length - 1) {
      // Next episode in same season
      setEpisode(eps[index + 1]);
    } else {
      // Transition to next season
      const seasonIndex = seasonsList.findIndex((s) => s.se === season);
      if (seasonIndex !== -1 && seasonIndex < seasonsList.length - 1) {
        const nextSeasonObj = seasonsList[seasonIndex + 1];
        setSeasonState(nextSeasonObj.se);
        const nextEps = generateEpisodes(nextSeasonObj);
        if (nextEps.length > 0) setEpisode(nextEps[0]);
      }
    }
  }, [seasonsList, season, episode, isSeries]);

  const prevEpisode = useCallback(() => {
    if (!isSeries || !Array.isArray(seasonsList) || seasonsList.length === 0) {
      return;
    }
    const currentSeasonObj =
      seasonsList.find((s) => s.se === season) || seasonsList[0];
    const eps = generateEpisodes(currentSeasonObj);
    const index = eps.indexOf(episode);

    if (index > 0) {
      // Previous episode in same season
      setEpisode(eps[index - 1]);
    } else {
      // Transition to previous season
      const seasonIndex = seasonsList.findIndex((s) => s.se === season);
      if (seasonIndex > 0) {
        const prevSeasonObj = seasonsList[seasonIndex - 1];
        setSeasonState(prevSeasonObj.se);
        const prevEps = generateEpisodes(prevSeasonObj);
        if (prevEps.length > 0) setEpisode(prevEps[prevEps.length - 1]);
      }
    }
  }, [seasonsList, season, episode, isSeries]);

  // ---- Navigation flags ----
  const hasNextEpisode = useMemo(() => {
    if (!isSeries) return false;
    const seasonIndex = seasonsList.findIndex((s) => s.se === season);
    if (seasonIndex === -1) return false;
    const idx = episodes.indexOf(episode);
    if (idx !== -1 && idx < episodes.length - 1) return true;
    return seasonIndex < seasonsList.length - 1;
  }, [seasonsList, season, episodes, episode, isSeries]);

  const hasPrevEpisode = useMemo(() => {
    if (!isSeries) return false;
    const seasonIndex = seasonsList.findIndex((s) => s.se === season);
    if (seasonIndex === -1) return false;
    const idx = episodes.indexOf(episode);
    if (idx > 0) return true;
    return seasonIndex > 0;
  }, [seasonsList, season, episodes, episode, isSeries]);

  // ---- Misc ----
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const updateWatchHistory = useCallback(
    (progress) => {
      try {
        const history = JSON.parse(
          localStorage.getItem("sw_watch_history") || "{}"
        );
        history[subjectId] = {
          season: isSeries ? season : 0,
          episode: isSeries ? episode : 0,
          progress,
          timestamp: Date.now(),
        };
        localStorage.setItem("sw_watch_history", JSON.stringify(history));
      } catch (err) {
        console.error(err);
      }
    },
    [subjectId, season, episode, isSeries]
  );

  return {
    streams,
    captions,
    selectedStream,
    selectedCaption,
    setSelectedCaption,
    season,
    setSeason,
    episode,
    setEpisode,
    episodes,
    isSeries,
    loading,
    error,
    status,
    playbackSpeed,
    setPlaybackSpeed,
    isFullscreen,
    changeQuality,
    nextEpisode,
    prevEpisode,
    hasNextEpisode,
    hasPrevEpisode,
    toggleFullscreen,
    updateWatchHistory,
    refetch: fetchStreams,
  };
}