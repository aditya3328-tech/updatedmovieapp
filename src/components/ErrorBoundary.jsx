import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] px-4">
          <div className="text-center glass-card p-10 max-w-md animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Something Went Wrong</h2>
            <p className="text-sm text-[#8a8ab0] mb-6">
              An unexpected error occurred. Please try refreshing the page or navigate back to the home page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-[#6366f1] text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/15 transition-colors font-medium"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
