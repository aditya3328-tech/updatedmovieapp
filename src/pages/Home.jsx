import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import movieService from "../services/movieService";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";

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

export default function Home() {
  const [homeSections, setHomeSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHomeRows = useCallback(async () => {
    try {
      setLoading(true);

      const loadedSections = [];

      for (const section of rankingSections) {
        try {
          const data =
           await movieService.getRankingContent(
  section.id,
  1,
  24
);

          loadedSections.push({
            title:
              data?.title || section.title,
            items:
              data?.subjectList || [],
          });

          // Progressive render
          setHomeSections([
            ...loadedSections,
          ]);
        } catch (err) {
          console.error(
            "Failed:",
            section.title,
            err
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeRows();
  }, [loadHomeRows]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen bg-[#05070d] overflow-hidden pb-24"
    >
      <HeroBanner />

      <div className="max-w-[1920px] mx-auto">
        {loading && homeSections.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-white text-lg">
              Loading...
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {homeSections.map(
              (section) => (
                <MovieRow
                  key={section.title}
                  title={section.title}
                  items={section.items}
                />
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}