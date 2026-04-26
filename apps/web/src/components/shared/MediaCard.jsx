export default function MediaCard({ title, type, image }) {
  // CONCEPTO: Fallback de Recursos
  // QUE HACE: Define una imagen por defecto cuando no llega portada de la API.
  // POR QUE LO USO: Evita huecos visuales en cards de juegos/peliculas/series sin imagen.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR
  const fallback = "https://placehold.co/400x600/1f2937/e5e7eb?text=No+Image";

  return (
    <article className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30">
      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-800">
        <img
          src={image || fallback}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-3">
        <p className="mb-1 text-xs uppercase tracking-wide text-cyan-300">
          {type}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-white">
          {title}
        </h3>
      </div>
    </article>
  );
}
