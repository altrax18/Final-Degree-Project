import { motion } from "framer-motion";
import type { Game } from "../../../types/game";
import type { Movie } from "../../../types/movie";

// SECCION DESTACADOS
// QUE HACE: Muestra selecciones rapidas de peliculas y juegos.
// POR QUE: Facilita el acceso rapido al catalogo.
// DOCUMENTACION: https://www.framer.com/motion/

type Props = {
  movieHighlights: Movie[];
  gameHighlights: Game[];
  moviesError?: string | null;
  gamesError?: string | null;
  fallbackCover: string;
  formatRating: (value: number) => string;
};

export default function HighlightsSection({
  movieHighlights,
  gameHighlights,
  moviesError,
  gamesError,
  fallbackCover,
  formatRating,
}: Props) {
  const hasMovieHighlights = movieHighlights.length > 0;
  const hasGameHighlights = gameHighlights.length > 0;

  return (
    <section className="space-y-6" id="destacados">
      <div className="space-y-1">
        <h2 className="text-ink text-xl font-semibold dark:text-screen">
          Destacados del catalogo
        </h2>
        <p className="text-slate text-sm dark:text-mist">
          Selecciones rapidas para seguir explorando.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink dark:text-screen">
              Peliculas destacadas
            </h3>
            <a
              href="/movies"
              className="cursor-pointer text-xs font-semibold text-ink transition-colors hover:text-electric-sky dark:text-screen"
            >
              Ver peliculas
            </a>
          </div>

          {moviesError ? (
            <div className="rounded-2xl border border-bone bg-lilac-mist px-4 py-3 text-sm text-slate dark:border-night-edge dark:bg-depth/20 dark:text-mist">
              {moviesError}
            </div>
          ) : null}

          {hasMovieHighlights ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {movieHighlights.map((movie, index) => (
                <motion.a
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  className="group overflow-hidden rounded-2xl border border-bone bg-sand p-3 dark:border-night-edge dark:bg-coal"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-parchment dark:bg-obsidian">
                    <img
                      src={movie.image || fallbackCover}
                      alt={movie.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-electric-sky">
                      Puntuacion {formatRating(movie.rating)}
                    </p>
                    <h4 className="text-sm font-semibold text-ink dark:text-screen">
                      {movie.title}
                    </h4>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
              No hay peliculas destacadas disponibles.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink dark:text-screen">
              Juegos destacados
            </h3>
            <a
              href="/games"
              className="cursor-pointer text-xs font-semibold text-ink transition-colors hover:text-electric-sky dark:text-screen"
            >
              Ver juegos
            </a>
          </div>

          {gamesError ? (
            <div className="rounded-2xl border border-bone bg-lilac-mist px-4 py-3 text-sm text-slate dark:border-night-edge dark:bg-depth/20 dark:text-mist">
              {gamesError}
            </div>
          ) : null}

          {hasGameHighlights ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {gameHighlights.map((game, index) => (
                <motion.a
                  key={game.id}
                  href={`/games/${game.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  className="group overflow-hidden rounded-2xl border border-bone bg-sand p-3 dark:border-night-edge dark:bg-coal"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-parchment dark:bg-obsidian">
                    <img
                      src={game.image || fallbackCover}
                      alt={game.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-electric-sky">
                      Puntuacion {formatRating(game.rating)}
                    </p>
                    <h4 className="text-sm font-semibold text-ink dark:text-screen">
                      {game.title}
                    </h4>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
              No hay juegos destacados disponibles.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
