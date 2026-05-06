// Importo useState para manejar estado local (concepto: estado de UI en React).
import { useState } from "react";
import type { RecentPost, TrendingItem } from "../../types/home";
// Importo tipos de dominio para catalogo (concepto: contratos de datos).
import type { Game } from "../../types/game";
import type { Movie } from "../../types/movie";
import CirclesSection from "./sections/CirclesSection";
import FeedSection from "./sections/FeedSection";
import HeroSection, { type HeroSpotlight, type HeroStat } from "./sections/HeroSection";
import HighlightsSection from "./sections/HighlightsSection";
import LiveRoomsSection, { type LiveRoom } from "./sections/LiveRoomsSection";
import RecommendationsSection, {
  type RecommendationItem,
} from "./sections/RecommendationsSection";
import SocialPulseSection, { type TagStat } from "./sections/SocialPulseSection";
import TrendingSection from "./sections/TrendingSection";

type CatalogPayload<T> = T[] | { items?: T[] } | null | undefined;

type Props = {
  trending: TrendingItem[];
  games: CatalogPayload<Game>;
  movies: CatalogPayload<Movie>;
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

  // Normalizo payloads de catalogo paginado (concepto: compatibilidad de respuesta).
  const normalizeCatalog = <T,>(payload: CatalogPayload<T>): T[] => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
  };

  // Duplico la lista para simular un carrusel continuo (concepto: repeticion de items).
  const loopPosts = recentPosts.length > 0 ? [...recentPosts, ...recentPosts] : [];
  // Derivo etiquetas desde los posts (concepto: transformacion de arrays con Set).
  const topTags = Array.from(new Set(recentPosts.flatMap((post) => post.tags))).slice(
    0,
    6,
  );
  // Conteo por etiqueta para el panel social (concepto: agregacion por clave).
  const tagStats: TagStat[] = topTags.map((tag) => ({
    tag,
    count: recentPosts.filter((post) => post.tags.includes(tag)).length,
  }));
  // Limito datos del catalogo para la home (concepto: slicing para performance).
  const safeMovies = normalizeCatalog(movies);
  const safeGames = normalizeCatalog(games);
  const featuredTracks = trending.slice(0, 8);
  const featuredMovies = safeMovies.slice(0, 6);
  const featuredGames = safeGames.slice(0, 6);
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
  // Estadisticas derivadas de datos reales (concepto: datos derivados).
  const heroStats: HeroStat[] = [
    { label: "Elementos del catalogo", value: `${catalogTotalCount}`, icon: "tabler:stack-2" },
    { label: "Publicaciones recientes", value: `${recentPosts.length}`, icon: "tabler:messages" },
    { label: "Etiquetas activas", value: `${topTags.length}`, icon: "tabler:hash" },
  ];

  // Destacados del hero para dar contexto inmediato (concepto: resumen visual del contenido real).
  const heroSpotlights: HeroSpotlight[] = [
    {
      id: "hero-music",
      eyebrow: "Musica en tendencia",
      icon: "tabler:vinyl",
      title: featuredTracks[0]?.title ?? "Descubre nuevas pistas",
      subtitle: featuredTracks[0]?.artist ?? "Recomendaciones curadas",
      image: featuredTracks[0]?.cover ?? fallbackCover,
      ctaLabel: featuredTracks[0]?.previewUrl ? "Reproducir" : "Explorar",
      onClick: featuredTracks[0]?.previewUrl
        ? () => handlePlayTrack(featuredTracks[0])
        : undefined,
      href: featuredTracks[0]?.previewUrl ? undefined : "/music",
    },
    {
      id: "hero-movie",
      eyebrow: "Cine destacado",
      icon: "tabler:movie",
      title: featuredMovies[0]?.title ?? "Peliculas para tu noche",
      subtitle: `Puntuacion ${formatRating(featuredMovies[0]?.rating ?? 0)}`,
      image: featuredMovies[0]?.image ?? fallbackCover,
      ctaLabel: featuredMovies[0]?.id ? "Ver pelicula" : "Ver peliculas",
      href: featuredMovies[0]?.id ? `/movies/${featuredMovies[0].id}` : "/movies",
    },
    {
      id: "hero-game",
      eyebrow: "Juego recomendado",
      icon: "tabler:device-gamepad-2",
      title: featuredGames[0]?.title ?? "Explora nuevos mundos",
      subtitle: `Puntuacion ${formatRating(featuredGames[0]?.rating ?? 0)}`,
      image: featuredGames[0]?.image ?? fallbackCover,
      ctaLabel: featuredGames[0]?.id ? "Ver juego" : "Ver juegos",
      href: featuredGames[0]?.id ? `/games/${featuredGames[0].id}` : "/games",
    },
  ];

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
  const handleCommentSubmit = (_postId: string) => {
    if (!commentDraft.trim()) return;
    // TODO: Enviar comentario al backend cuando exista el endpoint.
    setCommentDraft("");
    setActiveCommentId(null);
  };

  // Genero recomendaciones con datos reales del catalogo (concepto: recomendaciones derivadas).
  const recommendations: RecommendationItem[] = [
    ...featuredTracks.slice(0, 2).map<RecommendationItem>((track) => ({
      id: `rec-music-${track.id}`,
      eyebrow: "Musica recomendada",
      icon: "tabler:vinyl",
      title: track.title,
      subtitle: track.artist ?? "Descubre nuevos sonidos",
      href: `/music/${track.id}`,
    })),
    ...featuredMovies.slice(0, 2).map<RecommendationItem>((movie) => ({
      id: `rec-movie-${movie.id}`,
      eyebrow: "Cine recomendado",
      icon: "tabler:movie",
      title: movie.title,
      subtitle: `Puntuacion ${formatRating(movie.rating)}`,
      href: `/movies/${movie.id}`,
    })),
    ...featuredGames.slice(0, 2).map<RecommendationItem>((game) => ({
      id: `rec-game-${game.id}`,
      eyebrow: "Juego recomendado",
      icon: "tabler:device-gamepad-2",
      title: game.title,
      subtitle: `Puntuacion ${formatRating(game.rating)}`,
      href: `/games/${game.id}`,
    })),
  ].slice(0, 6);

  // Simulo salas activas usando datos del feed (concepto: estado social reutilizado).
  const liveRooms: LiveRoom[] = recentPosts.slice(0, 4).map((post, index) => ({
    id: `room-${post.id}`,
    topic: post.headline,
    subtitle: `${post.author} · ${post.time}`,
    href: post.href,
    members: 24 + index * 13,
    tags: post.tags.slice(0, 3),
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

  return (
    <div className="space-y-12">
      {/* Funcional: resume catalogo real cargado por SSR desde /api para mostrar contexto inmediato. */}
      <HeroSection
        heroStats={heroStats}
        heroSpotlights={heroSpotlights}
        kicker="Centro social Alexandria"
        title="Tu hogar multimedia para juegos, musica y cine."
        subtitle="Crea colecciones, sigue creadores y guarda cada descubrimiento en un solo lugar."
        primaryCta={{ href: "/movies", label: "Explorar catalogo" }}
        secondaryCta={{ href: "#feed", label: "Ver feed" }}
        tertiaryCta={{ href: "#tendencias", label: "Ir a tendencias" }}
      />

      {/* Mock de momento: usa `recentPosts` centralizados en `homeData.ts`. Falta conectar feed real y persistente. */}
      <CirclesSection
        loopPosts={loopPosts}
        hasPosts={hasPosts}
        isPaused={isCarouselPaused}
        onPauseChange={setIsCarouselPaused}
        marqueeDuration={MARQUEE_DURATION}
      />

      {/* Funcional: tendencias reales del backend, con play individual y play all. */}
      <TrendingSection
        weeklyTracks={weeklyTracks}
        canPlayAll={playableTracks.length > 0}
        errorMessage={errorMessage}
        onPlayAll={handlePlayAll}
        onPlayTrack={handlePlayTrack}
        fallbackCover={fallbackCover}
      />

      {/* Parcialmente funcional: recomendaciones derivadas de lo que ya cargamos en esta sesion, no de perfil real aun. */}
      <RecommendationsSection items={recommendations} />

      {/* Mock utilitario: genera salas a partir del feed; falta chat/salas persistentes. */}
      <LiveRoomsSection rooms={liveRooms} />

      {/* Mock derivado: solo resume etiquetas del feed actual; faltan señales reales de actividad. */}
      <SocialPulseSection tagStats={tagStats} onTagClick={setActiveTag} />

      {/* Funcional: consume juegos y peliculas reales del API, con fallback visual si falta imagen. */}
      <HighlightsSection
        movieHighlights={movieHighlights}
        gameHighlights={gameHighlights}
        moviesError={moviesError}
        gamesError={gamesError}
        fallbackCover={fallbackCover}
        formatRating={formatRating}
      />

      {/* Mock principal del Home: feed social, likes, guardados y comentarios estan solo en estado local por ahora. */}
      <FeedSection
        filteredPosts={filteredPosts}
        hasFeedPosts={hasFeedPosts}
        topTags={topTags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        likedPosts={likedPosts}
        savedPosts={savedPosts}
        followedAuthors={followedAuthors}
        activeCommentId={activeCommentId}
        commentDraft={commentDraft}
        onLikeToggle={toggleLike}
        onSaveToggle={toggleSave}
        onFollowToggle={toggleFollow}
        onCommentToggle={toggleComment}
        onCommentDraftChange={setCommentDraft}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
  );
}
