"use client";

import { createChatRoom } from "@/actions/createChatRoom";
import type { RoomCardData } from "./RoomCard";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import {
  BYTES_8_MB,
  CLOUDINARY_IMAGE_FORMATS,
} from "@/app/utils/cloudinaryUploadConfig";
import { deleteCloudinaryImage } from "@/services/cloudinary_requests/deletePostFile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated?: (room: RoomCardData) => void;
};

const NAME_MAX = 56;
const SUMMARY_MAX = 80;
const DESC_MAX = 400;
const SLUG_MAX = 80;

function clientSlugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, SLUG_MAX);
}

function restoreRadixOverlayAfterCloudinary() {
  if (typeof document === "undefined") return;
  document.body.style.pointerEvents = "";
  document.querySelectorAll("[data-radix-dialog-overlay]").forEach((el) => {
    const html = el as HTMLElement;
    html.style.pointerEvents = "";
    html.style.backgroundColor = "";
  });
}

export default function CreateRoomModal({ open, onOpenChange, onRoomCreated }: Props) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [bannerPublicId, setBannerPublicId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploadWidgetOpen, setIsUploadWidgetOpen] = useState(false);
  const slugEditedByUser = useRef(false);
  const pendingBannerRef = useRef("");

  const clearFormAfterSuccess = () => {
    setGroupName("");
    setUrlSlug("");
    setSummary("");
    setDescription("");
    setBannerPublicId("");
    pendingBannerRef.current = "";
    setFieldErrors({});
    setApiError(null);
    setIsUploadWidgetOpen(false);
    restoreRadixOverlayAfterCloudinary();
    slugEditedByUser.current = false;
  };

  /** Fecha o fluxo sem criar sala: remove banner órfão do Cloudinary (como foto de perfil). */
  const abandonFormAndDeletePendingBanner = () => {
    const orphan = bannerPublicId;
    clearFormAfterSuccess();
    if (orphan) {
      void (async () => {
        await deleteCloudinaryImage(orphan);
      })();
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) abandonFormAndDeletePendingBanner();
    onOpenChange(next);
  };

  /** Mesmo padrão do ProfileEditModal: overlay do Radix bloqueia o widget Cloudinary sem isso. */
  const handleWidgetOpen = () => {
    setIsUploadWidgetOpen(true);
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
      document.querySelectorAll("[data-radix-dialog-overlay]").forEach((el) => {
        const html = el as HTMLElement;
        html.style.pointerEvents = "none";
        html.style.backgroundColor = "transparent";
      });
    }, 100);
  };

  const handleWidgetClose = () => {
    setIsUploadWidgetOpen(false);
    restoreRadixOverlayAfterCloudinary();
  };

  useEffect(() => {
    if (slugEditedByUser.current) return;
    setUrlSlug(clientSlugify(groupName));
  }, [groupName]);

  useEffect(() => {
    pendingBannerRef.current = bannerPublicId;
  }, [bannerPublicId]);

  useEffect(() => {
    return () => {
      const id = pendingBannerRef.current;
      if (id) {
        void (async () => {
          await deleteCloudinaryImage(id);
        })();
      }
    };
  }, []);

  const submit = () => {
    setApiError(null);
    const errors: Record<string, string> = {};
    if (!groupName.trim()) errors.groupName = "Nome da sala é obrigatório.";
    if (!summary.trim()) errors.summary = "Sumário é obrigatório.";
    if (!description.trim()) errors.description = "Descrição é obrigatória.";
    if (!bannerPublicId.trim()) errors.banner = "Banner é obrigatório.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const res = await createChatRoom({
        group_name: groupName.trim(),
        summary: summary.trim(),
        description: description.trim(),
        banner: bannerPublicId.trim(),
        slug: urlSlug.trim() || undefined,
      });
      if (!res.ok) {
        setApiError(res.error);
        return;
      }
      clearFormAfterSuccess();
      onOpenChange(false);
      onRoomCreated?.(res.room);
      router.push(`/rooms/${res.slug}`);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isUploadWidgetOpen) return;
        handleClose(nextOpen);
      }}
    >
      <DialogContent
        className="z-[250] max-h-[90vh] overflow-y-auto border-border bg-background sm:max-w-lg"
        onInteractOutside={(e) => isUploadWidgetOpen && e.preventDefault()}
        onPointerDownOutside={(e) => isUploadWidgetOpen && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Criar nova sala</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {apiError ? (
            <p className="text-sm font-medium text-red-400">{apiError}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="room-name">Nome da sala</Label>
            <Input
              id="room-name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value.slice(0, NAME_MAX));
                if (fieldErrors.groupName) setFieldErrors((p) => ({ ...p, groupName: "" }));
              }}
              placeholder="Ex.: Comunidade Valorant"
              maxLength={NAME_MAX}
              className={fieldErrors.groupName ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {fieldErrors.groupName ? (
              <p className="text-xs text-red-400">{fieldErrors.groupName}</p>
            ) : (
              <p className="text-right text-xs text-muted-foreground">{groupName.length}/{NAME_MAX}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-url">Endereço na URL</Label>
            <Input
              id="room-url"
              value={urlSlug}
              onChange={(e) => {
                slugEditedByUser.current = true;
                const v = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
                  .slice(0, SLUG_MAX);
                setUrlSlug(v);
              }}
              placeholder="ex.: minha-tribo"
              maxLength={SLUG_MAX}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-right text-xs text-muted-foreground">
              {urlSlug.length}/{SLUG_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-summary">Sumário</Label>
            <Input
              id="room-summary"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value.slice(0, SUMMARY_MAX));
                if (fieldErrors.summary) setFieldErrors((p) => ({ ...p, summary: "" }));
              }}
              placeholder="Uma linha que descreve a sala"
              maxLength={SUMMARY_MAX}
              className={fieldErrors.summary ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {fieldErrors.summary ? (
              <p className="text-xs text-red-400">{fieldErrors.summary}</p>
            ) : (
              <p className="text-right text-xs text-muted-foreground">{summary.length}/{SUMMARY_MAX}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-desc">Descrição</Label>
            <Textarea
              id="room-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value.slice(0, DESC_MAX));
                if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="Tom da conversa, jogo, boas-vindas…"
              rows={4}
              maxLength={DESC_MAX}
              className={`resize-y${fieldErrors.description ? " border-red-400 focus-visible:ring-red-400" : ""}`}
            />
            {fieldErrors.description ? (
              <p className="text-xs text-red-400">{fieldErrors.description}</p>
            ) : (
              <p className="text-right text-xs text-muted-foreground">{description.length}/{DESC_MAX}</p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Banner</span>
            <div className="flex flex-wrap items-center gap-3">
              <CldUploadWidget
                signatureEndpoint="/api/signed-room-banner"
                options={{
                  uploadPreset: PresetsCloudinary.chat_room_banner,
                  sources: ["local"],
                  multiple: false,
                  maxFiles: 1,
                  resourceType: "image",
                  clientAllowedFormats: [...CLOUDINARY_IMAGE_FORMATS],
                  maxImageFileSize: BYTES_8_MB,
                  language: "pt-br",
                  styles: { zIndex: 200000 },
                }}
                onOpen={handleWidgetOpen}
                onClose={handleWidgetClose}
                onSuccess={async (result: any) => {
                  const id = result?.info?.public_id;
                  if (typeof id !== "string" || !id) return;
                  const previous = pendingBannerRef.current;
                  setBannerPublicId(id);
                  pendingBannerRef.current = id;
                  if (previous && previous !== id) {
                    await deleteCloudinaryImage(previous);
                  }
                }}
              >
                {({ open: openUpload }) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openUpload()}
                    disabled={isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher arquivo
                  </Button>
                )}
              </CldUploadWidget>
              {bannerPublicId ? (
                <span className="text-xs text-green-500">Banner selecionado ✓</span>
              ) : null}
            </div>
            {fieldErrors.banner ? (
              <p className="text-xs text-red-400">{fieldErrors.banner}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="gradient-primary text-primary-foreground"
              onClick={submit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar sala"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
