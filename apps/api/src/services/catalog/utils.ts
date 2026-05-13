// UTILIDADES COMPARTIDAS PARA SERVICIOS DE CATALOG
// QUE HACE: Exporta tipos y funciones reutilizables usadas por los servicios de games/movies/musics.
// POR QUE: Evita duplicar lógica (DRY) para parseo de params, cache y peticiones HTTP.

// ─── Tipos compartidos ────────────────────────────────────────────────────────

export type PaginatedCatalogResponse<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  genres: string[];
};

export type CatalogCacheEntry = {
  data: PaginatedCatalogResponse<any>;
  ts: number;
};

// ─── Peticiones HTTP con timeout ──────────────────────────────────────────────

const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

/**
 * Ejecuta un fetch con AbortController para cortar peticiones que superen el timeout.
 * Reduce el riesgo de rutas colgadas cuando servicios externos responden lento.
 */
export async function fetchJsonWithTimeout(url: string, init?: RequestInit) {
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

// ─── Parseo de respuestas de conteo ──────────────────────────────────────────

/**
 * Extrae el número total de resultados de distintos formatos de respuesta
 * que usan las APIs externas (IGDB devuelve un array, TMDB un objeto).
 */
export function parseCountPayload(payload: unknown): number {
  if (Array.isArray(payload) && payload.length > 0) {
    const firstItem = payload[0] as { count?: unknown };
    if (typeof firstItem.count === "number") return firstItem.count;
    if (typeof firstItem.count === "string") return Number(firstItem.count);
  }

  if (payload && typeof payload === "object" && "count" in payload) {
    const countValue = (payload as { count?: unknown }).count;
    if (typeof countValue === "number") return countValue;
    if (typeof countValue === "string") return Number(countValue);
  }

  return 0;
}

// ─── Helpers de paginación ────────────────────────────────────────────────────

export function parsePositiveInteger(
  rawValue: string | undefined,
  fallbackValue: number,
  minimumValue: number,
  maximumValue: number,
): number {
  const parsedValue = Number(rawValue ?? fallbackValue);
  if (!Number.isInteger(parsedValue)) {
    return fallbackValue;
  }

  return Math.max(minimumValue, Math.min(maximumValue, parsedValue));
}

export function getCacheKey(
  query: string,
  page: number,
  perPage: number,
  genre: string,
) {
  return [
    query.trim().toLowerCase(),
    page,
    perPage,
    genre.trim().toLowerCase(),
  ].join("|");
}
