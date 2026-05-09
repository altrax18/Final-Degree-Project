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
      className="group flex cursor-pointer items-center gap-3.5 rounded-lg border border-bone bg-parchment p-3 transition-all duration-300 hover:scale-[1.02] hover:border-amethyst hover:shadow-md dark:border-night-edge dark:bg-coal dark:hover:border-electric-sky active:scale-[0.98]"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand dark:bg-obsidian">
        <img
          src={getCollectionCover(collection)}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/50 to-transparent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-ink dark:text-screen">
          {collection.name}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate sm:text-xs dark:text-mist">
          {collection.items?.length ?? 0} items · {typeLabel[collection.type]}
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = isMounted ? readSession() : null;

  useEffect(() => {
    if (!user) return;
    // CONCEPTO: Consumo de API Oficial (Separation of Concerns)
    // QUE HACE: Llama al endpoint de tus compañeros para obtener los chats del usuario.
    // POR QUE LO USO: Permite mostrar mensajes no leídos en tiempo real sin modificar el código ni el estado interno del componente de Chat de tu equipo.
    const API_URL = (import.meta.env.PUBLIC_API_URL as string | undefined) ?? "";
    fetch(`${API_URL}/api/chat/conversations/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const totalUnread = data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        }
      })
      .catch(() => {}); // Fallback silencioso por si el chat está caído
  }, [user]);

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
                  className="flex flex-col items-center justify-center rounded-lg border border-bone bg-parchment/80 p-2 text-center sm:p-2.5 dark:border-night-edge dark:bg-coal/80"
                >
                  <p className="text-lg font-semibold text-ink dark:text-screen">
                    {count}
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-widest text-slate sm:text-[10px] dark:text-mist">
                    {typeLabel[type]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CONCEPTO: Indicador de Estado Oficial */}
          <div className="relative mt-4 flex items-center justify-between rounded-lg border border-bone bg-parchment/80 px-4 py-3 dark:border-night-edge dark:bg-coal/80">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {unreadCount > 0 && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amethyst opacity-75 dark:bg-electric-sky"></span>
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${unreadCount > 0 ? "bg-amethyst dark:bg-electric-sky" : "bg-slate dark:bg-mist"}`}></span>
              </span>
              <p className="text-xs font-semibold text-ink dark:text-screen">
                Mensajes del chat
              </p>
            </div>
            <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${unreadCount > 0 ? "text-amethyst dark:text-electric-sky" : "text-slate dark:text-mist"}`}>
              {unreadCount > 0 ? `${unreadCount} nuevos` : "Al día"}
            </span>
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
                className="flex items-center gap-3.5 rounded-lg border border-bone bg-parchment/40 p-3 dark:border-night-edge dark:bg-coal/40"
              >
                <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-bone/60 dark:bg-night-edge/60" />
                <div className="flex min-w-0 flex-1 flex-col justify-center space-y-2.5">
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
