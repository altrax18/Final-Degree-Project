import { useMemo, type ReactNode } from "react";
import CatalogFilters from "./CatalogFilters";
import CatalogPagination from "./CatalogPagination";
import { clampCatalogPage } from "./catalogPaginationUtils";
import {
  filterCatalogItems,
  getUniqueCatalogGenres,
  paginateCatalogItems,
} from "./catalogFiltering";
import { useCatalogFilters } from "./catalogFilterStore";

interface CatalogBrowserProps<T> {
  catalogKey: string;
  items: T[];
  getTitle: (item: T) => string;
  getGenres: (item: T) => string[];
  renderCard: (item: T) => ReactNode;
  searchPlaceholder: string;
  filterTitle: string;
  emptyMessage: string;
  itemsPerPage?: number;
}

export default function CatalogBrowser<T>({
  catalogKey,
  items,
  getTitle,
  getGenres,
  renderCard,
  searchPlaceholder,
  filterTitle,
  emptyMessage,
  itemsPerPage = 20,
}: CatalogBrowserProps<T>) {
  // CONCEPTO: Selector de Estado Global
  // QUE HACE: Lee filtros persistentes desde Zustand usando la clave del catálogo.
  // POR QUE LO USO: Permite que cada catálogo comparta la misma lógica sin mezclar búsqueda, género y página.
  // DOCUMENTACION: https://docs.pmnd.rs/zustand/getting-started/introduction
  const {
    searchTerm,
    selectedGenre,
    currentPage,
    setSearchTerm,
    setSelectedGenre,
    setCurrentPage,
    resetCatalogFilters,
  } = useCatalogFilters(catalogKey);

  // CONCEPTO: Memoización de Derivados
  // QUE HACE: Calcula una sola vez la lista de géneros únicos mientras no cambien los datos o la función extractora.
  // POR QUE LO USO: Evita recomputar el menú de filtros en cada pulsación del buscador.
  // DOCUMENTACION: https://react.dev/reference/react/useMemo
  const genres = useMemo(
    () => getUniqueCatalogGenres(items, getGenres),
    [items, getGenres],
  );

  // CONCEPTO: Filtrado Puro de Datos
  // QUE HACE: Aplica búsqueda por título y filtro por género sobre la colección base.
  // POR QUE LO USO: Mantiene la colección original intacta y hace el resultado fácil de razonar.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  const filteredItems = useMemo(
    () => filterCatalogItems(items, searchTerm, selectedGenre, getTitle, getGenres),
    [items, searchTerm, selectedGenre, getTitle, getGenres],
  );

  // CONCEPTO: Normalización de Página Activa
  // QUE HACE: Ajusta la página al rango disponible cuando el total cambia por filtros o por caché nueva.
  // POR QUE LO USO: Evita pedir una página inexistente después de cambiar filtros.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const safeCurrentPage = clampCatalogPage(currentPage, totalPages);

  // CONCEPTO: Segmentación de Resultados
  // QUE HACE: Extrae solo los elementos visibles de la página activa.
  // POR QUE LO USO: Mantiene la grilla liviana y la navegación rápida.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
  const paginatedItems = useMemo(
    () => paginateCatalogItems(filteredItems, safeCurrentPage, itemsPerPage),
    [filteredItems, safeCurrentPage, itemsPerPage],
  );

  const hasResults = filteredItems.length > 0;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* CONCEPTO: Composición de UI Reutilizable
          QUE HACE: Agrupa buscador y filtros de género en un componente dedicado.
          POR QUE LO USO: Separa presentación de controles del resto del catálogo y reduce ruido visual.
          DOCUMENTACION: https://react.dev/learn/passing-props-to-a-component */}
      <CatalogFilters
        searchTerm={searchTerm}
        selectedGenre={selectedGenre}
        genres={genres}
        searchPlaceholder={searchPlaceholder}
        filterTitle={filterTitle}
        onSearchTermChange={setSearchTerm}
        onGenreChange={setSelectedGenre}
      />

      {hasResults ? (
        <>
          {/* CONCEPTO: Grilla Responsiva
              QUE HACE: Distribuye las cards en columnas adaptadas al ancho de pantalla.
              POR QUE LO USO: Mantiene el mismo componente útil en desktop y mobile.
              DOCUMENTACION: https://tailwindcss.com/docs/grid-template-columns */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedItems.map((item) => renderCard(item))}
          </div>

          {/* CONCEPTO: Paginación Compartida
              QUE HACE: Muestra controles de página basados en el estado global del catálogo.
              POR QUE LO USO: Evita duplicar lógica de navegación en juegos y películas.
              DOCUMENTACION: https://react.dev/learn/conditional-rendering */}
          <CatalogPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-xl text-gray-400">{emptyMessage}</p>
          {/* CONCEPTO: Acción de Reinicio
              QUE HACE: Limpia búsqueda, género y página del catálogo actual.
              POR QUE LO USO: Da una salida clara cuando el usuario llega a un estado sin resultados.
              DOCUMENTACION: https://docs.pmnd.rs/zustand/guides/auto-generating-selectors */}
          <button
            type="button"
            onClick={resetCatalogFilters}
            className="mt-4 text-blue-400 hover:text-blue-300 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}