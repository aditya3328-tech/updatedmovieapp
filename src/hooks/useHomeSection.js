import { useEffect, useRef, useState } from "react";
import movieService from "../services/movieService";
import useLazySection from "./useLazySection";

/**
 * Loads a single homepage row through the orchestrated API pipeline.
 * Never aborts in-flight requests — only skips state updates after unmount.
 */
export default function useHomeSection(section, { preload = false } = {}) {
  const { ref, isVisible } = useLazySection({
    enabled: !preload,
    rootMargin: "400px 0px",
  });

  const shouldFetch = preload || isVisible;
  const [title, setTitle] = useState(section.title);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStartedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!shouldFetch || fetchStartedRef.current) return undefined;

    fetchStartedRef.current = true;
    setLoading(true);
    setError(null);

    movieService
      .getRankingContent(section.id, 1, 18, { priority: section.priority })
      .then((data) => {
        if (!mountedRef.current) return;
        setTitle(data?.title || section.title);
        setItems(data?.subjectList || []);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        setError(err);
        setItems([]);
      })
      .finally(() => {
        if (!mountedRef.current) return;
        setLoading(false);
      });

    return undefined;
  }, [shouldFetch, section.id, section.title, section.priority]);

  return {
    ref,
    title,
    items,
    loading: shouldFetch ? loading : true,
    error,
    isPending: !shouldFetch,
  };
}
