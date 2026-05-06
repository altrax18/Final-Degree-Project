import { motion } from "framer-motion";
import TypewriterText from "../TypewriterText";
import IconText, { type IconName } from "../IconText";

export type HeroStat = {
  label: string;
  value: string;
  icon: IconName;
};

export type HeroSpotlight = {
  id: string;
  eyebrow: string;
  icon: IconName;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  onClick?: () => void;
  href?: string;
};

type Props = {
  heroStats: HeroStat[];
  heroSpotlights: HeroSpotlight[];
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  tertiaryCta: { href: string; label: string };
};

// SECCION HERO
// QUE HACE: Presenta el mensaje principal y un radar con datos reales.
// POR QUE: Refuerza el valor del producto con un vistazo rapido.
// DOCUMENTACION: https://www.framer.com/motion/

export default function HeroSection({
  heroStats,
  heroSpotlights,
  kicker,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  tertiaryCta,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-bone bg-linen p-8 dark:border-night-edge dark:bg-obsidian">
      <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-depth/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-electric-sky/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-slate text-xs uppercase tracking-[0.25em] dark:text-mist">
              {kicker}
            </p>
            <h1 className="text-ink text-4xl font-semibold tracking-tight dark:text-screen md:text-5xl">
              <TypewriterText text={title} delay={0.1} />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-slate max-w-2xl text-sm leading-relaxed dark:text-mist"
            >
              {subtitle}
            </motion.p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={primaryCta.href}
              className="cursor-pointer rounded-full bg-electric-sky px-5 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-sapphire"
            >
              {primaryCta.label}
            </a>
            <a
              href={secondaryCta.href}
              className="cursor-pointer rounded-full border border-bone px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
            >
              {secondaryCta.label}
            </a>
            <a
              href={tertiaryCta.href}
              className="cursor-pointer rounded-full border border-bone px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
            >
              {tertiaryCta.label}
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-bone bg-sand/80 p-4 dark:border-night-edge dark:bg-coal/80"
              >
                <IconText
                  icon={stat.icon}
                  text={stat.label}
                  className="text-slate text-xs uppercase tracking-wide dark:text-mist"
                />
                <p className="text-ink text-2xl font-semibold dark:text-screen">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-bone bg-sand/70 p-5 backdrop-blur dark:border-night-edge dark:bg-coal/80">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate dark:text-mist">
              Radar del dia
            </p>
            <p className="text-sm text-slate dark:text-mist">
              Tres señales vivas del catalogo para arrancar tu sesion.
            </p>
          </div>
          <div className="space-y-3">
            {heroSpotlights.map((spotlight, index) => (
              <motion.article
                key={spotlight.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
                className="flex gap-4 rounded-2xl border border-bone bg-linen p-3 dark:border-night-edge dark:bg-obsidian"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment dark:bg-obsidian">
                  <img
                    src={spotlight.image}
                    alt={spotlight.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <IconText
                    icon={spotlight.icon}
                    text={spotlight.eyebrow}
                    className="text-[0.7rem] uppercase tracking-wide text-electric-sky"
                  />
                  <p className="text-sm font-semibold text-ink dark:text-screen">
                    {spotlight.title}
                  </p>
                  <p className="text-xs text-slate dark:text-mist">
                    {spotlight.subtitle}
                  </p>
                  {spotlight.onClick ? (
                    <button
                      type="button"
                      onClick={spotlight.onClick}
                      className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
                    >
                      {spotlight.ctaLabel}
                    </button>
                  ) : (
                    <a
                      href={spotlight.href}
                      className="inline-flex cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
                    >
                      {spotlight.ctaLabel}
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
