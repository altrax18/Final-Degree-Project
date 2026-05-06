import { motion } from "framer-motion";
import type { RecentPost } from "../../../types/home";

// SECCION CIRCULOS
// QUE HACE: Muestra un carrusel continuo con posts recientes.
// POR QUE: Aporta dinamismo y evidencia de actividad social.
// DOCUMENTACION: https://react.dev/reference/react/useState

type Props = {
  loopPosts: RecentPost[];
  hasPosts: boolean;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
  marqueeDuration: number;
};

export default function CirclesSection({
  loopPosts,
  hasPosts,
  isPaused,
  onPauseChange,
  marqueeDuration,
}: Props) {
  const marqueeStyle = {
    ["--marquee-duration" as const]: `${marqueeDuration}s`,
    animationPlayState: isPaused ? "paused" : "running",
  } as const;

  return (
    <section className="space-y-4" id="circulos">
      <div className="space-y-1">
        <h2 className="text-ink text-xl font-semibold dark:text-screen">
          Circulos en tendencia
        </h2>
        <p className="text-slate text-sm dark:text-mist">
          Movimiento en vivo de las ultimas publicaciones.
        </p>
      </div>

      {hasPosts ? (
        <div
          className="group relative overflow-hidden rounded-2xl border border-bone bg-linen py-4 dark:border-night-edge dark:bg-obsidian"
          onMouseEnter={() => onPauseChange(true)}
          onMouseLeave={() => onPauseChange(false)}
        >
          <div className="home-marquee flex w-max gap-4 px-4" style={marqueeStyle}>
            {loopPosts.map((post, index) => (
              <motion.article
                key={`${post.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="w-64 shrink-0 rounded-2xl border border-bone bg-sand p-4 dark:border-night-edge dark:bg-coal"
              >
                <a
                  href={post.href}
                  className="block h-full"
                  onFocus={() => onPauseChange(true)}
                  onBlur={() => onPauseChange(false)}
                  aria-label={`Abrir detalle de ${post.headline}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-depth/60" />
                    <div>
                      <p className="text-ink text-sm font-semibold dark:text-screen">
                        {post.author}
                      </p>
                      <p className="text-slate text-xs dark:text-mist">
                        {post.handle}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-base font-semibold text-ink dark:text-screen">
                    {post.headline}
                  </p>
                  <p className="mt-2 text-xs text-slate leading-relaxed dark:text-mist">
                    {post.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={`${post.id}-${tag}`}
                        className="rounded-full border border-bone px-2 py-1 text-[0.7rem] text-slate dark:border-night-edge dark:text-mist"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </a>
              </motion.article>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-linen to-transparent dark:from-obsidian" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-linen to-transparent dark:from-obsidian" />
        </div>
      ) : (
        <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
          Aun no hay publicaciones. Conecta el feed social para llenar esta
          seccion.
        </div>
      )}
    </section>
  );
}
