import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import movieService from '../services/movieService';

/* SVG Icons */
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Fetch dynamic tabs */
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const response = await movieService.getBottomTabs();
        const tabList = response?.data?.list || response?.data || [];
        if (Array.isArray(tabList) && tabList.length > 0) {
          setTabs(tabList);
        }
      } catch (err) {
        console.error('[Navbar] Failed to fetch tabs:', err);
      }
    };
    fetchTabs();
  }, []);

  /* Scroll listener */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/search?category=movies', label: 'Movies', icon: <SearchIcon /> },
    { path: '/search?category=series', label: 'Series', icon: <SearchIcon /> },
    { path: '/search?category=anime', label: 'Anime', icon: <SearchIcon /> },
    { path: '/search', label: 'Search', icon: <SearchIcon /> },
    { path: '/favorites', label: 'Favorites', icon: <HeartIcon /> },
  ];

  const mobileLinks = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/search', label: 'Search', icon: <SearchIcon /> },
    { path: '/favorites', label: 'Favorites', icon: <HeartIcon /> },
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname === path.split('?')[0] && location.search === '?' + path.split('?')[1];
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop / Top Navbar */}
      <motion.nav
        id="main-navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" id="navbar-logo">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow"
              >
                <span className="text-lg font-bold">▶</span>
              </motion.div>
              <span className="text-xl sm:text-2xl font-black hidden sm:block gradient-text">
                CinemaDDA
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  id={`nav-${link.label.toLowerCase()}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm ${
                      isActive(link.path)
                        ? 'text-white bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Mobile Hamburger */}
            <motion.button
              id="mobile-menu-toggle"
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 md:hidden"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-0 right-0 glass border-b border-white/10"
          >
            <div className="p-4 space-y-2">
              {mobileLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 text-white border border-red-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  <span className="font-semibold">{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-white/10"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {mobileLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              id={`mobile-nav-${link.label.toLowerCase()}`}
            >
              <motion.div
                whileHap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {link.icon}
                <span className="text-[10px] font-bold">{link.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  );
}
