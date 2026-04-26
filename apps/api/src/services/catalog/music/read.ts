// TODO: Configure your external music API (e.g. Spotify or MusicBrainz)
const MUSIC_API_BASE_URL = "PLACEHOLDER_MUSIC_API_BASE_URL";
const MUSIC_API_KEY = "PLACEHOLDER_MUSIC_API_KEY";

export async function browseMusic(query?: string): Promise<unknown[]> {
  // TODO: Replace with real API call, e.g.:
  // const url = query
  //   ? `${MUSIC_API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&access_token=${MUSIC_API_KEY}`
  //   : `${MUSIC_API_BASE_URL}/browse/featured-playlists?access_token=${MUSIC_API_KEY}`;
  // const res = await fetch(url);
  // const data = await res.json();
  // return data.tracks?.items ?? data.playlists?.items ?? [];
  void MUSIC_API_BASE_URL;
  void MUSIC_API_KEY;
  throw new Error("Music API not configured. Set MUSIC_API_BASE_URL and MUSIC_API_KEY.");
}

export async function getMusicByApiId(apiId: string): Promise<unknown> {
  // TODO: Replace with real API call, e.g.:
  // const res = await fetch(`${MUSIC_API_BASE_URL}/tracks/${apiId}`, {
  //   headers: { Authorization: `Bearer ${MUSIC_API_KEY}` },
  // });
  // return res.json();
  void apiId;
  throw new Error("Music API not configured. Set MUSIC_API_BASE_URL and MUSIC_API_KEY.");
}
