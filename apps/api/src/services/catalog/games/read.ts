import { config as loadEnv } from "dotenv";

// CONCEPTO: Carga de Entorno por Prioridad
// QUE HACE: Carga variables desde el .env local y luego fallback al .env raiz.
// POR QUE LO USO: Permite ejecutar el API desde distintas rutas del monorepo sin romper credenciales.
// DOCUMENTACION: https://github.com/motdotla/dotenv
loadEnv();
loadEnv({ path: "../../.env" });

// CONCEPTO: Constante de Configuracion de Resiliencia
// QUE HACE: Limita el tiempo maximo de espera en peticiones HTTP externas.
// POR QUE LO USO: Evita rutas colgadas cuando Twitch o IGDB responden lento.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

// CONCEPTO: Cache In-Memory con TTL
// QUE HACE: Reutiliza listados y detalles de juegos por una ventana de tiempo corta.
// POR QUE LO USO: Reduce latencia y numero de llamadas repetidas a IGDB.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
const GAMES_LIST_CACHE_TTL = 5 * 60 * 1000;
const GAME_DETAIL_CACHE_TTL = 10 * 60 * 1000;

let gamesListCache: { data: any[]; ts: number } | null = null;
const gameDetailCache = new Map<number, { data: any; ts: number }>();

// CONCEPTO: Cache de Token OAuth
// QUE HACE: Guarda el token de Twitch hasta cerca de su expiracion.
// POR QUE LO USO: Evita pedir un token nuevo en cada request a IGDB.
// DOCUMENTACION: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
let twitchTokenCache: { token: string; expiresAt: number } | null = null;

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

// CONCEPTO: Normalizacion DRY para IGDB
// QUE HACE: Centraliza campos comunes entre listado y detalle de juegos.
// POR QUE LO USO: Mantiene el mismo contrato del frontend en ambos endpoints.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
function mapIgdbBaseGameFields(game: any) {
  return {
    id: game.id.toString(),
    title: game.name,
    type: "game" as const,
    image: game.cover
      ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
      : null,
    rating: Math.round(game.total_rating || 0),
    firstReleaseDate: game.first_release_date || null,
    summary: game.summary || "Sin descripcion disponible.",
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

export async function browseGames(_query?: string): Promise<unknown[]> {
  if (gamesListCache && Date.now() - gamesListCache.ts < GAMES_LIST_CACHE_TTL) {
    return gamesListCache.data;
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
      // CONCEPTO: IGDB Query Language
      // QUE HACE: Define campos, filtros y orden en una sola consulta textual.
      // POR QUE LO USO: Minimiza payload y mantiene resultados consistentes para el catalogo.
      // DOCUMENTACION: https://api-docs.igdb.com/#filters
      body: "fields name, cover.url, summary, total_rating, first_release_date, genres.name, platforms.name; where cover != null & total_rating != null; sort total_rating desc; limit 70;",
    },
  );

  if (!response.ok || !Array.isArray(rawGames)) {
    throw new Error(`IGDB rechazo la solicitud (${response.status})`);
  }

  const normalizedGames = rawGames.map((game: any) =>
    mapIgdbBaseGameFields(game),
  );

  gamesListCache = {
    data: normalizedGames,
    ts: Date.now(),
  };

  return normalizedGames;
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
  const normalizedGameDetail = {
    ...mapIgdbBaseGameFields(game),
    storyline: game.storyline || null,
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
