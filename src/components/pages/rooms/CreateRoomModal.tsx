"use client";

import { createChatRoom } from "@/actions/createChatRoom";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
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

export default function CreateRoomModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [bannerPublicId, setBannerPublicId] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
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
    setError(null);
    if (
      !groupName.trim() ||
      !summary.trim() ||
      !description.trim() ||
      !bannerPublicId.trim()
    ) {
      setError("Nome, sumário, descrição e banner são obrigatórios.");
      return;
    }

    startTransition(async () => {
      const res = await createChatRoom({
        group_name: groupName.trim(),
        summary: summary.trim(),
        description: description.trim(),
        banner: bannerPublicId.trim(),
        slug: urlSlug.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clearFormAfterSuccess();
      onOpenChange(false);
      router.refresh();
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
          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="room-name">Nome da sala</Label>
            <Input
              id="room-name"
              value={groupName}
              onChange={(e) =>
                setGroupName(e.target.value.slice(0, NAME_MAX))
              }
              placeholder="Ex.: Comunidade Valorant"
              maxLength={NAME_MAX}
            />
            <p className="text-right text-xs text-muted-foreground">
              {groupName.length}/{NAME_MAX}
            </p>
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
              onChange={(e) =>
                setSummary(e.target.value.slice(0, SUMMARY_MAX))
              }
              placeholder="Uma linha que descreve a sala"
              maxLength={SUMMARY_MAX}
            />
            <p className="text-right text-xs text-muted-foreground">
              {summary.length}/{SUMMARY_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-desc">Descrição</Label>
            <Textarea
              id="room-desc"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESC_MAX))
              }
              placeholder="Tom da conversa, jogo, boas-vindas…"
              rows={4}
              maxLength={DESC_MAX}
              className="resize-y"
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.length}/{DESC_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Banner (obrigatório)</span>
            <div className="flex flex-wrap items-center gap-3">
              <CldUploadWidget
                signatureEndpoint="/api/signed-room-banner"
                options={{
                  uploadPreset: PresetsCloudinary.chat_room_banner,
                  sources: ["local"],
                  multiple: false,
                  maxFiles: 1,
                  resourceType: "image",
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
                <span className="text-xs text-muted-foreground">
                  Banner selecionado ✓
                </span>
              ) : null}
            </div>
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
