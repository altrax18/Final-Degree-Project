import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ProfileCollections from "./ProfileCollections";
import type { UserCollection } from "../../types/collection";
import { useProfile } from "../../hooks/useProfile";

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
  const { user: currentUser } = useProfile();

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        setLoading(true);
        // 1. Fetch user info
        const userRes = await fetch(`/api/users/${targetUserId}`);
        if (!userRes.ok) {
          throw new Error("Usuario no encontrado");
        }
        const userData = await userRes.json();
        setUser(userData);

        // 2. Fetch user collections
        const colsRes = await fetch(`/api/users/${targetUserId}/collections`);
        if (colsRes.ok) {
          const colsData = await colsRes.json();
          setCollections(colsData);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [targetUserId]);

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

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pt-10 px-4 md:px-8">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl bg-sand dark:bg-coal border border-bone dark:border-night-edge p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-500 shadow-xl shadow-ink/5 dark:shadow-none">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amethyst/10 dark:bg-amethyst/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <img
            src={user.profileImageUrl || "https://avatar.vercel.sh/default"}
            alt={user.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-bone dark:border-night-edge shadow-2xl bg-linen dark:bg-obsidian"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-screen tracking-tight">
              {user.username}
            </h1>
            <p className="text-slate dark:text-mist mt-2 font-medium">
              Explora las colecciones y gustos de {user.username}
            </p>
          </div>

          {!isSelf && (
            <div className="shrink-0">
              <button
                onClick={handleStartChat}
                className="flex items-center gap-2 px-6 py-3 bg-amethyst hover:bg-orchid text-white rounded-xl font-bold transition-all shadow-lg shadow-amethyst/20 hover:scale-105 active:scale-95"
              >
                <Icon icon="tabler:messages" className="w-5 h-5" />
                Enviar Mensaje
              </button>
            </div>
          )}
          {isSelf && (
            <div className="shrink-0">
               <a
                href="/profile"
                className="flex items-center gap-2 px-6 py-3 bg-ink/10 dark:bg-white/10 hover:bg-ink/20 dark:hover:bg-white/20 text-ink dark:text-screen rounded-xl font-bold transition-all"
              >
                <Icon icon="tabler:pencil" className="w-5 h-5" />
                Editar mi Perfil
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Profile Collections */}
      <div className="mt-8">
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
