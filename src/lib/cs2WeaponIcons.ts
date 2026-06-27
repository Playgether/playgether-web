const BASE_WEAPONS_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/base_weapons.json";

let cache: Map<string, string> | null = null;
let pending: Promise<Map<string, string>> | null = null;

/** Nomes vindos das stats Steam que diferem do base_weapons.json. */
const WEAPON_NAME_ALIASES: Record<string, string> = {
  "HE Grenade": "High Explosive Grenade",
  "Knife (T)": "Knife",
};

function resolveCs2WeaponDisplayName(weaponName: string): string {
  const trimmed = weaponName.trim();
  return WEAPON_NAME_ALIASES[trimmed] ?? trimmed;
}

export function getCs2WeaponIconsMap(): Promise<Map<string, string>> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(BASE_WEAPONS_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((items: Array<{ name?: string; image?: string }>) => {
        const map = new Map<string, string>();
        for (const item of items) {
          const name = item.name?.trim();
          const image = item.image?.trim();
          if (name && image) map.set(name, image);
        }
        cache = map;
        return map;
      })
      .catch(() => {
        cache = new Map();
        return cache;
      });
  }
  return pending;
}

export function peekCs2WeaponIconUrl(weaponName: string): string | null {
  const key = resolveCs2WeaponDisplayName(weaponName);
  return cache?.get(key) ?? null;
}

export function resolveCs2WeaponIconName(weaponName: string): string {
  return resolveCs2WeaponDisplayName(weaponName);
}
