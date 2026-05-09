// Modal de confirmación para eliminar la cuenta. Requiere contraseña.
import { useState } from "react";

interface Props {
  deleting: boolean;
  onConfirm: (password: string) => void;
  onClose: () => void;
}

export default function DeleteModal({ deleting, onConfirm, onClose }: Props) {
  const [pw, setPw] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/[0.08]
                   shadow-2xl p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-white/40 hover:text-white text-2xl leading-none cursor-pointer"
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-white text-center">¿Eliminar cuenta?</h2>
        <p className="text-sm text-white/50 text-center leading-relaxed">
          Esta acción es irreversible. Perderás todos tus datos y colecciones.
        </p>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="delete-password"
            className="text-xs font-semibold text-white/60 uppercase tracking-wide"
          >
            Contraseña para confirmar
          </label>
          <input
            id="delete-password"
            type="password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
                       placeholder:text-white/30 focus:border-red-500/60 focus:outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 text-white text-sm font-semibold
                       hover:bg-white/20 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            disabled={!pw || deleting}
            onClick={() => onConfirm(pw)}
            className="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold
                       hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {deleting ? "Eliminando…" : "Eliminar cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
