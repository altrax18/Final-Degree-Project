import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Movie } from "../../types/movie";
import { getMovies } from "../../lib/api";
import CatalogBrowser from "../shared/catalog/CatalogBrowser";
import CatalogCard3D from "../shared/catalog/CatalogCard3D";

interface Props {
  initialMovies: Movie[];
}

export default function MovieCatalogClient({ initialMovies }: Props) {
  // CONCEPTO: Instancia Aislada de Cache
  // QUE HACE: Crea un QueryClient privado para el catálogo de películas.
  // POR QUE LO USO: Evita que la caché de este catálogo se mezcle con otros árboles React Query y permite controlar su política de refresco.
  // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // CONCEPTO: Freshness Window
            // QUE HACE: Mantiene los datos de la consulta como frescos durante 5 minutos.
            // POR QUE LO USO: Reduce peticiones repetidas mientras el usuario filtra y pagina el catálogo.
            // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
            staleTime: 1000 * 60 * 5,
            // CONCEPTO: Refetch Controlado
            // QUE HACE: Desactiva el refetch automático al volver a enfocar la pestaña.
            // POR QUE LO USO: En una pantalla de catálogo, la interacción principal es el filtrado local; no necesitamos revalidar cada cambio de foco.
            // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    // CONCEPTO: Provider de React Context
    // QUE HACE: Expone la caché de React Query a todo el subárbol del catálogo.
    // POR QUE LO USO: Permite usar `useQuery` en el contenido interno sin pasar props manualmente.
    // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <MovieCatalogContent initialMovies={initialMovies} />
    </QueryClientProvider>
  );
}

function MovieCatalogContent({ initialMovies }: Props) {
  // CONCEPTO: Hydration de Datos Iniciales
  // QUE HACE: Arranca la query con los datos ya obtenidos por SSR.
  // POR QUE LO USO: Astro entrega contenido inicial y React Query solo toma el control para caché, refetch y sincronización.
  // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
  const { data: movies = initialMovies } = useQuery({
    queryKey: ["catalog", "movies"],
    queryFn: getMovies,
    initialData: initialMovies,
  });

  return (
    // CONCEPTO: Composición de Contenedores
    // QUE HACE: Reutiliza el browser genérico para mantener el dominio de películas delgado.
    // POR QUE LO USO: Separa recuperación de datos, estado de filtros y presentación de tarjetas.
    // DOCUMENTACION: https://react.dev/learn/passing-props-to-a-component
    <CatalogBrowser
      catalogKey="movies"
      items={movies}
      getTitle={(movie) => movie.title}
      getGenres={(movie) => movie.genres}
      searchPlaceholder="Buscar una pelicula por titulo..."
      filterTitle="Filtrar por Genero"
      emptyMessage="No se encontraron peliculas que coincidan con tu busqueda"
      itemsPerPage={20}
      renderCard={(movie) => (
        // CONCEPTO: Navegacion Declarativa con Enlaces
        // QUE HACE: Convierte cada tarjeta de pelicula en enlace al detalle.
        // POR QUE LO USO: Habilita flujo catalogo -> detalle y comportamiento nativo del navegador.
        // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
        <a
          key={movie.id}
          href={`/movies/${movie.id}`}
          aria-label={`Ver detalle de ${movie.title}`}
        >
          <CatalogCard3D item={movie} />
        </a>
      )}
    />
  );
}
