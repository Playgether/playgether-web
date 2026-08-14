import { v2 as cloudinary } from "cloudinary";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_BY_KIND: Record<string, PresetsCloudinary[]> = {
  posts: [PresetsCloudinary.posts],
  milestones: [PresetsCloudinary.profile_milestones],
  rooms_ambiance: [PresetsCloudinary.rooms_ambiance],
  profile_photos: [PresetsCloudinary.profile_image],
  profile_banners: [PresetsCloudinary.profile_banners],
  chat_room_banner: [PresetsCloudinary.chat_room_banner],
};

/**
 * Assina params do Upload Widget, aceitando apenas presets liberados para o kind.
 *
 * Assina exatamente o que o widget mandou: injetar um upload_preset que o widget
 * não vai enviar no POST do upload quebraria a assinatura.
 */
export async function signCloudinaryUploadParams(
  paramsToSign: Record<string, unknown>,
  kind: keyof typeof ALLOWED_BY_KIND,
  extras?: Record<string, unknown>,
) {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "CLOUDINARY_API_SECRET não está definido nas variáveis de ambiente.",
    );
  }

  const allowed = ALLOWED_BY_KIND[kind] ?? [];
  const fromClient =
    typeof paramsToSign.upload_preset === "string"
      ? paramsToSign.upload_preset
      : undefined;

  if (fromClient && !(allowed as string[]).includes(fromClient)) {
    throw new Error(
      `Upload preset "${fromClient}" não é permitido para "${kind}".`,
    );
  }

  if (extras) {
    Object.assign(paramsToSign, extras);
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );

  return { signature };
}
