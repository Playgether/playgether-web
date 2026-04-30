/**
 * Mesmos assets que games/services/lol_stats_service.py (LOL_LANE_ICON_BY_ROLE_LABEL).
 */
const CDRAGON_PARTIES_LANE_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-parties/global/default";

const BY_API_LABEL: Record<string, string> = {
  TOP: `${CDRAGON_PARTIES_LANE_BASE}/icon-position-top.png`,
  JG: `${CDRAGON_PARTIES_LANE_BASE}/icon-position-jungle.png`,
  MID: `${CDRAGON_PARTIES_LANE_BASE}/icon-position-middle.png`,
  ADC: `${CDRAGON_PARTIES_LANE_BASE}/icon-position-bottom.png`,
  SUP: `${CDRAGON_PARTIES_LANE_BASE}/icon-position-utility.png`,
};

/** Labels do schema duo LoL: Top, Jungle, Mid, ADC, Support */
export function lolLaneIconUrlForDuoRole(roleLabel: string): string | null {
  const key = duoLolRoleToApiLabel(roleLabel.trim());
  if (!key) return null;
  return BY_API_LABEL[key] ?? null;
}

function duoLolRoleToApiLabel(role: string): string | null {
  switch (role) {
    case "Top":
      return "TOP";
    case "Jungle":
      return "JG";
    case "Mid":
      return "MID";
    case "ADC":
      return "ADC";
    case "Support":
      return "SUP";
    default:
      return null;
  }
}
