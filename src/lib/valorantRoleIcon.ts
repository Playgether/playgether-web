/**
 * Role icons from valorant-api.com (stable UUIDs).
 * Labels match duo schema: Duelista, Iniciador, Controlador, Sentinela.
 */
const VALORANT_API_ROLE_BASE = "https://media.valorant-api.com/agents/roles";

const BY_DUO_LABEL: Record<string, string> = {
  Duelista: `${VALORANT_API_ROLE_BASE}/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png`,
  Iniciador: `${VALORANT_API_ROLE_BASE}/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png`,
  Controlador: `${VALORANT_API_ROLE_BASE}/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png`,
  Sentinela: `${VALORANT_API_ROLE_BASE}/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png`,
};

export function valorantRoleIconUrlForDuoRole(roleLabel: string): string | null {
  return BY_DUO_LABEL[roleLabel.trim()] ?? null;
}
