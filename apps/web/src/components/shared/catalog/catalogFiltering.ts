export function getUniqueCatalogGenres<T>(
  items: T[],
  getGenres: (item: T) => string[],
): string[] {
  // CONCEPTO: Función Pura
  // QUE HACE: Recorre los items y construye una lista única de géneros.
  // POR QUE LO USO: La función no depende de React y es fácil de probar o reutilizar.
  const genres = new Set<string>();

  items.forEach((item) => {
    getGenres(item).forEach((genre) => genres.add(genre));
  });

  return [
    ...Array.from(genres).sort((left, right) => left.localeCompare(right)),
  ];
}

export function filterCatalogItems<T>(
  items: T[],
  searchTerm: string,
  selectedGenres: string[],
  getTitle: (item: T) => string,
  getGenres: (item: T) => string[],
): T[] {
  // CONCEPTO: Normalización de Entrada
  // QUE HACE: Limpia el texto de búsqueda antes de comparar.
  // POR QUE LO USO: Evita resultados inesperados por espacios o mayúsculas.
  const normalizedSearch = searchTerm.trim().toLowerCase();

  // CONCEPTO: Filtrado Combinado
  // QUE HACE: Aplica búsqueda por título y coincidencia por género en una sola pasada.
  // POR QUE LO USO: Mantiene el pipeline de filtrado simple y eficiente.
  return items.filter((item) => {
    const title = getTitle(item).toLowerCase();
    const genres = getGenres(item);
    const matchesSearch =
      normalizedSearch.length === 0 || title.includes(normalizedSearch);
    const matchesGenre =
      selectedGenres.length === 0 ||
      selectedGenres.some((genre) => genres.includes(genre));

    return matchesSearch && matchesGenre;
  });
}

export function paginateCatalogItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number,
): T[] {
  // CONCEPTO: Segmentación por Página
  // QUE HACE: Calcula el rango visible de la página actual.
  // POR QUE LO USO: Es la base de una paginación constante y predecible.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return items.slice(startIndex, endIndex);
}
