import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

const BY_API_LABEL: Record<string, string> = {
  TOP: "top",
  JG: "jungle",
  MID: "mid",
  ADC: "adc",
  SUP: "support",
};

/** Labels do schema duo LoL: Top, Jungle, Mid, ADC, Support */
export function lolLaneIconUrlForDuoRole(roleLabel: string): string | null {
  const key = duoLolRoleToApiLabel(roleLabel.trim());
  if (!key) return null;
  const slug = BY_API_LABEL[key];
  if (!slug) return null;
  return getCloudinaryUrl(`games/lol/lanes/${slug}`, 128);
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
