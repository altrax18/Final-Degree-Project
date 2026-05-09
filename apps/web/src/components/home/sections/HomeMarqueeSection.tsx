import { motion } from "framer-motion";

export type MarqueeItem = {
  id: string;
  title: string;
  image: string;
  label: string;
  href: string;
};

type Props = {
  items: MarqueeItem[];
};

export default function HomeMarqueeSection({ items }: Props) {
  // CONCEPTO: Duplicación para Carrusel Infinito
  // QUE HACE: Duplica el array de elementos para que Framer Motion pueda hacer el efecto de bucle al 50% de la longitud sin cortes perceptibles.
  const duplicatedItems = [...items, ...items];

  return (
    // Utilizamos mask-image para crear un difuminado elegante en los bordes para que los items aparezcan/desaparezcan suavemente.
    <section className="relative flex overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <motion.div
        className="flex w-max shrink-0 items-center gap-4 px-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: items.length * 3.5, // La velocidad se adapta automáticamente a la cantidad de contenido
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {duplicatedItems.map((item, index) => (
          <a
            href={item.href}
            key={`${item.id}-${index}`}
            className="flex w-max items-center gap-3 rounded-full border border-bone bg-linen/50 py-1.5 pl-1.5 pr-5 backdrop-blur-sm transition-colors hover:border-amethyst dark:border-night-edge dark:bg-obsidian/50 dark:hover:border-electric-sky"
          >
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amethyst dark:text-electric-sky">
                {item.label}
              </span>
              <span className="text-xs font-semibold text-ink dark:text-screen">
                {item.title}
              </span>
            </div>
          </a>
        ))}
      </motion.div>
    </section>
  );
}