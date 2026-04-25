import { treaty } from "@elysiajs/eden";
import type { App } from "@final-degree-project/api";

const getApiUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  
  // Vercel serverless (Node.js engine)
  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return "http://localhost:4321";
};

export const api = treaty<App>(getApiUrl());
