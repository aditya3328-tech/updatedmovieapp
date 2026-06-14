import { memo } from "react";
import SubjectCard from "./SubjectCard";

/* ── Skeleton card placeholder ── */
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="subject-skeleton" aria-hidden="true">
      <div className="subject-skeleton-poster skeleton" />
      <div className="subject-skeleton-line skeleton" style={{ width: "80%", marginTop: 10 }} />
      <div className="subject-skeleton-line skeleton" style={{ width: "55%", marginTop: 6 }} />
    </div>
  );
});

/**
 * SubjectGrid — responsive poster grid with skeleton loading state.
 * Attach `sentinelRef` to the bottom sentinel div for infinite scroll.
 *
 * @param {Object} props
 * @param {Array}  props.items
 * @param {boolean} props.loading
 * @param {boolean} props.initialLoad
 * @param {Object|null} props.sentinelRef  — from useRef, attached to sentinel div
 */
function SubjectGrid({ items, loading, initialLoad, sentinelRef }) {
  const SKELETON_COUNT = 28;

  if (initialLoad && loading) {
    return (
      <div className="subject-grid" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!loading && !initialLoad && items.length === 0) {
    return (
      <div className="subject-empty">
        <div className="subject-empty-icon">🎬</div>
        <h3>No results found</h3>
        <p>Try adjusting your filters to discover more content.</p>
      </div>
    );
  }

  return (
    <>
      <div className="subject-grid">
        {items.map((item, idx) => (
          <SubjectCard key={`${item.subjectId}-${idx}`} item={item} />
        ))}
        {/* Append skeleton cards at the bottom while paginating */}
        {loading && !initialLoad &&
          Array.from({ length: 8 }, (_, i) => <SkeletonCard key={`skel-${i}`} />)
        }
      </div>
      {/* Intersection Observer sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
    </>
  );
}

export default memo(SubjectGrid);
