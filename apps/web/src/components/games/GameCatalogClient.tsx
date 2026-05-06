// apps/web/src/components/games/GameCatalogClient.tsx
/*
  RESPONSABILIDAD: Cliente React hidratado que consume el endpoint de /api/games
  - Construye la query (q, page, limit, genres) y maneja la paginación en el cliente.
  - NO realiza transformaciones complejas de negocio; delega eso al servicio del backend.
  MOTIVO: Mantener separación UI <-> servicio para facilitar testing y mantenimiento.
  DOCUMENTACION: React Query (TanStack): https://tanstack.com/query/latest
*/
import type { Game } from "../../types/game";
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
  initialGames: CatalogPage<Game>;
};

// Nota: la lógica de fetch/paginación se ha extraído a `useCatalogQuery`.

export default function GameCatalogClient({ initialGames }: Props) {
  return (
    <CatalogQueryProvider>
      <GameCatalogContent initialGames={initialGames} />
    </CatalogQueryProvider>
  );
}

function GameCatalogContent({ initialGames }: Props) {
  const {
    searchTerm,
    selectedGenres,
    setSearchTerm,
    toggleSelectedGenre,
    resetCatalogFilters,
  } = useCatalogFilters("games");

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
  } = useCatalogQuery<Game>("games", "/api/games", initialGames, DEFAULT_ITEMS_PER_PAGE);

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
        searchPlaceholder="Buscar un juego por título..."
        filterTitle="Tecnologías / géneros"
        onSearchTermChange={setSearchTerm}
        onGenreToggle={toggleSelectedGenre}
        onClearFilters={resetCatalogFilters}
      />

      {isError ? (
        <div className="py-20 text-center">
          <p className="text-xl text-slate dark:text-mist">
            No se pudieron cargar los juegos
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
            {items.map((game) => (
              <a
                key={game.id}
                href={`/games/${game.id}`}
                aria-label={`Ver detalle de ${game.title}`}
              >
                <CatalogCard3D item={game} />
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
            No se encontraron juegos que coincidan con tu búsqueda
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