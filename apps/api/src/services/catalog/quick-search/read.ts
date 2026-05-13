import { searchMusic, searchAlbums } from "../music";
import { browseMovies } from "../movies";
import { browseGames } from "../games";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  image: string | null;
  isAlbum?: boolean;
  trackCount?: number;
}

type Category = "music" | "movies" | "games";

export async function performQuickSearch(
  category: Category,
  term: string
): Promise<SearchResult[]> {
  const cleanTerm = term.trim();
  if (!cleanTerm || cleanTerm.length < 2) return [];

  if (category === "music") {
    // Lanza busqueda de canciones y albumes concurrentemente 
    const [songsResponse, albumsResponse] = await Promise.all([
      searchMusic(cleanTerm, "9"),
      searchAlbums(cleanTerm, "6")
    ]);

    // Parsear resultados considerando que las funciones pueden devolver Response o datos planos
    const songsData = songsResponse instanceof Response ? await songsResponse.json() : songsResponse;
    const albumsData = albumsResponse instanceof Response ? await albumsResponse.json() : albumsResponse;

    const songsRaw = songsData.results ?? [];
    const albumsRaw = albumsData.results ?? [];

    const songsMapped: SearchResult[] = songsRaw.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      subtitle: r.artist,
      image: r.cover,
      isAlbum: false
    }));

    const albumsMapped: SearchResult[] = albumsRaw.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      subtitle: r.artist,
      image: r.cover,
      isAlbum: true,
      trackCount: r.trackCount
    }));

    // Lógica de mezclado y ordenado 
    const mixed = [...songsMapped, ...albumsMapped];
    const lowerTerm = cleanTerm.toLowerCase();

    mixed.sort((a, b) => {
      const tA = a.title.toLowerCase();
      const tB = b.title.toLowerCase();
      if (tA === lowerTerm && tB !== lowerTerm) return -1;
      if (tB === lowerTerm && tA !== lowerTerm) return 1;
      if (tA.startsWith(lowerTerm) && !tB.startsWith(lowerTerm)) return -1;
      if (tB.startsWith(lowerTerm) && !tA.startsWith(lowerTerm)) return 1;
      return 0;
    });

    return mixed.slice(0, 12);
  }

  if (category === "movies") {
    const response = await browseMovies({ q: cleanTerm, limit: "12" });
    // En browseMovies la respuesta tipada tiene una propiedad .items
    const rawItems = Array.isArray(response) ? response : (response as any).items ?? [];

    return rawItems.map((r: any): SearchResult => {
      const year = r.firstReleaseDate
        ? new Date(r.firstReleaseDate).getFullYear().toString()
        : undefined;
      return {
        id: String(r.id),
        title: r.title,
        subtitle: year,
        image: r.image
      };
    });
  }

  if (category === "games") {
    const response = await browseGames({ q: cleanTerm, limit: "12" });
    const rawItems = Array.isArray(response) ? response : (response as any).items ?? [];

    return rawItems.map((r: any): SearchResult => {
      const genre = r.genres && r.genres.length > 0 ? r.genres[0] : undefined;
      return {
        id: String(r.id),
        title: r.title,
        subtitle: genre,
        image: r.image
      };
    });
  }

  return [];
}
