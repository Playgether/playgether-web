import type { RoomPermissionsSnapshot } from "@/types/RoomPermissions";

export function getRoomMemberRoleLabels(
  userId: string | number | null | undefined,
  roomOwnerId: string | number | null | undefined,
  snapshot: RoomPermissionsSnapshot | null | undefined,
): string[] {
  if (userId == null) return [];

  const normalizedId = String(userId);
  const labels: string[] = [];

  if (roomOwnerId != null && normalizedId === String(roomOwnerId)) {
    labels.push("Dono");
  }

  const assignments =
    snapshot?.assignments.filter((a) => String(a.user_id) === normalizedId) ??
    [];
  const roleIds = new Set(assignments.map((a) => a.role.id));
  const roles =
    snapshot?.roles
      .filter((r) => roleIds.has(r.id))
      .sort((a, b) => b.position - a.position) ?? [];

  for (const role of roles) {
    if (!labels.includes(role.name)) {
      labels.push(role.name);
    }
  }

  return labels;
}
