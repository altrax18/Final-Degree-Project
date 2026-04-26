// TODO: Configure your external movies API (e.g. TMDB)
const MOVIES_API_BASE_URL = "PLACEHOLDER_MOVIES_API_BASE_URL";
const MOVIES_API_KEY = "PLACEHOLDER_MOVIES_API_KEY";

export async function browseMovies(query?: string): Promise<unknown[]> {
  // TODO: Replace with real API call, e.g.:
  // const url = query
  //   ? `${MOVIES_API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${MOVIES_API_KEY}`
  //   : `${MOVIES_API_BASE_URL}/movie/popular?api_key=${MOVIES_API_KEY}`;
  // const res = await fetch(url);
  // const data = await res.json();
  // return data.results;
  void MOVIES_API_BASE_URL;
  void MOVIES_API_KEY;
  throw new Error("Movies API not configured. Set MOVIES_API_BASE_URL and MOVIES_API_KEY.");
}

export async function getMovieByApiId(apiId: string): Promise<unknown> {
  // TODO: Replace with real API call, e.g.:
  // const res = await fetch(`${MOVIES_API_BASE_URL}/movie/${apiId}?api_key=${MOVIES_API_KEY}`);
  // return res.json();
  void apiId;
  throw new Error("Movies API not configured. Set MOVIES_API_BASE_URL and MOVIES_API_KEY.");
}
