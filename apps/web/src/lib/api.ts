import { treaty } from "@elysiajs/eden";
import type { App } from "@final-degree-project/api";

// Eden Treaty client – points to the running API server.
// In SSR Astro pages, this is called server-side so localhost works fine.
export const api = treaty<App>("localhost:3000");
