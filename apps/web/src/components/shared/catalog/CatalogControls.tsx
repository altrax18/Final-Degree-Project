import { PAGE_SIZE_OPTIONS } from "./constants";

// COMPONENTE COMPARTIDO: CatalogControls
// RESPONSABILIDAD:
// - Renderiza el selector de tamaño de página y el botón de limpiar búsqueda.
// - Evita duplicar el mismo bloque de UI en juegos y películas.

type Props = {
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onReset: () => void;
};

export default function CatalogControls({
  pageSize,
  onPageSizeChange,
  onReset,
}: Props) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-3 md:items-end">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
          Items por página
        </label>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-full border border-bone dark:border-night-edge bg-parchment dark:bg-coal px-4 py-3 text-sm text-ink dark:text-screen cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border border-bone dark:border-night-edge px-5 py-3 text-sm font-semibold text-ink dark:text-screen bg-sand dark:bg-coal hover:bg-linen dark:hover:bg-coal transition-colors cursor-pointer"
        >
          Limpiar búsqueda
        </button>
      </div>
    </div>
  );
}
