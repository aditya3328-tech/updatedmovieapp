import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import "plyr/dist/plyr.css";
import StaffPage from "./pages/Staff";
import Loader from './components/Loader';
import { PlayerProvider } from './context/PlayerContext';

/* Lazy-loaded pages */
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Details = lazy(() => import('./pages/Details'));
const Watch = lazy(() => import('./pages/Watch'));
const Favorites = lazy(() => import('./pages/Favorites'));
const ApiDebugger = lazy(() => import('./pages/ApiDebugger'));
const TvShows = lazy(() => import('./pages/TvShows'));
const Movies = lazy(() => import('./pages/Movies'));
const Animation = lazy(() => import('./pages/Animation'));

/* Page loading fallback */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="large" text="Loading..." />
    </div>
  );
}

/* 404 Page */
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-[#8a8ab0] mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <a
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-semibold rounded-xl hover:opacity-90 transition-all inline-block"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PlayerProvider>
        <div className="min-h-screen bg-[#05070d]">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/details/:id" element={<Details />} />
                <Route path="/watch/:subjectId" element={<Watch />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/debug/api" element={<ApiDebugger />} />
                <Route path="/staff/:staffId" element={<StaffPage />} />
                <Route path="/tv-shows" element={<TvShows />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/animation" element={<Animation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </PlayerProvider>
    </ErrorBoundary>
  );
}
