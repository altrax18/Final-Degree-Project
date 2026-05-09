import { motion } from "framer-motion";
import type { ElementType } from "react";

// CONCEPTO: Componente de Presentación Animado (Typewriter)
// QUE HACE: Renderiza texto revelando letra por letra o palabra por palabra de forma fluida.
// POR QUE LO USO: Centraliza la lógica de Framer Motion para mantener los componentes limpios, reutilizables y sin código espagueti.
// DOCUMENTACION: https://www.framer.com/motion/animation/#variants

interface Props {
  text: string;
  className?: string;
  el?: ElementType;
  once?: boolean;
  delay?: number;
  mode?: "words" | "letters";
}

export default function AnimatedText({
  text,
  className = "",
  el: Wrapper = "p",
  once = false,
  delay = 0,
  mode = "letters",
}: Props) {
  const itemArray = mode === "letters" ? text.split("") : text.split(" ");
  // Las letras pueden ser muy rápidas, las palabras un poco más espaciadas
  const stagger = mode === "letters" ? 0.02 : 0.08;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  const MotionWrapper = motion(Wrapper as any);

  return (
    <MotionWrapper className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once, amount: 0.5 }}>
      {itemArray.map((item, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block"
          style={{ marginRight: mode === "words" && index !== itemArray.length - 1 ? "0.25em" : "0px", whiteSpace: mode === "letters" && item === " " ? "pre" : "normal" }}
        >
          {item}
        </motion.span>
      ))}
    </MotionWrapper>
  );
}