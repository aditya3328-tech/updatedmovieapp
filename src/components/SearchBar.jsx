import { useState, useRef, useEffect } from 'react';

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
  const inputRef = useRef(null);
  const isNavbar = variant === 'navbar';

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.(value.trim());
  };

  const handleClear = () => {
    onChange?.('');
    inputRef.current?.focus();
  };

  if (isNavbar) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`navbar-search-form ${className}`}
        id="navbar-search-bar"
      >
        <div
          className={`navbar-search-inner flex items-center ${
            isFocused ? 'navbar-search-inner--focused' : ''
          }`}
        >
          <span className="navbar-search-icon pl-4 text-gray-400 flex-shrink-0" aria-hidden>
            <SearchIconSVG />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Search"
            className="navbar-search-input flex-1 bg-transparent px-4 text-white text-sm placeholder:text-gray-500 outline-none"
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
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
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
    </form>
  );
}
