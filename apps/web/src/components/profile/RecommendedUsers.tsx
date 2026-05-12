import { useState, useEffect } from "react";
import { DEFAULT_AVATAR } from "../../types/user";
import { api } from "../../lib/api";

type RecommendedUser = {
  id: number;
  username: string;
  profile_image_url: string;
  similarity: number;
};

type Props = {
  userId: number;
  showBar?: boolean;
};

function UserCard({ user, showBar }: { user: RecommendedUser; showBar?: boolean }) {
  const avatar = user.profile_image_url || DEFAULT_AVATAR;
  const matchPct = Math.max(0, Math.round(Number(user.similarity) * 100));
  const affinityClass = matchPct > 75 ? "affinity-fill affinity-fill-high" : matchPct >= 50 ? "affinity-fill affinity-fill-good" : matchPct >= 25 ? "affinity-fill affinity-fill-mid" : "affinity-fill affinity-fill-low";

  return (
    <a href={`/u/${user.id}`} className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-sand dark:hover:bg-coal transition-colors decoration-transparent cursor-pointer">
      <img
        src={avatar}
        alt={user.username}
        className="w-8 h-8 rounded-full object-cover shrink-0 bg-linen dark:bg-obsidian"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
        }}
      />
      <span className="text-sm text-ink dark:text-screen truncate flex-1 font-medium hover:underline">
        {user.username}
      </span>
      {showBar ? (
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-24 h-2 rounded-full bg-sand dark:bg-coal overflow-hidden">
            <div
              className={`${affinityClass} absolute inset-y-0 left-0 rounded-full`}
              style={{ width: `${matchPct}%` }}
            />
          </div>
          <span className="text-xs text-slate dark:text-mist w-8 text-right">{matchPct}%</span>
        </div>
      ) : (
        <span className="text-xs text-slate dark:text-mist shrink-0">{matchPct}%</span>
      )}
    </a>
  );
}

export default function RecommendedUsers({ userId, showBar }: Props) {
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = () => {
      setLoading(true);
      setUsers([]);
      api.api.recommendations({ userId: String(userId) }).friends.get()
        .then(({ data }) => { if (!cancelled) setUsers(Array.isArray(data) ? data as any : []); })
        .catch(() => { if (!cancelled) setUsers([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchUsers();
    document.addEventListener("astro:page-load", fetchUsers);
    return () => {
      cancelled = true;
      document.removeEventListener("astro:page-load", fetchUsers);
    };
  }, [userId]);

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-amethyst dark:text-electric-sky shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
          />
        </svg>
        <h2 className="text-sm font-semibold text-ink dark:text-screen">
          Personas con gustos similares
        </h2>
      </div>

      <div className="rounded-xl border border-bone dark:border-night-edge bg-linen dark:bg-obsidian overflow-hidden">
        {loading && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-2 px-3 animate-pulse border-b border-bone dark:border-night-edge last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-sand dark:bg-coal shrink-0" />
                <div className="h-3 flex-1 rounded bg-sand dark:bg-coal" />
                <div className="h-3 w-7 rounded bg-sand dark:bg-coal shrink-0" />
              </div>
            ))}
          </>
        )}

        {!loading && users.length === 0 && (
          <p className="text-xs text-slate dark:text-mist px-3 py-4">
            Añade contenido a tus colecciones para ver sugerencias.
          </p>
        )}

        {!loading && users.length > 0 && (
          <div className="divide-y divide-bone dark:divide-night-edge">
            {users.map((user) => (
              <UserCard key={user.id} user={user} showBar={showBar} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
