// Hook con la lógica de estado y llamadas a la API del perfil.
import { useState, useEffect, useCallback } from "react";
import {
  type SessionUser,
  DEFAULT_AVATAR,
  readSession,
  writeSession,
  clearSession,
} from "../types/user";
import { api } from "../lib/api";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
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

    const refreshProfile = async () => {
      try {
        const { data, error } = await api.api.users({ userId: String(stored.id) }).get();
        if (!error && data) {
          const fresh = data as any;
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
      } catch (err) {
        // falla silenciosa, usamos el dato de localStorage
      }
    };
    
    refreshProfile();
  }, []);

  // Envía PUT /api/users/:id y actualiza localStorage.
  const handleSave = useCallback(async (form: EditForm, onSuccess?: () => void) => {
    if (!user) return;
    setSaving(true);
    setFeedback(null);

    try {
      const updateData: any = {
        username: form.username,
        email: form.email,
        newsletter: form.newsletter,
      };
      if (form.password) updateData.password = form.password;

      const { data, error } = await api.api.users({ userId: String(user.id) }).put(updateData);

      if (error || !data) throw new Error("Error al guardar");

      const updated = data as any;
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
      const { error } = await api.api.users({ userId: String(user.id) }).delete({ password });

      if (error) {
        // extraemos el mensaje del error tipado de Eden si existe
        const errorMsg = (error.value as any)?.error ?? "Error al eliminar";
        throw new Error(errorMsg);
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

  // Envía POST /api/users/:id/avatar con FormData para subir imagen a Vercel Blob
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    setFeedback(null);

    try {
      // Al pasar un objeto con t.File, el cliente Eden construye automáticamente el FormData
      const { data, error } = await api.api.users({ userId: String(user.id) }).avatar.post({ file });

      if (error || !data) throw new Error("Error al subir el avatar");

      const updated = data as any;
      const newSession: SessionUser = {
        ...user,
        profileImageUrl: updated.profileImageUrl ?? DEFAULT_AVATAR,
      };
      setUser(newSession);
      writeSession(newSession);
      setFeedback({ type: "ok", msg: "Avatar actualizado correctamente" });
    } catch {
      setFeedback({ type: "err", msg: "No se pudo subir el avatar" });
    } finally {
      setUploadingAvatar(false);
    }
  }, [user]);

  // Envía DELETE /api/users/:id/avatar para borrar imagen del Blob
  const handleAvatarDelete = useCallback(async () => {
    if (!user) return;
    setDeletingAvatar(true);
    setFeedback(null);

    try {
      const { data, error } = await api.api.users({ userId: String(user.id) }).avatar.delete();

      if (error || !data) throw new Error("Error al borrar el avatar");

      const updated = data as any;
      const newSession: SessionUser = {
        ...user,
        profileImageUrl: updated.profileImageUrl ?? DEFAULT_AVATAR,
      };
      setUser(newSession);
      writeSession(newSession);
      setFeedback({ type: "ok", msg: "Avatar eliminado correctamente" });
    } catch {
      setFeedback({ type: "err", msg: "No se pudo eliminar el avatar" });
    } finally {
      setDeletingAvatar(false);
    }
  }, [user]);

  return {
    user,
    loadingUser,
    saving,
    deleting,
    feedback,
    uploadingAvatar,
    deletingAvatar,
    handleSave,
    handleDelete,
    handleLogout,
    handleAvatarUpload,
    handleAvatarDelete,
  };
}
