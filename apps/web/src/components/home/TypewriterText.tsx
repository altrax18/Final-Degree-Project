// Componente para revelar texto letra a letra (concepto: animacion por caracteres).
import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
};

export default function TypewriterText({
  text,
  className,
  delay = 0,
  stagger = 0.02,
}: Props) {
  // Variantes para controlar el staggering de letras (concepto: variants de Framer Motion).
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  // Variantes para cada letra (concepto: animacion de entrada suave).
  const letterVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
      aria-label={text}
    >
      {Array.from(text).map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={letterVariants}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
