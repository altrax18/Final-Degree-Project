import { config as loadEnv } from "dotenv";

// CONCEPTO: Carga de Entorno por Prioridad
// QUE HACE: Carga .env local y fallback al .env raiz del monorepo.
// POR QUE LO USO: Evita fallos por rutas de ejecucion diferentes en desarrollo.
// DOCUMENTACION: https://github.com/motdotla/dotenv
loadEnv();
loadEnv({ path: "../../.env" });

// CONCEPTO: Timeouts de Red Controlados
// QUE HACE: Corta peticiones a servicios externos que exceden el tiempo maximo permitido.
// POR QUE LO USO: Mejora resiliencia del endpoint de peliculas cuando TMDB esta lento.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

// CONCEPTO: Cache In-Memory con TTL
// QUE HACE: Guarda temporalmente listados y detalles para reducir llamadas repetidas.
// POR QUE LO USO: Reduce latencia en rutas calientes del catalogo de peliculas.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
const MOVIES_LIST_CACHE_TTL = 5 * 60 * 1000;
const MOVIE_DETAIL_CACHE_TTL = 10 * 60 * 1000;

let moviesListCache: { data: any[]; ts: number } | null = null;
const movieDetailCache = new Map<number, { data: any; ts: number }>();

async function fetchJsonWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, EXTERNAL_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...(init ?? {}),
      signal: controller.signal,
    });
    const payload = await response.json();
    return { response, payload };
  } finally {
    clearTimeout(timeoutId);
  }
}

function resolveTmdbAuth() {
  const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN;
  const tmdbApiKey = process.env.TMDB_API_KEY;

  if (!tmdbBearerToken && !tmdbApiKey) {
    throw new Error(
      "Falta configuracion TMDB: define TMDB_BEARER_TOKEN o TMDB_API_KEY en variables de entorno",
    );
  }

  const headers = new Headers({
    accept: "application/json",
  });

  if (tmdbBearerToken) {
    headers.set("Authorization", `Bearer ${tmdbBearerToken}`);
    return {
      headers,
      authQuery: "",
    };
  }

  return {
    headers,
    authQuery: `api_key=${encodeURIComponent(tmdbApiKey as string)}&`,
  };
}

function parsePositiveMovieId(rawId: string): number {
  const parsedId = Number(rawId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("El id de la pelicula debe ser un entero positivo");
  }

  return parsedId;
}

export async function browseMovies(_query?: string): Promise<unknown[]> {
  if (
    moviesListCache &&
    Date.now() - moviesListCache.ts < MOVIES_LIST_CACHE_TTL
  ) {
    return moviesListCache.data;
  }

  const { headers, authQuery } = resolveTmdbAuth();
  const tmdbPagesToFetch = 4;
  const pages = Array.from(
    { length: tmdbPagesToFetch },
    (_, index) => index + 1,
  );

  const [genresResult, ...discoverResults] = await Promise.all([
    fetchJsonWithTimeout(
      `https://api.themoviedb.org/3/genre/movie/list?${authQuery}language=es-ES`,
      { headers },
    ),
    ...pages.map((page) =>
      fetchJsonWithTimeout(
        `https://api.themoviedb.org/3/discover/movie?${authQuery}include_adult=false&include_video=false&language=es-ES&page=${page}&sort_by=popularity.desc&vote_count.gte=150`,
        { headers },
      ),
    ),
  ]);

  const genresPayload: any = genresResult.payload;
  const discoverResponses = discoverResults.map((result) => result.response);
  const discoverPayloads: any[] = discoverResults.map(
    (result) => result.payload,
  );

  if (!genresResult.response.ok || !Array.isArray(genresPayload?.genres)) {
    throw new Error(`TMDB genero fallo (${genresResult.response.status})`);
  }

  if (discoverResponses.some((response) => !response.ok)) {
    const failedResponse = discoverResponses.find((response) => !response.ok);
    throw new Error(`TMDB discover fallo (${failedResponse?.status ?? 500})`);
  }

  if (discoverPayloads.some((payload) => !Array.isArray(payload?.results))) {
    throw new Error("TMDB discover devolvio una estructura invalida");
  }

  const genreById = new Map<number, string>(
    genresPayload.genres.map((genre: any) => [genre.id, genre.name]),
  );

  const mergedMovies = discoverPayloads.flatMap((payload) => payload.results);
  const uniqueMovies = Array.from(
    new Map(mergedMovies.map((movie: any) => [movie.id, movie])).values(),
  );

  const normalizedMovies = uniqueMovies.map((movie: any) => {
    const parsedDate = movie.release_date
      ? Date.parse(`${movie.release_date}T00:00:00Z`)
      : NaN;

    return {
      id: String(movie.id),
      title: movie.title || movie.original_title || "Sin titulo",
      type: "movie" as const,
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      rating: Math.round((movie.vote_average || 0) * 10),
      firstReleaseDate: Number.isNaN(parsedDate) ? null : parsedDate,
      summary: movie.overview || "Sin descripcion disponible.",
      genres: Array.isArray(movie.genre_ids)
        ? movie.genre_ids
            .map((id: number) => genreById.get(id))
            .filter((genre: string | undefined): genre is string =>
              Boolean(genre),
            )
        : [],
    };
  });

  moviesListCache = {
    data: normalizedMovies,
    ts: Date.now(),
  };

  return normalizedMovies;
}

export async function getMovieByApiId(apiId: string): Promise<unknown> {
  const parsedMovieId = parsePositiveMovieId(apiId);

  const cachedMovieDetail = movieDetailCache.get(parsedMovieId);
  if (
    cachedMovieDetail &&
    Date.now() - cachedMovieDetail.ts < MOVIE_DETAIL_CACHE_TTL
  ) {
    return cachedMovieDetail.data;
  }

  const { headers, authQuery } = resolveTmdbAuth();
  const { response, payload: detailPayload } = await fetchJsonWithTimeout(
    `https://api.themoviedb.org/3/movie/${parsedMovieId}?${authQuery}language=es-ES&append_to_response=credits,videos`,
    { headers },
  );

  if (!response.ok || !detailPayload?.id) {
    return null;
  }

  const parsedDate = detailPayload.release_date
    ? Date.parse(`${detailPayload.release_date}T00:00:00Z`)
    : NaN;

  const director = Array.isArray(detailPayload?.credits?.crew)
    ? detailPayload.credits.crew.find(
        (person: any) => person?.job === "Director",
      )
    : null;

  const videos = Array.isArray(detailPayload?.videos?.results)
    ? detailPayload.videos.results
    : [];

  const prioritizedTrailer =
    videos.find(
      (video: any) =>
        video?.site === "YouTube" &&
        video?.type === "Trailer" &&
        video?.official === true &&
        video?.iso_639_1 === "es",
    ) ||
    videos.find(
      (video: any) =>
        video?.site === "YouTube" &&
        video?.type === "Trailer" &&
        video?.official === true,
    ) ||
    videos.find(
      (video: any) => video?.site === "YouTube" && video?.type === "Trailer",
    ) ||
    null;

  const cast = Array.isArray(detailPayload?.credits?.cast)
    ? detailPayload.credits.cast.slice(0, 8).map((actor: any) => ({
        name:
          typeof actor?.name === "string" ? actor.name : "Actor desconocido",
        character:
          typeof actor?.character === "string"
            ? actor.character
            : "Personaje desconocido",
        profile:
          typeof actor?.profile_path === "string"
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : null,
      }))
    : [];

  const normalizedMovieDetail = {
    id: String(detailPayload.id),
    title: detailPayload.title || detailPayload.original_title || "Sin titulo",
    type: "movie" as const,
    originalTitle:
      typeof detailPayload.original_title === "string"
        ? detailPayload.original_title
        : detailPayload.title || "Sin titulo",
    image: detailPayload.poster_path
      ? `https://image.tmdb.org/t/p/w500${detailPayload.poster_path}`
      : null,
    backdrop: detailPayload.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${detailPayload.backdrop_path}`
      : null,
    rating: Math.round((detailPayload.vote_average || 0) * 10),
    voteCount: Number.isFinite(detailPayload.vote_count)
      ? Number(detailPayload.vote_count)
      : 0,
    firstReleaseDate: Number.isNaN(parsedDate) ? null : parsedDate,
    summary: detailPayload.overview || "Sin descripcion disponible.",
    tagline: detailPayload.tagline || null,
    runtime: Number.isFinite(detailPayload.runtime)
      ? Number(detailPayload.runtime)
      : null,
    spokenLanguages: Array.isArray(detailPayload.spoken_languages)
      ? detailPayload.spoken_languages
          .map((language: any) => language?.english_name || language?.name)
          .filter((name: unknown): name is string => typeof name === "string")
      : [],
    status:
      typeof detailPayload.status === "string"
        ? detailPayload.status
        : "Estado desconocido",
    budget: Number.isFinite(detailPayload.budget)
      ? Number(detailPayload.budget)
      : null,
    revenue: Number.isFinite(detailPayload.revenue)
      ? Number(detailPayload.revenue)
      : null,
    homepage:
      typeof detailPayload.homepage === "string" &&
      detailPayload.homepage.length > 0
        ? detailPayload.homepage
        : null,
    imdbId:
      typeof detailPayload.imdb_id === "string" &&
      detailPayload.imdb_id.length > 0
        ? detailPayload.imdb_id
        : null,
    genres: Array.isArray(detailPayload.genres)
      ? detailPayload.genres
          .map((genre: any) => genre?.name)
          .filter(
            (genre: unknown): genre is string => typeof genre === "string",
          )
      : [],
    director:
      director && typeof director.name === "string"
        ? director.name
        : "Direccion desconocida",
    productionCompanies: Array.isArray(detailPayload.production_companies)
      ? detailPayload.production_companies
          .map((company: any) => company?.name)
          .filter((name: unknown): name is string => typeof name === "string")
      : [],
    productionCountries: Array.isArray(detailPayload.production_countries)
      ? detailPayload.production_countries
          .map((country: any) => country?.name)
          .filter((name: unknown): name is string => typeof name === "string")
      : [],
    trailer: prioritizedTrailer
      ? {
          key: String(prioritizedTrailer.key || ""),
          title:
            typeof prioritizedTrailer.name === "string"
              ? prioritizedTrailer.name
              : "Trailer",
          site:
            typeof prioritizedTrailer.site === "string"
              ? prioritizedTrailer.site
              : "Desconocido",
          type:
            typeof prioritizedTrailer.type === "string"
              ? prioritizedTrailer.type
              : "Video",
          official: Boolean(prioritizedTrailer.official),
        }
      : null,
    cast,
  };

  movieDetailCache.set(parsedMovieId, {
    data: normalizedMovieDetail,
    ts: Date.now(),
  });

  return normalizedMovieDetail;
}
