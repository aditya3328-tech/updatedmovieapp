import { useState, useRef, useEffect, useCallback } from "react";
import QualitySelector from "./QualitySelector";
import "plyr/dist/plyr.css";
import Plyr from "plyr";
import SubtitleSelector from "./SubtitleSelector";

/* SVG Icons */
const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PauseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);
const FullscreenIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const ExitFullscreenIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const PipIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <rect
      x="11"
      y="10"
      width="9"
      height="6"
      rx="1"
      ry="1"
      fill="white"
      opacity="0.3"
    />
  </svg>
);
const VolumeIcon = ({ muted }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {muted ? (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </>
    )}
  </svg>
);
const SkipBackIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);
const SkipForwardIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player({
  streams = [],
  captions = [],
  selectedStream,
  selectedCaption,
  onQualityChange,
  onCaptionChange,
  playbackSpeed = 1,
  onSpeedChange,
  onNextEpisode,
  onPrevEpisode,
  onProgress,
  title = "",
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const videoUrl = selectedStream?.url || "";
  console.log("SELECTED STREAM", selectedStream);
  console.log("VIDEO URL", selectedStream?.url);
  console.log("SELECTED CAPTION", selectedCaption);
  console.log(selectedCaption?.url)

  const isStreamReady = Boolean(selectedStream?.url);

  if (!isStreamReady) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-[12px] overflow-hidden glass-card flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">Loading Stream...</p>
          <p className="text-sm text-[#cbd5e1]">
            Waiting for the highest quality source to become available.
          </p>
        </div>
      </div>
    );
  }

  /* Auto-hide controls */
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  /* Video event handlers */
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
    onProgress?.(video.currentTime / video.duration);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      video.playbackRate = playbackSpeed;
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
    resetHideTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setVolume(val);
      setMuted(val === 0);
    }
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const video = videoRef.current;
    if (video && duration) {
      video.currentTime = pos * duration;
      setCurrentTime(video.currentTime);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("[Player] Fullscreen error:", err);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("[Player] PiP error:", err);
    }
  };
  console.log("STREAMS", streams);
  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
    onSpeedChange?.(speed);
    setShowSpeedMenu(false);
  };

  /* Update playback rate when prop changes */
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  /* Fullscreen change listener */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "ArrowLeft":
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          video.currentTime = Math.min(duration, video.currentTime + 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [duration, playing]);

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      id="video-player-container"
      className="relative w-full aspect-video bg-black rounded-[12px] overflow-hidden group cursor-pointer"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        key={videoUrl}
        ref={videoRef}
        src={videoUrl}
        autoPlay
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setPlaying(false);
          onNextEpisode?.();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={(e) => {
          console.log("VIDEO ERROR:", e);
          console.log("FAILED URL:", videoUrl);
        }}
      >
        {selectedCaption?.url && (
          <track
            kind="subtitles"
            src={selectedCaption.url}
            srcLang={selectedCaption.lan || "en"}
            label={selectedCaption.lanName || "English"}
            default
          />
        )}
      </video>

      {/* Center Play Button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-[#E50914] backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-[#E50914]/50 hover:scale-125 hover:shadow-[#E50914]/70 transition-all duration-300 cursor-pointer">
            <PlayIcon />
          </div>
        </div>
      )}

      {/* Title Overlay */}
      {showControls && title && (
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent z-20 transition-opacity duration-300">
          <h3 className="text-white text-lg md:text-xl font-semibold truncate">
            {title}
          </h3>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 player-controls px-3 md:px-4 py-3 md:py-4 transition-opacity duration-300 bg-black/75 backdrop-blur-[10px] ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="w-full h-1.5 bg-[#2A2A2A] rounded-full mb-3 cursor-pointer group/progress relative"
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#3A3A3A] rounded-full"
            style={{ width: `${bufferedProgress}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full bg-[#E50914] hover:bg-[#FF1B2D] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Previous */}
            {onPrevEpisode && (
              <button
                onClick={onPrevEpisode}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                id="prev-episode-btn"
                title="Previous Episode"
              >
                <SkipBackIcon />
              </button>
            )}

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              id="play-pause-btn"
              title={playing ? "Pause" : "Play"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* Next */}
            {onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                id="next-episode-btn"
                title="Next Episode"
              >
                <SkipForwardIcon />
              </button>
            )}

            {/* Volume */}
            <div className="hidden md:flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                id="mute-btn"
                title="Mute"
              >
                <VolumeIcon muted={muted} />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-[#E50914] h-1 cursor-pointer"
                id="volume-slider"
              />
            </div>

            {/* Volume Mobile */}
            <button
              onClick={toggleMute}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              id="mute-btn-mobile"
              title="Mute"
            >
              <VolumeIcon muted={muted} />
            </button>

            {/* Time */}
            <span className="text-xs text-white/80 ml-1 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1">
            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-white text-xs font-semibold transition-colors"
                id="speed-btn"
                title="Playback speed"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSpeedMenu(false)}
                  />
                  <div
                    className="absolute bottom-full mb-2 right-0 z-50 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden animate-fade-in"
                    id="speed-menu"
                  >
                    {SPEED_OPTIONS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`block w-full px-4 py-2 text-sm text-left transition-colors ${playbackSpeed === speed
                          ? "text-[#E50914] bg-[#E50914]/10"
                          : "text-[#b0b0d0] hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Quality */}
            <QualitySelector
              streams={streams}
              selectedStream={selectedStream}
              onSelect={onQualityChange}
            />

            {/* Subtitles */}
            <SubtitleSelector
              captions={captions}
              selectedCaption={selectedCaption}
              onSelect={onCaptionChange}
            />

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden md:block"
              id="pip-btn"
              title="Picture in Picture"
            >
              <PipIcon />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              id="fullscreen-btn"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
