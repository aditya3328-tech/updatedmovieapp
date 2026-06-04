import { motion, AnimatePresence } from 'framer-motion';

export default function SuggestionsDropdown({
  visible,
  suggestions = [],
  loading = false,
  onSelect,
}) {
  const show = visible && (loading || suggestions.length > 0);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#141414] shadow-2xl shadow-black/60"
          id="search-suggestions"
          role="listbox"
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : (
            suggestions.map((word) => (
              <button
                key={word}
                type="button"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(word)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 transition-colors hover:bg-white/10"
              >
                <span className="text-gray-500" aria-hidden>
                  🔍
                </span>
                <span className="truncate">{word}</span>
              </button>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
