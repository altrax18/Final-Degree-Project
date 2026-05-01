// Sección de colecciones del usuario (placeholder, pendiente de datos reales).
export default function ProfileCollections() {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Mis colecciones</h2>
        <p className="text-sm text-white/40 mt-0.5">
          Tus listas de películas, música y videojuegos
        </p>
      </div>

      {/* Placeholder — pendiente de conectar a datos reales */}
      <div
        className="rounded-xl border border-white/[0.06] border-dashed
                   flex flex-col items-center justify-center py-16 gap-3 text-white/25"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2
               2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2
               2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2
               0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-sm font-medium">Aún no tienes colecciones</p>
        <p className="text-xs text-white/20">
          Explora películas, música y juegos para empezar
        </p>
      </div>
    </section>
  );
}
