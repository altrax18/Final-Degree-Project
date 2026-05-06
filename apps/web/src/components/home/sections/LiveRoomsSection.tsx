import { motion } from "framer-motion";
import IconText from "../IconText";

export type LiveRoom = {
  id: string;
  topic: string;
  subtitle: string;
  href: string;
  members: number;
  tags: string[];
};

// SECCION LIVE ROOMS
// QUE HACE: Presenta salas activas con datos del feed.
// POR QUE: Refuerza el caracter social de la plataforma.
// DOCUMENTACION: https://www.framer.com/motion/

type Props = {
  rooms: LiveRoom[];
};

export default function LiveRoomsSection({ rooms }: Props) {
  return (
    <section className="space-y-4" id="live-rooms">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-ink text-xl font-semibold dark:text-screen">
            Live Rooms
          </h2>
          <p className="text-slate text-sm dark:text-mist">
            Salas activas basadas en conversaciones recientes.
          </p>
        </div>
        <a
          href="#feed"
          className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
        >
          Ver feed completo
        </a>
      </div>

      {rooms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room, index) => (
            <motion.a
              key={room.id}
              href={room.href}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group rounded-2xl border border-bone bg-linen p-4 dark:border-night-edge dark:bg-obsidian"
            >
              <div className="flex items-center justify-between">
                <IconText
                  icon="tabler:users-group"
                  text="Sala activa"
                  className="text-[0.7rem] uppercase tracking-wide text-electric-sky"
                />
                <IconText
                  icon="tabler:radio"
                  text={`${room.members} en vivo`}
                  className="text-xs text-slate dark:text-mist"
                />
              </div>
              <h3 className="mt-3 text-base font-semibold text-ink dark:text-screen">
                {room.topic}
              </h3>
              <p className="mt-2 text-xs text-slate dark:text-mist">
                {room.subtitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {room.tags.map((tag) => (
                  <span
                    key={`${room.id}-${tag}`}
                    className="rounded-full border border-bone px-2 py-1 text-[0.7rem] text-slate dark:border-night-edge dark:text-mist"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
          Aun no hay salas activas. Publica un post para iniciar conversacion.
        </div>
      )}
    </section>
  );
}
