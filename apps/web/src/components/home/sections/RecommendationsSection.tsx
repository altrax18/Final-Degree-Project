import { motion } from "framer-motion";
import IconText, { type IconName } from "../IconText";

export type RecommendationItem = {
  id: string;
  eyebrow: string;
  icon: IconName;
  title: string;
  subtitle: string;
  href: string;
};

// SECCION RECOMENDACIONES
// QUE HACE: Renderiza sugerencias derivadas del catalogo cargado.
// POR QUE: Explica por que el usuario ve ciertos items en la home.
// DOCUMENTACION: https://www.framer.com/motion/

type Props = {
  items: RecommendationItem[];
};

export default function RecommendationsSection({ items }: Props) {
  return (
    <section className="space-y-4" id="recomendaciones">
      <div className="space-y-1">
        <h2 className="text-ink text-xl font-semibold dark:text-screen">
          Recomendado para ti
        </h2>
        <p className="text-slate text-sm dark:text-mist">
          Sugerencias derivadas del catalogo disponible en esta sesion (sin perfil).
        </p>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.href}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
              className="group rounded-2xl border border-bone bg-linen p-4 transition-colors hover:border-electric-sky dark:border-night-edge dark:bg-obsidian"
            >
              <IconText
                icon={item.icon}
                text={item.eyebrow}
                className="text-xs uppercase tracking-wide text-electric-sky"
              />
              <h3 className="mt-2 text-base font-semibold text-ink dark:text-screen">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate dark:text-mist">
                {item.subtitle}
              </p>
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
          Aun no hay suficiente actividad para generar recomendaciones.
        </div>
      )}
    </section>
  );
}
