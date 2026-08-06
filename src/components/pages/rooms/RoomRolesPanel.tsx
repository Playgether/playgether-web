"use client";

import {
  assignRoomRole,
  createRoomRole,
  deleteRoomRole,
  fetchPermissionsCatalog,
  reorderRoomRoles,
  unassignRoomRole,
  updateRoomRole,
} from "@/actions/roomRolesActions";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { cn } from "@/lib/utils";
import {
  isAssignablePermissionKey,
  normalizeRolePermissionsForEdit,
  normalizeRolePermissionsForSave,
  sortRolesByHierarchy,
} from "@/lib/roomPermissions";
import { ChatRoom } from "@/types/ChatRoom";
import type {
  PermissionCatalogCategory,
  RoomPermissionKey,
  RoomRole,
} from "@/types/RoomPermissions";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Crown,
  GripVertical,
  Plus,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

interface RoomRolesPanelProps {
  room: ChatRoom;
}

type RoleModalMode = { type: "create" } | { type: "edit"; role: RoomRole };

export function RoomRolesPanel({ room }: RoomRolesPanelProps) {
  const { onlineUsers } = useChatHandlerContext();
  const { snapshot, can, refresh, setSnapshot } = useRoomPermissions();
  const [catalog, setCatalog] = useState<PermissionCatalogCategory[]>([]);
  const [roleModal, setRoleModal] = useState<RoleModalMode | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalPerms, setModalPerms] = useState<RoomPermissionKey[]>([]);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoomRole | null>(null);
  const [isPending, startTransition] = useTransition();

  const canManageRoles = can("roles.manage");
  const canAssignRoles = can("roles.assign");

  useEffect(() => {
    void fetchPermissionsCatalog().then((res) => {
      if (res.ok) setCatalog(res.categories);
    });
  }, []);

  const sortedRoles = useMemo(
    () => sortRolesByHierarchy(snapshot?.roles ?? []),
    [snapshot?.roles],
  );

  const assignments = snapshot?.assignments ?? [];

  const assignableUsers = useMemo(() => {
    type AssignableUser = {
      id: string | number;
      username: string;
      fullname: string;
      profile_photo: string;
      isOnline: boolean;
    };
    const map = new Map<string | number, AssignableUser>();
    for (const u of onlineUsers) {
      if (u.id === room.owner) continue;
      map.set(u.id, {
        id: u.id,
        username: u.username,
        fullname: u.fullname,
        profile_photo: u.profile_photo,
        isOnline: true,
      });
    }
    for (const a of assignments) {
      if (a.user_id === room.owner || map.has(a.user_id)) continue;
      map.set(a.user_id, {
        id: a.user_id,
        username: a.username,
        fullname: a.fullname?.trim() || a.username,
        profile_photo: a.profile_photo ?? "",
        isOnline: false,
      });
    }
    return [...map.values()].sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      return a.fullname.localeCompare(b.fullname, "pt-BR");
    });
  }, [onlineUsers, assignments, room.owner]);

  const assignmentsByUser = useMemo(() => {
    const map = new Map<string | number, number[]>();
    for (const a of assignments) {
      const list = map.get(a.user_id) ?? [];
      list.push(a.role.id);
      map.set(a.user_id, list);
    }
    return map;
  }, [assignments]);

  const canReorderInHierarchy = canManageRoles;

  const canMoveRole = (role: RoomRole) => {
    if (!canReorderInHierarchy) return false;
    if (snapshot?.is_owner) return true;
    const actorPos = snapshot?.max_position ?? 0;
    return role.position < actorPos;
  };

  const openCreateModal = () => {
    setRoleModal({ type: "create" });
    setModalName("");
    setModalPerms([]);
  };

  const openEditModal = (role: RoomRole) => {
    setRoleModal({ type: "edit", role });
    setModalName(role.name);
    setModalPerms(normalizeRolePermissionsForEdit(role.permissions));
  };

  const closeRoleModal = () => {
    if (!isPending) setRoleModal(null);
  };

  const toggleModalPerm = (key: RoomPermissionKey) => {
    setModalPerms((list) =>
      list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
    );
  };

  const applyRolesOrder = (ordered: RoomRole[]) => {
    if (!snapshot) return;
    setSnapshot({ ...snapshot, roles: ordered });
  };

  const persistOrder = (ordered: RoomRole[]) => {
    const order = ordered.map((r) => r.id);
    setError(null);
    startTransition(async () => {
      const res = await reorderRoomRoles(room.slug, order);
      if (!res.ok) {
        setError(res.error);
        await refresh();
        return;
      }
      applyRolesOrder(res.data);
    });
  };

  const moveRole = (index: number, direction: "up" | "down") => {
    const list = [...sortedRoles];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= list.length) return;
    const role = list[index];
    const other = list[swapWith];
    if (!role || !other || !canMoveRole(role)) return;
    if (!snapshot?.is_owner && !canMoveRole(other)) return;
    [list[index], list[swapWith]] = [list[swapWith], list[index]];
    applyRolesOrder(list);
    persistOrder(list);
  };

  const reorderByDrag = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const list = [...sortedRoles];
    const role = list[fromIndex];
    const target = list[toIndex];
    if (!role || !target || !canMoveRole(role)) return;
    if (!snapshot?.is_owner && !canMoveRole(target)) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    applyRolesOrder(list);
    persistOrder(list);
  };

  const saveRoleModal = () => {
    const name = modalName.trim();
    if (!name || !canManageRoles || !roleModal) return;
    const permissions = normalizeRolePermissionsForSave(modalPerms);
    setError(null);
    startTransition(async () => {
      if (roleModal.type === "create") {
        const res = await createRoomRole(room.slug, { name, permissions });
        if (!res.ok) {
          setError(res.error);
          return;
        }
      } else {
        const res = await updateRoomRole(room.slug, roleModal.role.id, {
          name,
          permissions,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
      }
      setRoleModal(null);
      await refresh();
    });
  };

  const confirmDeleteRole = () => {
    if (!canManageRoles || !roleToDelete) return;
    const roleId = roleToDelete.id;
    setError(null);
    startTransition(async () => {
      const res = await deleteRoomRole(room.slug, roleId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRoleToDelete(null);
      if (assignRoleId === roleId) setAssignRoleId(null);
      await refresh();
    });
  };

  const toggleUserRole = (userId: string, roleId: number, hasRole: boolean) => {
    if (!canAssignRoles) return;
    setError(null);
    startTransition(async () => {
      const res = hasRole
        ? await unassignRoomRole(room.slug, roleId, userId)
        : await assignRoomRole(room.slug, roleId, userId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await refresh();
    });
  };

  const assignRole = sortedRoles.find((r) => r.id === assignRoleId) ?? null;

  const permissionLabels = useMemo(() => {
    const map = new Map<RoomPermissionKey, string>();
    for (const cat of catalog) {
      for (const p of cat.permissions) {
        if (isAssignablePermissionKey(p.key)) {
          map.set(p.key, p.label);
        }
      }
    }
    return map;
  }, [catalog]);

  if (!canManageRoles && !canAssignRoles) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Você não tem permissão para gerenciar cargos nesta sala.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Shield className="h-5 w-5 text-neon-emerald" />
            Cargos — {room.group_name}
          </h2>
          <p className="mt-1 max-w-lg text-xs text-muted-foreground">
            O topo da lista tem mais autoridade. Arraste um cargo ou use as setas para
            reorganizar. O dono da sala fica sempre acima de todos.
          </p>
        </div>
        {canManageRoles ? (
          <button
            type="button"
            disabled={isPending}
            onClick={openCreateModal}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Criar novo cargo
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-border/60 bg-card/90 p-3 shadow-sm">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Hierarquia
        </p>
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <Crown className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Dono da sala</p>
            <p className="text-[10px] text-muted-foreground">Máxima autoridade — não é um cargo</p>
          </div>
        </div>

        {sortedRoles.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum cargo criado ainda.
          </p>
        ) : (
          <div className="space-y-1.5">
            {sortedRoles.map((role, index) => {
              const hierarchyHint = roleHierarchyHint(index, sortedRoles.length);
              const draggable = canMoveRole(role) && !isPending;
              const isDragging = dragIndex === index;
              const isDropTarget =
                dragOverIndex === index &&
                dragIndex != null &&
                dragIndex !== index;
              return (
                <div
                  key={role.id}
                  draggable={draggable}
                  onDragStart={(e) => {
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnter={() => {
                    if (dragIndex != null && dragIndex !== index) {
                      setDragOverIndex(index);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverIndex((prev) => (prev === index ? null : prev));
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragIndex != null && dragIndex !== index) {
                      setDragOverIndex(index);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex != null) reorderByDrag(dragIndex, index);
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={cn(
                    "rounded-lg border border-border/50 bg-muted/60 transition-all duration-150",
                    isDragging && "scale-[0.98] opacity-40 shadow-lg ring-2 ring-primary/40",
                    isDropTarget &&
                      "border-primary/60 bg-primary/10 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background",
                    draggable && !isDragging && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <div className="flex gap-2.5 p-3">
                    {canReorderInHierarchy ? (
                      <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 self-stretch">
                        {draggable ? (
                          <GripVertical
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden
                          />
                        ) : null}
                        <button
                          type="button"
                          disabled={
                            isPending ||
                            index === 0 ||
                            !canMoveRole(role) ||
                            (!snapshot?.is_owner &&
                              index > 0 &&
                              !canMoveRole(sortedRoles[index - 1]!))
                          }
                          onClick={() => moveRole(index, "up")}
                          className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-25"
                          title="Subir na hierarquia"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            isPending ||
                            index === sortedRoles.length - 1 ||
                            !canMoveRole(role) ||
                            (!snapshot?.is_owner &&
                              index < sortedRoles.length - 1 &&
                              !canMoveRole(sortedRoles[index + 1]!))
                          }
                          onClick={() => moveRole(index, "down")}
                          className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-25"
                          title="Descer na hierarquia"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className="text-sm font-semibold text-foreground">
                              {role.name}
                            </p>
                            {hierarchyHint ? (
                              <span className="text-[10px] text-muted-foreground">
                                {hierarchyHint}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          {canManageRoles ? (
                            <button
                              type="button"
                              onClick={() => openEditModal(role)}
                              className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-background"
                            >
                              Editar
                            </button>
                          ) : null}
                          {canAssignRoles ? (
                            <button
                              type="button"
                              onClick={() => setAssignRoleId(role.id)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                              title="Atribuir"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          ) : null}
                          {canManageRoles ? (
                            <button
                              type="button"
                              onClick={() => setRoleToDelete(role)}
                              disabled={isPending}
                              title="Excluir cargo"
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <RolePermissionsSummary
                        permissionLabels={permissionLabels}
                        permissions={role.permissions}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={assignRole != null && canAssignRoles}
        onOpenChange={(open) => !open && setAssignRoleId(null)}
      >
        <DialogContent className="max-h-[min(90vh,640px)] max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Atribuir: {assignRole?.name ?? "cargo"}
            </DialogTitle>
            <DialogDescription>
              Online e membros que já possuem cargo nesta sala (mesmo offline).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(55vh,420px)] space-y-1.5 overflow-y-auto py-1">
            {assignableUsers.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhum membro disponível para atribuir.
              </p>
            ) : null}
            {assignRole
              ? assignableUsers.map((user) => {
                  const userRoles = assignmentsByUser.get(user.id) ?? [];
                  const hasRole = userRoles.includes(assignRole.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                    >
                      <ProfileAvatar
                        displayName={user.fullname}
                        username={user.username}
                        profilePhoto={user.profile_photo}
                        sizeClass="h-7 w-7"
                        ringClass="ring-1 ring-border/60"
                        fallbackTextClassName="text-[10px]"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {user.fullname}
                        </span>
                        {!user.isOnline ? (
                          <span className="text-[10px] text-muted-foreground">
                            Offline
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          toggleUserRole(String(user.id), assignRole.id, hasRole)
                        }
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-bold",
                          hasRole
                            ? "bg-destructive/10 text-destructive"
                            : "bg-neon-green/10 text-neon-green",
                        )}
                      >
                        {hasRole ? "Remover" : "Atribuir"}
                      </button>
                    </div>
                  );
                })
              : null}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setAssignRoleId(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleModal != null} onOpenChange={(open) => !open && closeRoleModal()}>
        <DialogContent className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {roleModal?.type === "edit" ? "Editar cargo" : "Criar novo cargo"}
            </DialogTitle>
            <DialogDescription>
              {roleModal?.type === "create"
                ? "O cargo novo entra no fim da hierarquia (menor autoridade)."
                : "Altere o nome e as permissões deste cargo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <input
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              placeholder="Nome do cargo"
              className="w-full rounded-lg border border-border/60 bg-muted/70 px-3 py-2 text-sm"
              autoFocus
            />
            <PermissionPicker
              catalog={catalog}
              selected={modalPerms}
              onToggle={toggleModalPerm}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              disabled={isPending}
              onClick={closeRoleModal}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isPending || !modalName.trim()}
              onClick={saveRoleModal}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {roleModal?.type === "edit" ? "Salvar alterações" : "Criar cargo"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={roleToDelete != null}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleToDelete ? (
                <>
                  Tem certeza que deseja excluir o cargo{" "}
                  <span className="font-semibold text-foreground">
                    {roleToDelete.name}
                  </span>
                  ? Membros que o possuem perderão esse cargo. Esta ação não pode
                  ser desfeita.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={confirmDeleteRole}
            >
              Excluir cargo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function roleHierarchyHint(index: number, total: number): string | null {
  if (total <= 1) return null;
  if (index === 0) return "Mais alto na sala";
  if (index === total - 1) return "Mais baixo na hierarquia";
  return null;
}

function RolePermissionsSummary({
  permissionLabels,
  permissions,
}: {
  permissionLabels: Map<RoomPermissionKey, string>;
  permissions: RoomPermissionKey[];
}) {
  const displayKeys = useMemo(
    () =>
      permissions.filter(
        (key) => isAssignablePermissionKey(key) || permissionLabels.has(key),
      ),
    [permissions, permissionLabels],
  );

  const labels = useMemo(
    () => displayKeys.map((key) => permissionLabels.get(key) ?? key),
    [displayKeys, permissionLabels],
  );

  if (permissionLabels.size === 0 && displayKeys.length > 0) {
    return (
      <p className="text-[10px] text-muted-foreground">Carregando permissões…</p>
    );
  }

  if (displayKeys.length === 0) {
    return (
      <p className="text-[10px] italic text-muted-foreground">
        Nenhuma permissão atribuída
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {displayKeys.map((key, i) => (
        <span
          key={key}
          className="rounded-full border border-border/50 bg-background/90 px-2 py-0.5 text-[10px] leading-snug text-muted-foreground"
        >
          {labels[i]}
        </span>
      ))}
    </div>
  );
}

function PermissionPicker({
  catalog,
  selected,
  onToggle,
}: {
  catalog: PermissionCatalogCategory[];
  selected: RoomPermissionKey[];
  onToggle: (key: RoomPermissionKey) => void;
}) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const filteredCatalog = useMemo(
    () =>
      catalog
        .map((cat) => ({
          ...cat,
          permissions: cat.permissions.filter((p) =>
            isAssignablePermissionKey(p.key),
          ),
        }))
        .filter((cat) => cat.permissions.length > 0),
    [catalog],
  );

  if (filteredCatalog.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Carregando permissões…</p>
    );
  }

  return (
    <div className="space-y-2">
      {filteredCatalog.map((cat) => {
        const open = openCats[cat.id] ?? true;
        return (
          <div
            key={cat.id}
            className="rounded-lg border border-border/40 bg-muted/50"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground"
              onClick={() =>
                setOpenCats((c) => ({ ...c, [cat.id]: !open }))
              }
            >
              {cat.label}
              {open ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {open ? (
              <ul className="space-y-1 border-t border-border/30 px-3 py-2">
                {cat.permissions.map((p) => (
                  <li key={p.key}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.key)}
                        onChange={() => onToggle(p.key)}
                        className="mt-0.5"
                      />
                      <span className="text-foreground">{p.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
