import type { TrendingItem } from "../../types/home";
import type { Game } from "../../types/game";
import type { Movie } from "../../types/movie";
import HeroSection from "./sections/HeroSection";
import HomeRailsSection from "./sections/HomeRailsSection";
import HomeShowcaseSection from "./sections/HomeShowcaseSection";
import HomeMarqueeSection from "./sections/HomeMarqueeSection";
import HomeCommunitySection from "./sections/HomeCommunitySection";
import PersonalSidebar from "./PersonalSidebar";
import { normalizeCatalog, type CatalogPayload } from "./sections/home-utils";
import useHomeMixer from "../../hooks/useHomeMixer";

// CONCEPTO: Container Component (Patrón Contenedor / Componente Inteligente)
// QUE HACE: Actúa como el cerebro de la página. Recibe datos crudos del servidor (Astro), los filtra, formatea y los reparte a los componentes visuales "tontos" (HeroSection, HomeRailsSection...).
// POR QUE LO USO: Cumple el principio de Separación de Responsabilidades (SoC). Si la API cambia mañana, solo tocas este archivo; el diseño de las tarjetas se queda intacto.

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

  const { spotlights, featureItems, rails, marqueeItems } = useHomeMixer(
    trending,
    safeMovies,
    safeGames,
    trendingMovies,
    trendingGames
  );

  const errors = [errorMessage, moviesError, gamesError].filter(
    (error): error is string => Boolean(error),
  );

  return (
    <div className="space-y-10">
      <HeroSection
        kicker="Alexandria"
        title="Tu universo cultural empieza aquí."
        subtitle="Tu espacio personal para explorar, coleccionar y compartir las historias, canciones y aventuras que te definen. Todo el entretenimiento en un solo lugar."
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-12">
          <HomeShowcaseSection
            eyebrow="Portada editorial"
            title="Lo mejor del catálogo sin hacerte buscar."
            description="Destacados seleccionados por nuestro equipo editorial para cada medio, basados en calidad, impacto cultural y valor de descubrimiento. Una muestra curada para cada visita."
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