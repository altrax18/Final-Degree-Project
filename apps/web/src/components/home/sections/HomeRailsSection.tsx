import { motion } from "framer-motion";
import type { HomeRail } from "./home-utils";
import AnimatedText from "../AnimatedText";

type Props = {
  rails: HomeRail[];
};

function HomeRailCard({ rail }: { rail: HomeRail }) {
  return (
    <div className="min-w-[85vw] shrink-0 snap-center rounded-lg border border-bone bg-linen p-5 sm:min-w-0 sm:shrink sm:snap-align-none dark:border-night-edge dark:bg-obsidian">
      <div className="flex items-center justify-between gap-3">
        <AnimatedText
          el="h2"
          text={rail.title}
          mode="words"
          className="text-lg font-semibold text-ink dark:text-screen"
        />
        <a
          href={rail.href}
          aria-label={`Ver todo sobre ${rail.title}`}
          className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-amethyst transition-colors hover:text-ink dark:text-electric-sky dark:hover:text-screen"
        >
          Ver todo
        </a>
      </div>

      <div className="mt-5 grid gap-3">
        {rail.items.length > 0 ? (
          rail.items.map((item) => (
            <a href={item.href} key={item.id} className="group flex cursor-pointer items-center gap-3.5 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand dark:bg-coal">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-amethyst dark:text-screen dark:group-hover:text-electric-sky">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-slate dark:text-mist">
                  {item.meta}
                </p>
              </div>
            </a>
          ))
        ) : (
          <p className="text-sm text-slate dark:text-mist">
            Este bloque se llenara cuando el API devuelva contenido.
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomeRailsSection({ rails }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:gap-4 lg:gap-5 sm:overflow-x-visible sm:pb-0 md:grid-cols-2 xl:grid-cols-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {rails.map((rail) => (
        <HomeRailCard key={rail.title} rail={rail} />
      ))}
    </motion.section>
  );
}