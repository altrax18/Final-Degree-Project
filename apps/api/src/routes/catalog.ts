import { Elysia } from "elysia";
import {
  browseMovies,
  getMovieByApiId,
  getTrendingMovies,
} from "../services/catalog/movies";
import {
  browseGames,
  getGameByApiId,
  getTrendingGames,
} from "../services/catalog/games";
import {
  browseMusic,
  getLyrics,
  getMoreSongs,
  getMusicByApiId,
  getTrackById,
  getTrendingSongs,
  searchMusic,
  searchAlbums,
  getAlbumWithTracks,
} from "../services/catalog/music";
import { performQuickSearch } from "../services/catalog/quick-search/read";

export const catalogRoutes = new Elysia()
  .get("/api/catalog/quick-search", async ({ query, set }) => {
    const { category, q } = query as { category?: string; q?: string };

    if (!category || !q) {
      set.status = 400;
      return { error: "Parameters 'category' and 'q' are required." };
    }

    if (!["music", "movies", "games"].includes(category)) {
      set.status = 400;
      return { error: "Invalid category." };
    }

    return performQuickSearch(category as "music" | "movies" | "games", q);
  })
  // CONCEPTO: Exposición de Tendencias de Cine
  // QUE HACE: Crea un endpoint publico para entregar las peliculas populares.
  // POR QUE LO USO: Mantiene separada la logica de peticion a TMDB de la interfaz web.
  // DOCUMENTACION: https://elysiajs.com/essential/route.html
  .get("/api/movies/trending", async () => getTrendingMovies())
  // CONCEPTO: Endpoint de Listado de Peliculas
  // QUE HACE: Expone el catalogo de peliculas normalizado en la ruta consumida por frontend.
  // POR QUE LO USO: Mantiene compatibilidad con el cliente Eden actual sin logica extra en UI.
  // DOCUMENTACION: https://elysiajs.com/essential/handler.html
  .get("/api/movies", async ({ query }) =>
    browseMovies({
      q: query.q || undefined,
      page: query.page || undefined,
      limit: query.limit || undefined,
      genres: query.genres || undefined,
    }),
  )
  .get("/api/movies/:apiId", async ({ params }) => {
    const movie = await getMovieByApiId(params.apiId);
    if (!movie) return new Response("Not found", { status: 404 });
    return movie;
  })
  // CONCEPTO: Exposición de Tendencias de Juegos
  // QUE HACE: Crea un endpoint publico para entregar los juegos populares.
  // POR QUE LO USO: Protege los tokens de Twitch/IGDB en el backend y solo envia la data lista.
  // DOCUMENTACION: https://elysiajs.com/essential/route.html
  .get("/api/games/trending", async () => getTrendingGames())
  // CONCEPTO: Endpoint de Listado de Juegos
  // QUE HACE: Publica juegos normalizados en la ruta usada por el catalogo web.
  // POR QUE LO USO: Separa capa HTTP de la capa de servicios y facilita mantenimiento.
  // DOCUMENTACION: https://elysiajs.com/essential/handler.html
  .get("/api/games", async ({ query }) =>
    browseGames({
      q: query.q || undefined,
      page: query.page || undefined,
      limit: query.limit || undefined,
      genres: query.genres || undefined,
      genre: query.genre || undefined,
    }),
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
  // Album endpoints
  .get("/api/music/search/albums", async ({ query }) => {
    const { term, limit = "12" } = query as { term?: string; limit?: string };
    return searchAlbums(term, limit);
  })
  .get("/api/music/album/:id", async ({ params }) =>
    getAlbumWithTracks(params.id),
  )
  .get("/api/music", async ({ query }) =>
    browseMusic({
      q: query.q || undefined,
      page: query.page || undefined,
      limit: query.limit || undefined,
      genres: query.genres || undefined,
    }),
  )
  .get("/music", async ({ query }) =>
    browseMusic({
      q: query.q || undefined,
      page: query.page || undefined,
      limit: query.limit || undefined,
      genres: query.genres || undefined,
    }),
  )
  .get("/music/:apiId", async ({ params }) => {
    const track = await getMusicByApiId(params.apiId);
    if (!track) return new Response("Not found", { status: 404 });
    return track;
  });
