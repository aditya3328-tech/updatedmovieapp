import { motion } from "framer-motion";
import { HOME_SECTIONS } from "../config/homeSections";
import HeroBanner from "../components/HeroBanner";
import HomeSectionRow from "../components/HomeSectionRow";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen bg-[#05070d] overflow-hidden pb-24"
    >
      <HeroBanner />

      <div className="max-w-[1920px] mx-auto">
        <div className="space-y-0">
          {HOME_SECTIONS.map((section) => (
            <HomeSectionRow key={section.id} section={section} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
