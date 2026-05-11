import { motion } from "framer-motion";
import IconText, { type IconName } from "../IconText";
import AnimatedText from "../AnimatedText";

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

// CONCEPTO: Above the Fold Optimization (Optimización LCP)
// QUE HACE: Renderiza la zona superior crítica de la web priorizando la descarga de recursos visuales clave (`fetchPriority="high"`, `loading="eager"`).
// POR QUE LO USO: Garantiza que el "Largest Contentful Paint" sea casi instantáneo, obteniendo una puntuación perfecta de rendimiento.
// DOCUMENTACION: https://web.dev/articles/lcp
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
      {/* CONCEPTO: Efecto Aurora (Ambient Breathing Glow)
          QUÉ HACE: Anima los destellos de fondo de forma infinita, suave y asíncrona.
          POR QUÉ LO USO: Da una sensación de "organismo vivo" (Premium UI) sin distraer la lectura. */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7], x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 right-10 -z-10 h-[36rem] w-[36rem] rounded-full bg-amethyst/50 blur-[120px] dark:bg-electric-sky/40"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 left-10 -z-10 h-[36rem] w-[36rem] rounded-full bg-sapphire/50 blur-[120px] dark:bg-amethyst/40"
      />
      <motion.div
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lilac-mist/50 blur-[120px] dark:bg-depth/50"
      />

      <div className="relative z-10 grid items-center gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:min-h-[480px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 xl:gap-12 lg:px-10 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="flex max-w-2xl flex-col justify-center gap-8 lg:gap-10"
        >
          <div className="space-y-7">
            <p className="inline-flex w-fit items-center rounded-lg bg-amethyst/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amethyst dark:bg-electric-sky/10 dark:text-electric-sky">
              {kicker}
            </p>

            <div className="space-y-4">
              <AnimatedText
                el="h1"
                text={title}
                mode="words"
                className="text-3xl font-bold leading-[1.2] tracking-tight text-ink sm:text-4xl lg:text-5xl dark:text-screen"
              />
              <AnimatedText
                el="p"
                text={subtitle}
                mode="words"
                delay={0.4}
                className="max-w-xl text-base leading-relaxed text-slate sm:text-lg dark:text-mist"
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 w-full">
              <a
                href={primaryCta.href}
                className="inline-flex w-full sm:w-auto sm:min-w-[130px] cursor-pointer items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-screen transition-all hover:scale-105 hover:bg-amethyst active:scale-95 dark:bg-screen dark:text-ink dark:hover:bg-electric-sky"
              >
                {primaryCta.label}
              </a>
              <a
                href={secondaryCta.href}
                className="inline-flex w-full sm:w-auto sm:min-w-[130px] cursor-pointer items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-screen transition-all hover:scale-105 hover:bg-amethyst active:scale-95 dark:bg-screen dark:text-ink dark:hover:bg-electric-sky"
              >
                {secondaryCta.label}
              </a>
              <a
                href={tertiaryCta.href}
                className="inline-flex w-full sm:w-auto sm:min-w-[130px] cursor-pointer items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-screen transition-all hover:scale-105 hover:bg-amethyst active:scale-95 dark:bg-screen dark:text-ink dark:hover:bg-electric-sky"
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
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
          className="grid gap-4 lg:content-center min-w-0"
        >
          <a
            href={mainSpotlight.href}
            className="group relative block w-full aspect-square sm:aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-2xl border border-bone shadow-xl shadow-ink/5 dark:border-night-edge dark:bg-coal dark:shadow-abyss/40"
          >
            <img
              key={mainSpotlight.image}
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

          <div className="flex flex-col gap-4">
            {secondarySpotlights.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group flex flex-row items-stretch overflow-hidden rounded-xl border border-bone bg-linen/80 transition-colors hover:border-amethyst dark:border-night-edge dark:bg-depth/50 dark:hover:border-electric-sky"
              >
                <div className="relative w-[88px] shrink-0 overflow-hidden bg-sand sm:w-[100px] dark:bg-coal">
                  <img
                    key={item.image}
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3 sm:px-4 sm:py-3.5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-amethyst dark:text-electric-sky">
                    {item.label}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-ink dark:text-screen">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate dark:text-mist">
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
