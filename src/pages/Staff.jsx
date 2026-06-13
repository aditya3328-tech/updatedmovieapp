import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import movieService from "../services/movieService";
import {
  fallbackToOriginalImage,
  getOptimizedImageProps,
} from "../utils/imageOptimizer";

const twoLineClamp = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export default function StaffPage() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [relatedStaff, setRelatedStaff] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);

      const related =
        await movieService.getStaffRelated(staffId);

      const subjects =
        await movieService.getStaffSubjects(staffId);

      console.log("CURRENT STAFF ID", staffId);
      console.log("RELATED", related);
      console.log("SUBJECTS", subjects);

      setRelatedStaff(related || []);
      setMovies(subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070d] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="flex items-center gap-5 sm:gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-4xl flex-shrink-0">
            Actor
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black">
              Actor
            </h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-300">
              <span>{movies.length} Titles</span>
              <span>{relatedStaff.length} Related Artists</span>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto mt-6 mb-10">
        <h2 className="text-[22px] font-bold mt-6 mb-[18px] pl-4 sm:pl-6 lg:pl-8 text-white">
          Similar Actors
        </h2>

        <div className="mt-2.5 mb-10 flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2">
          {relatedStaff.map((actor) => (
            <div
              key={actor.staffId}
              onClick={() =>
                navigate(`/staff/${actor.staffId}`)
              }
              className="w-[110px] flex-shrink-0 cursor-pointer flex flex-col items-center text-center group"
            >
              <img
                {...getOptimizedImageProps(actor.avatarUrl, "avatar")}
                alt={actor.name}
                loading="lazy"
                decoding="async"
                className="w-20 h-20 sm:w-[90px] sm:h-[90px] rounded-full object-cover border-2 border-white/[0.08] transition-all duration-300 group-hover:scale-105 group-hover:border-red-500/70"
                onError={(event) => fallbackToOriginalImage(event, actor.avatarUrl)}
              />

              <h3
                className="mt-2.5 text-sm font-semibold leading-[1.3] text-white"
                style={twoLineClamp}
              >
                {actor.name}
              </h3>

              <p className="mt-1 text-xs text-white/70">
                {actor.staffType?.join(", ") || "Actor"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto mt-8 mb-6 px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-[22px] font-bold mt-8 mb-5 text-white">
          Movies & Shows
        </h2>

        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(140px,140px))] sm:grid-cols-[repeat(auto-fill,minmax(150px,150px))] lg:grid-cols-[repeat(auto-fill,minmax(160px,160px))] gap-x-4 gap-y-6">
          {movies.map((movie) => (
            <div
              key={movie.subjectId}
              onClick={() =>
                navigate(`/details/${movie.subjectId}`)
              }
              className="w-[140px] sm:w-[150px] lg:w-[160px] cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-lg bg-white/5">
                <img
                  {...getOptimizedImageProps(movie.cover?.url, "poster")}
                  alt={movie.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(event) => fallbackToOriginalImage(event, movie.cover?.url)}
                />

                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-yellow-400 text-xs font-bold">
                  {movie.imdbRatingValue || "N/A"}
                </div>
              </div>

              <h3
                className="mt-2 text-sm sm:text-base font-semibold leading-[1.3] text-gray-100"
                style={twoLineClamp}
              >
                {movie.title}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
