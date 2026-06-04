import { useState, useEffect, useCallback } from "react";
import movieService from "../services/movieService";

export default function usePlayer(subjectId, detailPath, subjectType) {
console.log("USEPLAYER FILE");
console.log("subjectId =", subjectId);
console.log("detailPath =", detailPath);
  const [streams, setStreams] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedCaption, setSelectedCaption] = useState(null);

  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

const fetchCaptions = useCallback(async (streamId) => {
  if (!subjectId || !detailPath) return;

  try {
    const captionList =
      await movieService.getCaptions(
        streamId,
        subjectId,
        detailPath
      );

    console.log("CAPTIONS:", captionList);

    setCaptions(captionList);

    const englishCaption =
      captionList.find(
        (c) => c.lan === "en"
      );

    setSelectedCaption(
      englishCaption || captionList[0] || null
    );
  } catch (err) {
    console.error(err);
    setCaptions([]);
  }
}, [subjectId, detailPath]);

  const fetchStreams = useCallback(async () => {
    if (!subjectId || !detailPath) {
      console.log("Waiting for detailPath...");
      setStatus("Waiting for playback details...");
      return;
    }

    try {
      console.log("FETCH STREAMS CALLED");
      console.log("SUBJECT ID:", subjectId);
      console.log("DETAIL PATH:", detailPath);

      setLoading(true);
      setError(null);
      setSelectedStream(null);

      const isMovie = subjectType === 1;
      const se = isMovie ? 0 : season;
      const ep = isMovie ? 0 : episode;

      const response = await movieService.getStreams(
        subjectId,
        detailPath,
        se,
        ep
      );

      console.log("GET STREAM RESPONSE:", response);

      const streamList = Array.isArray(response?.streams)
        ? response.streams
        : [];

      console.log("STREAM LIST:", streamList);

      setStreams(streamList);

      if (streamList.length > 0) {
        const sortedStreams = [...streamList].sort(
          (a, b) =>
            Number(b.resolutions ?? b.resolution ?? 0) -
            Number(a.resolutions ?? a.resolution ?? 0)
        );

        const bestStream = sortedStreams[0];

        console.log("SELECTED STREAM:", bestStream);
        console.log("VIDEO URL:", bestStream?.url);

        setSelectedStream(bestStream);

        setStatus(
          `Stream Ready (${bestStream?.resolutions || "Auto"}p)`
        );

        if (bestStream?.id) {
          fetchCaptions(bestStream.id);
        }
      } else {
        console.log("NO STREAMS FOUND");
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
  }, [
    subjectId,
    detailPath,
    subjectType,
    season,
    episode,
    fetchCaptions,
  ]);

  useEffect(() => {
console.log("USEPLAYER FILE");
console.log("subjectId =", subjectId);
console.log("detailPath =", detailPath);

    fetchStreams();
  }, [fetchStreams]);

  const changeQuality = useCallback(
    (stream) => {
      setSelectedStream(stream);

      if (stream?.id) {
        fetchCaptions(stream.id);
      }
    },
    [fetchCaptions]
  );

  const nextEpisode = useCallback(() => {
    setEpisode((prev) => prev + 1);
  }, []);

  const prevEpisode = useCallback(() => {
    setEpisode((prev) => Math.max(1, prev - 1));
  }, []);

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
          season,
          episode,
          progress,
          timestamp: Date.now(),
        };

        localStorage.setItem(
          "sw_watch_history",
          JSON.stringify(history)
        );
      } catch (err) {
        console.error(err);
      }
    },
    [subjectId, season, episode]
  );
console.log("CURRENT STREAMS STATE", streams);
console.log("CURRENT SELECTED STREAM", selectedStream);
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

    loading,
    error,
    status,

    playbackSpeed,
    setPlaybackSpeed,

    isFullscreen,

    changeQuality,
    nextEpisode,
    prevEpisode,
    toggleFullscreen,

    updateWatchHistory,

    refetch: fetchStreams,
  };
}