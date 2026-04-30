import { useState } from "react";
import type { SyntheticEvent } from "react";

type Tab = "login" | "register";

type Props = {
  onClose: () => void;
  dropdown?: boolean;
};

export default function RegisterForm({ onClose, dropdown = false }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const handleLogin = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: call login API
  };

  const handleRegister = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: call register API
  };

  const card = (
    <div className="relative w-full max-w-sm rounded-2xl bg-parchment border border-bone shadow-2xl dark:bg-obsidian dark:border-night-edge">
        {/* Header */}
        <div className="flex items-center justify-between bg-sand text-ink px-5 py-4 rounded-t-2xl dark:bg-coal dark:text-screen">
          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("login")}
              className={`text-sm font-semibold pb-0.5 transition-colors cursor-pointer ${
                activeTab === "login"
                  ? "text-amethyst border-b-2 border-amethyst dark:text-electric-sky dark:border-electric-sky"
                  : "text-slate hover:text-ink dark:hover:text-screen"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`text-sm font-semibold pb-0.5 transition-colors cursor-pointer ${
                activeTab === "register"
                  ? "text-amethyst border-b-2 border-amethyst dark:text-electric-sky dark:border-electric-sky"
                  : "text-slate hover:text-ink dark:hover:text-screen"
              }`}
            >
              Create account
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate hover:text-amethyst dark:hover:text-electric-sky transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-6">
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="login-email" className="text-xs font-medium text-slate dark:text-mist">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-amethyst focus:outline-none dark:border-night-edge dark:bg-coal dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="login-password" className="text-xs font-medium text-slate dark:text-mist">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-amethyst focus:outline-none dark:border-night-edge dark:bg-coal dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="mt-1 rounded-lg bg-amethyst py-2 text-sm font-semibold text-screen hover:bg-orchid dark:bg-sapphire dark:hover:bg-depth transition-colors cursor-pointer disabled:opacity-40"
              >
                Sign in
              </button>

              <p className="text-center text-xs text-slate dark:text-mist">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-amethyst hover:underline dark:text-electric-sky cursor-pointer"
                >
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="reg-username" className="text-xs font-medium text-slate dark:text-mist">
                  Username
                </label>
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-amethyst focus:outline-none dark:border-night-edge dark:bg-coal dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky"
                  placeholder="johndoe"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="reg-email" className="text-xs font-medium text-slate dark:text-mist">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-amethyst focus:outline-none dark:border-night-edge dark:bg-coal dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="reg-password" className="text-xs font-medium text-slate dark:text-mist">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-amethyst focus:outline-none dark:border-night-edge dark:bg-coal dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="reg-confirm" className="text-xs font-medium text-slate dark:text-mist">
                  Confirm password
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={registerConfirm}
                  onChange={(e) => setRegisterConfirm(e.target.value)}
                  className="rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-amethyst focus:outline-none dark:border-night-edge dark:bg-coal dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="mt-1 rounded-lg bg-amethyst py-2 text-sm font-semibold text-screen hover:bg-orchid dark:bg-sapphire dark:hover:bg-depth transition-colors cursor-pointer disabled:opacity-40"
              >
                Create account
              </button>

              <p className="text-center text-xs text-slate dark:text-mist">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-amethyst hover:underline dark:text-electric-sky cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
    </div>
  );

  if (dropdown) return card;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 dark:bg-abyss/60 backdrop-blur-sm">
      {card}
    </div>
  );
}
