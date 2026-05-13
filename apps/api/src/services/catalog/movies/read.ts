import { config as loadEnv } from "dotenv";

// CONCEPTO: Carga de Entorno por Prioridad
// QUE HACE: Carga .env local y fallback al .env raiz del monorepo.
// POR QUE LO USO: Evita fallos por rutas de ejecucion diferentes en desarrollo.
loadEnv();
loadEnv({ path: "../../.env" });

import {
  parsePositiveInteger,
  getCacheKey,
  fetchJsonWithTimeout,
  parseCountPayload,
  type PaginatedCatalogResponse,
  type CatalogCacheEntry,
} from "../utils";

// CONCEPTO: Cache In-Memory con TTL
// QUE HACE: Guarda temporalmente listados y detalles para reducir llamadas repetidas.
// POR QUE LO USO: Reduce latencia en rutas calientes del catalogo de peliculas.
const MOVIES_LIST_CACHE_TTL = 5 * 60 * 1000;
const MOVIE_DETAIL_CACHE_TTL = 10 * 60 * 1000;

const moviesListCache = new Map<string, CatalogCacheEntry>();
const movieDetailCache = new Map<number, { data: any; ts: number }>();

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

let genreCache: Map<number, string> | null = null;
let genreCacheTs = 0;
const GENRE_CACHE_TTL = 24 * 60 * 60 * 1000;



async function getGenreMap(headers: Headers, authQuery: string) {
  if (genreCache && Date.now() - genreCacheTs < GENRE_CACHE_TTL) {
    return genreCache;
  }
  const { response, payload } = await fetchJsonWithTimeout(
    `https://api.themoviedb.org/3/genre/movie/list?${authQuery}language=es-ES`,
    { headers },
  );
  if (!response.ok || !Array.isArray(payload?.genres)) {
    throw new Error(`TMDB genero fallo (${response.status})`);
  }
  genreCache = new Map<number, string>(
    payload.genres.map((genre: any) => [genre.id, genre.name]),
  );
  genreCacheTs = Date.now();
  return genreCache;
}

function normalizeMovies(movies: any[], genreById: Map<number, string>) {
  const uniqueMovies = Array.from(
    new Map(movies.map((movie: any) => [movie.id, movie])).values(),
  );

  return uniqueMovies.map((movie: any) => {
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
}

function getGenreIdsByName(
  genreById: Map<number, string>,
  genreNames: string[],
) {
  const genreIdByName = new Map(
    Array.from(genreById.entries()).map(
      ([id, name]) => [name.trim().toLowerCase(), id] as const,
    ),
  );

  return Array.from(
    new Set(
      genreNames
        .map((genreName) => genreIdByName.get(genreName.trim().toLowerCase()))
        .filter((genreId): genreId is number => typeof genreId === "number"),
    ),
  );
}

export async function browseMovies(query: {
  q?: string;
  page?: string;
  limit?: string;
  genres?: string;
}): Promise<PaginatedCatalogResponse<unknown>> {
  return browseMoviesPage(query);
}

export async function browseMoviesPage(query: {
  q?: string;
  page?: string;
  limit?: string;
  genres?: string;
}): Promise<PaginatedCatalogResponse<unknown>> {
  const { headers, authQuery } = resolveTmdbAuth();
  const page = parsePositiveInteger(query.page, 1, 1, 1000);
  const perPage = parsePositiveInteger(query.limit, 20, 1, 100);
  const searchTerm = query.q?.trim() ?? "";
  const genreNames = (query.genres ?? "")
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
  const cacheKey = getCacheKey(searchTerm, page, perPage, genreNames.join(","));

  const cachedResult = moviesListCache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.ts < MOVIES_LIST_CACHE_TTL) {
    return cachedResult.data;
  }

  const genreById = await getGenreMap(headers, authQuery);
  const selectedGenreIds = getGenreIdsByName(genreById, genreNames);
  if (genreNames.length > 0 && selectedGenreIds.length === 0) {
    const responsePayload: PaginatedCatalogResponse<unknown> = {
      items: [],
      total: 0,
      page,
      perPage,
      totalPages: 1,
      genres: Array.from(genreById.values()),
    };

    moviesListCache.set(cacheKey, { data: responsePayload, ts: Date.now() });
    return responsePayload;
  }

  const baseUrl =
    searchTerm.length > 0
      ? "https://api.themoviedb.org/3/search/movie"
      : "https://api.themoviedb.org/3/discover/movie";
  const apiKey = new URLSearchParams(authQuery).get("api_key");
  const fetchTmdbPage = async (tmdbPage: number) => {
    const url = new URL(baseUrl);
    url.searchParams.set("language", "es-ES");
    url.searchParams.set("include_adult", "false");

    if (searchTerm.length > 0) {
      url.searchParams.set("query", searchTerm);
    } else {
      url.searchParams.set("include_video", "false");
      url.searchParams.set("sort_by", "popularity.desc");
      url.searchParams.set("vote_count.gte", "150");
      if (selectedGenreIds.length > 0) {
        url.searchParams.set("with_genres", selectedGenreIds.join("|"));
      }
    }

    url.searchParams.set("page", String(tmdbPage));

    if (apiKey) {
      url.searchParams.set("api_key", apiKey);
    }

    return fetchJsonWithTimeout(url.toString(), { headers });
  };

  const pageResults: Array<{ response: Response; payload: unknown }> = [];

  if (searchTerm.length > 0 && selectedGenreIds.length > 0) {
    const firstResult = await fetchTmdbPage(1);
    if (
      !firstResult.response.ok ||
      !Array.isArray((firstResult.payload as any)?.results)
    ) {
      throw new Error(`TMDB solicitud fallo (${firstResult.response.status})`);
    }

    pageResults.push(firstResult);
    const firstPayload: any = firstResult.payload;
    const totalTmdbPages = Number.isFinite(firstPayload?.total_pages)
      ? Number(firstPayload.total_pages)
      : 1;

    for (let tmdbPage = 2; tmdbPage <= totalTmdbPages; tmdbPage += 1) {
      const result = await fetchTmdbPage(tmdbPage);
      if (
        !result.response.ok ||
        !Array.isArray((result.payload as any)?.results)
      ) {
        throw new Error(`TMDB solicitud fallo (${result.response.status})`);
      }
      pageResults.push(result);
    }
  } else {
    const startIndex = (page - 1) * perPage;
    const startTmdbPage = Math.floor(startIndex / 20) + 1;
    const endTmdbPage = Math.floor((startIndex + perPage - 1) / 20) + 1;
    const tmdbPages = Array.from(
      { length: endTmdbPage - startTmdbPage + 1 },
      (_, index) => startTmdbPage + index,
    );

    const fetchedPages = await Promise.all(
      tmdbPages.map((tmdbPage) => fetchTmdbPage(tmdbPage)),
    );
    for (const result of fetchedPages) {
      if (
        !result.response.ok ||
        !Array.isArray((result.payload as any)?.results)
      ) {
        throw new Error(`TMDB solicitud fallo (${result.response.status})`);
      }
      pageResults.push(result);
    }
  }

  const combinedResults = pageResults.flatMap((result) =>
    Array.isArray((result.payload as any)?.results)
      ? (result.payload as any).results
      : [],
  );

  const filteredResults =
    searchTerm.length > 0 && selectedGenreIds.length > 0
      ? combinedResults.filter(
        (movie: any) =>
          Array.isArray(movie.genre_ids) &&
          movie.genre_ids.some((genreId: number) =>
            selectedGenreIds.includes(genreId),
          ),
      )
      : combinedResults;

  if (filteredResults.length === 0) {
    const responsePayload: PaginatedCatalogResponse<unknown> = {
      items: [],
      total: 0,
      page,
      perPage,
      totalPages: 1,
      genres: Array.from(genreById.values()),
    };

    moviesListCache.set(cacheKey, { data: responsePayload, ts: Date.now() });
    return responsePayload;
  }

  const normalizedCombinedMovies = normalizeMovies(filteredResults, genreById);
  const firstPayload: any = pageResults[0]?.payload;
  const total =
    searchTerm.length > 0 && selectedGenreIds.length > 0
      ? normalizedCombinedMovies.length
      : Number.isFinite(firstPayload?.total_results)
        ? Number(firstPayload.total_results)
        : normalizedCombinedMovies.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const offsetWithinCombined = (page - 1) * perPage;
  const normalizedMovies =
    searchTerm.length > 0 && selectedGenreIds.length > 0
      ? normalizedCombinedMovies.slice(
        offsetWithinCombined,
        offsetWithinCombined + perPage,
      )
      : normalizedCombinedMovies;
  const genres = Array.from(genreById.values());

  const responsePayload: PaginatedCatalogResponse<unknown> = {
    items: normalizedMovies,
    total,
    page,
    perPage,
    totalPages,
    genres,
  };

  moviesListCache.set(cacheKey, { data: responsePayload, ts: Date.now() });

  return responsePayload;
}

// CONCEPTO: Consumo de Tendencias Reales (TMDB)
// QUE HACE: Llama al endpoint oficial de TMDB para obtener lo mas visto de la semana y lo normaliza.
// POR QUE LO USO: Provee datos reales y frescos sin que nuestro servidor tenga que calcular la popularidad.
export async function getTrendingMovies(): Promise<unknown[]> {
  const { headers, authQuery } = resolveTmdbAuth();

  const { response, payload } = await fetchJsonWithTimeout(
    `https://api.themoviedb.org/3/trending/movie/week?${authQuery}language=es-ES`,
    { headers },
  );

  if (!response.ok || !Array.isArray((payload as any)?.results)) {
    throw new Error(
      `TMDB rechazó la solicitud de tendencias (${response.status})`,
    );
  }

  const genreById = await getGenreMap(headers, authQuery);
  const normalizedMovies = normalizeMovies((payload as any).results, genreById);

  return normalizedMovies.slice(0, 10);
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
