import { Elysia, t } from "elysia";
import cors from "@elysiajs/cors";

const trendingMock = [
  {
    id: "1",
    title: "Dune: Part Two",
    type: "movie" as const,
    image: "https://placehold.co/300x450/1a1a2e/e94560?text=Dune+2",
  },
  {
    id: "2",
    title: "Elden Ring",
    type: "game" as const,
    image: "https://placehold.co/300x450/16213e/0f3460?text=Elden+Ring",
  },
  {
    id: "3",
    title: "Shogun",
    type: "series" as const,
    image: "https://placehold.co/300x450/0f3460/533483?text=Shogun",
  },
];
// Función para obtener el Token de Twitch automáticamente
async function getTwitchToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );
  const data: any = await res.json();
  return data.access_token;
}

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ message: "Alexandria API is running" }))
  .get("/api/trending", () => trendingMock)
  .get(
    "/api/games",
    async () => {
      // 1. Petición a IGDB con Token automático
      const token = await getTwitchToken();
      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
        // https://api-docs.igdb.com/#fields
        body: "fields name, cover.url, summary, total_rating, first_release_date; where cover != null & total_rating != null; sort total_rating desc; limit 20;",
      });

      const rawGames = await response.json();
      // 2. Limpiamos los datos
      return rawGames.map((game: any) => ({
        id: game.id.toString(),
        title: game.name,
        type: "game" as const,
        image: game.cover
          ? `https:${game.cover.url.replace("t_thumb", "t_720p")}`
          : null,
        rating: Math.round(game.total_rating || 0),
        firstReleaseDate: game.first_release_date || null,
      }));
    },
    {
      // 2. ESQUEMA DE RESPUESTA
      response: t.Array(
        t.Object({
          id: t.String(),
          title: t.String(),
          type: t.Literal("game"),
          image: t.Nullable(t.String()),
          rating: t.Number(),
          firstReleaseDate: t.Nullable(t.Number()),
        }),
      ),
    },
  )
  .listen(3000);

console.log(
  `Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
export type App = typeof app;
