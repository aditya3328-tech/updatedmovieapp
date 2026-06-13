import { useState, useEffect, useRef } from 'react';
import movieService from '../services/movieService';

const SUGGEST_DEBOUNCE_MS = 300;

/**
 * Debounced autocomplete suggestions from /subject/search-suggest
 */
export default function useSearchSuggestions(keyword, enabled = true) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const abortController = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!enabled || !keyword?.trim()) {
      setSuggestions([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    debounceTimer.current = setTimeout(async () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      try {
        const suggestions = await movieService.searchSuggest(keyword, {
          signal: abortController.current.signal,
        });
        console.log("HOOK STATE", suggestions);
        console.log("SUGGESTION LENGTH", suggestions?.length);
        setSuggestions(suggestions);
      } catch (err) {
        if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword, enabled]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  console.log("HOOK STATE", suggestions);
  console.log("SUGGESTION LENGTH", suggestions?.length);

  return { suggestions, loading };
}
