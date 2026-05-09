// UTILIDADES COMPARTIDAS PARA SERVICIOS DE CATALOG
// QUE HACE: Exporta funciones reutilizables usadas por los servicios de games/movies
// POR QUE: Evita duplicar lógica (DRY) para parseo de params y generación de cache keys.
// DOCUMENTACION RELEVANTE:
// - MDN: Number.isInteger / Math (parseo y validaciones): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

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
