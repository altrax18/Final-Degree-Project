// apps/web/src/components/shared/catalog/catalogFilterStore.ts
import { create } from "zustand";

interface CatalogFilterState {
  searchTerm: string;
  selectedGenre: string;
  currentPage: number;
}

interface CatalogFilterStore {
  filtersByKey: Record<string, CatalogFilterState>;
  setSearchTerm: (catalogKey: string, searchTerm: string) => void;
  setSelectedGenre: (catalogKey: string, selectedGenre: string) => void;
  setCurrentPage: (catalogKey: string, currentPage: number) => void;
  resetCatalogFilters: (catalogKey: string) => void;
}

const defaultCatalogFilters: CatalogFilterState = {
  searchTerm: "",
  selectedGenre: "All",
  currentPage: 1,
};

function getCatalogFilters(
  filtersByKey: Record<string, CatalogFilterState>,
  catalogKey: string,
): CatalogFilterState {
  return filtersByKey[catalogKey] ?? defaultCatalogFilters;
}

// CONCEPTO: Zustand Store + Patrón de Diccionario (Keyed Store)
// QUÉ HACE: Crea un estado global fuera del árbol de React, guardando los filtros en un objeto donde la clave es el nombre del catálogo (ej. "games" o "movies").
// POR QUÉ LO USO: Permite que el catálogo de juegos y el de películas compartan la misma lógica de código, pero mantengan sus filtros y páginas de forma independiente sin sobrescribirse.
// DOCUMENTACIÓN: https://zustand-demo.pmnd.rs/
export const useCatalogFilterStore = create<CatalogFilterStore>((set) => ({
  filtersByKey: {},
  setSearchTerm: (catalogKey, searchTerm) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: {
          ...getCatalogFilters(state.filtersByKey, catalogKey),
          searchTerm,
          // CONCEPTO: Sincronización de Interfaz
          // QUÉ HACE: Al escribir en el buscador, forzamos la página a 1.
          // POR QUÉ LO USO: Si el usuario está en la página 5 y busca algo nuevo que solo tiene 2 resultados, la pantalla quedaría vacía. Esto lo previene.
          currentPage: 1,
        },
      },
    })),
  setSelectedGenre: (catalogKey, selectedGenre) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: {
          ...getCatalogFilters(state.filtersByKey, catalogKey),
          selectedGenre,
          currentPage: 1,
        },
      },
    })),
  setCurrentPage: (catalogKey, currentPage) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: {
          ...getCatalogFilters(state.filtersByKey, catalogKey),
          currentPage,
        },
      },
    })),
  resetCatalogFilters: (catalogKey) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: { ...defaultCatalogFilters },
      },
    })),
}));

// CONCEPTO: Custom Hook Selector
// QUÉ HACE: Envuelve la llamada a Zustand para extraer solo lo necesario según el catálogo.
// POR QUÉ LO USO: Evita que el componente `CatalogBrowser` se renderice innecesariamente si cambian los filtros de "movies" mientras el usuario está viendo "games".
// DOCUMENTACIÓN: https://docs.pmnd.rs/zustand/guides/auto-generating-selectors
export function useCatalogFilters(catalogKey: string) {
  const searchTerm = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).searchTerm,
  );
  const selectedGenre = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).selectedGenre,
  );
  const currentPage = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).currentPage,
  );

  const setSearchTerm = useCatalogFilterStore((state) => state.setSearchTerm);
  const setSelectedGenre = useCatalogFilterStore(
    (state) => state.setSelectedGenre,
  );
  const setCurrentPage = useCatalogFilterStore((state) => state.setCurrentPage);
  const resetCatalogFilters = useCatalogFilterStore(
    (state) => state.resetCatalogFilters,
  );

  return {
    searchTerm,
    selectedGenre,
    currentPage,
    setSearchTerm: (value: string) => setSearchTerm(catalogKey, value),
    setSelectedGenre: (value: string) => setSelectedGenre(catalogKey, value),
    setCurrentPage: (value: number) => setCurrentPage(catalogKey, value),
    resetCatalogFilters: () => resetCatalogFilters(catalogKey),
  };
}
