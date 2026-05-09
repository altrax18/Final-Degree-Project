import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HomeFeatureItem } from "./home-utils";
import AnimatedText from "../AnimatedText";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  featureItems: HomeFeatureItem[];
};

function HomeFeatureCard({ item, index }: { item: HomeFeatureItem; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-bone bg-linen dark:border-night-edge dark:bg-obsidian transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amethyst dark:hover:border-electric-sky"
    >
      <a href={item.href} className="block cursor-pointer">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand dark:bg-coal">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss/78 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-lg border border-screen/15 bg-abyss/65 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-screen backdrop-blur">
            {item.label}
          </span>
          <span className="absolute bottom-3 left-3 right-3 truncate text-xs font-semibold text-screen/80">
            {item.meta}
          </span>
        </div>
      </a>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-4">
        <div>
          <h3 className="truncate text-base font-semibold text-ink dark:text-screen">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate dark:text-mist">
            {item.subtitle}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className="w-full cursor-pointer rounded-lg bg-electric-sky px-3 py-2 text-xs font-semibold text-obsidian transition-colors hover:bg-sapphire"
            >
              Reproducir
            </button>
          ) : null}
          <a
            href={item.href}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-bone px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-amethyst dark:border-night-edge dark:text-screen dark:hover:border-electric-sky"
          >
            Abrir ficha
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function HomeShowcaseSection({
  eyebrow,
  title,
  description,
  featureItems,
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "music" | "movie" | "game">("all");

  const filteredItems = featureItems.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "music") return item.href.includes("/music");
    if (activeTab === "movie") return item.href.includes("/movies");
    if (activeTab === "game") return item.href.includes("/games");
    return true;
  });

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl rounded-xl border border-bone bg-linen/50 p-6 sm:p-8 dark:border-night-edge dark:bg-obsidian/50"
      >
        <AnimatedText
          el="p"
          mode="words"
          text={eyebrow}
          className="text-xs font-semibold uppercase tracking-[0.22em] text-amethyst dark:text-electric-sky"
        />
        <AnimatedText
          el="h2"
          mode="letters"
          text={title}
          className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl dark:text-screen"
        />
        <AnimatedText
          el="p"
          mode="words"
          delay={0.2}
          text={description}
          className="mt-4 text-base leading-relaxed text-slate dark:text-mist"
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {([
            { id: "all", label: "Todo" },
            { id: "music", label: "Música" },
            { id: "movie", label: "Cine" },
            { id: "game", label: "Juegos" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-screen dark:text-obsidian"
                  : "text-slate hover:text-ink dark:text-mist dark:hover:text-screen"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-full bg-amethyst dark:bg-electric-sky"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <HomeFeatureCard key={item.id} item={item} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}