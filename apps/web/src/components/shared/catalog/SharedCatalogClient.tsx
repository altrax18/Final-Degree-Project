import CatalogFilters from "./CatalogFilters";
import CatalogCard3D from "./CatalogCard3D";
import CatalogPagination from "./CatalogPagination";
import { useCatalogFilters } from "./catalogFilterStore";
import { useCatalogQuery, type CatalogPage } from "../../../hooks/useCatalogQuery";
import CatalogQueryProvider from "./CatalogQueryProvider";
import { DEFAULT_ITEMS_PER_PAGE } from "./constants";

export interface SharedCatalogClientProps<T> {
  catalogKey: string;
  apiPath: string;
  initialData: CatalogPage<T>;
  itemRoutePrefix: string; // ej: "/movies" o "/games"
  labels: {
    searchPlaceholder: string;
    countText: string;
    notFound: string;
    error: string;
  };
}

export default function SharedCatalogClient<T extends { id: string | number; title: string }>(
  props: SharedCatalogClientProps<T>
) {
  return (
    <CatalogQueryProvider>
      <SharedCatalogContent {...props} />
    </CatalogQueryProvider>
  );
}

function SharedCatalogContent<T extends { id: string | number; title: string }>({
  catalogKey,
  apiPath,
  initialData,
  labels,
  itemRoutePrefix,
}: SharedCatalogClientProps<T>) {
  const {
    searchTerm,
    selectedGenres,
    setSearchTerm,
    toggleSelectedGenre,
    resetCatalogFilters,
    setCurrentPage,
  } = useCatalogFilters(catalogKey);

  const {
    data,
    isFetching,
    isPlaceholderData,
    isError,
    pageSize,
    setPageSize,
    items,
    totalPages,
    safeCurrentPage,
    genres,
  } = useCatalogQuery<T>(catalogKey, apiPath, initialData, DEFAULT_ITEMS_PER_PAGE);

  const hasResults = items.length > 0;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <CatalogFilters
        searchTerm={searchTerm}
        selectedGenres={selectedGenres}
        genres={genres}
        searchPlaceholder={labels.searchPlaceholder}
        filterTitle="Tecnologías / géneros"
        onSearchTermChange={setSearchTerm}
        onGenreToggle={toggleSelectedGenre}
        onClearFilters={resetCatalogFilters}
      />

      {isError ? (
        <div className="py-20 text-center">
          <p className="text-xl text-slate dark:text-mist">{labels.error}</p>
        </div>
      ) : isFetching && !hasResults ? (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-full aspect-[3/4] rounded-xl bg-bone/40 dark:bg-night-edge/40 animate-pulse"></div>
          ))}
        </div>
      ) : hasResults ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bone pb-4 text-sm text-slate dark:border-night-edge dark:text-mist mt-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink dark:text-screen">
                {isFetching ? "Buscando..." : `${data?.total ?? items.length} ${labels.countText}`}
              </span>
              <span className="hidden text-bone sm:inline-block dark:text-night-edge">|</span>
              <span>Página {safeCurrentPage} de {totalPages}</span>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="pageSize" className="font-medium">Mostrar:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="cursor-pointer rounded-lg border border-bone bg-linen px-3 py-1.5 text-sm text-ink transition-colors hover:border-amethyst focus:border-amethyst focus:outline-none focus:ring-1 focus:ring-amethyst dark:border-night-edge dark:bg-obsidian dark:text-screen dark:hover:border-electric-sky dark:focus:border-electric-sky dark:focus:ring-electric-sky"
              >
                <option value={20}>20 por página</option>
                <option value={40}>40 por página</option>
                <option value={60}>60 por página</option>
              </select>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
            isPlaceholderData ? "opacity-60 transition-opacity duration-300" : ""
          }`}>
            {items.map((item, index) => (
              <a key={item.id} href={`${itemRoutePrefix}/${item.id}`} aria-label={`Ver detalle de ${item.title}`}>
                <CatalogCard3D item={item as any} priority={index < 4} />
              </a>
            ))}
          </div>

          <CatalogPagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-xl text-slate dark:text-mist">{labels.notFound}</p>
          <button type="button" onClick={resetCatalogFilters} className="mt-4 text-sapphire dark:text-electric-sky hover:text-sapphire/80 dark:hover:text-electric-sky/80 underline">
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}