import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/search?category=movies', label: 'Movies' },
  { path: '/search?category=series', label: 'Series' },
  { path: '/search?category=anime', label: 'Anime' },
  { path: '/search', label: 'Search' },
  { path: '/favorites', label: 'Favorites', icon: <HeartIcon /> },
];

const mobileNavLinks = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/search?category=movies', label: 'Movies' },
  { path: '/search?category=series', label: 'Series' },
  { path: '/search?category=anime', label: 'Anime' },
  { path: '/search', label: 'Search' },
  { path: '/favorites', label: 'Favorites', icon: <HeartIcon /> },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setSearchValue(q);
    }
  }, [location.pathname, location.search]);

  const isActive = useCallback(
    (path) => {
      if (path.includes('?')) {
        return (
          location.pathname === path.split('?')[0] &&
          location.search === `?${path.split('?')[1]}`
        );
      }
      if (path === '/search') {
        return location.pathname === '/search' && !location.search.includes('category=');
      }
      return location.pathname === path;
    },
    [location.pathname, location.search],
  );

  const handleSearchSubmit = useCallback(
    (term) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate],
  );

  return (
    <>
      <motion.nav
        id="main-navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'navbar--scrolled' : 'navbar--transparent'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center h-20 relative gap-12">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group hover:opacity-80 transition-opacity" id="navbar-logo">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">▶</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                CinemaDDA
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={`navbar-link px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'navbar-link--active'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {link.icon}
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="navbar-search-desktop ml-auto">
              <SearchBar
                variant="navbar"
                value={searchValue}
                onChange={setSearchValue}
                onSubmit={handleSearchSubmit}
                placeholder="Search movies, series, anime..."
              />
            </div>
          </div>

          <div className="md:hidden py-3 space-y-3">
            <div className="flex items-center justify-between h-12">
              <Link to="/" className="flex items-center gap-2" id="navbar-logo-mobile">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">▶</span>
                </div>
                <span className="text-base font-black text-white">CinemaDDA</span>
              </Link>

              <motion.button
                id="mobile-menu-toggle"
                whileTap={{ scale: 0.95 }}
                type="button"
                className="p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </motion.button>
            </div>

            <SearchBar
              variant="navbar"
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={handleSearchSubmit}
              placeholder="Search movies, series, anime..."
              className="navbar-search-mobile w-full"
            />
          </div>
        </div>
      </motion.nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 md:hidden"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-24 left-4 right-4 rounded-xl border border-white/10 bg-[#111827]/95 backdrop-blur-xl p-4"
          >
            <div className="space-y-1">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive(link.path)
                      ? 'bg-red-600/20 text-white border border-red-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden navbar-mobile-bottom border-t border-white/10"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { path: '/', label: 'Home', icon: <HomeIcon /> },
            { path: '/search', label: 'Search' },
            { path: '/favorites', label: 'Saved', icon: <HeartIcon /> },
          ].map((link) => (
            <Link key={link.path} to={link.path} id={`mobile-nav-${link.label.toLowerCase()}`}>
              <div
                className={`flex flex-col items-center gap-1 px-3 py-2 text-11px font-bold transition-all rounded-lg ${
                  isActive(link.path) 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span className="text-xs">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  );
}
