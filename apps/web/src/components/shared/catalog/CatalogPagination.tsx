import { useMemo } from "react";
import {
  clampCatalogPage,
  getVisibleCatalogPageNumbers,
} from "./catalogPaginationUtils";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  // CONCEPTO: Guard Clause de Navegación
  // QUE HACE: Normaliza la página antes de notificar el cambio.
  // POR QUE LO USO: Evita saltar a páginas inválidas si el usuario hace clic rápido o el total cambió.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else
  const goToPage = (page: number) => {
    const normalizedPage = clampCatalogPage(page, totalPages);
    if (normalizedPage !== currentPage) {
      onPageChange(normalizedPage);
    }
  };

  // CONCEPTO: Memoización de Ventana Visible
  // QUE HACE: Calcula una ventana compacta de números de página alrededor de la actual.
  // POR QUE LO USO: Mantiene la navegación simple cuando hay muchas páginas.
  // DOCUMENTACIÓN: https://react.dev/reference/react/useMemo
  const pageNumbers = useMemo(
    () => getVisibleCatalogPageNumbers(currentPage, totalPages, 5),
    [currentPage, totalPages],
  );

  // CONCEPTO: Render Condicional
  // QUE HACE: Oculta la paginación cuando solo existe una página.
  // POR QUE LO USO: Reduce ruido visual y evita controles innecesarios.
  // DOCUMENTACION: https://react.dev/learn/conditional-rendering
  if (totalPages <= 1) {
    return null;
  }

  return (
    // CONCEPTO: Navegación Semántica
    // QUE HACE: Usa <nav> para exponer el control de página como navegación accesible.
    // POR QUE LO USO: Mejora accesibilidad y deja claro que este bloque cambia el resultado visible.
    // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
    <nav className="mt-10 flex justify-center" aria-label="Catalog pagination">
      <div className="inline-flex items-center overflow-hidden rounded-xl border border-black/15 bg-white text-sm shadow-sm">
        {/* CONCEPTO: Botón de Página Anterior
            QUE HACE: Retrocede una página sin bajar de la primera.
            POR QUE LO USO: Mantiene una navegación predecible y segura.
            DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button */}
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-3 text-gray-700 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:text-gray-400"
          aria-label="Previous page"
        >
          <span aria-hidden="true">‹</span>
          <span>Anterior</span>
        </button>

        <div className="h-9 w-px bg-black/10" />

        {/* CONCEPTO: Generación de Botones de Página
            QUE HACE: Crea un botón por cada número visible de la ventana de paginación.
            POR QUE LO USO: Evita listas largas y concentra la interacción en un rango corto.
            DOCUMENTACION: https://react.dev/learn/rendering-lists */}
        {pageNumbers.map((page) => {
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`min-w-11 px-3 py-3 font-semibold transition-colors ${
                isActive
                  ? "border-x border-black bg-white text-black"
                  : "text-gray-800 hover:bg-black/5"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        })}

        <div className="h-9 w-px bg-black/10" />

        {/* CONCEPTO: Botón de Página Siguiente
            QUE HACE: Avanza una página sin superar el máximo.
            POR QUE LO USO: Completa la navegación secuencial del catálogo.
            DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button */}
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-3 text-gray-900 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:text-gray-400"
          aria-label="Next page"
        >
          <span>Siguiente</span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </nav>
  );
}