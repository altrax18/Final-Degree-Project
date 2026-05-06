/*
  RESPONSABILIDAD: Cliente React hidratado que consume el endpoint de /api/movies
  - Construye la query (q, page, limit, genres) y maneja la paginación en el cliente.
  - NO realiza filtrados complejos que dependan de TMDB; el servidor expone resultados paginados.
  MOTIVO: Evitar duplicar lógica del backend y mantener la UI enfocada en interacción y render.
  DOCUMENTACION: React Query (TanStack): https://tanstack.com/query/latest
  TMDB discover docs: https://developers.themoviedb.org/3/discover/movie
*/
import type { Movie } from "../../types/movie";
import CatalogFilters from "../shared/catalog/CatalogFilters";
import CatalogCard3D from "../shared/catalog/CatalogCard3D";
import CatalogPagination from "../shared/catalog/CatalogPagination";
import CatalogControls from "../shared/catalog/CatalogControls";
import { useCatalogFilters } from "../shared/catalog/catalogFilterStore";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import type { CatalogPage } from "../../hooks/useCatalogQuery";
import CatalogQueryProvider from "../shared/catalog/CatalogQueryProvider";
import { DEFAULT_ITEMS_PER_PAGE } from "../shared/catalog/constants";

type Props = {
  initialMovies: CatalogPage<Movie>;
};

// La lógica de petición y composición de query se gestiona en el hook compartido `useCatalogQuery`.

export default function MovieCatalogClient({ initialMovies }: Props) {
  return (
    <CatalogQueryProvider>
      <MovieCatalogContent initialMovies={initialMovies} />
    </CatalogQueryProvider>
  );
}

function MovieCatalogContent({ initialMovies }: Props) {
  const {
    searchTerm,
    selectedGenres,
    setSearchTerm,
    toggleSelectedGenre,
    resetCatalogFilters,
  } = useCatalogFilters("movies");

  const {
    data,
    isFetching,
    isError,
    pageSize,
    setPageSize,
    items,
    totalPages,
    safeCurrentPage,
    genres,
    setCurrentPage,
  } = useCatalogQuery<Movie>("movies", "/api/movies", initialMovies, DEFAULT_ITEMS_PER_PAGE);

  const hasResults = items.length > 0;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* UI compartida: selector de pagina y boton para limpiar filtros. */}
      <CatalogControls
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        onReset={resetCatalogFilters}
      />

      <CatalogFilters
        searchTerm={searchTerm}
        selectedGenres={selectedGenres}
        genres={genres}
        searchPlaceholder="Buscar una pelicula por titulo..."
        filterTitle="Tecnologías / géneros"
        onSearchTermChange={setSearchTerm}
        onGenreToggle={toggleSelectedGenre}
        onClearFilters={resetCatalogFilters}
      />

      {isError ? (
        <div className="py-20 text-center">
          <p className="text-xl text-slate dark:text-mist">
            No se pudieron cargar las peliculas
          </p>
        </div>
      ) : hasResults ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-slate dark:text-mist">
            <span>{isFetching ? "Buscando..." : `${data?.total ?? items.length} resultados`}</span>
            <span>
              Página {safeCurrentPage} de {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((movie) => (
              <a
                key={movie.id}
                href={`/movies/${movie.id}`}
                aria-label={`Ver detalle de ${movie.title}`}
              >
                <CatalogCard3D item={movie} />
              </a>
            ))}
          </div>

          <CatalogPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-xl text-slate dark:text-mist">
            No se encontraron peliculas que coincidan con tu busqueda
          </p>
          <button
            type="button"
            onClick={resetCatalogFilters}
            className="mt-4 text-sapphire dark:text-electric-sky hover:text-sapphire/80 dark:hover:text-electric-sky/80 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}
