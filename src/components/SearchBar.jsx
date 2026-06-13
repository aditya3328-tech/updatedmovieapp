import { useState, useRef, useEffect } from 'react';
import SuggestionsDropdown from './SuggestionsDropdown';
import useSearchSuggestions from '../hooks/useSearchSuggestions';

const SearchIconSVG = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = 'Search movies, anime, tv shows...',
  autoFocus = false,
  className = '',
  variant = 'default',
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const isNavbar = variant === 'navbar';

  // Suggestions hook - enabled when focused and text is being typed
  const { suggestions, loading } = useSearchSuggestions(
    isFocused && value.trim().length > 0 ? value : '',
    true,
  );
  console.log("RENDERED SUGGESTIONS", suggestions);
  console.log("SUGGESTION LENGTH", suggestions?.length);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.(value.trim());
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange?.('');
    inputRef.current?.focus();
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion) => {
    onChange?.(suggestion);
    setShowSuggestions(false);
    // Trigger search after a short delay
    setTimeout(() => {
      onSubmit?.(suggestion);
    }, 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(value.trim().length > 0);
    onFocus?.();
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click handling
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
    onBlur?.();
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setShowSuggestions(newValue.trim().length > 0);
  };

  if (isNavbar) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`relative ${className}`}
        id="navbar-search-bar"
      >
        <div
          className="flex items-center rounded-full border transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            className="pl-4 text-gray-400 flex-shrink-0"
            aria-hidden
          >
            <SearchIconSVG />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Search"
            className="flex-1 bg-transparent px-4 py-3 text-white text-sm placeholder:text-gray-500 outline-none"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        <SuggestionsDropdown
          visible={showSuggestions && isFocused}
          suggestions={suggestions}
          loading={loading}
          onSelect={handleSuggestionSelect}
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full max-w-2xl mx-auto ${className}`}
      id="search-bar"
    >
      <div
        className={`absolute inset-0 rounded-xl blur-2xl transition-all duration-500 ${
          isFocused ? 'bg-indigo-500/30 opacity-100' : 'bg-transparent opacity-0'
        }`}
      />

      <div
        className={`
          relative flex items-center rounded-xl border backdrop-blur-xl transition-all duration-300 overflow-hidden
          ${
            isFocused
              ? 'border-indigo-500/50 bg-white/12 shadow-[0_0_50px_rgba(99,102,241,0.3)]'
              : 'border-white/12 bg-white/8 hover:border-white/20 hover:bg-white/10'
          }
        `}
      >
        <div
          className={`px-5 flex-shrink-0 transition-all duration-300 ${
            isFocused ? 'text-indigo-400' : 'text-gray-500'
          }`}
        >
          <SearchIconSVG />
        </div>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          className="flex-1 bg-transparent px-2 py-5 text-white text-lg placeholder:text-gray-500 outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      <SuggestionsDropdown
        visible={showSuggestions && isFocused}
        suggestions={suggestions}
        loading={loading}
        onSelect={handleSuggestionSelect}
      />
    </form>
  );
}
