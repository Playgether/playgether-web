export const VALORANT_DUO_SLUGS = new Set(["val", "valorant", "vava"]);

export function isValorantDuoSlug(slug: string | null | undefined): boolean {
  return VALORANT_DUO_SLUGS.has((slug ?? "").trim().toLowerCase());
}

export function isValorantDuoGame(game: {
  acronym?: string | null;
  name?: string | null;
}): boolean {
  if (isValorantDuoSlug(game.acronym)) return true;
  return (game.name ?? "").toLowerCase().includes("valorant");
}
