import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

const BY_DUO_LABEL: Record<string, string> = {
  Duelista: "duelista",
  Iniciador: "iniciador",
  Controlador: "controlador",
  Sentinela: "sentinela",
};

export function valorantRoleIconUrlForDuoRole(roleLabel: string): string | null {
  const slug = BY_DUO_LABEL[roleLabel.trim()];
  if (!slug) return null;
  return getCloudinaryUrl(`games/val/roles/${slug}`, 128);
}
