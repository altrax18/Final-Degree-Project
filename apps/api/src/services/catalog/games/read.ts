import { config as loadEnv } from "dotenv";

// CONCEPTO: Carga de Entorno por Prioridad
// QUE HACE: Carga variables desde el .env local y luego fallback al .env raiz.
// POR QUE LO USO: Permite ejecutar el API desde distintas rutas del monorepo sin romper credenciales.
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
// QUE HACE: Reutiliza listados y detalles de juegos por una ventana de tiempo corta.
// POR QUE LO USO: Reduce latencia y numero de llamadas repetidas a IGDB.
const GAMES_LIST_CACHE_TTL = 5 * 60 * 1000;
const GAME_DETAIL_CACHE_TTL = 10 * 60 * 1000;

const gamesListCache = new Map<string, CatalogCacheEntry>();
const gameDetailCache = new Map<number, { data: any; ts: number }>();
let gameGenresCache: {
  data: { id: number; name: string }[];
  ts: number;
} | null = null;
const GAME_GENRES_CACHE_TTL = 24 * 60 * 60 * 1000;

// CONCEPTO: Cache de Token OAuth
// QUE HACE: Guarda el token de Twitch hasta cerca de su expiracion.
// POR QUE LO USO: Evita pedir un token nuevo en cada request a IGDB.
let twitchTokenCache: { token: string; expiresAt: number } | null = null;

// CONCEPTO: Traducción Dinámica (On-the-fly Translation)
// QUE HACE: Usa la API pública de Google Translate para traducir textos del inglés al español.
// POR QUE LO USO: IGDB (Twitch) es una API exclusiva en inglés y no ofrece descripciones en español en su base de datos.
async function translateToSpanish(text: string): Promise<string> {
  if (!text || text === "Sin descripcion disponible.") return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    return json[0].map((item: any) => item[0]).join("");
  } catch (error) {
    return text; // Fallback: si falla, devolvemos el texto original
  }
}

// CONCEPTO: Normalizacion DRY para IGDB
// QUE HACE: Centraliza campos comunes entre listado y detalle de juegos.
// POR QUE LO USO: Mantiene el mismo contrato del frontend en ambos endpoints.
async function mapIgdbBaseGameFields(game: any) {
  const translatedSummary = await translateToSpanish(
    game.summary || "Sin descripcion disponible.",
  );

  return {
    id: game.id.toString(),
    title: game.name,
    type: "game" as const,
    image: game.cover
      ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
      : null,
    rating: Math.round(game.total_rating || 0),
    firstReleaseDate: game.first_release_date || null,
    summary: translatedSummary,
    genres: game.genres ? game.genres.map((genre: any) => genre.name) : [],
    platforms: game.platforms
      ? game.platforms.map((platform: any) => platform.name)
      : [],
  };
}

function parsePositiveGameId(rawId: string): number {
  const parsedId = Number(rawId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("El id del juego debe ser un entero positivo");
  }

  return parsedId;
}

function escapeApicalypseString(value: string): string {
  return value.replace(/"/g, "");
}

async function getAllGameGenres(token: string) {
  if (
    gameGenresCache &&
    Date.now() - gameGenresCache.ts < GAME_GENRES_CACHE_TTL
  ) {
    return gameGenresCache.data;
  }

  const { response, payload } = await fetchJsonWithTimeout(
    "https://api.igdb.com/v4/genres",
    {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      body: "fields id,name; limit 500;",
    },
  );

  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(`IGDB genero fallo (${response.status})`);
  }

  gameGenresCache = {
    data: payload
      .map((genre: any) => ({
        id: Number(genre.id),
        name: String(genre.name ?? ""),
      }))
      .filter(
        (genre: { id: number; name: string }) =>
          Number.isInteger(genre.id) && genre.name.length > 0,
      ),
    ts: Date.now(),
  };

  return gameGenresCache.data;
}

async function getGameGenreIdsByName(token: string, genreNames: string[]) {
  if (genreNames.length === 0) return [];

  const genres = await getAllGameGenres(token);
  const genreIds = genreNames
    .map((genreName) => {
      const normalizedGenreName = genreName.trim().toLowerCase();
      const genre = genres.find(
        (item) => item.name.trim().toLowerCase() === normalizedGenreName,
      );
      return genre?.id ?? null;
    })
    .filter((genreId): genreId is number => genreId !== null);

  return Array.from(new Set(genreIds));
}

async function getTwitchToken() {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    throw new Error(
      "Faltan TWITCH_CLIENT_ID y/o TWITCH_CLIENT_SECRET en variables de entorno",
    );
  }

  if (twitchTokenCache && Date.now() < twitchTokenCache.expiresAt - 60_000) {
    return twitchTokenCache.token;
  }

  const { response, payload } = await fetchJsonWithTimeout(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      `No se pudo obtener token de Twitch (${response.status}): ${payload?.message || "respuesta invalida"}`,
    );
  }

  const expiresInSeconds =
    Number.isFinite(Number(payload.expires_in)) &&
      Number(payload.expires_in) > 0
      ? Number(payload.expires_in)
      : 3600;

  twitchTokenCache = {
    token: String(payload.access_token),
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  return String(payload.access_token);
}

export async function browseGames(query: {
  q?: string;
  page?: string;
  limit?: string;
  genre?: string;
  genres?: string;
}): Promise<PaginatedCatalogResponse<unknown>> {
  return browseGamesPage(query);
}

export async function browseGamesPage(query: {
  q?: string;
  page?: string;
  limit?: string;
  genre?: string;
  genres?: string;
}): Promise<PaginatedCatalogResponse<unknown>> {
  const token = await getTwitchToken();
  const page = parsePositiveInteger(query.page, 1, 1, 100000);
  const perPage = parsePositiveInteger(query.limit, 20, 1, 50);
  const offset = (page - 1) * perPage;
  const searchTerm = query.q?.trim() ?? "";
  const genreNames = (query.genres ?? query.genre ?? "")
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
  const genreIds = await getGameGenreIdsByName(token, genreNames);
  const cacheKey = getCacheKey(searchTerm, page, perPage, genreNames.join(","));

  const cachedResult = gamesListCache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.ts < GAMES_LIST_CACHE_TTL) {
    return cachedResult.data;
  }

  const filters: string[] = ["cover != null"];

  if (genreNames.length > 0 && genreIds.length === 0) {
    const genres = (await getAllGameGenres(token)).map((genre) => genre.name);
    return {
      items: [],
      total: 0,
      page,
      perPage,
      totalPages: 1,
      genres,
    };
  }

  if (genreIds.length > 0) {
    filters.push(`genres = (${genreIds.join(",")})`);
  }

  const searchPrefix =
    searchTerm.length > 0
      ? `search \"${escapeApicalypseString(searchTerm)}\"; `
      : "";
  const whereClause =
    filters.length > 0 ? ` where ${filters.join(" & ")};` : "";
  const baseQuery = `${searchPrefix}fields name, cover.url, summary, total_rating, first_release_date, genres.name, platforms.name;${whereClause}`;
  const pagedQuery = `${baseQuery} limit ${perPage}; offset ${offset};`;
  const countQuery = `${searchPrefix}${whereClause}`;

  const [countResult, listResult] = await Promise.all([
    fetchJsonWithTimeout("https://api.igdb.com/v4/games/count", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      body: countQuery,
    }),
    fetchJsonWithTimeout("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      body: pagedQuery,
    }),
  ]);

  if (!listResult.response.ok || !Array.isArray(listResult.payload)) {
    throw new Error(
      `IGDB rechazo la solicitud (${listResult.response.status})`,
    );
  }

  const normalizedGames = await Promise.all(
    listResult.payload.map((game: any) => mapIgdbBaseGameFields(game)),
  );
  const total = countResult.response.ok
    ? parseCountPayload(countResult.payload)
    : normalizedGames.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const genres = (await getAllGameGenres(token)).map((genre) => genre.name);

  const response: PaginatedCatalogResponse<unknown> = {
    items: normalizedGames,
    total,
    page,
    perPage,
    totalPages,
    genres,
  };

  gamesListCache.set(cacheKey, { data: response, ts: Date.now() });

  return response;
}

export async function getTrendingGames(): Promise<unknown[]> {
  const token = await getTwitchToken();

  // CONCEPTO: Simulacion de Tendencias (IGDB)
  // QUE HACE: Busca los juegos lanzados en los ultimos 6 meses y los ordena por su cantidad de calificaciones.
  // POR QUE LO USO: IGDB no tiene un endpoint de "trending" nativo, esta es la forma mas precisa de calcular la popularidad actual.
  const sixMonthsAgo = Math.floor(Date.now() / 1000) - 180 * 24 * 60 * 60;
  const query = `fields name, cover.url, summary, total_rating, first_release_date, genres.name, platforms.name; where first_release_date > ${sixMonthsAgo} & cover != null; sort total_rating_count desc; limit 10;`;

  const { response, payload } = await fetchJsonWithTimeout(
    "https://api.igdb.com/v4/games",
    {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      body: query,
    },
  );

  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(
      `IGDB rechazó la solicitud de tendencias (${response.status})`,
    );
  }

  return await Promise.all(
    payload.map((game: any) => mapIgdbBaseGameFields(game)),
  );
}

export async function getGameByApiId(apiId: string): Promise<unknown> {
  const parsedGameId = parsePositiveGameId(apiId);

  const cachedGameDetail = gameDetailCache.get(parsedGameId);
  if (
    cachedGameDetail &&
    Date.now() - cachedGameDetail.ts < GAME_DETAIL_CACHE_TTL
  ) {
    return cachedGameDetail.data;
  }

  const token = await getTwitchToken();
  const { response, payload: rawGames } = await fetchJsonWithTimeout(
    "https://api.igdb.com/v4/games",
    {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      body: `fields name, cover.url, summary, storyline, total_rating, first_release_date, genres.name, platforms.name, screenshots.url, involved_companies.company.name; where id = ${parsedGameId};`,
    },
  );

  if (!response.ok || !Array.isArray(rawGames) || rawGames.length === 0) {
    return null;
  }

  const game = rawGames[0];
  const baseFields = await mapIgdbBaseGameFields(game);
  const translatedStoryline = game.storyline
    ? await translateToSpanish(game.storyline)
    : null;

  const normalizedGameDetail = {
    ...baseFields,
    storyline: translatedStoryline,
    screenshots: game.screenshots
      ? game.screenshots.map(
        (screenshot: any) =>
          `https:${screenshot.url.replace("t_thumb", "t_1080p")}`,
      )
      : [],
    developer: game.involved_companies
      ? game.involved_companies[0].company.name
      : "Desarrollador desconocido",
  };

  gameDetailCache.set(parsedGameId, {
    data: normalizedGameDetail,
    ts: Date.now(),
  });

  return normalizedGameDetail;
}
