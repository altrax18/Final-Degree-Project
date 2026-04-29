interface CatalogFiltersProps {
  searchTerm: string;
  selectedGenre: string;
  genres: string[];
  searchPlaceholder: string;
  filterTitle: string;
  onSearchTermChange: (value: string) => void;
  onGenreChange: (value: string) => void;
}

export default function CatalogFilters({
  searchTerm,
  selectedGenre,
  genres,
  searchPlaceholder,
  filterTitle,
  onSearchTermChange,
  onGenreChange,
}: CatalogFiltersProps) {
  return (
    // CONCEPTO: Controles de Búsqueda y Filtro
    // QUE HACE: Agrupa el buscador controlado y los botones de género en una sola pieza visual.
    // POR QUE LO USO: Este bloque cambia según el estado del catálogo, así que conviene aislarlo como componente reutilizable.
    // DOCUMENTACION: https://react.dev/learn/sharing-state-between-components
    <div className="mb-12 flex flex-col gap-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* CONCEPTO: Input Controlado
            QUE HACE: El valor del buscador viene desde el estado global y notifica cambios por callback.
            POR QUE LO USO: Zustand conserva el estado y React solo refleja la interfaz.
            DOCUMENTACION: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable */}
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="w-full bg-transparent border-b-2 border-bone dark:border-night-edge px-4 py-3 text-xl text-ink dark:text-screen placeholder:text-slate dark:placeholder:text-mist transition-all focus:border-amethyst dark:focus:border-electric-sky focus:outline-none text-center"
        />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-slate dark:text-mist mb-4 text-center font-bold">
          {filterTitle}
        </h3>

        {/* CONCEPTO: Renderizado de Lista de Botones
            QUE HACE: Genera un botón por género y marca visualmente el activo.
            POR QUE LO USO: La UI de filtros se adapta automáticamente a cualquier catálogo.
            DOCUMENTACION: https://react.dev/learn/rendering-lists */}
        <div className="flex flex-wrap justify-center gap-3">
          {genres.map((genre) => {
            const isSelected = selectedGenre === genre;

            return (
              <button
                key={genre}
                type="button"
                onClick={() => onGenreChange(genre)}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
                  isSelected
                    ? "border-ink dark:border-screen text-ink dark:text-screen bg-ink/5 dark:bg-screen/5 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "border-bone dark:border-night-edge text-slate dark:text-mist hover:border-ink/40 dark:hover:border-screen/40 hover:text-ink/80 dark:hover:text-screen/80 bg-transparent"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}