import { Elysia, t } from "elysia";

const app = new Elysia()
  .get(
    "/api/games",
    async () => {
      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
        // https://api-docs.igdb.com/#fields
        body: "fields name, cover.url, summary, total_rating, first_release_date; where cover != null & total_rating != null; sort total_rating desc; limit 20;",
      });

      const rawGames = await response.json();
      return rawGames.map((game: any) => ({
        id: game.id.toString(),
        title: game.name,
        type: "game" as const,
        image: game.cover
          ? `https:${game.cover.url.replace("t_thumb", "t_720p")}`
          : null,
        rating: game.total_rating || 0,
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

export type App = typeof app; // Crucial para Eden Treaty
