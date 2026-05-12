import { useState, useEffect, useMemo } from "react";
import type { TrendingItem } from "../types/home";
import type { Game } from "../types/game";
import type { Movie } from "../types/movie";
import type { HeroSpotlight } from "../components/home/sections/HeroSection";
import type { MarqueeItem } from "../components/home/sections/HomeMarqueeSection";
import {
  createTrackPlayback,
  fallbackBackdrop,
  fallbackCover,
  formatRating,
  getReleaseYear,
  type HomeFeatureItem,
  type HomeRail,
} from "../components/home/sections/home-utils";

const MAX_ITEMS = 8;

// CONCEPTO: Custom Hook (Separación de Lógica y Vista)
// QUE HACE: Extrae toda la transformación de datos (Shuffle y Mapeo a ViewModels) fuera del componente visual.
// POR QUE LO USO: Mantiene el componente HomePage enfocado puramente en renderizar el Layout, elimina repetición de código (DRY) y hace la lógica fácilmente testeable.
export default function useHomeMixer(
  trending: TrendingItem[],
  safeMovies: Movie[],
  safeGames: Game[],
  trendingMovies?: Movie[],
  trendingGames?: Game[],
) {
  // 1. Fuentes de verdad limpias y estables (DRY)
  const baseTracks = useMemo(() => trending || [], [trending]);
  const baseMovies = useMemo(
    () => (trendingMovies?.length ? trendingMovies : safeMovies),
    [trendingMovies, safeMovies],
  );
  const baseGames = useMemo(
    () => (trendingGames?.length ? trendingGames : safeGames),
    [trendingGames, safeGames],
  );

  // 2. Estado Inicial (Hydration Safe)
  const [featuredTracks, setFeaturedTracks] = useState(() =>
    baseTracks.slice(0, MAX_ITEMS),
  );
  const [featuredMovies, setFeaturedMovies] = useState(() =>
    baseMovies.slice(0, MAX_ITEMS),
  );
  const [featuredGames, setFeaturedGames] = useState(() =>
    baseGames.slice(0, MAX_ITEMS),
  );

  // 3. Efecto de Mezcla (Client-Side Shuffling sin romper reglas de ESLint)
  useEffect(() => {
    const shuffle = <T>(array: T[]) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    setFeaturedTracks(shuffle(baseTracks).slice(0, MAX_ITEMS));
    setFeaturedMovies(shuffle(baseMovies).slice(0, MAX_ITEMS));
    setFeaturedGames(shuffle(baseGames).slice(0, MAX_ITEMS));
  }, [baseTracks, baseMovies, baseGames]);

  const handlePlayTrack = (track: TrendingItem) => {
    const playback = createTrackPlayback(track);
    if (playback)
      window.dispatchEvent(new CustomEvent("play-track", { detail: playback }));
  };

  // 4A. Mapeos FIJOS (Editorial): Spotlights, Showcase y Raíles usan los verdaderos Top de la API
  const spotlights = useMemo<HeroSpotlight[]>(() => {
    const track = baseTracks[0];
    const movie = baseMovies[0];
    const game = baseGames[0];

    return [
      {
        label: "La más escuchada",
        title: track?.title ?? "Alexandria Mix",
        subtitle:
          track?.artist ?? "Tendencias musicales listas para descubrir.",
        image:
          track?.cover ?? movie?.backdrop ?? movie?.image ?? fallbackBackdrop,
        href: track?.previewUrl ? `/music/${track.id}` : "/music",
        accent: "music",
      },
      {
        label: "Cine destacado",
        title: movie?.title ?? "Sala principal",
        subtitle: movie
          ? `${formatRating(movie.rating)} de puntuación${movie.genres[0] ? ` · ${movie.genres[0]}` : ""}`
          : "Tu catálogo de películas aparecerá aquí.",
        image: movie?.image ?? fallbackCover,
        href: movie?.id ? `/movies/${movie.id}` : "/movies",
        accent: "movie",
      },
      {
        label: "Juego recomendado",
        title: game?.title ?? "Partida pendiente",
        subtitle: game
          ? `${formatRating(game.rating)} de puntuación${game.platforms[0] ? ` · ${game.platforms[0]}` : ""}`
          : "Los juegos destacados se mostrarán en esta zona.",
        image: game?.image ?? fallbackCover,
        href: game?.id ? `/games/${game.id}` : "/games",
        accent: "game",
      },
    ];
  }, [baseTracks, baseMovies, baseGames]);

  const featureItems = useMemo<HomeFeatureItem[]>(
    () => [
      ...baseTracks.slice(0, 3).map((track, index) => ({
        id: `track-${track.id}`,
        label: index === 0 ? "Tendencia principal" : "En rotación",
        title: track.title,
        subtitle: track.artist ?? "Artista desconocido",
        image: track.cover ?? fallbackCover,
        href: track.previewUrl ? `/music/${track.id}` : "/music",
        meta: track.genre ?? "Música",
        onClick: track.previewUrl ? () => handlePlayTrack(track) : undefined,
      })),
      ...baseMovies.slice(0, 3).map((movie) => ({
        id: `movie-${movie.id}`,
        label: "Cine",
        title: movie.title,
        subtitle:
          movie.summary || movie.tagline || "Ficha de película disponible.",
        image: movie.image ?? fallbackCover,
        href: `/movies/${movie.id}`,
        meta: `${formatRating(movie.rating)}${getReleaseYear(movie.firstReleaseDate) ? ` · ${getReleaseYear(movie.firstReleaseDate)}` : ""}`,
      })),
      ...baseGames.slice(0, 3).map((game) => ({
        id: `game-${game.id}`,
        label: "Juego",
        title: game.title,
        subtitle:
          game.summary || game.developer || "Ficha de juego disponible.",
        image: game.image ?? fallbackCover,
        href: `/games/${game.id}`,
        meta: `${formatRating(game.rating)}${game.genres[0] ? ` · ${game.genres[0]}` : ""}`,
      })),
    ],
    [baseTracks, baseMovies, baseGames],
  );

  const rails = useMemo<HomeRail[]>(
    () => [
      {
        title: "Música que marca el ritmo",
        href: "/music",
        items: baseTracks.slice(3, 7).map((track) => ({
          id: track.id,
          title: track.title,
          image: track.cover ?? fallbackCover,
          meta: track.artist ?? "Artista desconocido",
          href: track.previewUrl ? `/music/${track.id}` : "/music",
        })),
      },
      {
        title: "Cine para abrir sala",
        href: "/movies",
        items: baseMovies.slice(3, 7).map((movie) => ({
          id: movie.id,
          title: movie.title,
          image: movie.image ?? fallbackCover,
          meta: `${formatRating(movie.rating)} / 100`,
          href: `/movies/${movie.id}`,
        })),
      },
      {
        title: "Juegos en portada",
        href: "/games",
        items: baseGames.slice(3, 7).map((game) => ({
          id: game.id,
          title: game.title,
          image: game.image ?? fallbackCover,
          meta: `${formatRating(game.rating)} / 100`,
          href: `/games/${game.id}`,
        })),
      },
    ],
    [baseTracks, baseMovies, baseGames],
  );

  // 4B. Mapeo ALEATORIO: Solo el Marquee usa las listas 'featured' (shuffled) para mantenerse dinámico
  const marqueeItems = useMemo<MarqueeItem[]>(() => {
    const items: MarqueeItem[] = [];
    for (let i = 0; i < 5; i++) {
      if (featuredTracks[i])
        items.push({
          id: `marquee-track-${featuredTracks[i].id}`,
          title: featuredTracks[i].title,
          image: featuredTracks[i].cover ?? fallbackCover,
          label: "Música",
          href: featuredTracks[i].previewUrl
            ? `/music/${featuredTracks[i].id}`
            : "/music",
        });
      if (featuredMovies[i])
        items.push({
          id: `marquee-movie-${featuredMovies[i].id}`,
          title: featuredMovies[i].title,
          image: featuredMovies[i].image ?? fallbackCover,
          label: "Cine",
          href: `/movies/${featuredMovies[i].id}`,
        });
      if (featuredGames[i])
        items.push({
          id: `marquee-game-${featuredGames[i].id}`,
          title: featuredGames[i].title,
          image: featuredGames[i].image ?? fallbackCover,
          label: "Juegos",
          href: `/games/${featuredGames[i].id}`,
        });
    }
    return items;
  }, [featuredTracks, featuredMovies, featuredGames]);

  return { spotlights, featureItems, rails, marqueeItems };
}
