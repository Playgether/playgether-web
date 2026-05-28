export type RoomPermissionKey =
  | "messages.delete"
  | "messages.pin"
  | "members.kick"
  | "members.mute"
  | "roles.assign"
  | "roles.manage"
  | "room.settings.manage"
  | "room.settings.slug"
  | "room.rules.manage"
  | "room.images.manage"
  | "music.queue.manage"
  | "music.playback.control"
  | "games.create"
  | "games.moderate"
  | "watchparty.create"
  | "watchparty.video.change"
  | "watchparty.close";

export interface RoomRole {
  id: number;
  name: string;
  position: number;
  permissions: RoomPermissionKey[];
  color: string;
  created_at: string;
}

export interface RoomRoleAssignment {
  id: number;
  user_id: number;
  username: string;
  fullname?: string;
  profile_photo?: string | null;
  role: RoomRole;
  assigned_at: string;
}

export interface RoomActiveMute {
  expires_at: string | null;
  remaining_seconds: number | null;
  is_permanent: boolean;
}

export interface RoomActiveBan {
  expires_at: string | null;
  remaining_seconds: number | null;
  is_permanent: boolean;
  message: string;
}

export type RoomKickScope = "room" | "ambience";

export interface RoomPermissionsSnapshot {
  is_owner: boolean;
  max_position: number;
  permissions: RoomPermissionKey[];
  active_mute?: RoomActiveMute | null;
  active_room_ban?: RoomActiveBan | null;
  active_ambience_ban?: RoomActiveBan | null;
  roles: RoomRole[];
  assignments: RoomRoleAssignment[];
}

export interface PermissionCatalogItem {
  key: RoomPermissionKey;
  label: string;
}

export interface PermissionCatalogCategory {
  id: string;
  label: string;
  permissions: PermissionCatalogItem[];
}
