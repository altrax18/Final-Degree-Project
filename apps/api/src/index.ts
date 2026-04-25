import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { usersRoutes } from "./routes/users";
import { catalogRoutes } from "./routes/catalog";
import { collectionsRoutes } from "./routes/collections";
import { interactionsRoutes } from "./routes/interactions";
import { recommendationsRoutes } from "./routes/recommendations";
import { chatRoutes } from "./routes/chat";

const app = new Elysia()
  .use(cors())
  .use(usersRoutes)
  .use(catalogRoutes)
  .use(collectionsRoutes)
  .use(interactionsRoutes)
  .use(recommendationsRoutes)
  .use(chatRoutes)
  .listen(3000);
// ─── Constantes de la API de iTunes ─────────────────────────────────────────────────────
const ITUNES_SEARCH = "https://itunes.apple.com/search";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";
const APPLE_RSS_SONGS =
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/24/songs.json";

// Términos de búsqueda rotados en cada página de "cargar más" (página 0 = RSS en tendencia, omitido aquí)
const MORE_TERMS = [
  "pop hits 2024",
  "hip hop hits",
  "indie alternative",
  "r&b soul",
  "rock classics",
  "country hits",
  "electronic dance",
  "latin hits 2024",
  "new music 2025",
  "top 40",
];

// ─── Caché en memoria (solo tendencias, 1 h TTL) ────────────────────────────────
const CACHE_TTL = 60 * 60 * 1000;
let trendingSongsCache: { data: Track[]; ts: number } | null = null;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  cover: string | null;
  previewUrl?: string | null;
  releaseDate?: string;
  duration?: number;
  genre?: string;
}

// ─── Funciones Auxiliares ──────────────────────────────────────────────────────────────────
function getBestArtwork(item: any): string | null {
  const base = item.artworkUrl100 ?? item.artworkUrl60 ?? item.artworkUrl30;
  if (!base) return null;
  return (base as string).replace(/\/\d+x\d+bb/, "/600x600bb");
}

function toTrack(item: any): Track {
  return {
    id: String(item.trackId ?? item.collectionId ?? ""),
    title: item.trackName ?? item.collectionName ?? "Unknown",
    artist: item.artistName ?? "Unknown",
    artistId: item.artistId ? String(item.artistId) : undefined,
    album: item.collectionName,
    albumId: item.collectionId ? String(item.collectionId) : undefined,
    cover: getBestArtwork(item),
    previewUrl: item.previewUrl ?? null,
    releaseDate: item.releaseDate,
    duration: item.trackTimeMillis,
    genre: item.primaryGenreName,
  };
}

// ─── Aplicación ──────────────────────────────────────────────────────────────────────
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
  .use(cors({ origin: "http://localhost:4321" }))
  // ── General ────────────────────────────────────────────────────────────────
  .get("/", () => ({ message: "Alexandria API is running" }))
  .get("/api/trending", () => trendingMock)

  // ── Música: canciones en tendencia (Apple RSS + proxy de iTunes Lookup) ────────────────
  .get("/api/music/trending/songs", async () => {
    // Servir desde la caché si aún está fresca
    if (trendingSongsCache && Date.now() - trendingSongsCache.ts < CACHE_TTL) {
      return { results: trendingSongsCache.data, cached: true };
    }

    try {
      const rssRes = await fetch(APPLE_RSS_SONGS);
      const rssJson = await rssRes.json() as any;
      const ids: string[] = rssJson.feed.results.map((r: any) => r.id);

      if (ids.length === 0) return { results: [] };

      // Buscar cada ID individualmente para obtener previewUrl (búsqueda en lote no lo devuelve)
      const lookups = await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await fetch(`${ITUNES_LOOKUP}?id=${id}&entity=song`);
            const j = await r.json() as any;
            if (j.resultCount > 0) return toTrack(j.results[0]);
            return null;
          } catch {
            return null;
          }
        })
      );

      const results = lookups.filter(Boolean) as Track[];
      trendingSongsCache = { data: results, ts: Date.now() };
      return { results };
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: "Error fetching trending songs", detail: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })

  // ── Música: búsqueda ──────────────────────────────────────────────────────────
  .get(
    "/api/music/search",
    async ({ query }) => {
      const { term, limit = "20" } = query as { term?: string; limit?: string };
      if (!term) {
        return new Response(
          JSON.stringify({ error: 'El parámetro "term" es requerido' }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const url = new URL(ITUNES_SEARCH);
        url.searchParams.set("term", term);
        url.searchParams.set("media", "music");
        url.searchParams.set("entity", "song");
        url.searchParams.set("limit", limit);
        url.searchParams.set("country", "US");

        const res = await fetch(url.toString());
        const json = await res.json() as any;
        const results: Track[] = json.results.map(toTrack);

        return { resultCount: json.resultCount, results };
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "Error searching iTunes", detail: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  )

  // ── Música: pista por ID ────────────────────────────────────────────────────
  .get(
    "/api/music/track/:id",
    async ({ params }) => {
      const { id } = params;
      try {
        const res = await fetch(`${ITUNES_LOOKUP}?id=${id}&entity=song`);
        const json = await res.json() as any;
        if (!json.resultCount || json.resultCount === 0) {
          return new Response(
            JSON.stringify({ error: "Track not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }
        return toTrack(json.results[0]);
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "Error fetching track", detail: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  )

  // ── Música: proxy de letras (lrclib.net) ──────────────────────────────────────
  // Proxy para evitar problemas de CORS al llamar desde el navegador
  .get(
    "/api/music/lyrics",
    async ({ query }) => {
      const { track_name, artist_name, album_name, duration } = query as {
        track_name?: string;
        artist_name?: string;
        album_name?: string;
        duration?: string;
      };

      if (!track_name || !artist_name) {
        return new Response(
          JSON.stringify({ error: "track_name and artist_name are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const params = new URLSearchParams();
        params.set("track_name", track_name);
        params.set("artist_name", artist_name);
        if (album_name) params.set("album_name", album_name);
        if (duration) params.set("duration", duration);

        const res = await fetch(`https://lrclib.net/api/get?${params}`);
        if (!res.ok) {
          return new Response(
            JSON.stringify({ error: "Lyrics not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }
        const data = await res.json();
        return data;
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "Error fetching lyrics", detail: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  )

  // ── Música: cargar más (paginado rotando términos de búsqueda) ────────────────
  .get(
    "/api/music/more",
    async ({ query }) => {
      const page = Math.max(1, parseInt((query as any).page ?? "1", 10));
      const limit = Math.min(50, parseInt((query as any).limit ?? "24", 10));

      // Elegir un término de búsqueda por índice de página (basado en 0, se envuelve)
      const term = MORE_TERMS[(page - 1) % MORE_TERMS.length];

      try {
        const url = new URL(ITUNES_SEARCH);
        url.searchParams.set("term", term);
        url.searchParams.set("media", "music");
        url.searchParams.set("entity", "song");
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("country", "US");

        const res = await fetch(url.toString());
        const json = await res.json() as any;
        const results: Track[] = json.results.map(toTrack);
        return { results, page, term };
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "Error fetching more songs", detail: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  );

if (typeof Bun !== 'undefined' && import.meta.main) {
  app.listen(3000);
  console.log(
    `Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
  );
}

export { app };
export type App = typeof app;
