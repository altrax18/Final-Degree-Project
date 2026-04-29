type MediaType = "movie" | "game" | "series";

type Props = {
  title: string;
  type: MediaType;
  image: string;
};

const TYPE_STYLES: Record<MediaType, { label: string; badge: string; glow: string }> = {
  movie: {
    label: "Movie",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    glow: "hover:shadow-rose-500/20",
  },
  game: {
    label: "Game",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    glow: "hover:shadow-emerald-500/20",
  },
  series: {
    label: "Series",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    glow: "hover:shadow-sky-500/20",
  },
};

export default function MediaCard({ title, type, image }: Props) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.movie;

  return (
    <article
      className={`group relative rounded-2xl overflow-hidden bg-sand dark:bg-coal border border-bone dark:border-night-edge
        shadow-lg transition-all duration-300 hover:-translate-y-1
        hover:shadow-2xl ${style.glow} hover:border-bone dark:hover:border-night-edge cursor-pointer`}
    >
      {/* Póster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Capa de degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-sand dark:from-coal via-transparent to-transparent opacity-80" />
      </div>

      {/* Información */}
      <div className="p-4 space-y-2">
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}
        >
          {style.label}
        </span>
        <h3 className="font-semibold text-ink dark:text-screen text-sm leading-snug line-clamp-2">
          {title}
        </h3>
      </div>
    </article>
  );
}
