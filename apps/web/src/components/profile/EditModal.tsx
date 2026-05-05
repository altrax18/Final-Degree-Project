// Modal para editar los datos del perfil. Contraseña opcional.
import { useState } from "react";
import type { EditForm } from "../../hooks/useProfile";

interface Props {
  initial: EditForm;
  saving: boolean;
  onSave: (form: EditForm) => void;
  onClose: () => void;
}

export default function EditModal({ initial, saving, onSave, onClose }: Props) {
  const [form, setForm] = useState<EditForm>(initial);
  const [pwError, setPwError] = useState("");

  const set = (key: keyof EditForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password.length < 8) {
      setPwError("Mínimo 8 caracteres");
      return;
    }
    setPwError("");
    onSave(form);
  };

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

        <h2 className="text-lg font-bold text-white text-center">Editar perfil</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-username"
              className="text-xs font-semibold text-white/60 uppercase tracking-wide"
            >
              Nombre de usuario
            </label>
            <input
              id="edit-username"
              type="text"
              required
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
                         placeholder:text-white/30 focus:border-indigo-500/60 focus:outline-none transition"
              placeholder="Tu nombre"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-email"
              className="text-xs font-semibold text-white/60 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="edit-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
                         placeholder:text-white/30 focus:border-indigo-500/60 focus:outline-none transition"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Newsletter */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              id="edit-newsletter"
              type="checkbox"
              checked={form.newsletter}
              onChange={(e) => set("newsletter", e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-white/70">Recibir novedades y ofertas</span>
          </label>

          {/* Nueva contraseña */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-password"
              className="text-xs font-semibold text-white/60 uppercase tracking-wide"
            >
              Nueva contraseña{" "}
              <span className="normal-case font-normal text-white/35">(opcional)</span>
            </label>
            <input
              id="edit-password"
              type="password"
              value={form.password}
              onChange={(e) => {
                set("password", e.target.value);
                setPwError("");
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
                         placeholder:text-white/30 focus:border-indigo-500/60 focus:outline-none transition"
              placeholder="Dejar vacío para no cambiar"
            />
            {pwError && <span className="text-xs text-red-400">{pwError}</span>}
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-white/40 hover:text-white uppercase font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold uppercase
                         hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
