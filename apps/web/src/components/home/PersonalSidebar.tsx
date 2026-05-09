import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCollections } from "../../hooks/useCollections";
import { readSession } from "../../types/user";
import RecommendedUsers from "../profile/RecommendedUsers";
import GuestSidebar from "./GuestSidebar";
import UserStatsCard from "./UserStatsCard";
import QuickCollectionsCard from "./QuickCollectionsCard";

// CONCEPTO: Component Composition (Composición de Componentes)
// QUE HACE: Actúa como un "orquestador" que evalúa la sesión del usuario y ensambla los bloques visuales correspondientes.
// POR QUE LO USO: Sigue el principio de Responsabilidad Única (SRP). Delega el renderizado a sus hijos y se centra exclusivamente en el layout global de la barra.
// DOCUMENTACION: https://react.dev/learn/passing-props-to-a-component
export default function PersonalSidebar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = isMounted ? readSession() : null;

  const { collections, loading, error } = useCollections();

  if (!user) {
    return <GuestSidebar />;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 self-start lg:sticky lg:top-24"
    >
      <UserStatsCard user={user} collections={collections} />
      <QuickCollectionsCard collections={collections} loading={loading} error={error} />

      <section className="rounded-lg border border-bone bg-linen p-4 sm:p-5 dark:border-night-edge dark:bg-obsidian">
        {/* CONCEPTO: CSS Injection (Tailwind Arbitrary Variants)
             */}
        <div className="
          [&_.divide-y]:divide-y-0 [&_.divide-y>div]:mb-1
          [&_.divide-y>div]:transition-all [&_.divide-y>div]:duration-300 [&_.divide-y>div]:border [&_.divide-y>div]:border-transparent
          [&_.divide-y>div:hover]:scale-[1.02] [&_.divide-y>div:hover]:bg-parchment dark:[&_.divide-y>div:hover]:bg-coal
          [&_.divide-y>div:hover]:border-amethyst/30 dark:[&_.divide-y>div:hover]:border-electric-sky/30
          [&_.divide-y>div:hover]:shadow-sm [&_.divide-y>div:active]:scale-[0.98]
          [&_img]:transition-all [&_img]:duration-300 
          [&_.divide-y>div:hover_img]:ring-2 [&_.divide-y>div:hover_img]:ring-amethyst/50 dark:[&_.divide-y>div:hover_img]:ring-electric-sky/50
        ">
          <RecommendedUsers userId={user.id} />
        </div>
      </section>
    </motion.aside>
  );
}
