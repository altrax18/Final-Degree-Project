import type { APIRoute } from "astro";
import { app } from "@final-degree-project/api";

// Astro mounts this file at /api/*, so the incoming URL contains the /api prefix.
// Elysia routes are registered without that prefix, so we strip it before forwarding.
const handle = ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/^\/api/, "") || "/";
  return app.handle(new Request(url.toString(), request));
};

export const GET: APIRoute = handle;
export const POST: APIRoute = handle;
export const PUT: APIRoute = handle;
export const PATCH: APIRoute = handle;
export const DELETE: APIRoute = handle;
export const OPTIONS: APIRoute = handle;
export const ALL: APIRoute = handle;
