// Importo Framer Motion para animaciones (concepto: animacion declarativa).
import { motion } from "framer-motion";
// Importo useState para manejar estado local (concepto: estado de UI en React).
import { useState } from "react";
// Importo efecto de texto tipo maquina (concepto: componente reutilizable).
import TypewriterText from "./TypewriterText";
import type { RecentPost, TrendingItem } from "../../types/home";
// Importo tipos de dominio para catalogo (concepto: contratos de datos).
import type { Game } from "../../types/game";
import type { Movie } from "../../types/movie";

type Props = {
  trending: TrendingItem[];
  games: Game[];
  movies: Movie[];
  recentPosts: RecentPost[];
  errorMessage?: string | null;
  gamesError?: string | null;
  moviesError?: string | null;
};

// Duracion para el carrusel (concepto: configuracion reutilizable).
const MARQUEE_DURATION = 30;

// Fallback local para tarjetas sin imagen (concepto: fallback de recursos).
const fallbackCover = "https://placehold.co/480x640/0A0A0A/FFFFFF?text=Alexandria";

// Formateo puntuaciones para el catalogo (concepto: helper puro).
const formatRating = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "0.0";

// Entrada flexible para el player (concepto: tipado estructural).
type PlayerTrackInput = {
  id: string;
  title: string;
  artist?: string;
  cover?: string | null;
  image?: string | null;
  previewUrl?: string | null;
  genre?: string;
};

// Normalizo la pista para el reproductor global (concepto: adaptador de eventos).
const toPlayerTrack = (track: PlayerTrackInput) => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  cover: track.cover ?? track.image ?? null,
  previewUrl: track.previewUrl ?? null,
  genre: track.genre,
});

export default function HomePage({
  trending,
  games,
  movies,
  recentPosts,
  errorMessage,
  gamesError,
  moviesError,
}: Props) {
  // Estado para filtros y acciones (concepto: estado local con useState).
  const [activeTag, setActiveTag] = useState<string>("Todas");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  // Duplico la lista para simular un carrusel continuo (concepto: repeticion de items).
  const loopPosts = recentPosts.length > 0 ? [...recentPosts, ...recentPosts] : [];
  // Derivo etiquetas desde los posts (concepto: transformacion de arrays con Set).
  const topTags = Array.from(new Set(recentPosts.flatMap((post) => post.tags))).slice(
    0,
    6,
  );
  // Limito datos del catalogo para la home (concepto: slicing para performance).
  const featuredTracks = trending.slice(0, 8);
  const featuredMovies = movies.slice(0, 6);
  const featuredGames = games.slice(0, 6);
  // Datos de tendencias semanales (concepto: recorte de lista).
  const weeklyTracks = featuredTracks;
  // Cola reproducible para el player (concepto: datos derivados).
  const playableTracks = weeklyTracks.filter((track) => track.previewUrl);
  // Destacados por categoria (concepto: seleccion de muestras).
  const movieHighlights = featuredMovies.slice(0, 3);
  const gameHighlights = featuredGames.slice(0, 3);
  // Conteo total para metricas (concepto: agregacion simple).
  const catalogTotalCount =
    weeklyTracks.length + featuredMovies.length + featuredGames.length;
  // Aplico filtro de etiquetas (concepto: filtrado condicional).
  const filteredPosts =
    activeTag === "Todas"
      ? recentPosts
      : recentPosts.filter((post) => post.tags.includes(activeTag));
  // Sugerencias unicas por autor (concepto: deduplicacion con Map).
  const suggestedCreators = Array.from(
    new Map(recentPosts.map((post) => [post.author, post])).values(),
  ).slice(0, 3);
  // Estadisticas derivadas de datos reales (concepto: datos derivados).
  const heroStats = [
    { label: "Elementos del catalogo", value: `${catalogTotalCount}` },
    { label: "Publicaciones recientes", value: `${recentPosts.length}` },
    { label: "Etiquetas activas", value: `${topTags.length}` },
  ];

  const hasWeeklyTracks = weeklyTracks.length > 0;
  const hasMovieHighlights = movieHighlights.length > 0;
  const hasGameHighlights = gameHighlights.length > 0;
  const hasPosts = loopPosts.length > 0;
  const hasFeedPosts = filteredPosts.length > 0;

  // Alterno el estado de me gusta (concepto: actualizacion inmutable).
  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId],
    );
  };
  // Alterno el estado de guardado (concepto: actualizacion inmutable).
  const toggleSave = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId],
    );
  };
  // Alterno el estado de seguimiento (concepto: estado por entidad).
  const toggleFollow = (author: string) => {
    setFollowedAuthors((prev) =>
      prev.includes(author)
        ? prev.filter((name) => name !== author)
        : [...prev, author],
    );
  };

  // Alterno el editor de comentarios (concepto: UI controlada por estado).
  const toggleComment = (postId: string) => {
    setActiveCommentId((prev) => (prev === postId ? null : postId));
    setCommentDraft("");
  };

  // Simulo envio de comentario local (concepto: placeholder de integracion).
  const handleCommentSubmit = (postId: string) => {
    if (!commentDraft.trim()) return;
    // TODO: Enviar comentario al backend cuando exista el endpoint.
    setCommentDraft("");
    setActiveCommentId(null);
  };

  // Genero datos de descubrimiento para reflejar la preferencia del usuario (concepto: recomendaciones derivadas).
  const discoveryPosts = recentPosts
    .slice(0, 3)
    .map((post) => ({
      ...post,
      subtitle: post.tags.slice(0, 2).join(" · "),
    }));

  // Disparo reproduccion individual en el player global (concepto: eventos personalizados).
  const handlePlayTrack = (track: TrendingItem) => {
    if (!track.previewUrl || playableTracks.length === 0) return;
    const queue = playableTracks.map(toPlayerTrack);
    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track: toPlayerTrack(track), queue },
      }),
    );
  };
  // Disparo reproduccion de toda la cola (concepto: reproduccion por lote).
  const handlePlayAll = () => {
    if (playableTracks.length === 0) return;
    const queue = playableTracks.map(toPlayerTrack);
    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track: queue[0], queue },
      }),
    );
  };

  // Clases para filtros activos (concepto: clases dinamicas).
  const getTagButtonClass = (tag: string) =>
    `cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
      activeTag === tag
        ? "border-electric-sky bg-electric-sky text-obsidian"
        : "border-bone text-slate dark:border-night-edge dark:text-mist hover:border-electric-sky"
    }`;

  // Estilo de animacion para el carrusel (concepto: CSS animation controlada por estado).
  const marqueeStyle = {
    animation: `home-marquee ${MARQUEE_DURATION}s linear infinite`,
    animationPlayState: isCarouselPaused ? "paused" : "running",
  } as const;

  return (
    <div className="space-y-12">
      {/* Keyframes locales para el carrusel (concepto: animacion CSS nativa). */}
      <style>{`
        @keyframes home-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
      {/* Hero con animacion de entrada (concepto: motion initial/animate). */}
      <section className="relative overflow-hidden rounded-3xl border border-bone bg-linen p-8 dark:border-night-edge dark:bg-obsidian">
        {/* Capas decorativas para profundidad visual (concepto: posicion absoluta). */}
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-depth/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-electric-sky/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 space-y-6"
        >
          <div className="space-y-3">
            <p className="text-slate text-xs uppercase tracking-[0.25em] dark:text-mist">
              Centro social Alexandria
            </p>
            <h1 className="text-ink text-4xl font-semibold tracking-tight dark:text-screen md:text-5xl">
              {/* Texto con efecto typewriter (concepto: animacion de caracteres). */}
              <TypewriterText
                text="Tu hogar multimedia para juegos, musica y cine."
                delay={0.1}
              />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-slate max-w-2xl text-sm leading-relaxed dark:text-mist"
            >
              Crea colecciones, sigue creadores y guarda cada descubrimiento en un
              solo lugar.
            </motion.p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/movies"
              className="cursor-pointer rounded-full bg-electric-sky px-5 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-sapphire"
            >
              Explorar catalogo
            </a>
            <a
              href="#feed"
              className="cursor-pointer rounded-full border border-bone px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
            >
              Ver feed
            </a>
          </div>
          {/* Metricas derivadas (concepto: renderizado por lista). */}
          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-bone bg-sand/80 p-4 dark:border-night-edge dark:bg-coal/80"
              >
                <p className="text-slate text-xs uppercase tracking-wide dark:text-mist">
                  {stat.label}
                </p>
                <p className="text-ink text-2xl font-semibold dark:text-screen">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Carrusel automatico de posts (concepto: animacion con loop). */}
      <section className="space-y-4" id="circulos">
        <div className="space-y-1">
          <h2 className="text-ink text-xl font-semibold dark:text-screen">
            Circulos en tendencia
          </h2>
          <p className="text-slate text-sm dark:text-mist">
            Movimiento en vivo de las ultimas publicaciones.
          </p>
        </div>

        {hasPosts ? (
          <div
            className="group relative overflow-hidden rounded-2xl border border-bone bg-linen py-4 dark:border-night-edge dark:bg-obsidian"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {/* Carrusel nativo con pausa al hover (concepto: animation-play-state). */}
            <div className="flex w-max gap-4 px-4" style={marqueeStyle}>
              {loopPosts.map((post, index) => (
                <motion.article
                  key={`${post.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  className="w-64 shrink-0 rounded-2xl border border-bone bg-sand p-4 dark:border-night-edge dark:bg-coal"
                >
                  <a
                    href={post.href}
                    className="block h-full"
                    onFocus={() => setIsCarouselPaused(true)}
                    onBlur={() => setIsCarouselPaused(false)}
                    aria-label={`Abrir detalle de ${post.headline}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-depth/60" />
                      <div>
                        <p className="text-ink text-sm font-semibold dark:text-screen">
                          {post.author}
                        </p>
                        <p className="text-slate text-xs dark:text-mist">
                          {post.handle}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-base font-semibold text-ink dark:text-screen">
                      {post.headline}
                    </p>
                    <p className="mt-2 text-xs text-slate leading-relaxed dark:text-mist">
                      {post.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="rounded-full border border-bone px-2 py-1 text-[0.7rem] text-slate dark:border-night-edge dark:text-mist"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </a>
                </motion.article>
              ))}
            </div>
            {/* Degradados laterales para suavizar el loop (concepto: capas overlay). */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-linen to-transparent dark:from-obsidian" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-linen to-transparent dark:from-obsidian" />
          </div>
        ) : (
          <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
            Aun no hay publicaciones. Conecta el feed social para llenar esta
            seccion.
          </div>
        )}
      </section>

      {/* Tendencias de la semana en musica (concepto: seleccion curada). */}
      <section className="space-y-4" id="tendencias">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-ink text-xl font-semibold dark:text-screen">
              <TypewriterText text="Tendencias de la semana" delay={0.05} />
            </h2>
            <p className="text-slate text-sm dark:text-mist">
              Musica mas escuchada y lista para reproducir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Boton para reproducir la cola de musica (concepto: accion contextual). */}
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={playableTracks.length === 0}
              className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky disabled:opacity-40 disabled:cursor-not-allowed dark:border-night-edge dark:text-screen"
            >
              Reproducir todo
            </button>
            <a
              href="/music"
              className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
            >
              Ver musica
            </a>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-bone bg-lilac-mist px-4 py-3 text-sm text-slate dark:border-night-edge dark:bg-depth/20 dark:text-mist">
            {errorMessage}
          </div>
        ) : null}

        {hasWeeklyTracks ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {weeklyTracks.map((track, index) => (
              <motion.article
                key={track.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className="group overflow-hidden rounded-2xl border border-bone bg-sand dark:border-night-edge dark:bg-coal"
              >
                <div className="aspect-[3/4] overflow-hidden bg-parchment dark:bg-obsidian">
                  <img
                    src={track.cover || fallbackCover}
                    alt={track.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-wide text-electric-sky">
                    Musica
                  </p>
                  <h3 className="text-base font-semibold text-ink dark:text-screen">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate dark:text-mist">
                    {track.artist}
                  </p>
                  {track.genre ? (
                    <p className="text-[0.7rem] text-slate dark:text-mist">
                      {track.genre}
                    </p>
                  ) : null}
                  {/* Acciones de musica (concepto: interaccion directa). */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayTrack(track)}
                      disabled={!track.previewUrl}
                      className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky disabled:opacity-40 disabled:cursor-not-allowed dark:border-night-edge dark:text-screen"
                    >
                      {track.previewUrl ? "Reproducir" : "Sin preview"}
                    </button>
                    <a
                      href={`/music/${track.id}`}
                      className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
                    >
                      Ver detalle
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
            No hay tendencias de musica disponibles.
          </div>
        )}
      </section>

      {/* Destacados de peliculas y juegos (concepto: descubrimiento rapido). */}
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

      {/* Feed principal y sidebar (concepto: layout en grid). */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" id="feed">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-ink text-xl font-semibold dark:text-screen">
              Feed reciente
            </h2>
            <a
              href="#circulos"
              className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
            >
              Ver circulos
            </a>
          </div>

          {/* Filtros de etiquetas para el feed (concepto: estado compartido). */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag("Todas")}
              className={getTagButtonClass("Todas")}
              aria-pressed={activeTag === "Todas"}
            >
              Todas
            </button>
            {topTags.map((tag) => (
              <button
                key={`feed-${tag}`}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={getTagButtonClass(tag)}
                aria-pressed={activeTag === tag}
              >
                #{tag}
              </button>
            ))}
          </div>

          {hasFeedPosts ? (
            filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                className="rounded-2xl border border-bone bg-linen p-5 dark:border-night-edge dark:bg-obsidian"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-sapphire/50" />
                    <div>
                      <p className="text-sm font-semibold text-ink dark:text-screen">
                        {post.author}
                      </p>
                      <p className="text-xs text-slate dark:text-mist">
                        {post.handle} - {post.time}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFollow(post.author)}
                    className="cursor-pointer rounded-full bg-depth px-4 py-1 text-xs font-semibold text-screen transition-colors hover:bg-sapphire"
                    aria-pressed={followedAuthors.includes(post.author)}
                  >
                    {followedAuthors.includes(post.author) ? "Siguiendo" : "Seguir"}
                  </button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  {post.cover ? (
                    <img
                      src={post.cover}
                      alt={post.headline}
                      loading="lazy"
                      className="h-36 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-36 rounded-xl bg-gradient-to-br from-depth to-obsidian" />
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-ink dark:text-screen">
                      {post.headline}
                    </h3>
                    <p className="text-sm text-slate leading-relaxed dark:text-mist">
                      {post.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <button
                          key={`${post.id}-feed-${tag}`}
                          type="button"
                          onClick={() => setActiveTag(tag)}
                          className={getTagButtonClass(tag)}
                          aria-pressed={activeTag === tag}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                    aria-pressed={likedPosts.includes(post.id)}
                  >
                    {likedPosts.includes(post.id) ? "Te gusta" : "Me gusta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComment(post.id)}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                  >
                    Comentar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSave(post.id)}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                    aria-pressed={savedPosts.includes(post.id)}
                  >
                    {savedPosts.includes(post.id) ? "Guardado" : "Guardar"}
                  </button>
                  <a
                    href={post.href}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                  >
                    Ver detalle
                  </a>
                </div>

                {/* Editor simple de comentario (concepto: UI condicional). */}
                {activeCommentId === post.id && (
                  <div className="mt-3 rounded-xl border border-bone bg-sand p-3 dark:border-night-edge dark:bg-coal">
                    <label
                      htmlFor={`comment-${post.id}`}
                      className="text-xs text-slate dark:text-mist"
                    >
                      Escribe un comentario
                    </label>
                    <textarea
                      id={`comment-${post.id}`}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-electric-sky/40 dark:border-night-edge dark:bg-obsidian dark:text-screen"
                      placeholder="Comparte tu opinion..."
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveCommentId(null)}
                        className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(post.id)}
                        className="cursor-pointer rounded-full bg-electric-sky px-3 py-1 text-xs font-semibold text-obsidian transition-colors hover:bg-sapphire"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </motion.article>
            ))
          ) : (
            <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
              No hay publicaciones para esta etiqueta. Prueba otra.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-bone bg-sand p-5 dark:border-night-edge dark:bg-coal">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
              Etiquetas destacadas
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {topTags.length > 0 ? (
                topTags.map((tag) => (
                  <button
                    key={`tag-${tag}`}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={getTagButtonClass(tag)}
                    aria-pressed={activeTag === tag}
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate dark:text-mist">
                  Agrega posts para ver etiquetas.
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-bone bg-linen p-5 dark:border-night-edge dark:bg-obsidian">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
              Sugerencias para ti
            </h3>
            <div className="mt-4 space-y-3">
              {suggestedCreators.map((post) => (
                <div
                  key={`suggested-${post.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-screen">
                      {post.author}
                    </p>
                    <p className="text-xs text-slate dark:text-mist">
                      {post.handle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFollow(post.author)}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
                    aria-pressed={followedAuthors.includes(post.author)}
                  >
                    {followedAuthors.includes(post.author) ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-bone bg-sand p-5 dark:border-night-edge dark:bg-coal">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
              Tu proxima coleccion
            </h3>
            <p className="mt-3 text-sm text-slate dark:text-mist">
              Combina juegos, peliculas y musica en una coleccion curada.
            </p>
            <a
              href="/games"
              className="mt-4 inline-flex cursor-pointer rounded-full border border-bone px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
            >
              Empezar coleccion
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
