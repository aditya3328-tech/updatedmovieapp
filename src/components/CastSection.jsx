import { motion } from 'framer-motion';

export default function CastSection({ cast }) {
  if (!cast || cast.length === 0) return null;

  const castList = Array.isArray(cast) ? cast : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 mb-12"
    >
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Cast</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {castList.map((actor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group text-center"
          >
            {/* Actor Image */}
            <div className="mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 aspect-square">
              {actor.image || actor.img || actor.photo ? (
                <img
                  src={actor.image || actor.img || actor.photo}
                  alt={actor.name || actor.actor}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600/30 to-purple-600/30">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
            </div>

            {/* Actor Name */}
            <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">
              {actor.name || actor.actor}
            </h3>

            {/* Character Name */}
            {(actor.character || actor.role || actor.characterName) && (
              <p className="text-xs text-gray-400 line-clamp-1">
                as {actor.character || actor.role || actor.characterName}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* View All Cast Button */}
      {castList.length > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <button className="px-6 py-2 bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-600/30 text-white font-semibold rounded-lg hover:from-red-600/40 hover:to-purple-600/40 transition-all">
            View All Cast
          </button>
        </motion.div>
      )}
    </motion.section>
  );
}
