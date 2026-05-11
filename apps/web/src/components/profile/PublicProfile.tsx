import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ProfileCollections from "./ProfileCollections";
import type { UserCollection } from "../../types/collection";
import { useProfile } from "../../hooks/useProfile";
import { api } from "../../lib/api";

interface PublicUser {
  id: number;
  username: string;
  profileImageUrl: string;
}

interface Props {
  targetUserId: number;
}

export default function PublicProfile({ targetUserId }: Props) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const { user: currentUser } = useProfile();

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        setLoading(true);
        const targetApi = api.api.users({ userId: String(targetUserId) });

        // 1. Fetch user info
        const userResponse = await targetApi.get();
        if (userResponse.error || !userResponse.data) {
          throw new Error("Usuario no encontrado");
        }
        setUser(userResponse.data as unknown as PublicUser);

        // 2. Fetch user collections
        const collectionsResponse = await targetApi.collections.get();
        if (!collectionsResponse.error && collectionsResponse.data) {
          setCollections(collectionsResponse.data as UserCollection[]);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [targetUserId]);

  useEffect(() => {
    if (currentUser && targetUserId && currentUser.id !== targetUserId) {
      const currentApi = api.api.users({ userId: String(currentUser.id) });
      currentApi["is-following"]({ targetId: String(targetUserId) }).get()
        .then(({ data }: any) => {
          if (data) setFollowing(data.isFollowing);
        })
        .catch(() => {});
    }
  }, [currentUser, targetUserId]);

  useEffect(() => {
    if (targetUserId) {
      const targetApi = api.api.users({ userId: String(targetUserId) });
      targetApi.followers.get()
        .then(({ data }: any) => {
          if (data) setFollowersCount(Array.isArray(data) ? data.length : 0);
        })
        .catch(() => {});
    }
  }, [targetUserId, following]);

  const handleStartChat = () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para enviar mensajes");
      return;
    }
    // Dispatch event to open chat window
    window.dispatchEvent(
      new CustomEvent("open-chat", {
        detail: { targetUserId },
      })
    );
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para seguir a otros usuarios");
      return;
    }
    setCheckingFollow(true);
    try {
      const userApi = api.api.users({ userId: String(currentUser.id) });
      if (following) {
        const { error } = await userApi.follow({ targetId: String(targetUserId) }).delete();
        if (!error) setFollowing(false);
      } else {
        const { error } = await userApi.follow({ targetId: String(targetUserId) }).post();
        if (!error) setFollowing(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate dark:text-mist text-sm">
        Cargando perfil...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-rose-500">
        <Icon icon="tabler:user-off" className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">{error || "Usuario no encontrado"}</p>
      </div>
    );
  }

  const isSelf = currentUser?.id === user.id;

  const musicCount = collections.filter(c => c.type === "music").length;
  const movieCount = collections.filter(c => c.type === "movie").length;
  const gameCount = collections.filter(c => c.type === "game").length;
  const totalCount = collections.length;

  return (
    <div className="flex flex-col gap-0">
      {/* Profile Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-end gap-6 px-5 pt-12 pb-8 sm:px-9
                   rounded-2xl border border-bone dark:border-night-edge bg-linen dark:bg-coal animate-in fade-in zoom-in-95 duration-500"
      >
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <img
            src={user.profileImageUrl || "https://avatar.vercel.sh/default"}
            alt={user.username}
            className="w-full h-full rounded-full object-cover"
            style={{
              boxShadow: "0 4px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <span className="text-[0.7rem] font-bold uppercase tracking-[2px] text-slate dark:text-mist">
            Perfil Público
          </span>
          <h1
            className="m-0 font-black leading-tight tracking-tight text-ink dark:text-screen truncate"
            style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
          >
            {user.username}
          </h1>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink/[0.04] dark:bg-screen/[0.04] border border-bone dark:border-night-edge text-[11px] font-bold uppercase tracking-wider text-slate dark:text-mist">
              <span className="text-ink dark:text-screen">{totalCount}</span> Colecciones
            </div>
            
            {musicCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amethyst/10 border border-amethyst/20 text-[10px] font-bold uppercase tracking-wider text-amethyst">
                <Icon icon="tabler:music" className="w-3.5 h-3.5" />
                <span className="text-ink dark:text-screen">{musicCount}</span> Música
              </div>
            )}

            {movieCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                <Icon icon="tabler:movie" className="w-3.5 h-3.5" />
                <span className="text-ink dark:text-screen">{movieCount}</span> Películas
              </div>
            )}

            {gameCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <Icon icon="tabler:device-gamepad-2" className="w-3.5 h-3.5" />
                <span className="text-ink dark:text-screen">{gameCount}</span> Juegos
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:mb-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold uppercase tracking-wider text-indigo-500 shrink-0">
            <Icon icon="tabler:users-group" className="w-3.5 h-3.5" />
            <span className="text-ink dark:text-screen">{followersCount}</span> {followersCount === 1 ? "Seguidor" : "Seguidores"}
          </div>
          {!isSelf ? (
            <>
              <button
                onClick={handleFollowToggle}
                disabled={checkingFollow}
                className={`px-5 py-2 rounded-full border text-sm font-bold uppercase tracking-wide hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  following
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    : "border-bone dark:border-white/15 bg-ink/[0.06] dark:bg-white/[0.06] text-ink dark:text-screen hover:bg-ink/[0.12] dark:hover:bg-white/[0.12]"
                }`}
              >
                <Icon icon={following ? "tabler:user-check" : "tabler:user-plus"} className="w-4 h-4" />
                {following ? "Siguiendo" : "Seguir"}
              </button>
              <button
                onClick={handleStartChat}
                className="px-5 py-2 rounded-full border border-bone dark:border-white/15 bg-amethyst/10 dark:bg-amethyst/20
                           text-amethyst dark:text-electric-sky text-sm font-bold uppercase tracking-wide
                           hover:bg-amethyst/20 dark:hover:bg-amethyst/30 hover:border-amethyst/40 hover:scale-105
                           transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <Icon icon="tabler:messages" className="w-4 h-4" />
                Enviar Mensaje
              </button>
            </>
          ) : (
             <a
              href="/profile"
              className="px-5 py-2 rounded-full border border-bone dark:border-white/15 bg-ink/[0.06] dark:bg-white/[0.06]
                         text-ink dark:text-screen text-sm font-bold uppercase tracking-wide
                         hover:bg-ink/[0.12] dark:hover:bg-white/[0.12] hover:border-ink/30 dark:hover:border-white/30 hover:scale-105
                         transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <Icon icon="tabler:pencil" className="w-4 h-4" />
              Editar Perfil
            </a>
          )}
        </div>
      </div>

      {/* Profile Collections */}
      <div className="mt-8 flex flex-col gap-10">
        <ProfileCollections
          collections={collections}
          loading={loading}
          error={error}
          isReadOnly={true}
        />
      </div>
    </div>
  );
}
