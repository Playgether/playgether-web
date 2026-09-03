import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

/** Nomes vindos das stats Steam que diferem do catálogo de armas. */
const WEAPON_NAME_ALIASES: Record<string, string> = {
  "HE Grenade": "High Explosive Grenade",
  "Knife (T)": "Knife",
};

function resolveCs2WeaponDisplayName(weaponName: string): string {
  const trimmed = weaponName.trim();
  return WEAPON_NAME_ALIASES[trimmed] ?? trimmed;
}

function slugifyWeapon(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveCs2WeaponIconName(weaponName: string): string {
  return resolveCs2WeaponDisplayName(weaponName);
}

export function peekCs2WeaponIconUrl(weaponName: string): string | null {
  const slug = slugifyWeapon(resolveCs2WeaponDisplayName(weaponName));
  if (!slug) return null;
  return getCloudinaryUrl(`games/cs2/guns/${slug}`, 256);
}
