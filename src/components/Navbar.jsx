import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setSearchValue(q);
    } else {
      setSearchValue('');
    }
  }, [location.pathname, location.search]);

  const handleSearchSubmit = useCallback(
    (term) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate],
  );

  const handleFavoritesClick = useCallback(() => {
    navigate('/favorites');
  }, [navigate]);

  return (
    <motion.nav
  id="main-navbar"
  initial={{ y: -70 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.5 }}
  className="fixed top-0 left-0 right-0 z-50 h-[78px]"
  style={{
    background: 'rgba(0,0,0,0.82)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}
>
      <div className="h-full px-6 sm:px-10 lg:px-16 xl:px-20 flex items-center justify-between gap-6 max-w-[1800px] mx-auto w-full">
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          id="navbar-logo"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
            <span className="text-xs sm:text-sm font-bold text-white">▶</span>
          </div>
          <span className="hidden sm:inline text-base sm:text-lg font-black text-white tracking-tight">
            CinemaDDA
          </span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-[500px] md:max-w-[400px] lg:max-w-[500px] mx-auto">
          <SearchBar
            variant="navbar"
            value={searchValue}
            onChange={setSearchValue}
            onSubmit={handleSearchSubmit}
            placeholder="Search movies..."
          />
        </div>

        {/* Right: Favorites Button */}
        <motion.button
          type="button"
          onClick={handleFavoritesClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/90 hover:bg-white/5 transition-all shrink-0"
          id="navbar-favorites"
          aria-label="Go to favorites"
        >
          <HeartIcon />
          <span className="hidden sm:inline text-sm font-semibold">Favorites</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
