import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCatalogFilters } from "../components/shared/catalog/catalogFilterStore";

// HOOK COMPARTIDO: useCatalogQuery
// RESPONSABILIDAD:
// - Encapsula la lógica de consulta paginada para los catálogos (games/movies).
// - Construye la URL de la API con `q`, `page`, `limit` y `genres`, realiza la petición
//   y expone un API simple para los componentes consumidores.
// POR QUÉ: Evita duplicar `fetch` y la composición del queryKey entre `GameCatalogClient` y `MovieCatalogClient`.
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

function getApiBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;

  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:4321";
}

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

  const queryFn = async (pageToFetch: number) => {
    const url = new URL(`${getApiBaseUrl()}${apiPath}`);
    if (searchTerm.trim().length > 0) {
      url.searchParams.set("q", searchTerm.trim());
    }
    url.searchParams.set("page", String(pageToFetch));
    url.searchParams.set("limit", String(pageSize));
    if (selectedGenres.length > 0) {
      url.searchParams.set("genres", selectedGenres.join(","));
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("No se pudo cargar el catálogo");
    return (await res.json()) as CatalogPage<T>;
  };

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
