import { treaty } from "@elysiajs/eden";
import type { App } from "@final-degree-project/api";
// Eden Treaty client – points to the running API server.
// In SSR Astro pages, this is called server-side so localhost works fine.

// 1. Creamos el cliente de Eden.
// 'treaty' usa el tipo 'App' de tu backend para darte autocompletado.
export const api = treaty<App>("localhost:3000");

// Definimos la interfaz que devuelve Elysia
export interface Game {
  id: string;
  title: string;
  type: "game";
  image: string | null;
  rating: number;
  firstReleaseDate: number | null;
}

export async function getGames(): Promise<Game[]> {
  const { data, error } = await api.api.games.get();

  if (error || !data) {
    throw new Error("No se pudieron cargar los juegos");
  }

  // "cast" para que Astro sepa que esto es una lista de juegos
  return data as unknown as Game[];
}
