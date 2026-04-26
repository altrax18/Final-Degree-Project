const ITUNES_SEARCH = "https://itunes.apple.com/search";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";
const APPLE_RSS_SONGS =
  "https://rss.applemarketingtools.com/api/v2/us/music/most-played/24/songs.json";

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

const CACHE_TTL = 60 * 60 * 1000;

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

let trendingSongsCache: { data: Track[]; ts: number } | null = null;

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

export async function getTrendingSongs() {
  if (trendingSongsCache && Date.now() - trendingSongsCache.ts < CACHE_TTL) {
    return { results: trendingSongsCache.data, cached: true };
  }

  try {
    const rssRes = await fetch(APPLE_RSS_SONGS);
    const rssJson = (await rssRes.json()) as any;
    const ids: string[] = rssJson.feed.results.map((result: any) => result.id);

    if (ids.length === 0) return { results: [] };

    const lookups = await Promise.all(
      ids.map(async (id) => {
        try {
          const response = await fetch(`${ITUNES_LOOKUP}?id=${id}&entity=song`);
          const json = (await response.json()) as any;
          if (json.resultCount > 0) return toTrack(json.results[0]);
          return null;
        } catch {
          return null;
        }
      }),
    );

    const results = lookups.filter(Boolean) as Track[];
    trendingSongsCache = { data: results, ts: Date.now() };
    return { results };
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Error fetching trending songs",
        detail: err.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function searchMusic(term?: string, limit = "20") {
  if (!term) {
    return new Response(
      JSON.stringify({ error: 'El parámetro "term" es requerido' }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const url = new URL(ITUNES_SEARCH);
    url.searchParams.set("term", term);
    url.searchParams.set("media", "music");
    url.searchParams.set("entity", "song");
    url.searchParams.set("limit", limit);
    url.searchParams.set("country", "US");

    const response = await fetch(url.toString());
    const json = (await response.json()) as any;
    const results: Track[] = json.results.map(toTrack);

    return { resultCount: json.resultCount, results };
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Error searching iTunes",
        detail: err.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function getMusicByApiId(apiId: string): Promise<unknown> {
  try {
    const response = await fetch(`${ITUNES_LOOKUP}?id=${apiId}&entity=song`);
    const json = (await response.json()) as any;
    if (!json.resultCount || json.resultCount === 0) {
      return null;
    }

    return toTrack(json.results[0]);
  } catch {
    return null;
  }
}

export async function getTrackById(id: string) {
  try {
    const response = await fetch(`${ITUNES_LOOKUP}?id=${id}&entity=song`);
    const json = (await response.json()) as any;
    if (!json.resultCount || json.resultCount === 0) {
      return new Response(JSON.stringify({ error: "Track not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return toTrack(json.results[0]);
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Error fetching track", detail: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function getLyrics(query: {
  track_name?: string;
  artist_name?: string;
  album_name?: string;
  duration?: string;
}) {
  const { track_name, artist_name, album_name, duration } = query;

  if (!track_name || !artist_name) {
    return new Response(
      JSON.stringify({ error: "track_name and artist_name are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const params = new URLSearchParams();
    params.set("track_name", track_name);
    params.set("artist_name", artist_name);
    if (album_name) params.set("album_name", album_name);
    if (duration) params.set("duration", duration);

    const response = await fetch(`https://lrclib.net/api/get?${params}`);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Lyrics not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return await response.json();
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Error fetching lyrics", detail: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function getMoreSongs(query: { page?: string; limit?: string }) {
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const limit = Math.min(50, parseInt(query.limit ?? "24", 10));
  const term = MORE_TERMS[(page - 1) % MORE_TERMS.length];

  try {
    const url = new URL(ITUNES_SEARCH);
    url.searchParams.set("term", term);
    url.searchParams.set("media", "music");
    url.searchParams.set("entity", "song");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("country", "US");

    const response = await fetch(url.toString());
    const json = (await response.json()) as any;
    const results: Track[] = json.results.map(toTrack);
    return { results, page, term };
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Error fetching more songs",
        detail: err.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function browseMusic(query?: string): Promise<unknown[]> {
  const result = await searchMusic(query ?? "top", "24");
  if (result instanceof Response) {
    return [];
  }

  return result.results;
}
