import { useState, useEffect } from "react";
import { DEFAULT_AVATAR } from "../../types/user";
import type { UserCollection } from "../../types/collection";

const typeLabel: Record<UserCollection["type"], string> = {
  music: "Música",
  movie: "Películas",
  game: "Juegos",
};

type Props = {
  user: { id: number; username: string; profileImageUrl?: string | null };
  collections: UserCollection[];
};

// CONCEPTO: Autonomous Component (Componente Autónomo / Micro-Frontend)
// QUE HACE: Muestra la información del usuario y consume su propia API asíncrona para obtener los mensajes no leídos del chat.
// POR QUE LO USO: Al manejar su propio estado interno (`unreadCount`), evita que el resto de la página se vuelva a renderizar cuando llega un mensaje nuevo.
// DOCUMENTACION: https://react.dev/learn/state-a-components-memory
export default function UserStatsCard({ user, collections }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const API_URL = (import.meta.env.PUBLIC_API_URL as string | undefined) ?? "";
    fetch(`${API_URL}/api/chat/conversations/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const totalUnread = data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        }
      })
      .catch(() => {});
  }, [user]);

  return (
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
  );
}