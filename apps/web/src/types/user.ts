// Tipo del usuario en sesión y helpers de localStorage.
export type SessionUser = {
  id: number;
  username: string;
  email: string;
  profileImageUrl: string;
  newsletter: boolean;
};

export const DEFAULT_AVATAR = "https://avatar.vercel.sh/default";
export const SESSION_KEY = "alex_user";

// Lee, escribe y borra el usuario en localStorage.
export function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
