export function clampCatalogPage(page: number, totalPages: number): number {
  // CONCEPTO: Clamping
  // QUE HACE: Mantiene la página dentro del rango válido.
  // POR QUE LO USO: Evita estados inconsistentes cuando el usuario navega rápido o cambia filtros.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
  return Math.max(1, Math.min(page, Math.max(totalPages, 1)));
}

export function getVisibleCatalogPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number,
): number[] {
  // CONCEPTO: Ventana Deslizante de Paginación
  // QUE HACE: Calcula qué números de página deben mostrarse alrededor de la activa.
  // POR QUE LO USO: Evita una barra interminable cuando hay muchas páginas.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftWindow = Math.floor(maxVisiblePages / 2);
  let start = Math.max(1, currentPage - leftWindow);
  let end = start + maxVisiblePages - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - maxVisiblePages + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
