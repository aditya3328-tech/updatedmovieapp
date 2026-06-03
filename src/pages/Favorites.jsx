import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { usePlayerContext } from '../context/PlayerContext';

export default function Favorites() {
  const { favorites } = usePlayerContext();

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto" id="favorites-page">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Favorites</h1>
        <p className="text-sm text-[#8a8ab0]">
          {favorites.length} {favorites.length === 1 ? 'title' : 'titles'} saved
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {favorites.map((item, i) => (
            <div key={item.subjectId || i} className="flex justify-center">
              <MovieCard item={item} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2a2a52" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h3 className="text-xl font-bold text-white mt-6 mb-2">No Favorites Yet</h3>
          <p className="text-sm text-[#8a8ab0] text-center max-w-sm mb-6">
            Start adding movies and shows to your favorites by tapping the heart icon on any title.
          </p>
          <Link
            to="/search"
            className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
          >
            Discover Content
          </Link>
        </div>
      )}
    </div>
  );
}
