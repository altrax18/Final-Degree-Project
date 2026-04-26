import { Elysia } from "elysia";
import { browseMovies, getMovieByApiId } from "../services/catalog/movies";
import { browseGames, getGameByApiId } from "../services/catalog/games";
import {
  browseMusic,
  getLyrics,
  getMoreSongs,
  getMusicByApiId,
  getTrackById,
  getTrendingSongs,
  searchMusic,
} from "../services/catalog/music";

export const catalogRoutes = new Elysia()
  // CONCEPTO: Endpoint de Listado de Peliculas
  // QUE HACE: Expone el catalogo de peliculas normalizado en la ruta consumida por frontend.
  // POR QUE LO USO: Mantiene compatibilidad con el cliente Eden actual sin logica extra en UI.
  // DOCUMENTACION: https://elysiajs.com/essential/handler.html
  .get("/api/movies", async ({ query }) =>
    browseMovies(query.q as string | undefined),
  )
  .get("/api/movies/:apiId", async ({ params }) => {
    const movie = await getMovieByApiId(params.apiId);
    if (!movie) return new Response("Not found", { status: 404 });
    return movie;
  })
  // CONCEPTO: Endpoint de Listado de Juegos
  // QUE HACE: Publica juegos normalizados en la ruta usada por el catalogo web.
  // POR QUE LO USO: Separa capa HTTP de la capa de servicios y facilita mantenimiento.
  // DOCUMENTACION: https://elysiajs.com/essential/handler.html
  .get("/api/games", async ({ query }) =>
    browseGames(query.q as string | undefined),
  )
  .get("/api/games/:apiId", async ({ params }) => {
    const game = await getGameByApiId(params.apiId);
    if (!game) return new Response("Not found", { status: 404 });
    return game;
  })
  // Music
  .get("/api/music/trending/songs", async () => getTrendingSongs())
  .get("/api/music/search", async ({ query }) => {
    const { term, limit = "20" } = query as { term?: string; limit?: string };
    return searchMusic(term, limit);
  })
  .get("/api/music/track/:id", async ({ params }) => getTrackById(params.id))
  .get("/api/music/lyrics", async ({ query }) =>
    getLyrics(
      query as {
        track_name?: string;
        artist_name?: string;
        album_name?: string;
        duration?: string;
      },
    ),
  )
  .get("/api/music/more", async ({ query }) =>
    getMoreSongs(query as { page?: string; limit?: string }),
  )
  .get("/music", async ({ query }) =>
    browseMusic(query.q as string | undefined),
  )
  .get("/music/:apiId", async ({ params }) => {
    const track = await getMusicByApiId(params.apiId);
    if (!track) return new Response("Not found", { status: 404 });
    return track;
  });
