import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import movieService from "../services/movieService";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import LoadingSkeleton from "../components/LoadingSkeleton";

const rankingSections = [
  { title: "Trending Now", id: "4516404531735022304" },
  { title: "Cinema", id: "5692654647815587592" },
  { title: "Hot Short TV", id: "537172945375056936" },
  { title: "Bollywood", id: "414907768299210008" },
  { title: "South Indian", id: "3859721901924910512" },
  { title: "Hollywood", id: "8019599703232971616" },
  { title: "Top Series This Week", id: "4741626294545400336" },
  { title: "Indian Drama", id: "4903182713986896328" },
  { title: "Top Anime", id: "8434602210994128512" },
  { title: "Best Asian Series", id: "1976033493293449744" },
  { title: "Western TV", id: "3910636007619709856" },
];

const SKELETON_ROW_COUNT = 4;

export default function Home() {
  const [homeSections, setHomeSections] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  const loadHomeRows = useCallback(async () => {
    setRowsLoading(true);

    const results = await Promise.allSettled(
      rankingSections.map(async (section) => {
        const data = await movieService.getRankingContent(section.id, 1, 12);
        const items = data?.subjectList ?? [];

        return {
          title: data?.title || section.title,
          items,
        };
      }),
    );

    const sections = results
      .map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        console.error(
          `Failed to load ranking section "${rankingSections[index].title}":`,
          result.reason,
        );
        return null;
      })
      .filter((section) => section && section.items.length > 0);

    setHomeSections(sections);
    setRowsLoading(false);
  }, []);

  useEffect(() => {
    loadHomeRows();
  }, [loadHomeRows]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen pt-16 md:pt-20 pb-32 bg-black overflow-hidden"
    >
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      <HeroBanner />

      <div className="max-w-[1920px] mx-auto">
        {rowsLoading ? (
          <div className="px-4 sm:px-6 lg:px-8 space-y-2">
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <MovieRow key={i} isLoading />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-2 px-4 sm:px-6 lg:px-8"
          >
            {homeSections.map((section) => (
              <MovieRow
                key={section.title}
                title={section.title}
                items={section.items}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
