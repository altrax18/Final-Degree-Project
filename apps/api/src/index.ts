import { Elysia, t } from "elysia";
import cors from "@elysiajs/cors";
import { config as loadEnv } from "dotenv";

// CONCEPTO: Carga de Entorno por Prioridad
// QUE HACE: Carga .env local de api y luego .env raiz como fallback.
// POR QUE LO USO: Facilita ejecutar la app desde distintos directorios del monorepo.
// DOCUMENTACION: https://github.com/motdotla/dotenv
// Load env from local api folder first, then monorepo root as fallback.
loadEnv();
loadEnv({ path: "../../.env" });

// CONCEPTO: Reutilizacion de Schemas
// QUE HACE: Define una base comun para los campos compartidos entre movie y game.
// POR QUE LO USO: Evita duplicar contratos de respuesta y facilita cambios futuros.
// DOCUMENTACION: https://elysiajs.com/patterns/typebox.html
const sharedMediaResponseFields = {
  id: t.String(),
  title: t.String(),
  image: t.Nullable(t.String()),
  rating: t.Number(),
  firstReleaseDate: t.Nullable(t.Number()),
  summary: t.String(),
  genres: t.Array(t.String()),
};

// CONCEPTO: Composicion de Objetos
// QUE HACE: Crea schemas especificos por tipo reutilizando la base comun.
// POR QUE LO USO: Mantiene DRY el contrato de salida en endpoints relacionados.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
const gameResponseSchema = t.Array(
  t.Object({
    ...sharedMediaResponseFields,
    type: t.Literal("game"),
    platforms: t.Array(t.String()),
  }),
);

const movieResponseSchema = t.Array(
  t.Object({
    ...sharedMediaResponseFields,
    type: t.Literal("movie"),
  }),
);

const movieDetailResponseSchema = t.Object({
  ...sharedMediaResponseFields,
  type: t.Literal("movie"),
  backdrop: t.Nullable(t.String()),
  tagline: t.Nullable(t.String()),
  runtime: t.Nullable(t.Number()),
  voteCount: t.Number(),
  originalTitle: t.String(),
  spokenLanguages: t.Array(t.String()),
  status: t.String(),
  budget: t.Nullable(t.Number()),
  revenue: t.Nullable(t.Number()),
  homepage: t.Nullable(t.String()),
  imdbId: t.Nullable(t.String()),
  director: t.String(),
  productionCompanies: t.Array(t.String()),
  productionCountries: t.Array(t.String()),
  trailer: t.Nullable(
    t.Object({
      key: t.String(),
      title: t.String(),
      site: t.String(),
      type: t.String(),
      official: t.Boolean(),
    }),
  ),
  cast: t.Array(
    t.Object({
      name: t.String(),
      character: t.String(),
      profile: t.Nullable(t.String()),
    }),
  ),
});

// ─── Constantes de la API de iTunes ─────────────────────────────────────────────────────
const ITUNES_SEARCH = "https://itunes.apple.com/search";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";
const APPLE_RSS_SONGS =
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/24/songs.json";

// Términos de búsqueda rotados en cada página de "cargar más" (página 0 = RSS en tendencia, omitido aquí)
const MORE_TERMS = [
  "pop hits 2024",
  "hip hop hits",
  "indie alternative",
  "r&b soul",
  "rock classics",
  "country hits",
  "electronic dance",
  "latin hits 2024",
  "new music 2025",
  "top 40",
];

// ─── Caché en memoria (solo tendencias, 1 h TTL) ────────────────────────────────
const CACHE_TTL = 60 * 60 * 1000;
let trendingSongsCache: { data: Track[]; ts: number } | null = null;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  cover: string | null;
  previewUrl?: string | null;
  releaseDate?: string;
  duration?: number;
  genre?: string;
}

// ─── Funciones Auxiliares ──────────────────────────────────────────────────────────────────
function getBestArtwork(item: any): string | null {
  const base = item.artworkUrl100 ?? item.artworkUrl60 ?? item.artworkUrl30;
  if (!base) return null;
  return (base as string).replace(/\/\d+x\d+bb/, "/600x600bb");
}

function toTrack(item: any): Track {
  return {
    id: String(item.trackId ?? item.collectionId ?? ""),
    title: item.trackName ?? item.collectionName ?? "Unknown",
    artist: item.artistName ?? "Unknown",
    artistId: item.artistId ? String(item.artistId) : undefined,
    album: item.collectionName,
    albumId: item.collectionId ? String(item.collectionId) : undefined,
    cover: getBestArtwork(item),
    previewUrl: item.previewUrl ?? null,
    releaseDate: item.releaseDate,
    duration: item.trackTimeMillis,
    genre: item.primaryGenreName,
  };
}

// ─── Aplicación ──────────────────────────────────────────────────────────────────────
const trendingMock = [
  {
    id: "1",
    title: "Dune: Part Two",
    type: "movie" as const,
    image: "https://placehold.co/300x450/1a1a2e/e94560?text=Dune+2",
  },
  {
    id: "2",
    title: "Elden Ring",
    type: "game" as const,
    image: "https://placehold.co/300x450/16213e/0f3460?text=Elden+Ring",
  },
  {
    id: "3",
    title: "Shogun",
    type: "series" as const,
    image: "https://placehold.co/300x450/0f3460/533483?text=Shogun",
  },
];

// CONCEPTO: Estrategia de Autenticacion Flexible
// QUE HACE: Resuelve credenciales TMDB aceptando Bearer token (v4) o API key (v3).
// POR QUE LO USO: Evita fallos por diferencias de configuracion entre entornos y simplifica mantenimiento.
// DOCUMENTACION: https://developer.themoviedb.org/docs/authentication-application
function resolveTmdbAuth() {
  const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN;
  const tmdbApiKey = process.env.TMDB_API_KEY;

  if (!tmdbBearerToken && !tmdbApiKey) {
    throw new Error(
      "Falta configuracion TMDB: define TMDB_BEARER_TOKEN o TMDB_API_KEY en variables de entorno",
    );
  }

  // CONCEPTO: Headers API Nativa
  // QUE HACE: Construye un objeto Headers consistente para evitar unions ambiguas de TypeScript.
  // POR QUE LO USO: Garantiza compatibilidad de tipos con fetch en todos los caminos de autenticacion.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/API/Headers
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

// CONCEPTO: Utilidad Reutilizable de Validacion
// QUE HACE: Convierte y valida un id de ruta como entero positivo.
// POR QUE LO USO: Evita duplicar la misma guardia en multiples endpoints de detalle.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
function parsePositiveEntityId(rawId: string, entityLabel: string): number {
  const parsedId = Number(rawId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error(`El id de ${entityLabel} debe ser un entero positivo`);
  }

  return parsedId;
}
// CONCEPTO: OAuth Client Credentials Flow
// QUE HACE: Solicita token machine-to-machine a Twitch para autenticar peticiones a IGDB.
// POR QUE LO USO: IGDB requiere un Bearer token valido en cada consulta privada.
// DOCUMENTACION: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
async function getTwitchToken() {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    throw new Error(
      "Faltan TWITCH_CLIENT_ID y/o TWITCH_CLIENT_SECRET en variables de entorno",
    );
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );

  const data: any = await res.json();
  if (!res.ok || !data?.access_token) {
    throw new Error(
      `No se pudo obtener token de Twitch (${res.status}): ${data?.message || "respuesta invalida"}`,
    );
  }

  return data.access_token;
}

// CONCEPTO: Llamada autenticada a TMDB
// QUE HACE: Consulta peliculas populares y mapea IDs de genero a nombres legibles.
// POR QUE LO USO: La UI necesita datos normalizados (titulo, portada, rating y generos) sin logica extra.
// DOCUMENTACION: https://developer.themoviedb.org/reference/discover-movie
async function getTmdbMovies() {
  const { headers, authQuery } = resolveTmdbAuth();

  // CONCEPTO: Configuracion Parametrica
  // QUE HACE: Define cuantas paginas de TMDB vamos a solicitar por cada llamada al endpoint interno.
  // POR QUE LO USO: Cada pagina trae maximo 20 peliculas; pidiendo varias garantizamos suficientes items para paginacion en frontend.
  // DOCUMENTACION: https://developer.themoviedb.org/reference/discover-movie
  const TMDB_PAGES_TO_FETCH = 4;

  // CONCEPTO: Programacion Declarativa con Arrays
  // QUE HACE: Construye [1, 2, 3, ...] para iterar paginas de discover.
  // POR QUE LO USO: Evita codigo duplicado de fetch por pagina y facilita ajustar el volumen en una sola variable.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  const pages = Array.from(
    { length: TMDB_PAGES_TO_FETCH },
    (_, index) => index + 1,
  );

  const [genresResponse, ...discoverResponses] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/genre/movie/list?${authQuery}language=es-ES`,
      {
        headers,
      },
    ),
    ...pages.map((page) =>
      fetch(
        `https://api.themoviedb.org/3/discover/movie?${authQuery}include_adult=false&include_video=false&language=es-ES&page=${page}&sort_by=popularity.desc&vote_count.gte=150`,
        {
          headers,
        },
      ),
    ),
  ]);

  const genresPayload: any = await genresResponse.json();
  const discoverPayloads: any[] = await Promise.all(
    discoverResponses.map((response) => response.json()),
  );

  if (!genresResponse.ok || !Array.isArray(genresPayload?.genres)) {
    throw new Error(`TMDB genero fallo (${genresResponse.status})`);
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

  // CONCEPTO: Flatten + Deduplicacion
  // QUE HACE: Une resultados de todas las paginas y elimina ids repetidos.
  // POR QUE LO USO: Garantiza una lista unica y mas larga para el paginador del catalogo.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  const mergedMovies = discoverPayloads.flatMap((payload) => payload.results);
  const uniqueMovies = Array.from(
    new Map(mergedMovies.map((movie: any) => [movie.id, movie])).values(),
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
      // Escala de TMDB (0-10) a escala visual 0-100 usada en cards actuales.
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

// CONCEPTO: Endpoint de Detalle de Recurso
// QUE HACE: Recupera una pelicula puntual de TMDB por ID y la normaliza al contrato interno.
// POR QUE LO USO: El catalogo usa un payload compacto, pero el detalle necesita campos extra (tagline, runtime, director).
// DOCUMENTACION: https://developer.themoviedb.org/reference/movie-details
async function getTmdbMovieById(movieId: number) {
  const { headers, authQuery } = resolveTmdbAuth();

  // CONCEPTO: Expandir Payload con append_to_response
  // QUE HACE: Pide en una sola llamada los bloques de videos y credits junto al detalle principal.
  // POR QUE LO USO: Evita multiples round-trips y reduce latencia en la pagina de detalle.
  // DOCUMENTACION: https://developer.themoviedb.org/reference/movie-details
  const detailResponse = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?${authQuery}language=es-ES&append_to_response=credits,videos`,
    {
      headers,
    },
  );

  const detailPayload: any = await detailResponse.json();
  if (!detailResponse.ok || !detailPayload?.id) {
    throw new Error(`TMDB detalle fallo (${detailResponse.status})`);
  }

  const parsedDate = detailPayload.release_date
    ? Date.parse(`${detailPayload.release_date}T00:00:00Z`)
    : NaN;

  const director = Array.isArray(detailPayload?.credits?.crew)
    ? detailPayload.credits.crew.find(
        (person: any) => person?.job === "Director",
      )
    : null;

  // CONCEPTO: Seleccion de Trailer Prioritario
  // QUE HACE: Elige primero trailer oficial de YouTube en espanol; si no existe, usa el mejor candidato disponible.
  // POR QUE LO USO: Incrementa la probabilidad de mostrar un trailer reproducible y relevante para el usuario.
  // DOCUMENTACION: https://developer.themoviedb.org/reference/movie-videos
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

  // CONCEPTO: Recorte de Reparto Principal
  // QUE HACE: Mantiene solo los 8 actores de mayor prioridad en credits.cast.
  // POR QUE LO USO: Evita saturar la UI y conserva foco en el elenco principal.
  // DOCUMENTACION: https://developer.themoviedb.org/reference/movie-credits
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

  return {
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
}

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ message: "Alexandria API is running" }))
  .get("/api/trending", () => trendingMock)
  .get(
    "/api/games",
    async () => {
      // CONCEPTO: Encadenado de APIs
      // QUE HACE: Pide token a Twitch y luego consulta IGDB con ese token.
      // POR QUE LO USO: Separa autenticacion y datos para controlar errores en cada fase.
      // DOCUMENTACION: https://api-docs.igdb.com/
      const token = await getTwitchToken();
      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
        // CONCEPTO: IGDB API Query Language
        // QUE HACE: Define campos, filtros, orden y limite en una sola consulta textual.
        // POR QUE LO USO: Reduce payload y solo trae lo que la UI necesita.
        // DOCUMENTACION: https://api-docs.igdb.com/#filters
        // Añadimos genres.name, platforms.name y summary
        body: "fields name, cover.url, summary, total_rating, first_release_date, genres.name, platforms.name; where cover != null & total_rating != null; sort total_rating desc; limit 70;",
      });

      const rawGames: any = await response.json();
      if (!response.ok || !Array.isArray(rawGames)) {
        throw new Error(`IGDB rechazó la solicitud (${response.status})`);
      }

      // CONCEPTO: Normalizacion de Datos
      // QUE HACE: Convierte la respuesta cruda de IGDB al contrato Game que consume frontend.
      // POR QUE LO USO: Evita exponer formato externo directo y mantiene un API estable.
      // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      return rawGames.map((game: any) => ({
        id: game.id.toString(),
        title: game.name,
        type: "game" as const,
        // Usamos t_cover_big para mayor calidad en la tarjeta
        image: game.cover
          ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
          : null,
        rating: Math.round(game.total_rating || 0),
        firstReleaseDate: game.first_release_date || null,
        summary: game.summary || "Sin descripción disponible.",
        genres: game.genres ? game.genres.map((g: any) => g.name) : [],
        platforms: game.platforms ? game.platforms.map((p: any) => p.name) : [],
      }));
    },
    {
      // CONCEPTO: Validacion de Respuesta en Runtime
      // QUE HACE: Elysia valida que cada item cumpla este schema antes de responder.
      // POR QUE LO USO: Protege al cliente contra respuestas mal formadas.
      // DOCUMENTACION: https://elysiajs.com/patterns/typebox.html
      response: gameResponseSchema,
    },
  )
  .get(
    "/api/games/:id",
    async ({ params: { id } }) => {
      // CONCEPTO: Path Parameters (Parámetros de Ruta)
      // QUÉ HACE: Captura el valor dinámico de la URL (ej. /api/games/1234) en la variable `id`.
      // POR QUÉ LO USO: Es el estándar REST para solicitar un recurso específico por su identificador único.
      // DOCUMENTACIÓN: https://elysiajs.com/essential/path.html#path-parameter

      // CONCEPTO: Normalizacion y Validacion de Entrada
      // QUE HACE: Convierte el parametro de ruta a numero entero positivo.
      // POR QUE LO USO: Evita interpolar valores no numericos en la query de IGDB y reduce riesgo de inyecciones.
      // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
      const parsedGameId = parsePositiveEntityId(id, "juego");

      const token = await getTwitchToken();
      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
        // Pedimos campos extendidos: capturas de pantalla y compañías involucradas
        body: `fields name, cover.url, summary, storyline, total_rating, first_release_date, genres.name, platforms.name, screenshots.url, involved_companies.company.name; where id = ${parsedGameId};`,
      });

      const rawGames: any = await response.json();
      if (!response.ok || rawGames.length === 0) {
        throw new Error(`Juego no encontrado o error en IGDB`);
      }

      const game = rawGames[0];
      return {
        id: game.id.toString(),
        title: game.name,
        type: "game" as const,
        image: game.cover
          ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
          : null,
        rating: Math.round(game.total_rating || 0),
        firstReleaseDate: game.first_release_date || null,
        summary: game.summary || "Sin descripción disponible.",
        storyline: game.storyline || null,
        genres: game.genres ? game.genres.map((g: any) => g.name) : [],
        platforms: game.platforms ? game.platforms.map((p: any) => p.name) : [],
        // Mapeamos las capturas a alta resolución (1080p)
        screenshots: game.screenshots
          ? game.screenshots.map(
              (s: any) => `https:${s.url.replace("t_thumb", "t_1080p")}`,
            )
          : [],
        // Obtenemos el nombre del desarrollador si existe
        developer: game.involved_companies
          ? game.involved_companies[0].company.name
          : "Desarrollador Desconocido",
      };
    },
    {
      // CONCEPTO: Validación de Parámetros (TypeBox)
      // QUÉ HACE: Asegura que Elysia solo acepte peticiones donde el 'id' sea un string.
      // POR QUÉ LO USO: Previene errores de inyección o peticiones malformadas antes de que lleguen a la lógica del servidor.
      // DOCUMENTACIÓN: https://elysiajs.com/validation/overview.html
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/api/movies",
    async () => {
      // CONCEPTO: Endpoint de Normalizacion
      // QUE HACE: Devuelve peliculas TMDB en el contrato que consume el frontend.
      // POR QUE LO USO: Aisla dependencia externa y mantiene estable la API interna.
      // DOCUMENTACION: https://elysiajs.com/essential/handler.html
      return getTmdbMovies();
    },
    {
      // CONCEPTO: Validacion de Respuesta en Runtime
      // QUE HACE: Elysia valida cada campo de salida antes de responder.
      // POR QUE LO USO: Garantiza contratos seguros incluso si TMDB cambia payload.
      // DOCUMENTACION: https://elysiajs.com/patterns/typebox.html
      response: movieResponseSchema,
    },
  )
  .get(
    "/api/movies/:id",
    async ({ params: { id } }) => {
      // CONCEPTO: Validacion de Parametros
      // QUE HACE: Convierte el id de ruta a entero positivo antes de consultar TMDB.
      // POR QUE LO USO: Evita peticiones invalidas y mantiene comportamiento predecible del endpoint.
      // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
      const parsedMovieId = parsePositiveEntityId(id, "la pelicula");

      // CONCEPTO: Reutilizacion de Logica de Dominio
      // QUE HACE: Delega toda la normalizacion del detalle en getTmdbMovieById.
      // POR QUE LO USO: Elimina duplicacion y reduce errores por contratos divergentes.
      // DOCUMENTACION: https://refactoring.guru/es/smells/duplicate-code
      return getTmdbMovieById(parsedMovieId);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: movieDetailResponseSchema,
    },
  )
  // CONCEPTO: Unificacion de Rutas
  // QUE HACE: Continuamos la misma cadena con los endpoints de musica para evitar duplicar rutas ya definidas.
  // POR QUE LO USO: Rutas duplicadas en Elysia pueden generar comportamientos ambiguos y dificultar el debugging.
  // DOCUMENTACION: https://elysiajs.com/essential/handler.html

  // ── Música: canciones en tendencia (Apple RSS + proxy de iTunes Lookup) ────────────────
  .get("/api/music/trending/songs", async () => {
    // Servir desde la caché si aún está fresca
    if (trendingSongsCache && Date.now() - trendingSongsCache.ts < CACHE_TTL) {
      return { results: trendingSongsCache.data, cached: true };
    }

    try {
      const rssRes = await fetch(APPLE_RSS_SONGS);
      const rssJson = (await rssRes.json()) as any;
      const ids: string[] = rssJson.feed.results.map((r: any) => r.id);

      if (ids.length === 0) return { results: [] };

      // Buscar cada ID individualmente para obtener previewUrl (búsqueda en lote no lo devuelve)
      const lookups = await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await fetch(`${ITUNES_LOOKUP}?id=${id}&entity=song`);
            const j = (await r.json()) as any;
            if (j.resultCount > 0) return toTrack(j.results[0]);
            return null;
          } catch {
            return null;
          }
        }),
      );

      const results = lookups.filter(Boolean) as Track[];
      trendingSongsCache = { data: results, ts: Date.now() };
      return { results };
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "Error fetching trending songs",
          detail: err.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  })

  // ── Música: búsqueda ──────────────────────────────────────────────────────────
  .get("/api/music/search", async ({ query }) => {
    const { term, limit = "20" } = query as { term?: string; limit?: string };
    if (!term) {
      return new Response(
        JSON.stringify({ error: 'El parámetro "term" es requerido' }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const url = new URL(ITUNES_SEARCH);
      url.searchParams.set("term", term);
      url.searchParams.set("media", "music");
      url.searchParams.set("entity", "song");
      url.searchParams.set("limit", limit);
      url.searchParams.set("country", "US");

      const res = await fetch(url.toString());
      const json = (await res.json()) as any;
      const results: Track[] = json.results.map(toTrack);

      return { resultCount: json.resultCount, results };
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "Error searching iTunes",
          detail: err.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  })

  // ── Música: pista por ID ────────────────────────────────────────────────────
  .get("/api/music/track/:id", async ({ params }) => {
    const { id } = params;
    try {
      const res = await fetch(`${ITUNES_LOOKUP}?id=${id}&entity=song`);
      const json = (await res.json()) as any;
      if (!json.resultCount || json.resultCount === 0) {
        return new Response(JSON.stringify({ error: "Track not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return toTrack(json.results[0]);
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: "Error fetching track", detail: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  })

  // ── Música: proxy de letras (lrclib.net) ──────────────────────────────────────
  // Proxy para evitar problemas de CORS al llamar desde el navegador
  .get("/api/music/lyrics", async ({ query }) => {
    const { track_name, artist_name, album_name, duration } = query as {
      track_name?: string;
      artist_name?: string;
      album_name?: string;
      duration?: string;
    };

    if (!track_name || !artist_name) {
      return new Response(
        JSON.stringify({ error: "track_name and artist_name are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const params = new URLSearchParams();
      params.set("track_name", track_name);
      params.set("artist_name", artist_name);
      if (album_name) params.set("album_name", album_name);
      if (duration) params.set("duration", duration);

      const res = await fetch(`https://lrclib.net/api/get?${params}`);
      if (!res.ok) {
        return new Response(JSON.stringify({ error: "Lyrics not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      const data = await res.json();
      return data;
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: "Error fetching lyrics", detail: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  })

  // ── Música: cargar más (paginado rotando términos de búsqueda) ────────────────
  .get("/api/music/more", async ({ query }) => {
    const page = Math.max(1, parseInt((query as any).page ?? "1", 10));
    const limit = Math.min(50, parseInt((query as any).limit ?? "24", 10));

    // Elegir un término de búsqueda por índice de página (basado en 0, se envuelve)
    const term = MORE_TERMS[(page - 1) % MORE_TERMS.length];

    try {
      const url = new URL(ITUNES_SEARCH);
      url.searchParams.set("term", term);
      url.searchParams.set("media", "music");
      url.searchParams.set("entity", "song");
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("country", "US");

      const res = await fetch(url.toString());
      const json = (await res.json()) as any;
      const results: Track[] = json.results.map(toTrack);
      return { results, page, term };
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "Error fetching more songs",
          detail: err.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  });

if (typeof Bun !== "undefined" && import.meta.main) {
  app.listen(3000);
  console.log(
    `Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
  );
}

export { app };
