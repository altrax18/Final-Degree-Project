import { useState, useEffect, useRef } from "react";
import type { ChatConversation } from "../../hooks/useChat";

const API_URL = ((import.meta.env.PUBLIC_API_URL as string | undefined) ?? "").replace(/\/api\/?$/, "");

type UserResult = {
  id: number;
  username: string;
  profileImageUrl: string;
};

type Props = {
  userId: number;
  conversations: ChatConversation[];
  onSelect: (conversationId: number) => void;
  onStartConversation: (targetUserId: number) => Promise<void>;
};

export default function ConversationList({ userId, conversations, onSelect, onStartConversation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "followed">("chats");
  const [followedUsers, setFollowedUsers] = useState<UserResult[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(
        `${API_URL}/api/users/search?q=${encodeURIComponent(query)}&excludeId=${userId}`
      );
      const data = await res.json();
      setResults(data);
      setSearching(false);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, userId]);

  useEffect(() => {
    if (activeTab === "followed") {
      setLoadingFollowed(true);
      fetch(`/api/users/${userId}/following`)
        .then((r) => r.json())
        .then((data) => setFollowedUsers(Array.isArray(data) ? data : []))
        .catch(() => setFollowedUsers([]))
        .finally(() => setLoadingFollowed(false));
    }
  }, [activeTab, userId]);

  const handleUserClick = async (targetUserId: number) => {
    setQuery("");
    setResults([]);
    await onStartConversation(targetUserId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Buscador de usuarios */}
      <div className="px-3 pt-3 pb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-full border border-bone bg-linen px-4 py-2 text-sm text-ink outline-none placeholder:text-slate focus:border-amethyst focus:ring-1 focus:ring-amethyst dark:border-night-edge dark:bg-abyss dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky dark:focus:ring-electric-sky"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bone dark:border-night-edge px-3 pb-2 gap-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
            activeTab === "chats"
              ? "bg-amethyst/10 dark:bg-electric-sky/15 text-amethyst dark:text-electric-sky"
              : "text-slate dark:text-mist hover:bg-sand dark:hover:bg-coal"
          }`}
        >
          Mensajes
        </button>
        <button
          onClick={() => setActiveTab("followed")}
          className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
            activeTab === "followed"
              ? "bg-amethyst/10 dark:bg-electric-sky/15 text-amethyst dark:text-electric-sky"
              : "text-slate dark:text-mist hover:bg-sand dark:hover:bg-coal"
          }`}
        >
          Seguidos
        </button>
      </div>

      {/* Resultados de búsqueda */}
      {(results.length > 0 || searching) && (
        <div className="border-b border-bone dark:border-night-edge">
          {searching && (
            <p className="px-4 py-2 text-xs text-slate dark:text-mist">Searching...</p>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-sand dark:hover:bg-coal transition-colors cursor-pointer"
            >
              <img
                src={user.profileImageUrl}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-ink dark:text-screen">{user.username}</span>
            </button>
          ))}
        </div>
      )}

      {/* Lista de conversaciones */}
      {activeTab === "chats" && (
        <ul className="divide-y divide-bone overflow-y-auto flex-1 dark:divide-night-edge">
          {conversations.length === 0 && query.length < 2 && (
            <li className="px-4 py-8 text-center text-sm text-slate dark:text-mist">
              No conversations yet. Search for a user to start chatting!
            </li>
          )}
          {conversations.map((conv) => {
            const displayName =
              conv.type === "direct"
                ? conv.members.find((m) => m.id !== userId)?.username ?? "Unknown"
                : conv.name ?? "Group";

            return (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand dark:hover:bg-coal transition-colors cursor-pointer"
                >
                  {conv.type === "group" ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac-mist text-amethyst dark:bg-depth dark:text-electric-sky">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                      </svg>
                    </div>
                  ) : (() => {
                    const interlocutor = conv.members.find((m) => m.id !== userId);
                    return interlocutor?.profileImageUrl ? (
                      <img
                        src={interlocutor.profileImageUrl}
                        alt={displayName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover bg-sand dark:bg-obsidian"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac-mist text-amethyst font-semibold text-sm dark:bg-depth dark:text-electric-sky">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink dark:text-screen">{displayName}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amethyst px-1.5 text-[11px] font-semibold text-screen dark:bg-electric-sky dark:text-obsidian">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate dark:text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Lista de seguidos */}
      {activeTab === "followed" && (
        <div className="overflow-y-auto flex-1 divide-y divide-bone dark:divide-night-edge">
          {loadingFollowed && (
            <p className="px-4 py-8 text-center text-sm text-slate dark:text-mist">Cargando seguidos...</p>
          )}
          {!loadingFollowed && followedUsers.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate dark:text-mist">
              Aún no sigues a nadie. ¡Sigue a usuarios desde su perfil para verlos aquí!
            </p>
          )}
          {!loadingFollowed &&
            followedUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand dark:hover:bg-coal transition-colors cursor-pointer"
              >
                <img
                  src={user.profileImageUrl || "https://avatar.vercel.sh/default"}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover bg-sand dark:bg-obsidian"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink dark:text-screen">
                    {user.username}
                  </p>
                  <p className="text-[11px] text-slate dark:text-mist">Enviar mensaje</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate dark:text-mist"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
