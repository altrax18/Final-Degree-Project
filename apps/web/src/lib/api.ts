import { treaty } from "@elysiajs/eden";
import type { App } from "@final-degree-project/api";

const getApiUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (import.meta.env.VERCEL_URL) return `https://${import.meta.env.VERCEL_URL}`;
  return "http://localhost:4321";
};

export const api = treaty<App>(getApiUrl());
