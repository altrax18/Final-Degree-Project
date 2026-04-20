export function getUniqueCatalogGenres<T>(
  items: T[],
  getGenres: (item: T) => string[],
): string[] {
  // CONCEPTO: Función Pura
  // QUE HACE: Recorre los items y construye una lista única de géneros.
  // POR QUE LO USO: La función no depende de React y es fácil de probar o reutilizar.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Glossary/Pure_function
  const genres = new Set<string>();

  items.forEach((item) => {
    getGenres(item).forEach((genre) => genres.add(genre));
  });

  return [
    "All",
    ...Array.from(genres).sort((left, right) => left.localeCompare(right)),
  ];
}

export function filterCatalogItems<T>(
  items: T[],
  searchTerm: string,
  selectedGenre: string,
  getTitle: (item: T) => string,
  getGenres: (item: T) => string[],
): T[] {
  // CONCEPTO: Normalización de Entrada
  // QUE HACE: Limpia el texto de búsqueda antes de comparar.
  // POR QUE LO USO: Evita resultados inesperados por espacios o mayúsculas.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase
  const normalizedSearch = searchTerm.trim().toLowerCase();

  // CONCEPTO: Filtrado Combinado
  // QUE HACE: Aplica búsqueda por título y coincidencia por género en una sola pasada.
  // POR QUE LO USO: Mantiene el pipeline de filtrado simple y eficiente.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  return items.filter((item) => {
    const title = getTitle(item).toLowerCase();
    const genres = getGenres(item);
    const matchesSearch =
      normalizedSearch.length === 0 || title.includes(normalizedSearch);
    const matchesGenre =
      selectedGenre === "All" || genres.includes(selectedGenre);

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
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return items.slice(startIndex, endIndex);
}
