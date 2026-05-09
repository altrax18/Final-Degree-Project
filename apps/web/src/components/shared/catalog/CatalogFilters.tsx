import { useState, useEffect } from "react";
// RESPONSABILIDAD: Componente presentacional de filtros (UI only).
// - No ejecuta llamadas de red; notifica cambios mediante callbacks.
// - Mantiene estado local mínimo (input de búsqueda) y delega almacenamiento global a `catalogFilterStore`.
// DOCUMENTACION: Zustand: https://docs.pmnd.rs/zustand/introduction
// UI guidance: accesibilidad de botones con `aria-pressed`.

interface CatalogFiltersProps {
  searchTerm: string;
  selectedGenres: string[];
  genres: string[];
  searchPlaceholder: string;
  filterTitle: string;
  onSearchTermChange: (value: string) => void;
  onGenreToggle: (value: string) => void;
  onClearFilters: () => void;
}

export default function CatalogFilters({
  searchTerm,
  selectedGenres,
  genres,
  searchPlaceholder,
  filterTitle,
  onSearchTermChange,
  onGenreToggle,
  onClearFilters,
}: CatalogFiltersProps) {
  // CONCEPTO: Estado Local para Debounce
  // QUE HACE: Mantiene el valor del input al instante para no bloquear la escritura del usuario.
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sincroniza el estado local cuando el término de búsqueda se limpia desde fuera (ej: botón "Limpiar filtros")
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // CONCEPTO: Patrón Debounce (Amortiguador)
  // QUE HACE: Espera 500ms después de que el usuario deje de escribir para lanzar la petición oficial.
  // POR QUE LO USO: Evita hacer una llamada a la API por cada letra presionada (ahorro masivo de recursos).
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== searchTerm) {
        onSearchTermChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localSearch, searchTerm, onSearchTermChange]);

  const hasSelectedGenres = selectedGenres.length > 0;

  return (
    <div className="mb-12 flex flex-col gap-8">
      <div className="w-full max-w-2xl mx-auto">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          className="w-full bg-transparent border-b-2 border-bone dark:border-night-edge px-4 py-3 text-xl text-ink dark:text-screen placeholder:text-slate dark:placeholder:text-mist transition-all focus:border-amethyst dark:focus:border-electric-sky focus:outline-none text-center"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xs uppercase tracking-[0.2em] text-slate dark:text-mist font-bold">
            {filterTitle}
          </h3>

          <div className="text-xs uppercase tracking-[0.16em] text-slate dark:text-mist">
            {hasSelectedGenres ? `${selectedGenres.length} activos` : "Sin filtros activos"}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre);

            return (
              <button
                key={genre}
                type="button"
                onClick={() => onGenreToggle(genre)}
                aria-pressed={isSelected}
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

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center rounded-full border border-bone dark:border-night-edge px-5 py-3 text-sm font-semibold text-ink dark:text-screen bg-sand dark:bg-coal hover:bg-linen dark:hover:bg-coal transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}