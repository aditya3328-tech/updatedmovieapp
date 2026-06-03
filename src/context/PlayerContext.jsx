import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sw_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sw_watch_history') || '{}');
    } catch {
      return {};
    }
  });

  const [continueWatching, setContinueWatching] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sw_continue_watching') || '[]');
    } catch {
      return [];
    }
  });

  /* Persist favorites */
  useEffect(() => {
    localStorage.setItem('sw_favorites', JSON.stringify(favorites));
  }, [favorites]);

  /* Persist continue watching */
  useEffect(() => {
    localStorage.setItem('sw_continue_watching', JSON.stringify(continueWatching));
  }, [continueWatching]);

  /* Toggle favorite */
  const toggleFavorite = useCallback((item) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.subjectId === item.subjectId);
      if (exists) {
        return prev.filter((f) => f.subjectId !== item.subjectId);
      }
      return [{ ...item, addedAt: Date.now() }, ...prev];
    });
  }, []);

  /* Check if favorited */
  const isFavorite = useCallback(
    (subjectId) => favorites.some((f) => f.subjectId === subjectId),
    [favorites]
  );

  /* Add to continue watching */
  const addToContinueWatching = useCallback((item) => {
    setContinueWatching((prev) => {
      const filtered = prev.filter((cw) => cw.subjectId !== item.subjectId);
      return [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 20);
    });
  }, []);

  /* Remove from continue watching */
  const removeFromContinueWatching = useCallback((subjectId) => {
    setContinueWatching((prev) => prev.filter((cw) => cw.subjectId !== subjectId));
  }, []);

  /* Get watch progress */
  const getWatchProgress = useCallback(
    (subjectId) => watchHistory[subjectId] || null,
    [watchHistory]
  );

  return (
    <PlayerContext.Provider
      value={{
        favorites,
        continueWatching,
        watchHistory,
        toggleFavorite,
        isFavorite,
        addToContinueWatching,
        removeFromContinueWatching,
        getWatchProgress,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}

export default PlayerContext;
