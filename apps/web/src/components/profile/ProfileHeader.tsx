// Cabecera del perfil: avatar, nombre, email, stats y acciones.
import type { SessionUser } from "../../types/user";
import { DEFAULT_AVATAR } from "../../types/user";
import ProfileAvatar from "./ProfileAvatar";
import type { UserCollection } from "../../types/collection";
import { Icon } from "@iconify/react";

interface Props {
  user: SessionUser | null;
  collections: UserCollection[];
  onEdit: () => void;
  onLogout: () => void;
}

export default function ProfileHeader({ user, collections, onEdit, onLogout }: Props) {
  const displayName = user?.username ?? "Invitado";
  const displayEmail = user?.email ?? "";
  const displayAvatar = user?.profileImageUrl ?? DEFAULT_AVATAR;

  const musicCount = collections.filter(c => c.type === "music").length;
  const movieCount = collections.filter(c => c.type === "movie").length;
  const gameCount = collections.filter(c => c.type === "game").length;
  const totalCount = collections.length;

  return (
    <div className="flex flex-col gap-0">
      {/* Banner: modo invitado */}
      {!user && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border border-indigo-500/20
                     bg-indigo-500/[0.07] px-4 py-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 shrink-0 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-indigo-300">
            Estás viendo el perfil como invitado.{" "}
            <button
              onClick={() => document.getElementById("register-btn")?.click()}
              className="font-semibold underline underline-offset-2 hover:text-white
                         transition-colors cursor-pointer"
            >
              Inicia sesión
            </button>{" "}
            para gestionar tu cuenta.
          </p>
        </div>
      )}

      {/* Cabecera principal */}
      <div
        className="flex flex-col sm:flex-row sm:items-end gap-6 px-5 pt-12 pb-8 sm:px-9
                   rounded-2xl border border-white/[0.06]"
        style={{
          background: "linear-gradient(180deg, #0d0d0d 0%, #090909 50%, #070707 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <ProfileAvatar src={displayAvatar} username={displayName} />

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <span className="text-[0.7rem] font-bold uppercase tracking-[2px] text-white/40">
            Perfil
          </span>
          <h1
            className="m-0 font-black leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
          >
            {displayName}
          </h1>
          {displayEmail && (
            <p className="text-sm text-white/50 mt-1 truncate">{displayEmail}</p>
          )}

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-white/40">
              <span className="text-white">{totalCount}</span> Colecciones
            </div>
            
            {musicCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amethyst/10 border border-amethyst/20 text-[10px] font-bold uppercase tracking-wider text-amethyst">
                <Icon icon="tabler:music" className="w-3.5 h-3.5" />
                <span className="text-white/80">{musicCount}</span> Música
              </div>
            )}

            {movieCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                <Icon icon="tabler:movie" className="w-3.5 h-3.5" />
                <span className="text-white/80">{movieCount}</span> Pelis
              </div>
            )}

            {gameCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <Icon icon="tabler:device-gamepad-2" className="w-3.5 h-3.5" />
                <span className="text-white/80">{gameCount}</span> Juegos
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción: solo cuando hay sesión activa */}
        {user && (
          <div className="flex items-center gap-3 sm:mb-2">
            <button
              id="profile-edit-btn"
              onClick={onEdit}
              className="px-5 py-2 rounded-full border border-white/15 bg-white/[0.06]
                         text-white text-sm font-bold uppercase tracking-wide
                         hover:bg-white/[0.12] hover:border-white/30 hover:scale-105
                         transition-all duration-200 cursor-pointer"
            >
              Editar
            </button>
            <button
              id="profile-logout-btn"
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex items-center justify-center w-9 h-9 rounded-full
                         border border-white/10 bg-white/[0.04] text-white/50
                         hover:border-red-500/40 hover:bg-red-500/[0.12] hover:text-red-400
                         transition-all duration-200 cursor-pointer"
              aria-label="Cerrar sesión"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3
                     3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
