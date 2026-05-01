// Avatar del usuario con overlay de edición (próximamente).
import { DEFAULT_AVATAR } from "../../types/user";

interface Props {
  src: string;
  username: string;
}

export default function ProfileAvatar({ src, username }: Props) {
  return (
    <div className="relative shrink-0 group" style={{ width: 160, height: 160 }}>
      <img
        src={src || DEFAULT_AVATAR}
        alt={`Avatar de ${username}`}
        className="w-full h-full rounded-full object-cover"
        style={{
          boxShadow: "0 4px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
      {/* Overlay — subida de avatar pendiente de implementar */}
      <div
        className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-1
                   bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   cursor-pointer"
        title="Cambiar imagen (próximamente)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-white/70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021
               18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="text-[0.65rem] font-semibold text-white/60 uppercase tracking-wide">
          Próximamente
        </span>
      </div>
    </div>
  );
}
