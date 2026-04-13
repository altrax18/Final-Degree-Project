import { treaty } from "@elysiajs/eden";
import type { App } from "@final-degree-project/api";

// Cliente Eden Treaty – apunta al servidor API en ejecución.
// En las páginas SSR de Astro, esto se llama en el servidor, por lo que localhost funciona bien.
export const api = treaty<App>("localhost:3000");
