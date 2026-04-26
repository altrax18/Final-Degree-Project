// TODO: Configure your external games API (e.g. RAWG)
const GAMES_API_BASE_URL = "PLACEHOLDER_GAMES_API_BASE_URL";
const GAMES_API_KEY = "PLACEHOLDER_GAMES_API_KEY";

export async function browseGames(query?: string): Promise<unknown[]> {
  // TODO: Replace with real API call, e.g.:
  // const url = query
  //   ? `${GAMES_API_BASE_URL}/games?search=${encodeURIComponent(query)}&key=${GAMES_API_KEY}`
  //   : `${GAMES_API_BASE_URL}/games?key=${GAMES_API_KEY}`;
  // const res = await fetch(url);
  // const data = await res.json();
  // return data.results;
  void GAMES_API_BASE_URL;
  void GAMES_API_KEY;
  throw new Error("Games API not configured. Set GAMES_API_BASE_URL and GAMES_API_KEY.");
}

export async function getGameByApiId(apiId: string): Promise<unknown> {
  // TODO: Replace with real API call, e.g.:
  // const res = await fetch(`${GAMES_API_BASE_URL}/games/${apiId}?key=${GAMES_API_KEY}`);
  // return res.json();
  void apiId;
  throw new Error("Games API not configured. Set GAMES_API_BASE_URL and GAMES_API_KEY.");
}
