import { handleSignedCloudinaryUpload } from "../_lib/handleSignedCloudinaryUpload";

/** Upload assinado para ambientação (preset único de imagem e vídeo). */
export async function POST(request: Request) {
  return handleSignedCloudinaryUpload(
    request,
    "rooms_ambiance",
    "signed-room-ambiance",
  );
}
