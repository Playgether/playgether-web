export type CompanyDetails = {
  id: number;
  name: string;
  description: string;
  logo?: string | null;
  banner?: string | null;
  location?: string | null;
};

export type GameDetails = {
  id: number;
  name: string;
  acronym: string;
  description: string;
  icon: string | null;
  image: string | null;
  platform_slug: string | null;
  platform_name: string | null;
  company: CompanyDetails | null;
};

let gamesCache: GameDetails[] | null = null;
let gamesPromise: Promise<GameDetails[]> | null = null;

export async function getGames(): Promise<GameDetails[]> {
  if (gamesCache) return gamesCache;
  if (gamesPromise) return gamesPromise;

  const resp = await fetch("/api/games/list/", { method: "GET" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "Failed to fetch games");
  }

  gamesPromise = (async () => {
    const data = (await resp.json()) as GameDetails[];
    gamesCache = data;
    return data;
  })();

  try {
    return await gamesPromise;
  } finally {
    gamesPromise = null;
  }
}

