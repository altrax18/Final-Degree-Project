// Hook con la lógica de estado y llamadas a la API del perfil.
import { useState, useEffect, useCallback } from "react";
import {
  type SessionUser,
  DEFAULT_AVATAR,
  readSession,
  writeSession,
  clearSession,
} from "../types/user";

export type EditForm = {
  username: string;
  email: string;
  newsletter: boolean;
  password: string;
};

type Feedback = { type: "ok" | "err"; msg: string };

export function useProfile() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Carga el usuario desde localStorage y lo refresca desde la API.
  useEffect(() => {
    const stored = readSession();
    if (!stored) {
      setLoadingUser(false);
      return;
    }

    setUser(stored);
    setLoadingUser(false);

    fetch(`/api/users/${stored.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((fresh) => {
        if (fresh) {
          const updated: SessionUser = {
            id: fresh.id,
            username: fresh.username,
            email: fresh.email,
            profileImageUrl: fresh.profileImageUrl ?? DEFAULT_AVATAR,
            newsletter: fresh.newsletter ?? false,
          };
          setUser(updated);
          writeSession(updated);
        }
      })
      .catch(() => {/* falla silenciosa, usamos el dato de localStorage */});
  }, []);

  // Envía PUT /api/users/:id y actualiza localStorage.
  const handleSave = useCallback(async (form: EditForm, onSuccess?: () => void) => {
    if (!user) return;
    setSaving(true);
    setFeedback(null);

    try {
      const body: Record<string, unknown> = {
        username: form.username,
        email: form.email,
        newsletter: form.newsletter,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar");

      const updated = await res.json();
      const newSession: SessionUser = {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        profileImageUrl: updated.profileImageUrl ?? DEFAULT_AVATAR,
        newsletter: updated.newsletter ?? false,
      };
      setUser(newSession);
      writeSession(newSession);
      setFeedback({ type: "ok", msg: "Perfil actualizado correctamente" });
      onSuccess?.();
    } catch {
      setFeedback({ type: "err", msg: "No se pudo guardar el perfil" });
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Envía DELETE /api/users/:id con la contraseña para confirmar el borrado.
  const handleDelete = useCallback(async (password: string) => {
    if (!user) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al eliminar");
      }

      clearSession();
      window.location.href = "/";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo eliminar la cuenta";
      setFeedback({ type: "err", msg });
      setDeleting(false);
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    clearSession();
    window.location.href = "/";
  }, []);

  return {
    user,
    loadingUser,
    saving,
    deleting,
    feedback,
    handleSave,
    handleDelete,
    handleLogout,
  };
}
