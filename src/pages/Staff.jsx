import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import MovieCard from "../components/MovieCard";
import movieService from "../services/movieService";
import {
  fallbackToOriginalImage,
  getOptimizedImageProps,
} from "../utils/imageOptimizer";

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

  const currentActor = useMemo(
    () =>
      relatedStaff.find(
        (actor) => String(actor.staffId) === String(staffId),
      ),
    [relatedStaff, staffId],
  );

  const similarActors = useMemo(
    () =>
      relatedStaff.filter(
        (actor) => String(actor.staffId) !== String(staffId),
      ),
    [relatedStaff, staffId],
  );

  const actorName = currentActor?.name || "Actor";
  const actorRole =
    currentActor?.staffType?.join(", ") || "Actor";
  const actorAvatar = currentActor?.avatarUrl;

  if (loading) {
    return (
      <div className="staff-page min-h-screen bg-[#05070d] text-white pt-[90px] md:pt-[80px]">
        <div className="staff-page-inner">
          <header className="staff-profile staff-profile--skeleton">
            <div className="staff-profile-avatar skeleton" />
            <div className="staff-profile-meta">
              <div className="h-8 w-48 rounded-lg skeleton mb-3" />
              <div className="h-4 w-32 rounded skeleton" />
            </div>
          </header>

          <section className="staff-section">
            <div className="h-7 w-40 rounded-lg skeleton mb-6" />
            <div className="staff-films-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="staff-film-skeleton skeleton" />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-page min-h-screen bg-[#05070d] text-white pt-[90px] md:pt-[80px] pb-20">
      <div className="staff-page-inner">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="staff-profile"
        >
          <div className="staff-profile-avatar-wrap">
            {actorAvatar ? (
              <img
                {...getOptimizedImageProps(actorAvatar, "avatar")}
                alt={actorName}
                loading="eager"
                decoding="async"
                className="staff-profile-avatar"
                onError={(event) =>
                  fallbackToOriginalImage(event, actorAvatar)
                }
              />
            ) : (
              <div className="staff-profile-avatar staff-profile-avatar--placeholder">
                <span aria-hidden>{actorName.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="staff-profile-meta">
            <h1 className="staff-profile-name">{actorName}</h1>
            <p className="staff-profile-role">{actorRole}</p>
            <div className="staff-profile-stats">
              <span>{movies.length} Titles</span>
              {similarActors.length > 0 && (
                <span>{similarActors.length} Related Artists</span>
              )}
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="staff-section staff-section--primary"
          aria-label="Movies and shows"
        >
          <div className="staff-section-header">
            <h2 className="staff-section-title">
              Movies &amp; Shows
              {movies.length > 0 && (
                <span className="staff-section-count">{movies.length}</span>
              )}
            </h2>
            <div className="staff-section-accent" />
          </div>

          {movies.length > 0 ? (
            <div className="staff-films-grid">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.subjectId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
                  className="staff-film-item"
                >
                  <MovieCard item={movie} layout="grid" />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="staff-empty-message">
              No titles found for this artist.
            </p>
          )}
        </motion.section>

        {similarActors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true, margin: "-40px" }}
            className="staff-section staff-section--related"
            aria-label="Similar actors"
          >
            <div className="staff-section-header">
              <h2 className="staff-section-title">
                Similar Actors
                <span className="staff-section-count">
                  {similarActors.length}
                </span>
              </h2>
              <div className="staff-section-accent staff-section-accent--muted" />
            </div>

            <div className="staff-actors-row scroll-row">
              {similarActors.map((actor) => (
                <button
                  key={actor.staffId}
                  type="button"
                  onClick={() => navigate(`/staff/${actor.staffId}`)}
                  className="staff-actor-card"
                >
                  <div className="staff-actor-avatar-wrap">
                    <img
                      {...getOptimizedImageProps(actor.avatarUrl, "avatar")}
                      alt={actor.name}
                      loading="lazy"
                      decoding="async"
                      className="staff-actor-avatar"
                      onError={(event) =>
                        fallbackToOriginalImage(event, actor.avatarUrl)
                      }
                    />
                  </div>

                  <span className="staff-actor-name">{actor.name}</span>

                  <span className="staff-actor-role">
                    {actor.staffType?.join(", ") || "Actor"}
                  </span>
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
