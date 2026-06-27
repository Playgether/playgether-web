/**
 * Duas letras: primeira do primeiro nome + primeira do último sobrenome.
 * Um só nome: duas primeiras letras do nome. Sem nome: fallback no @username.
 */
export function getProfileInitialsFromDisplayName(
  displayName: string,
  usernameFallback?: string,
): string {
  const trimmed = (displayName ?? "").trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0] ?? "";
      const b = parts[parts.length - 1]?.[0] ?? "";
      const pair = (a + b).toUpperCase();
      if (pair.replace(/\s/g, "").length >= 2) return pair.slice(0, 2);
    }
    const one = parts[0] ?? trimmed;
    if (one.length >= 2) return one.slice(0, 2).toUpperCase();
    if (one.length === 1) return (one + one).toUpperCase();
  }
  const u = (usernameFallback ?? "?").trim();
  if (u.length >= 2) return u.slice(0, 2).toUpperCase();
  if (u.length === 1) return (u + u).toUpperCase();
  return "??";
}
