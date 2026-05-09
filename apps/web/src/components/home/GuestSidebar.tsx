import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";

// CONCEPTO: Presentational Component (Estado Vacío / Empty State)
// QUE HACE: Renderiza la interfaz estática que invita al usuario a iniciar sesión o registrarse.
// POR QUE LO USO: Mantiene el componente padre limpio al aislar la UI exclusiva para usuarios no autenticados.
// DOCUMENTACION: https://react.dev/learn/conditional-rendering
export default function GuestSidebar() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="self-start rounded-lg border border-bone bg-linen p-5 lg:sticky lg:top-24 dark:border-night-edge dark:bg-obsidian"
    >
      <AnimatedText
        el="p"
        mode="words"
        text="Espacio personal"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-amethyst dark:text-electric-sky"
      />
      <AnimatedText
        el="h2"
        mode="words"
        text="Entra para desbloquear tu portada."
        className="mt-3 text-xl font-semibold text-ink dark:text-screen"
      />
      <p className="mt-3 text-sm leading-6 text-slate dark:text-mist">
        Al iniciar sesion veras aqui tus colecciones y personas con gustos
        parecidos, sin pasar por el perfil.
      </p>
      <a
        href="/profile"
        className="mt-5 inline-flex cursor-pointer rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-screen transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-amethyst dark:bg-electric-sky dark:text-obsidian dark:hover:bg-screen"
      >
        Ir a mi perfil
      </a>
    </motion.aside>
  );
}