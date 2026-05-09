import { motion } from "framer-motion";
import IconText, { type IconName } from "../IconText";

export type HeroStat = {
  label: string;
  value: string;
  icon: IconName;
};

export type HeroSpotlight = {
  label: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  accent: "music" | "movie" | "game";
};

type Props = {
  heroStats: HeroStat[];
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  tertiaryCta: { href: string; label: string };
  spotlights: HeroSpotlight[];
};

const accentClassByType: Record<HeroSpotlight["accent"], string> = {
  music: "bg-electric-sky text-obsidian",
  movie: "bg-amethyst text-screen dark:bg-electric-sky dark:text-obsidian",
  game: "bg-depth text-screen",
};

export default function HeroSection({
  heroStats,
  kicker,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  tertiaryCta,
  spotlights,
}: Props) {
  const mainSpotlight = spotlights[0];
  const secondarySpotlights = spotlights.slice(1, 3);

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-bone bg-gradient-to-br from-linen to-bone/30 dark:border-night-edge dark:from-obsidian dark:to-abyss">
      {/* Detalles luminosos de fondo para no usar una imagen ruidosa */}
      <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-amethyst/15 blur-3xl dark:bg-electric-sky/10" />
      <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-sapphire/10 blur-3xl dark:bg-amethyst/10" />

      <div className="relative z-10 grid items-center gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:min-h-[600px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-16 lg:px-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="flex max-w-2xl flex-col justify-center gap-10 lg:gap-12"
        >
          <div className="space-y-7">
            <p className="inline-flex w-fit items-center rounded-lg bg-amethyst/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amethyst dark:bg-electric-sky/10 dark:text-electric-sky">
              {kicker}
            </p>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl dark:text-screen">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate sm:text-lg dark:text-mist">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={primaryCta.href}
                className="inline-flex min-w-[140px] cursor-pointer items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-screen transition-all hover:scale-105 hover:bg-amethyst active:scale-95 dark:bg-screen dark:text-ink dark:hover:bg-electric-sky"
              >
                {primaryCta.label}
              </a>
              <a
                href={secondaryCta.href}
                className="inline-flex min-w-[140px] cursor-pointer items-center justify-center rounded-xl border border-bone bg-transparent px-5 py-3 text-sm font-semibold text-ink transition-all hover:bg-bone/50 active:scale-95 dark:border-night-edge dark:text-screen dark:hover:bg-night-edge/50"
              >
                {secondaryCta.label}
              </a>
              <a
                href={tertiaryCta.href}
                className="inline-flex min-w-[140px] cursor-pointer items-center justify-center rounded-xl border border-bone bg-transparent px-5 py-3 text-sm font-semibold text-ink transition-all hover:bg-bone/50 active:scale-95 dark:border-night-edge dark:text-screen dark:hover:bg-night-edge/50"
              >
                {tertiaryCta.label}
              </a>
            </div>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-3 border-t border-bone/50 dark:border-night-edge/50">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-bone bg-linen/50 p-4 dark:border-night-edge dark:bg-depth/30"
              >
                <IconText
                  icon={stat.icon}
                  text={stat.label}
                  className="text-[0.65rem] font-bold uppercase tracking-wider text-slate dark:text-mist"
                />
                <p className="mt-2 text-2xl font-bold text-ink dark:text-screen">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
          className="grid gap-4 lg:content-center min-w-0"
        >
          <a
            href={mainSpotlight.href}
            className="group relative block w-full aspect-square sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-2xl border border-bone shadow-xl shadow-ink/5 dark:border-night-edge dark:bg-coal dark:shadow-abyss/40"
          >
            <img
              src={mainSpotlight.image}
              alt={mainSpotlight.title}
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-5">
              <span
                className={`inline-flex rounded-lg px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] shadow-lg backdrop-blur-md ${accentClassByType[mainSpotlight.accent]}`}
              >
                {mainSpotlight.label}
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-screen">
                  {mainSpotlight.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-screen/80">
                  {mainSpotlight.subtitle}
                </p>
              </div>
            </div>
          </a>

          <div className="grid gap-4 sm:grid-cols-2">
            {secondarySpotlights.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group grid grid-cols-[88px_minmax(0,1fr)] overflow-hidden rounded-xl border border-bone bg-linen/80 transition-colors hover:border-amethyst dark:border-night-edge dark:bg-depth/50 dark:hover:border-electric-sky"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full min-h-[96px] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="min-w-0 p-3 self-center">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-amethyst dark:text-electric-sky">
                    {item.label}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-semibold text-ink dark:text-screen">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate dark:text-mist">
                    {item.subtitle}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
