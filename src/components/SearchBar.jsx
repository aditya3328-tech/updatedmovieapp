import { useState, useRef, useEffect } from 'react';

const SearchIconSVG = () => (
  <svg
    width="22"
    height="22"
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
    width="18"
    height="18"
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
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

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

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full max-w-3xl mx-auto ${className}`}
      id="search-bar"
    >
      <div
        className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-500 ${
          isFocused ? 'bg-indigo-500/20 opacity-100' : 'bg-transparent opacity-0'
        }`}
      />

      <div
        className={`
          relative flex items-center rounded-3xl border backdrop-blur-2xl transition-all duration-300 overflow-hidden
          ${
            isFocused
              ? 'border-indigo-500/40 bg-white/10 shadow-[0_0_40px_rgba(99,102,241,0.25)]'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }
        `}
      >
        <div
          className={`pl-5 transition-all duration-300 ${
            isFocused ? 'text-indigo-400 scale-110' : 'text-gray-500'
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
          className="flex-1 bg-transparent px-4 py-4 text-white text-base placeholder:text-gray-500 outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}

        <button
          type="submit"
          className="m-2 px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/20"
        >
          Search
        </button>
      </div>
    </form>
  );
}
