import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import movieService from "../services/movieService";

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
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-6">
  <div className="w-28 h-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-4xl">
    🎭
  </div>

  <div>
    <h1 className="text-4xl font-black">
      Actor
    </h1>

    <div className="flex gap-6 mt-2 text-sm text-gray-300">
      <span>🎬 {movies.length} Titles</span>
      <span>👥 {relatedStaff.length} Related Artists</span>
    </div>
  </div>
</div>

      {/* Filmography */}
 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
  {movies.map((movie) => (
    <div
      key={movie.subjectId}
      onClick={() =>
        navigate(`/details/${movie.subjectId}`)
      }
      className="cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={movie.cover?.url}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-yellow-400 text-xs font-bold">
          ⭐ {movie.imdbRatingValue || "N/A"}
        </div>
      </div>

      <h3 className="mt-2 text-sm font-medium line-clamp-1 text-gray-100">
        {movie.title}
      </h3>
    </div>
  ))}
</div>

      {/* Related Artists */}
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
  {relatedStaff.map((actor) => (
    <div
      key={actor.staffId}
      onClick={() =>
        navigate(`/staff/${actor.staffId}`)
      }
      className="cursor-pointer text-center group"
    >
      <img
        src={actor.avatarUrl}
        alt={actor.name}
        className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full object-cover border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-red-500"
      />

      <h3 className="mt-3 text-sm font-medium line-clamp-1">
        {actor.name}
      </h3>

      <p className="text-xs text-gray-400 line-clamp-1">
        {actor.staffType?.join(", ")}
      </p>
    </div>
  ))}
      </div>
    </div>
  );
}