import { motion } from "framer-motion";
import TypewriterText from "../TypewriterText";
import type { TrendingItem } from "../../../types/home";

// SECCION TENDENCIAS
// QUE HACE: Lista compacta de musica en tendencia con acciones.
// POR QUE: Resume lo mas relevante sin duplicar la galeria del catalogo.
// DOCUMENTACION: https://www.framer.com/motion/

type Props = {
  weeklyTracks: TrendingItem[];
  canPlayAll: boolean;
  errorMessage?: string | null;
  onPlayAll: () => void;
  onPlayTrack: (track: TrendingItem) => void;
  fallbackCover: string;
};

export default function TrendingSection({
  weeklyTracks,
  canPlayAll,
  errorMessage,
  onPlayAll,
  onPlayTrack,
  fallbackCover,
}: Props) {
  const hasWeeklyTracks = weeklyTracks.length > 0;

  return (
    <section className="space-y-4" id="tendencias">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-ink text-xl font-semibold dark:text-screen">
            <TypewriterText text="Tendencias de la semana" delay={0.05} />
          </h2>
          <p className="text-slate text-sm dark:text-mist">
            Un resumen rapido para decidir que escuchar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPlayAll}
            disabled={!canPlayAll}
            className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky disabled:opacity-40 disabled:cursor-not-allowed dark:border-night-edge dark:text-screen"
          >
            Reproducir todo
          </button>
          <a
            href="/music"
            className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
          >
            Ver musica
          </a>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-bone bg-lilac-mist px-4 py-3 text-sm text-slate dark:border-night-edge dark:bg-depth/20 dark:text-mist">
          {errorMessage}
        </div>
      ) : null}

      {hasWeeklyTracks ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {weeklyTracks.map((track, index) => (
            <motion.article
              key={track.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.04 }}
              whileHover={{ scale: 1.01 }}
              className="group flex items-center gap-4 rounded-2xl border border-bone bg-sand p-3 dark:border-night-edge dark:bg-coal"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment dark:bg-obsidian">
                <img
                  src={track.cover || fallbackCover}
                  alt={track.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[0.7rem] uppercase tracking-wide text-electric-sky">
                  Musica
                </p>
                <h3 className="text-sm font-semibold text-ink dark:text-screen">
                  {track.title}
                </h3>
                <p className="text-xs text-slate dark:text-mist">
                  {track.artist}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onPlayTrack(track)}
                  disabled={!track.previewUrl}
                  className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky disabled:opacity-40 disabled:cursor-not-allowed dark:border-night-edge dark:text-screen"
                >
                  {track.previewUrl ? "Reproducir" : "Sin preview"}
                </button>
                <a
                  href={`/music/${track.id}`}
                  className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
                >
                  Ver detalle
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
          No hay tendencias de musica disponibles.
        </div>
      )}
    </section>
  );
}
