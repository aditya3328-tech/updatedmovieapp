import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import movieService from "../services/movieService";
import HeroSlide from "./HeroSlide";
import HeroDots from "./HeroDots";
import HeroArrows from "./HeroArrows";
import { HERO_FALLBACK_IMAGE } from "./heroUtils";

const AUTO_SLIDE_MS = 5000;

function preloadImage(url) {
  if (!url) return;
  const img = new Image();
  img.src = url;
}

export default function HeroBanner() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSources, setImageSources] = useState({});
  const pauseAutoRef = useRef(false);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const items = await movieService.getHomeBannerItems({
          signal: abortRef.current.signal,
        });
        setSlides(items);
        setCurrentIndex(0);

        const sources = {};
        items.forEach((item, index) => {
          sources[index] = item?.image?.url || HERO_FALLBACK_IMAGE;
        });
        setImageSources(sources);

        if (items[0]?.image?.url) preloadImage(items[0].image.url);
        if (items[1]?.image?.url) preloadImage(items[1].image.url);
      } catch (err) {
        if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
          console.error("[HeroBanner] Failed to load banners:", err);
        }
        setSlides([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => abortRef.current?.abort();
  }, []);

  const goTo = useCallback(
    (index) => {
      if (slides.length === 0) return;
      const next = (index + slides.length) % slides.length;
      setCurrentIndex(next);
      pauseAutoRef.current = true;
      setTimeout(() => {
        pauseAutoRef.current = false;
      }, AUTO_SLIDE_MS * 2);
    },
    [slides.length],
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = setInterval(() => {
      if (!pauseAutoRef.current) {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const nextIndex = (currentIndex + 1) % slides.length;
    const nextUrl = slides[nextIndex]?.image?.url;
    preloadImage(nextUrl);
  }, [currentIndex, slides]);

  const handleImageError = useCallback((index) => {
    setImageSources((prev) => ({
      ...prev,
      [index]: HERO_FALLBACK_IMAGE,
    }));
  }, []);

  if (loading) {
    return (
      <div
        className="hero-banner-skeleton w-full h-[55vh] md:h-[75vh] bg-gradient-to-br from-zinc-900 to-[#05070d] animate-pulse"
        aria-busy="true"
        aria-label="Loading hero banner"
      />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hero-banner relative w-full h-[55vh] md:h-[75vh] overflow-hidden bg-[#05070d] mb-4 md:mb-6"
      aria-roledescription="carousel"
      aria-label="Featured titles"
    >
      {slides.map((item, index) => (
        <HeroSlide
          key={item.subjectId || index}
          item={item}
          isActive={index === currentIndex}
          priority={index === currentIndex || index === (currentIndex + 1) % slides.length}
          imageSrc={imageSources[index] || item?.image?.url || HERO_FALLBACK_IMAGE}
          onImageError={() => handleImageError(index)}
        />
      ))}

      <HeroArrows
        onPrev={goPrev}
        onNext={goNext}
        visible={slides.length > 1}
      />

      <HeroDots
        count={slides.length}
        current={currentIndex}
        onSelect={goTo}
      />
    </motion.section>
  );
}
