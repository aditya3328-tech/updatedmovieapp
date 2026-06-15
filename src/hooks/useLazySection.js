import { useEffect, useRef, useState } from "react";

/**
 * Detect when a section approaches the viewport for lazy data loading.
 */
export default function useLazySection({
  enabled = true,
  rootMargin = "400px 0px",
  threshold = 0,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled || isVisible) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, isVisible, rootMargin, threshold]);

  return { ref, isVisible };
}
