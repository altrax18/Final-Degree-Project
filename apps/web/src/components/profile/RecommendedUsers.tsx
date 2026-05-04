import { useState, useEffect } from "react";
import { DEFAULT_AVATAR } from "../../types/user";

const API_URL = "http://localhost:3000";

type RecommendedUser = {
  id: number;
  username: string;
  profile_image_url: string;
  similarity: number;
};

type Props = {
  userId: number;
};

function UserCard({ user }: { user: RecommendedUser }) {
  const avatar = user.profile_image_url || DEFAULT_AVATAR;
  const matchPct = Math.max(0, Math.round(Number(user.similarity) * 100));

  return (
    <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-sand dark:hover:bg-coal transition-colors">
      <img
        src={avatar}
        alt={user.username}
        className="w-8 h-8 rounded-full object-cover shrink-0 bg-linen dark:bg-obsidian"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
        }}
      />
      <span className="text-sm text-ink dark:text-screen truncate flex-1">
        {user.username}
      </span>
      <span className="text-xs text-slate dark:text-mist shrink-0">{matchPct}%</span>
    </div>
  );
}

export default function RecommendedUsers({ userId }: Props) {
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/recommendations/${userId}/friends`)
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <section className="flex flex-col gap-3 w-64">
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
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
