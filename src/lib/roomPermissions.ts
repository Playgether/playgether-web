import type { RoomPermissionKey, RoomPermissionsSnapshot } from "@/types/RoomPermissions";

export const ROOM_PERMISSION_KEYS: RoomPermissionKey[] = [
  "messages.delete",
  "messages.pin",
  "members.kick",
  "members.mute",
  "roles.assign",
  "roles.manage",
  "room.settings.manage",
  "room.settings.slug",
  "room.rules.manage",
  "room.images.manage",
  "music.queue.manage",
  "music.playback.control",
  "games.create",
  "games.moderate",
  "watchparty.create",
  "watchparty.video.change",
  "watchparty.close",
];

export function hasRoomPermission(
  snapshot: RoomPermissionsSnapshot | null | undefined,
  key: RoomPermissionKey,
): boolean {
  if (!snapshot) return false;
  if (snapshot.is_owner) return true;
  if (snapshot.permissions.includes(key)) return true;
  if (
    key === "music.playback.control" &&
    snapshot.permissions.includes("music.queue.manage")
  ) {
    return true;
  }
  return false;
}

export function canManageRoomMusic(
  snapshot: RoomPermissionsSnapshot | null | undefined,
): boolean {
  return (
    hasRoomPermission(snapshot, "music.queue.manage") ||
    hasRoomPermission(snapshot, "music.playback.control")
  );
}

/** Permissões exibidas no editor de cargos (oculta legado / duplicadas). */
export function isAssignablePermissionKey(key: RoomPermissionKey): boolean {
  return key !== "music.playback.control" && key !== "games.moderate";
}

export function normalizeRolePermissionsForSave(
  keys: RoomPermissionKey[],
): RoomPermissionKey[] {
  const set = new Set(keys.filter(isAssignablePermissionKey));
  if (set.has("music.queue.manage")) {
    set.delete("music.playback.control");
  }
  return [...set];
}

export function normalizeRolePermissionsForEdit(
  keys: RoomPermissionKey[],
): RoomPermissionKey[] {
  const set = new Set(keys.filter(isAssignablePermissionKey));
  if (keys.includes("music.playback.control") && !set.has("music.queue.manage")) {
    set.add("music.queue.manage");
  }
  return [...set];
}

/** Ordem visual: topo da lista = mais autoridade. */
export function sortRolesByHierarchy<T extends { position: number; name: string }>(
  roles: T[],
): T[] {
  return [...roles].sort((a, b) => b.position - a.position || a.name.localeCompare(b.name));
}

export function canManageRoomSettings(
  snapshot: RoomPermissionsSnapshot | null | undefined,
): boolean {
  return (
    hasRoomPermission(snapshot, "room.settings.manage") ||
    hasRoomPermission(snapshot, "room.settings.slug")
  );
}

export function getMemberMaxPosition(
  snapshot: RoomPermissionsSnapshot | null | undefined,
  userId: number,
): number {
  if (!snapshot) return 0;
  let max = 0;
  for (const a of snapshot.assignments) {
    if (a.user_id === userId) {
      max = Math.max(max, a.role.position);
    }
  }
  return max;
}

/** Pode moderar o alvo (hierarquia; dono da sala não pode ser alvo). */
export function canModerateMember(
  snapshot: RoomPermissionsSnapshot | null | undefined,
  roomOwnerId: number,
  actorId: number | null,
  targetId: number | null | undefined,
): boolean {
  if (!snapshot || actorId == null || targetId == null || actorId === targetId) {
    return false;
  }
  if (targetId === roomOwnerId) return false;
  if (snapshot.is_owner) return true;
  return snapshot.max_position > getMemberMaxPosition(snapshot, targetId);
}
