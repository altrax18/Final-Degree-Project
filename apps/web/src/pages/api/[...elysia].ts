import type { APIRoute } from "astro";
import { app } from "@final-degree-project/api";

const handle = ({ request }: { request: Request }) => app.handle(request);

export const GET: APIRoute = handle;
export const POST: APIRoute = handle;
export const PUT: APIRoute = handle;
export const PATCH: APIRoute = handle;
export const DELETE: APIRoute = handle;
export const OPTIONS: APIRoute = handle;
export const ALL: APIRoute = handle;
