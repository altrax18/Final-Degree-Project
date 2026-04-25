import { Elysia } from "elysia";
import { browseMovies, getMovieByApiId } from "../services/catalog/movies";
import { browseGames, getGameByApiId } from "../services/catalog/games";
import { browseMusic, getMusicByApiId } from "../services/catalog/music";

export const catalogRoutes = new Elysia()
  // Movies
  .get("/movies", async ({ query }) => browseMovies(query.q as string | undefined))
  .get("/movies/:apiId", async ({ params }) => {
    const movie = await getMovieByApiId(params.apiId);
    if (!movie) return new Response("Not found", { status: 404 });
    return movie;
  })
  // Games
  .get("/games", async ({ query }) => browseGames(query.q as string | undefined))
  .get("/games/:apiId", async ({ params }) => {
    const game = await getGameByApiId(params.apiId);
    if (!game) return new Response("Not found", { status: 404 });
    return game;
  })
  // Music
  .get("/music", async ({ query }) => browseMusic(query.q as string | undefined))
  .get("/music/:apiId", async ({ params }) => {
    const track = await getMusicByApiId(params.apiId);
    if (!track) return new Response("Not found", { status: 404 });
    return track;
  });
