"use client";

import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import {
  createChatRoomRule,
  deleteChatRoomRule,
  updateChatRoomRule,
} from "@/actions/chatRoomMutations";
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
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import {
  Calendar,
  Info,
  MessageSquare,
  Pencil,
  Plus,
  ScrollText,
  TrendingUp,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";

interface RoomDetailsPanelProps {
  room: ChatRoom;
}

/** Alinhado ao max_length do modelo ChatRule / validação da API. */
const RULE_MAX_LENGTH = 200;
/** Truncamento só para exibição no modal de exclusão. */
const RULE_DELETE_PREVIEW_MAX = 80;

function truncateRulePreview(text: string, max = RULE_DELETE_PREVIEW_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export function RoomInfoPanel({ room }: RoomDetailsPanelProps) {
  const stats = [
    { icon: Calendar, label: "Criada em", value: room.created_at_formated },
    {
      icon: User,
      label: "Criador",
      value: `${room.owner_fullname} (@${room.owner_username})`,
    },
    {
      icon: MessageSquare,
      label: "Mensagens",
      value: room.total_messages.toLocaleString("pt-BR"),
    },
    { icon: Users, label: "Capacidade", value: `${room.capacity} usuários` },
    {
      icon: TrendingUp,
      label: "Pico",
      value: `${room.peak_users} usuários`,
    },
  ];

  return (
    <div className="space-y-5 bg-muted/20 p-4 md:h-full md:overflow-y-auto">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Info className="h-5 w-5 text-neon-blue" />
        Informações da Sala
      </h2>

      <div className="max-w-sm overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="relative aspect-[16/10] overflow-hidden">
          {room.banner ? (
            <ImageComponent media_id={room.banner} alt={room.group_name} />
          ) : (
            <div className="flex h-full min-h-[140px] w-full items-center justify-center bg-muted/50 text-xs text-muted-foreground">
              Sem banner
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-bold text-white drop-shadow-md hyphens-none whitespace-normal">
              {room.group_name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-white/80 drop-shadow-sm">
              {room.summary}
            </p>
          </div>
        </div>
      </div>

      {room.description ? (
        <div className="rounded-xl border border-border/60 bg-card/70 p-4 text-sm text-card-foreground">
          <p className="whitespace-pre-wrap">{room.description}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/60 bg-muted/40 p-3"
          >
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <stat.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoomRulesPanel({ room }: RoomDetailsPanelProps) {
  const { can } = useRoomPermissions();
  const canManage = can("room.rules.manage");
  const [rules, setRules] = useState(room.rules);
  const [newRule, setNewRule] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [ruleToDelete, setRuleToDelete] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const addRule = () => {
    const value = newRule.trim();
    if (!value || !canManage) return;
    if (value.length > RULE_MAX_LENGTH) {
      setError(`A regra pode ter no máximo ${RULE_MAX_LENGTH} caracteres.`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createChatRoomRule(room.slug, value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRules((current) => [...current, res.data]);
      setNewRule("");
    });
  };

  const startEdit = (ruleId: number, description: string) => {
    if (!canManage) return;
    setEditingRuleId(ruleId);
    setEditingText(description);
  };

  const cancelEdit = () => {
    setEditingRuleId(null);
    setEditingText("");
  };

  const saveEdit = () => {
    if (!editingRuleId || !canManage) return;
    const value = editingText.trim();
    if (!value) return;
    if (value.length > RULE_MAX_LENGTH) {
      setError(`A regra pode ter no máximo ${RULE_MAX_LENGTH} caracteres.`);
      return;
    }
    const id = editingRuleId;
    setError(null);
    startTransition(async () => {
      const res = await updateChatRoomRule(room.slug, id, value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRules((current) =>
        current.map((rule) => (rule.id === id ? res.data : rule)),
      );
      setEditingRuleId(null);
      setEditingText("");
    });
  };

  const confirmDeleteRule = () => {
    if (!canManage || !ruleToDelete) return;
    const ruleId = ruleToDelete.id;
    setError(null);
    startTransition(async () => {
      const res = await deleteChatRoomRule(room.slug, ruleId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRules((current) => current.filter((rule) => rule.id !== ruleId));
      if (editingRuleId === ruleId) {
        setEditingRuleId(null);
        setEditingText("");
      }
      setRuleToDelete(null);
    });
  };

  return (
    <div className="space-y-4 bg-muted/20 p-4 md:h-full md:overflow-y-auto">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <ScrollText className="h-5 w-5 text-neon-purple" />
        Regras da Sala
      </h2>

      {!canManage ? (
        <p className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Apenas o criador da sala pode adicionar ou editar regras.
        </p>
      ) : null}

      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}

      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            value={newRule}
            onChange={(event) =>
              setNewRule(event.target.value.slice(0, RULE_MAX_LENGTH))
            }
            onKeyDown={(event) => event.key === "Enter" && addRule()}
            placeholder="Nova regra..."
            maxLength={RULE_MAX_LENGTH}
            disabled={!canManage || isPending}
            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={addRule}
            disabled={!canManage || isPending}
            className="shrink-0 rounded-lg gradient-primary p-2 text-primary-foreground disabled:opacity-50"
            title="Criar regra"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {canManage && newRule.length > 0 ? (
          <p className="text-right text-[10px] text-muted-foreground">
            {newRule.length}/{RULE_MAX_LENGTH}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        {rules.length > 0 ? (
          rules.map((rule, index) => (
            <div
              key={rule.id}
              className="group flex min-w-0 items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3"
            >
              <span className="mt-0.5 w-5 flex-shrink-0 text-sm font-bold text-neon-grandmaster">
                {index + 1}.
              </span>
              {editingRuleId === rule.id ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 space-y-1">
                    <input
                      value={editingText}
                      onChange={(event) =>
                        setEditingText(
                          event.target.value.slice(0, RULE_MAX_LENGTH),
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveEdit();
                        if (event.key === "Escape") cancelEdit();
                      }}
                      maxLength={RULE_MAX_LENGTH}
                      className="min-w-0 w-full rounded border border-border/60 bg-muted/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <p className="text-right text-[10px] text-muted-foreground">
                      {editingText.length}/{RULE_MAX_LENGTH}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={isPending}
                      className="rounded px-2 py-1 text-xs font-bold text-neon-green hover:bg-neon-green/10 disabled:opacity-50"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isPending}
                      className="rounded px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="min-w-0 flex-1 break-words text-sm text-foreground">
                    {rule.description}
                  </span>
                  <div className="flex shrink-0 gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEdit(rule.id, rule.description)}
                      disabled={!canManage || isPending}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                      title="Editar regra"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRuleToDelete({
                          id: rule.id,
                          description: rule.description,
                        })
                      }
                      disabled={!canManage || isPending}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      title="Excluir regra"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma regra definida.
          </p>
        )}
      </div>

      <AlertDialog
        open={ruleToDelete != null}
        onOpenChange={(open) => !open && setRuleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>
              {ruleToDelete ? (
                <>
                  Tem certeza que deseja excluir a regra{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{truncateRulePreview(ruleToDelete.description)}&rdquo;
                  </span>
                  ? Esta ação não pode ser desfeita.
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
              onClick={confirmDeleteRule}
            >
              Excluir regra
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
