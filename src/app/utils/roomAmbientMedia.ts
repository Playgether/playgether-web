import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { getCloudinaryVideoUrl } from "@/app/utils/getCloudinaryVideo";
import {
  AMBIENT_VIDEO_MAX_DURATION_SEC,
  AMBIENT_VIDEO_MAX_LONG_SIDE,
  AMBIENT_VIDEO_MAX_SHORT_SIDE,
} from "@/app/utils/cloudinaryUploadConfig";

export {
  AMBIENT_VIDEO_MAX_DURATION_SEC,
  AMBIENT_VIDEO_MAX_LONG_SIDE,
  AMBIENT_VIDEO_MAX_SHORT_SIDE,
};

const VIDEO_MARKER = "video:";

export type ParsedAmbientMedia =
  | { kind: "image"; publicId: string }
  | { kind: "video"; publicId: string };

export function parseAmbientMediaValue(
  raw: string | null | undefined,
): ParsedAmbientMedia | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (s.startsWith(VIDEO_MARKER)) {
    const publicId = s.slice(VIDEO_MARKER.length).trim();
    if (!publicId) return null;
    return { kind: "video", publicId };
  }
  return { kind: "image", publicId: s };
}

export function resolveAmbientAbsoluteUrl(parsed: ParsedAmbientMedia): string {
  if (parsed.kind === "video") {
    return getCloudinaryVideoUrl(parsed.publicId, AMBIENT_VIDEO_MAX_LONG_SIDE);
  }
  return getCloudinaryUrl(parsed.publicId, AMBIENT_VIDEO_MAX_LONG_SIDE);
}

export function cloudinaryResourceForAmbientDelete(stored: string): {
  resource_type: "image" | "video";
  public_id: string;
} {
  const p = parseAmbientMediaValue(stored);
  if (!p) return { resource_type: "image", public_id: "" };
  return {
    resource_type: p.kind === "video" ? "video" : "image",
    public_id: p.publicId,
  };
}

export function storedValueFromUploadResult(info: {
  public_id?: string;
  resource_type?: string;
}): string | null {
  const publicId = info?.public_id;
  if (!publicId || typeof publicId !== "string") return null;
  const rt = info.resource_type;
  if (rt === "video") return `${VIDEO_MARKER}${publicId}`;
  return publicId;
}
