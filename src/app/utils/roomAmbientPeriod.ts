/** Alinhado aos períodos em `RoomImagesPanel`: madrugada, manhã, tarde, noite (hora local). */
export type AmbientPeriodKey = "morning" | "afternoon" | "night" | "dawn";

export function getAmbientPeriodForNow(date = new Date()): AmbientPeriodKey {
  const h = date.getHours();
  if (h >= 0 && h < 6) return "dawn";
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "night";
}
