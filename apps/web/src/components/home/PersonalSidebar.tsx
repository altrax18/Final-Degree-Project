import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCollections } from "../../hooks/useCollections";
import { DEFAULT_AVATAR, readSession } from "../../types/user";
import RecommendedUsers from "../profile/RecommendedUsers";
import type { UserCollection } from "../../types/collection";
import AnimatedText from "./AnimatedText";

const typeLabel: Record<UserCollection["type"], string> = {
  music: "Musica",
  movie: "Peliculas",
  game: "Juegos",
};

const typeHref: Record<UserCollection["type"], string> = {
  music: "/music",
  movie: "/movies",
  game: "/games",
};

const getCollectionCover = (collection: UserCollection) => {
  const firstItem = collection.items?.[0];
  return (
    firstItem?.metadata?.image ??
    firstItem?.metadata?.cover ??
    "https://placehold.co/160x160/0A0A0A/FFFFFF?text=A"
  );
};

function MiniCollection({ collection }: { collection: UserCollection }) {
  return (
    <a
      href={typeHref[collection.type]}
      className="group grid cursor-pointer grid-cols-[54px_minmax(0,1fr)] gap-3 rounded-lg border border-bone bg-parchment p-2.5 transition-all duration-300 hover:scale-[1.02] hover:border-amethyst hover:shadow-md dark:border-night-edge dark:bg-coal dark:hover:border-electric-sky active:scale-[0.98]"
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-sand dark:bg-obsidian">
        <img
          src={getCollectionCover(collection)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/50 to-transparent" />
      </div>
      <div className="min-w-0 self-center">
        <p className="truncate text-sm font-semibold text-ink dark:text-screen">
          {collection.name}
        </p>
        <p className="mt-1 text-xs text-slate dark:text-mist">
          {collection.items?.length ?? 0} elementos · {typeLabel[collection.type]}
        </p>
      </div>
    </a>
  );
}

export default function PersonalSidebar() {
  // CONCEPTO: Prevención de Error de Hidratación (Hydration Mismatch)
  // QUE HACE: Asegura que el primer renderizado del cliente sea idéntico al del servidor.
  // POR QUE LO USO: El servidor no tiene localStorage. Si el cliente lee la sesión inmediatamente, React detecta un cambio brusco y hace saltar el plugin de error de Astro.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = isMounted ? readSession() : null;
  const { collections, loading, error } = useCollections();
  const visibleCollections = collections.slice(0, 4);

  if (!user) {
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

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 self-start lg:sticky lg:top-24"
    >
      <section className="overflow-hidden rounded-lg border border-bone bg-linen dark:border-night-edge dark:bg-obsidian">
        <div className="relative p-4 sm:p-5">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-lilac-mist via-electric-sky/20 to-transparent dark:from-depth dark:via-electric-sky/10" />
          <div className="relative flex items-center gap-3">
            <img
              src={user.profileImageUrl || DEFAULT_AVATAR}
              alt={user.username}
              className="h-12 w-12 rounded-lg border border-screen/40 bg-sand object-cover dark:border-night-edge dark:bg-coal"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink dark:text-screen">
                {user.username}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate dark:text-mist">
                Centro personal
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            {(["music", "movie", "game"] as const).map((type) => {
              const count = collections.filter((item) => item.type === type).length;
              return (
                <div
                  key={type}
                  className="rounded-lg border border-bone bg-parchment/80 p-3 text-center dark:border-night-edge dark:bg-coal/80"
                >
                  <p className="text-lg font-semibold text-ink dark:text-screen">
                    {count}
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-[0.12em] text-slate dark:text-mist">
                    {typeLabel[type]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-bone bg-linen p-4 sm:p-5 dark:border-night-edge dark:bg-obsidian">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amethyst dark:text-electric-sky">
              Acceso rapido
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink dark:text-screen">
              Tus colecciones
            </h2>
          </div>
          <a
            href="/profile"
            className="cursor-pointer text-xs font-semibold text-slate transition-colors hover:text-ink dark:text-mist dark:hover:text-screen"
          >
            Perfil
          </a>
        </div>

        <div className="mt-4 space-y-2">
          {loading && collections.length === 0 ? (
            [0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[54px_minmax(0,1fr)] gap-3 rounded-lg border border-bone bg-parchment/40 p-2.5 dark:border-night-edge dark:bg-coal/40"
              >
                <div className="h-14 w-14 animate-pulse rounded-lg bg-bone/60 dark:bg-night-edge/60" />
                <div className="flex flex-col justify-center space-y-2.5">
                  <div className="h-3 w-3/4 animate-pulse rounded-md bg-bone/60 dark:bg-night-edge/60" />
                  <div className="h-2 w-1/2 animate-pulse rounded-md bg-bone/60 dark:bg-night-edge/60" />
                </div>
              </div>
            ))
          ) : null}

          {!loading && error ? (
            <p className="rounded-lg border border-bone bg-parchment p-3 text-xs text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
              {error}
            </p>
          ) : null}

          {!loading && !error && visibleCollections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-bone bg-parchment p-4 dark:border-night-edge dark:bg-coal">
              <p className="text-sm font-semibold text-ink dark:text-screen">
                Aun no hay listas
              </p>
              <p className="mt-1 text-xs leading-5 text-slate dark:text-mist">
                Crea colecciones desde el perfil y apareceran aqui como accesos
                directos.
              </p>
            </div>
          ) : null}

          {visibleCollections.map((collection) => (
            <MiniCollection key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-bone bg-linen p-4 sm:p-5 dark:border-night-edge dark:bg-obsidian">
        <RecommendedUsers userId={user.id} />
      </section>
    </motion.aside>
  );
}
