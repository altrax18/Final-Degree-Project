import { Elysia, t } from "elysia";

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

const app = new Elysia()
  .get("/", () => ({ message: "Alexandria API is running" }))
  .get("/api/trending", () => trendingMock)
  .listen(3000);

console.log(
  `Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
