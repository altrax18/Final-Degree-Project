import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    html.classList.add("theme-transitioning");
    const next = !isDark;
    setIsDark(next);
    html.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.setTimeout(() => html.classList.remove("theme-transitioning"), 300);
  };

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-night-edge bg-coal text-mist hover:text-screen transition-colors cursor-pointer"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Icon icon="tabler:sun" width={20} height={20} aria-hidden="true" />
      ) : (
        <Icon icon="tabler:moon" width={20} height={20} aria-hidden="true" />
      )}
    </button>
  );
}
