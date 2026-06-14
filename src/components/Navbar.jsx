import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const HeartIcon = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? '#ff2c37' : 'none'}
    stroke={filled ? '#ff2c37' : 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'all 0.3s ease' }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const NAV_LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/tv-shows',   label: 'TV Shows' },
  { to: '/movies',     label: 'Movies' },
  { to: '/animation',  label: 'Animation' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFavHovered, setIsFavHovered] = useState(false);

  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setSearchValue(q);
    } else {
      setSearchValue('');
    }
    setMenuOpen(false);
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

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <motion.nav
      id="main-navbar"
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Main row */}
      <div className="h-[72px] px-6 sm:px-10 lg:px-16 xl:px-20 flex items-center justify-between gap-6 max-w-[1400px] xl:max-w-[1800px] mx-auto w-full">

        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          id="navbar-logo"
        >
          <img
            src="/favicon.png"
            alt="Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain shadow-md"
          />
          <span className="hidden sm:inline text-base sm:text-lg font-black text-white tracking-tight">
            CinemaDDA
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-nav-link${isActive(to) ? ' navbar-nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search */}
          <div className="w-[180px] sm:w-[260px] lg:w-[320px]">
            <SearchBar
              variant="navbar"
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={handleSearchSubmit}
              placeholder="Search..."
            />
          </div>

          {/* Favorites */}
          <motion.button
            type="button"
            onClick={handleFavoritesClick}
            onHoverStart={() => setIsFavHovered(true)}
            onHoverEnd={() => setIsFavHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white transition-all shrink-0 border"
            style={{
              background: isFavHovered ? 'rgba(229, 9, 20, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isFavHovered ? 'rgba(229, 9, 20, 0.4)' : 'rgba(255, 255, 255, 0.1)',
              boxShadow: isFavHovered ? '0 0 15px rgba(229, 9, 20, 0.25)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer'
            }}
            id="navbar-favorites"
            aria-label="Go to favorites"
          >
            <HeartIcon filled={isFavHovered} />
            <span className="hidden lg:inline text-sm font-semibold tracking-wide">Favorites</span>
          </motion.button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <motion.div
        initial={false}
        animate={menuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="md:hidden overflow-hidden border-t border-white/5"
        style={{ background: 'rgba(0,0,0,0.95)' }}
      >
        <nav className="flex flex-col py-3 px-4" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-mobile-link${isActive(to) ? ' navbar-mobile-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => { handleFavoritesClick(); setMenuOpen(false); }}
            className="navbar-mobile-link text-left"
          >
            ♡ Favorites
          </button>
        </nav>
      </motion.div>
    </motion.nav>
  );
}
