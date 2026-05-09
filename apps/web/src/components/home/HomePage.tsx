import type { TrendingItem } from "../../types/home";
import type { Game } from "../../types/game";
import type { Movie } from "../../types/movie";
import HeroSection, {
  type HeroSpotlight,
  type HeroStat,
} from "./sections/HeroSection";
import HomeRailsSection from "./sections/HomeRailsSection";
import HomeShowcaseSection from "./sections/HomeShowcaseSection";
import HomeMarqueeSection, { type MarqueeItem } from "./sections/HomeMarqueeSection";
import HomeCommunitySection from "./sections/HomeCommunitySection";
import PersonalSidebar from "./PersonalSidebar";
import {
  createTrackPlayback,
  fallbackBackdrop,
  fallbackCover,
  formatRating,
  getReleaseYear,
  normalizeCatalog,
  type CatalogPayload,
  type HomeFeatureItem,
  type HomeRail,
} from "./sections/home-utils";

type Props = {
  trending: TrendingItem[];
  games: CatalogPayload<Game>;
  movies: CatalogPayload<Movie>;
  trendingMovies?: Movie[];
  trendingGames?: Game[];
  errorMessage?: string | null;
  gamesError?: string | null;
  moviesError?: string | null;
};

export default function HomePage({
  trending,
  games,
  movies,
  errorMessage,
  gamesError,
  moviesError,
  trendingMovies,
  trendingGames,
}: Props) {
  const safeMovies = normalizeCatalog(movies);
  const safeGames = normalizeCatalog(games);
  
  const featuredTracks = (trending || []).slice(0, 8);
  
  // CONCEPTO: Fallback Defensivo de Datos
  // QUE HACE: Si la API de tendencias falla, inyecta los destacados del catalogo general.
  // POR QUE LO USO: Asegura que la portada nunca colapse o se vea vacia si un servicio externo cae.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const featuredMovies = (trendingMovies?.length ? trendingMovies : safeMovies).slice(0, 8);
  const featuredGames = (trendingGames?.length ? trendingGames : safeGames).slice(0, 8);
  
  const featuredTrack = featuredTracks[0];
  const featuredMovie = featuredMovies[0];
  const featuredGame = featuredGames[0];

  const handlePlayTrack = (track: TrendingItem) => {
    const playback = createTrackPlayback(track);
    if (!playback) return;

    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: playback,
      }),
    );
  };

  const heroStats: HeroStat[] = [
    { label: "Musica", value: `${featuredTracks.length}`, icon: "tabler:vinyl" },
    { label: "Peliculas", value: `${featuredMovies.length}`, icon: "tabler:movie" },
    { label: "Juegos", value: `${featuredGames.length}`, icon: "tabler:device-gamepad-2" },
  ];

  const spotlights: HeroSpotlight[] = [
    {
      label: "Ahora sonando",
      title: featuredTrack?.title ?? "Alexandria Mix",
      subtitle:
        featuredTrack?.artist ?? "Tendencias musicales listas para descubrir.",
      image:
        featuredTrack?.cover ??
        featuredMovie?.backdrop ??
        featuredMovie?.image ??
        fallbackBackdrop,
      href: featuredTrack?.previewUrl ? `/music/${featuredTrack.id}` : "/music",
      accent: "music",
    },
    {
      label: "Cine destacado",
      title: featuredMovie?.title ?? "Sala principal",
      subtitle: featuredMovie
        ? `${formatRating(featuredMovie.rating)} de puntuacion${featuredMovie.genres[0] ? ` · ${featuredMovie.genres[0]}` : ""}`
        : "Tu catalogo de peliculas aparecera aqui.",
      image: featuredMovie?.image ?? fallbackCover,
      href: featuredMovie?.id ? `/movies/${featuredMovie.id}` : "/movies",
      accent: "movie",
    },
    {
      label: "Juego recomendado",
      title: featuredGame?.title ?? "Partida pendiente",
      subtitle: featuredGame
        ? `${formatRating(featuredGame.rating)} de puntuacion${featuredGame.platforms[0] ? ` · ${featuredGame.platforms[0]}` : ""}`
        : "Los juegos destacados se mostraran en esta zona.",
      image: featuredGame?.image ?? fallbackCover,
      href: featuredGame?.id ? `/games/${featuredGame.id}` : "/games",
      accent: "game",
    },
  ];

  const featureItems: HomeFeatureItem[] = [
    ...featuredTracks.slice(0, 4).map((track, index) => ({
      id: `track-${track.id}`,
      label: index === 0 ? "Tendencia principal" : "En rotacion",
      title: track.title,
      subtitle: track.artist ?? "Artista desconocido",
      image: track.cover ?? fallbackCover,
      href: track.previewUrl ? `/music/${track.id}` : "/music",
      meta: track.genre ?? "Musica",
      onClick: track.previewUrl ? () => handlePlayTrack(track) : undefined,
    })),
    ...featuredMovies.slice(0, 3).map((movie) => ({
      id: `movie-${movie.id}`,
      label: "Cine",
      title: movie.title,
      subtitle: movie.summary || movie.tagline || "Ficha de pelicula disponible.",
      image: movie.image ?? fallbackCover,
      href: `/movies/${movie.id}`,
      meta: `${formatRating(movie.rating)}${getReleaseYear(movie.firstReleaseDate) ? ` · ${getReleaseYear(movie.firstReleaseDate)}` : ""}`,
    })),
    ...featuredGames.slice(0, 3).map((game) => ({
      id: `game-${game.id}`,
      label: "Juego",
      title: game.title,
      subtitle: game.summary || game.developer || "Ficha de juego disponible.",
      image: game.image ?? fallbackCover,
      href: `/games/${game.id}`,
      meta: `${formatRating(game.rating)}${game.genres[0] ? ` · ${game.genres[0]}` : ""}`,
    })),
  ].slice(0, 9);

  const rails: HomeRail[] = [
    {
      title: "Musica que marca el ritmo",
      href: "/music",
      items: featuredTracks.slice(4, 8).map((track) => ({
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
      items: featuredMovies.slice(3, 7).map((movie) => ({
        id: movie.id,
        title: movie.title,
        image: movie.image ?? fallbackCover,
        meta: `${formatRating(movie.rating)} / 10`,
        href: `/movies/${movie.id}`,
      })),
    },
    {
      title: "Juegos en portada",
      href: "/games",
      items: featuredGames.slice(3, 7).map((game) => ({
        id: game.id,
        title: game.title,
        image: game.image ?? fallbackCover,
        meta: `${formatRating(game.rating)} / 10`,
        href: `/games/${game.id}`,
      })),
    },
  ];

  const errors = [errorMessage, moviesError, gamesError].filter(
    (error): error is string => Boolean(error),
  );

  // CONCEPTO: Entrelazado de Contenido (Interleaving)
  // QUE HACE: Mezcla elementos de musica, cine y juegos en un solo array iterando secuencialmente.
  // POR QUE LO USO: Logra un carrusel muy variado sin requerir que el backend haga una consulta combinada.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for
  const marqueeItems: MarqueeItem[] = [];
  for (let i = 0; i < 5; i++) {
    if (featuredTracks[i]) {
      marqueeItems.push({
        id: `marquee-track-${featuredTracks[i].id}`,
        title: featuredTracks[i].title,
        image: featuredTracks[i].cover ?? fallbackCover,
        label: "Música",
        href: featuredTracks[i].previewUrl ? `/music/${featuredTracks[i].id}` : "/music",
      });
    }
    if (featuredMovies[i]) {
      marqueeItems.push({
        id: `marquee-movie-${featuredMovies[i].id}`,
        title: featuredMovies[i].title,
        image: featuredMovies[i].image ?? fallbackCover,
        label: "Cine",
        href: `/movies/${featuredMovies[i].id}`,
      });
    }
    if (featuredGames[i]) {
      marqueeItems.push({
        id: `marquee-game-${featuredGames[i].id}`,
        title: featuredGames[i].title,
        image: featuredGames[i].image ?? fallbackCover,
        label: "Juegos",
        href: `/games/${featuredGames[i].id}`,
      });
    }
  }

  return (
    <div className="space-y-10">
      <HeroSection
        heroStats={heroStats}
        kicker="Alexandria"
        title="Tu universo cultural empieza aqui."
        subtitle="Una portada viva para saltar entre musica, peliculas y videojuegos con destacados reales, ritmo visual y caminos claros hacia cada catalogo."
        primaryCta={{ href: "/movies", label: "Explorar cine" }}
        secondaryCta={{ href: "/music", label: "Escuchar tendencias" }}
        tertiaryCta={{ href: "/games", label: "Ver juegos" }}
        spotlights={spotlights}
      />

      {marqueeItems.length > 0 ? <HomeMarqueeSection items={marqueeItems} /> : null}

      {errors.length > 0 ? (
        <section className="rounded-lg border border-bone bg-lilac-mist p-4 text-sm text-slate dark:border-night-edge dark:bg-depth/35 dark:text-mist">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-12">
          <HomeShowcaseSection
            eyebrow="Portada editorial"
            title="Lo mejor del catalogo sin hacerte buscar."
            description="La home resume lo importante: que escuchar, que ver y que jugar. Cada bloque lleva a contenido real y conserva una lectura rapida en movil."
            featureItems={featureItems}
          />

          <HomeCommunitySection />

          <HomeRailsSection rails={rails} />
        </div>

        <PersonalSidebar />
      </div>
    </div>
  );
}
