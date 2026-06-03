import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import movieService from '../services/movieService';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [contentSections, setContentSections] = useState({
    trendingNow: [],
    bollywood: [],
    southIndian: [],
    webSeries: [],
    hindiDubbed: [],
    anime: [],
    mostWatched: [],
    recentlyAdded: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHome();
  }, []);

  const loadHome = async () => {
    try {
      setLoading(true);

      // Load featured content
      const recommendations = await movieService.getRecommendations('8772972936765623664');
      const itemsArray = Array.isArray(recommendations) ? recommendations : recommendations?.data?.list || [];

      if (itemsArray.length > 0) {
        setFeatured(itemsArray[0]);
      }

      // Load category-based content
      const sections = { ...contentSections };

      // Trending Now (use first batch)
      sections.trendingNow = itemsArray.slice(0, 10);

      // Load different categories with search keywords
      const categoryKeywords = [
        { key: 'bollywood', query: 'bollywood' },
        { key: 'southIndian', query: 'south indian tamil telugu' },
        { key: 'webSeries', query: 'web series' },
        { key: 'hindiDubbed', query: 'hindi dubbed' },
        { key: 'anime', query: 'anime' },
        { key: 'mostWatched', query: 'popular trending' },
      ];

      // Load each category in parallel
      const categoryPromises = categoryKeywords.map(async (category) => {
        try {
          const response = await movieService.search(category.query, 1);
          const items = Array.isArray(response) ? response : response?.data?.list || response?.data?.items || [];
          sections[category.key] = Array.isArray(items) ? items.slice(0, 10) : [];
        } catch (err) {
          console.error(`Error loading ${category.key}:`, err);
          sections[category.key] = [];
        }
      });

      await Promise.all(categoryPromises);

      // Recently Added (use different search)
      try {
        const recent = await movieService.search('new latest 2024', 1);
        sections.recentlyAdded = Array.isArray(recent) ? recent.slice(0, 10) : recent?.data?.list?.slice(0, 10) || [];
      } catch (err) {
        console.error('Error loading recently added:', err);
        sections.recentlyAdded = itemsArray.slice(10, 20);
      }

      setContentSections(sections);
    } catch (err) {
      console.error('Home Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = () => {
    // TODO: Add to watchlist functionality
    console.log('Added to watchlist:', featured?.title);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen pt-20 md:pt-24 pb-32 bg-black overflow-hidden"
    >
      {/* Animated background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        {loading ? (
          <LoadingSkeleton type="hero" />
        ) : featured ? (
          <HeroBanner
            movie={featured}
            movies={contentSections.trendingNow.length > 0 ? contentSections.trendingNow : [featured]}
            onAddToWatchlist={handleAddToWatchlist}
          />
        ) : null}

        {/* Content Rows */}
        {loading ? (
          <div className="space-y-12">
            <LoadingSkeleton type="row" />
            <LoadingSkeleton type="row" />
            <LoadingSkeleton type="row" />
            <LoadingSkeleton type="row" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-12"
          >
            {/* Trending Now */}
            {contentSections.trendingNow.length > 0 && (
              <MovieRow
                title="🔥 Trending Now"
                movies={contentSections.trendingNow}
                isLoading={false}
                viewAllLink="/search?q=trending"
              />
            )}

            {/* Hot Shorts */}
            {contentSections.trendingNow.length > 0 && (
              <MovieRow
                title="🎬 Hot Shorts"
                movies={contentSections.trendingNow.slice(0, 8)}
                isLoading={false}
                viewAllLink="/search?q=shorts"
              />
            )}

            {/* Bollywood */}
            {contentSections.bollywood.length > 0 && (
              <MovieRow
                title="🇮🇳 Bollywood"
                movies={contentSections.bollywood}
                isLoading={false}
                viewAllLink="/search?category=bollywood"
              />
            )}

            {/* South Indian */}
            {contentSections.southIndian.length > 0 && (
              <MovieRow
                title="🔥 South Indian"
                movies={contentSections.southIndian}
                isLoading={false}
                viewAllLink="/search?category=southindian"
              />
            )}

            {/* Web Series */}
            {contentSections.webSeries.length > 0 && (
              <MovieRow
                title="📺 Web Series"
                movies={contentSections.webSeries}
                isLoading={false}
                viewAllLink="/search?category=webseries"
              />
            )}

            {/* Hindi Dubbed */}
            {contentSections.hindiDubbed.length > 0 && (
              <MovieRow
                title="🎭 Hindi Dubbed"
                movies={contentSections.hindiDubbed}
                isLoading={false}
                viewAllLink="/search?category=hindidubbed"
              />
            )}

            {/* Anime */}
            {contentSections.anime.length > 0 && (
              <MovieRow
                title="🎌 Anime"
                movies={contentSections.anime}
                isLoading={false}
                viewAllLink="/search?category=anime"
              />
            )}

            {/* Most Watched */}
            {contentSections.mostWatched.length > 0 && (
              <MovieRow
                title="⭐ Most Watched"
                movies={contentSections.mostWatched}
                isLoading={false}
                viewAllLink="/search?q=mostWatched"
              />
            )}

            {/* Recently Added */}
            {contentSections.recentlyAdded.length > 0 && (
              <MovieRow
                title="🆕 Recently Added"
                movies={contentSections.recentlyAdded}
                isLoading={false}
                viewAllLink="/search?q=recent"
              />
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}