import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { DEFAULT_AVATAR } from "../../types/user";

type FollowedUser = {
  id: number;
  username: string;
  profileImageUrl: string;
};

type Props = {
  userId: number;
};

export default function FollowedUsers({ userId }: Props) {
  const [users, setUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/following`)
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUnfollow = async (targetId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow/${targetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== targetId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChat = (targetUserId: number) => {
    window.dispatchEvent(
      new CustomEvent("open-chat", {
        detail: { targetUserId },
      })
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col gap-3">
        <div className="h-4 w-32 bg-sand dark:bg-coal rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-sand dark:bg-coal rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon icon="tabler:users" className="w-5 h-5 text-amethyst dark:text-electric-sky" />
        <h2 className="text-lg font-bold text-ink dark:text-screen">
          Usuarios a los que sigues ({users.length})
        </h2>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-bone dark:border-night-edge bg-linen dark:bg-coal p-6 text-center text-slate dark:text-mist text-sm">
          Aún no sigues a ningún usuario. Explora los perfiles públicos de otros miembros para empezar a seguirlos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-bone dark:border-night-edge bg-linen dark:bg-coal hover:border-amethyst/30 dark:hover:border-electric-sky/30 transition-all duration-200"
            >
              <a
                href={`/u/${user.id}`}
                className="flex items-center gap-3 decoration-transparent hover:opacity-85"
              >
                <img
                  src={user.profileImageUrl || DEFAULT_AVATAR}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover bg-sand dark:bg-obsidian"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-ink dark:text-screen truncate max-w-[120px]">
                    {user.username}
                  </span>
                  <span className="text-xs text-slate dark:text-mist">Ver perfil</span>
                </div>
              </a>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStartChat(user.id)}
                  title="Enviar Mensaje"
                  className="p-2 rounded-full border border-bone dark:border-white/10 bg-amethyst/10 hover:bg-amethyst/20 dark:bg-amethyst/20 dark:hover:bg-amethyst/30 text-amethyst dark:text-electric-sky hover:scale-105 transition-all cursor-pointer"
                >
                  <Icon icon="tabler:messages" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUnfollow(user.id)}
                  title="Dejar de seguir"
                  className="p-2 rounded-full border border-bone dark:border-white/10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:scale-105 transition-all cursor-pointer"
                >
                  <Icon icon="tabler:user-minus" className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
