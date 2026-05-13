/*
  RESPONSABILIDAD: Cliente React hidratado que consume el endpoint de /api/movies
  - Construye la query (q, page, limit, genres) y maneja la paginación en el cliente.
  - NO realiza filtrados complejos que dependan de TMDB; el servidor expone resultados paginados.
  MOTIVO: Evitar duplicar lógica del backend y mantener la UI enfocada en interacción y render.
*/
import type { Movie } from "../../types/movie";
import type { CatalogPage } from "../../hooks/useCatalogQuery";
import SharedCatalogClient from "../shared/catalog/SharedCatalogClient";

type Props = {
  initialMovies: CatalogPage<Movie>;
};

export default function MovieCatalogClient({ initialMovies }: Props) {
  return (
    <SharedCatalogClient
      catalogKey="movies"
      apiPath="/api/movies"
      initialData={initialMovies}
      itemRoutePrefix="/movies"
      labels={{
        searchPlaceholder: "Buscar una película por título...",
        countText: "películas",
        notFound: "No se encontraron películas que coincidan con tu búsqueda",
        error: "No se pudieron cargar las películas",
      }}
    />
  );
}
