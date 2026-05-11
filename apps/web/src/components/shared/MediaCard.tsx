interface MediaCardProps {
  title: string;
  type: string;
  image?: string | null;
}

export default function MediaCard({ title, type, image }: MediaCardProps) {
  // CONCEPTO: Fallback de Recursos
  const fallback = "https://placehold.co/400x600/1f2937/e5e7eb?text=No+Image";

  return (
    <article className="group overflow-hidden rounded-xl border border-bone dark:border-night-edge bg-linen dark:bg-coal backdrop-blur-sm transition hover:-translate-y-1 hover:border-bone dark:hover:border-night-edge">
      <div className="aspect-[2/3] w-full overflow-hidden bg-sand dark:bg-coal">
        <img
          src={image || fallback}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-3">
        <p className="mb-1 text-xs uppercase tracking-wide text-electric-sky">
          {type}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-ink dark:text-screen">
          {title}
        </h3>
      </div>
    </article>
  );
}
