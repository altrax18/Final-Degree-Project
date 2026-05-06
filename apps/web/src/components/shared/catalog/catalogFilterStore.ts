// apps/web/src/components/shared/catalog/catalogFilterStore.ts
import { create } from "zustand";

interface CatalogFilterState {
  searchTerm: string;
  selectedGenres: string[];
  currentPage: number;
}

interface CatalogFilterStore {
  filtersByKey: Record<string, CatalogFilterState>;
  setSearchTerm: (catalogKey: string, searchTerm: string) => void;
  toggleSelectedGenre: (catalogKey: string, selectedGenre: string) => void;
  clearSelectedGenres: (catalogKey: string) => void;
  setCurrentPage: (catalogKey: string, currentPage: number) => void;
  resetCatalogFilters: (catalogKey: string) => void;
}

const defaultCatalogFilters: CatalogFilterState = {
  searchTerm: "",
  selectedGenres: [],
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
// RESPONSABILIDAD: Este archivo es la única fuente de verdad para filtros y paginación de catálogo; los componentes UI deben usar `useCatalogFilters`.
// DOCUMENTACIÓN: https://docs.pmnd.rs/zustand/introduction
export const useCatalogFilterStore = create<CatalogFilterStore>((set) => ({
  filtersByKey: {},
  setSearchTerm: (catalogKey, searchTerm) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: {
          ...getCatalogFilters(state.filtersByKey, catalogKey),
          searchTerm,
          currentPage: 1,
        },
      },
    })),
  toggleSelectedGenre: (catalogKey, selectedGenre) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: {
          ...getCatalogFilters(state.filtersByKey, catalogKey),
          selectedGenres: getCatalogFilters(
            state.filtersByKey,
            catalogKey,
          ).selectedGenres.includes(selectedGenre)
            ? getCatalogFilters(
                state.filtersByKey,
                catalogKey,
              ).selectedGenres.filter((genre) => genre !== selectedGenre)
            : [
                ...getCatalogFilters(state.filtersByKey, catalogKey)
                  .selectedGenres,
                selectedGenre,
              ],
          currentPage: 1,
        },
      },
    })),
  clearSelectedGenres: (catalogKey) =>
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: {
          ...getCatalogFilters(state.filtersByKey, catalogKey),
          selectedGenres: [],
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
  const selectedGenres = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).selectedGenres,
  );
  const currentPage = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).currentPage,
  );

  const setSearchTerm = useCatalogFilterStore((state) => state.setSearchTerm);
  const toggleSelectedGenre = useCatalogFilterStore(
    (state) => state.toggleSelectedGenre,
  );
  const clearSelectedGenres = useCatalogFilterStore(
    (state) => state.clearSelectedGenres,
  );
  const setCurrentPage = useCatalogFilterStore((state) => state.setCurrentPage);
  const resetCatalogFilters = useCatalogFilterStore(
    (state) => state.resetCatalogFilters,
  );

  return {
    searchTerm,
    selectedGenres,
    currentPage,
    setSearchTerm: (value: string) => setSearchTerm(catalogKey, value),
    toggleSelectedGenre: (value: string) =>
      toggleSelectedGenre(catalogKey, value),
    clearSelectedGenres: () => clearSelectedGenres(catalogKey),
    setCurrentPage: (value: number) => setCurrentPage(catalogKey, value),
    resetCatalogFilters: () => resetCatalogFilters(catalogKey),
  };
}
