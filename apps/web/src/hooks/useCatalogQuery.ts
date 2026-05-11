import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCatalogFilters } from "../components/shared/catalog/catalogFilterStore";
import { api } from "../lib/api";

// HOOK COMPARTIDO: useCatalogQuery
// RESPONSABILIDAD:
// - Encapsula la lógica de consulta paginada para los catálogos (games/movies/music).
// - Lanza la petición a través del cliente unificado de Eden y expone la data a React Query.
// DOCUMENTACION RELEVANTE:
// - React Query: https://tanstack.com/query/latest

export type CatalogPage<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  genres: string[];
};

export function useCatalogQuery<T>(
  catalogKey: string,
  apiPath: string,
  initialData?: CatalogPage<T>,
  defaultPageSize = 20,
) {
  const { searchTerm, selectedGenres, currentPage, setCurrentPage } =
    useCatalogFilters(catalogKey);

  const queryClient = useQueryClient();

  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const queryKey = [
    "catalog",
    apiPath.replace("/api/", ""),
    searchTerm,
    selectedGenres.join("|"),
    currentPage,
    pageSize,
  ];

  const queryFn = useCallback(async (pageToFetch: number) => {
    const queryParams = {
      page: String(pageToFetch),
      limit: String(pageSize),
      q: searchTerm.trim() || undefined,
      genres: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
    };

    let response;
    
    // Derivar el endpoint correcto del cliente Eden según la ruta lógica
    if (apiPath.includes("movies")) {
      response = await api.api.movies.get({ query: queryParams });
    } else if (apiPath.includes("games")) {
      response = await api.api.games.get({ query: queryParams });
    } else if (apiPath.includes("music")) {
      response = await api.api.music.get({ query: queryParams });
    } else {
      throw new Error(`Unsupported api path: ${apiPath}`);
    }

    if (response.error || !response.data) {
      throw new Error("No se pudo cargar el catálogo");
    }

    return response.data as unknown as CatalogPage<T>;
  }, [apiPath, searchTerm, selectedGenres, pageSize]);

  const query = useQuery<CatalogPage<T>>({
    queryKey,
    queryFn: () => queryFn(currentPage),
    // Solo usamos initialData cuando no hay filtros activos y estamos en la primera página.
    initialData:
      initialData &&
      searchTerm.trim().length === 0 &&
      selectedGenres.length === 0 &&
      currentPage === 1 &&
      pageSize === initialData.perPage
        ? initialData
        : undefined,
    // CONCEPTO: Patrón de Paginación Fluida (Keep Previous Data)
    // QUE HACE: Mantiene en pantalla los datos de la página actual mientras se descarga la siguiente.
    // POR QUE LO USO: Evita el parpadeo a "No hay resultados" durante la carga de nuevas páginas.
    placeholderData: (prev) => prev,
    // CONCEPTO: Caché de Cliente Avanzada (Stale Time)
    // QUE HACE: Considera los datos frescos durante 1 minuto. No hace fetch al volver atrás.
    // POR QUE LO USO: Elimina tiempos de carga innecesarios y reduce peticiones al servidor.
    staleTime: 1000 * 60,
  });

  // Garantiza que la página actual siempre esté dentro del rango devuelto por el servidor.
  useEffect(() => {
    if (!query.data) return;
    const totalPages = query.data.totalPages ?? 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [query.data, currentPage, setCurrentPage]);

  // CONCEPTO: Prefetching Proactivo
  // QUE HACE: Carga los datos de la página siguiente en segundo plano.
  // POR QUE LO USO: Hace que la navegación a la siguiente página sea instantánea.
  useEffect(() => {
    if (
      !query.isPlaceholderData &&
      query.data &&
      query.data.totalPages > currentPage
    ) {
      const nextPage = currentPage + 1;
      const nextQueryKey = [
        "catalog",
        apiPath.replace("/api/", ""),
        searchTerm,
        selectedGenres.join("|"),
        nextPage,
        pageSize,
      ];
      queryClient.prefetchQuery({
        queryKey: nextQueryKey,
        queryFn: () => queryFn(nextPage),
      });
    }
  }, [
    currentPage,
    query.isPlaceholderData,
    query.data,
    queryClient,
    apiPath,
    searchTerm,
    selectedGenres,
    pageSize,
    queryFn,
  ]);

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const genres = query.data?.genres ?? initialData?.genres ?? [];

  return {
    ...query,
    pageSize,
    setPageSize: (value: number) => {
      setPageSize(value);
      setCurrentPage(1);
    },
    items,
    totalPages,
    safeCurrentPage,
    genres,
    setCurrentPage,
  };
}
