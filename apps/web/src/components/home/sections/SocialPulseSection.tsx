import { motion } from "framer-motion";

export type TagStat = {
  tag: string;
  count: number;
};

// SECCION PULSO SOCIAL
// QUE HACE: Muestra los temas mas activos del feed.
// POR QUE: Da contexto rapido sobre conversaciones en curso.
// DOCUMENTACION: https://www.framer.com/motion/

type Props = {
  tagStats: TagStat[];
  onTagClick: (tag: string) => void;
};

export default function SocialPulseSection({ tagStats, onTagClick }: Props) {
  return (
    <section className="space-y-4" id="pulso-social">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-ink text-xl font-semibold dark:text-screen">
            Pulso social
          </h2>
          <p className="text-slate text-sm dark:text-mist">
            Temas mas conversados del feed en esta sesion.
          </p>
        </div>
        <a
          href="#feed"
          className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
        >
          Ir al feed
        </a>
      </div>

      {tagStats.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tagStats.map((item, index) => (
            <motion.div
              key={`pulse-${item.tag}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
              className="rounded-2xl border border-bone bg-linen p-4 dark:border-night-edge dark:bg-obsidian"
            >
              <p className="text-[0.7rem] uppercase tracking-wide text-electric-sky">
                Tema activo
              </p>
              <p className="mt-2 text-base font-semibold text-ink dark:text-screen">
                #{item.tag}
              </p>
              <p className="mt-1 text-xs text-slate dark:text-mist">
                {item.count} publicaciones recientes
              </p>
              <button
                type="button"
                onClick={() => onTagClick(item.tag)}
                className="mt-3 cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
              >
                Ver conversaciones
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
          Aun no hay suficiente actividad social para mostrar el pulso.
        </div>
      )}
    </section>
  );
}
