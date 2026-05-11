import type { Movie } from "../../types/movie";
import SharedDetailsLayout from "../shared/details/SharedDetailsLayout";

interface Props {
  movie: Movie;
}

export default function MovieDetailsClient({ movie }: Props) {
  const releaseDate = movie.firstReleaseDate
    ? new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(movie.firstReleaseDate))
    : "Fecha desconocida";

  const heroBackground = movie.backdrop || movie.image;

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const formattedBudget =
    movie.budget && movie.budget > 0
      ? moneyFormatter.format(movie.budget)
      : "No disponible";
  const formattedRevenue =
    movie.revenue && movie.revenue > 0
      ? moneyFormatter.format(movie.revenue)
      : "No disponible";

  const trailerEmbedUrl =
    movie.trailer && movie.trailer.site === "YouTube"
      ? `https://www.youtube.com/embed/${movie.trailer.key}`
      : null;

  const extraHeroTags = movie.runtime ? (
    <span className="bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge">
      ⏱ {movie.runtime} min
    </span>
  ) : null;

  const leftColumn = (
    <>
      <section>
        <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">
          Sinopsis
        </h2>
        <p className="text-slate dark:text-mist leading-relaxed text-lg">{movie.summary}</p>
      </section>

      {trailerEmbedUrl && (
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">
            Trailer oficial
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="aspect-video">
              <iframe
                src={trailerEmbedUrl}
                title={movie.trailer?.title || `Trailer de ${movie.title}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {(movie.cast || []).length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">
            Reparto principal
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(movie.cast || []).map((actor) => (
              <article
                key={`${actor.name}-${actor.character}`}
                className="rounded-xl border border-bone dark:border-night-edge bg-sand dark:bg-coal p-3 shadow-lg"
              >
                <img
                  src={actor.profile || "https://placehold.co/185x278/111827/e5e7eb?text=No+Photo"}
                  alt={`Foto de ${actor.name}`}
                  className="mb-3 h-44 w-full rounded-lg object-cover"
                />
                <p className="text-sm font-semibold text-ink dark:text-screen truncate" title={actor.name}>{actor.name}</p>
                <p className="text-xs text-slate dark:text-mist truncate" title={actor.character}>{actor.character}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const rightColumn = (
    <>
      <div>
        <h3 className="text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold">
          Géneros
        </h3>
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-md border border-red-500/30"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold">
          Datos técnicos
        </h3>
        <ul className="space-y-2 text-sm text-slate dark:text-mist">
          <li>
            <span className="text-slate dark:text-mist block mb-1">Título original:</span>
            <span className="font-semibold text-ink dark:text-screen">{movie.originalTitle || movie.title}</span>
          </li>
          <li>
            <span className="text-slate dark:text-mist block mb-1">Estado:</span>
            {movie.status || "No disponible"}
          </li>
          <li>
            <span className="text-slate dark:text-mist block mb-1">Presupuesto:</span>
            {formattedBudget}
          </li>
          <li>
            <span className="text-slate dark:text-mist block mb-1">Recaudación:</span>
            {formattedRevenue}
          </li>
        </ul>
      </div>

      <div className="space-y-3 pt-4 border-t border-bone dark:border-night-edge">
        {movie.homepage && (
          <a
            href={movie.homepage}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-center font-semibold text-blue-300 hover:bg-blue-500/20 transition"
          >
            Sitio web oficial
          </a>
        )}
        {movie.imdbId && (
          <a
            href={`https://www.imdb.com/title/${movie.imdbId}/`}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center font-semibold text-yellow-300 hover:bg-yellow-500/20 transition"
          >
            Ver en IMDb
          </a>
        )}
      </div>
    </>
  );

  return (
    <SharedDetailsLayout
      id={movie.id}
      title={movie.title}
      type="movie"
      image={movie.image}
      heroBackground={heroBackground}
      heroSubtitle={movie.director || "Dirección desconocida"}
      tagline={movie.tagline}
      rating={movie.rating}
      releaseDate={releaseDate}
      extraHeroTags={extraHeroTags}
      collectionMetadata={{
        image: movie.image,
        rating: movie.rating,
        genres: movie.genres,
        director: movie.director
      }}
      leftColumn={leftColumn}
      rightColumn={rightColumn}
      accentColor="red"
    />
  );
}