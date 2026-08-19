import { handleSignedCloudinaryUpload } from "../_lib/handleSignedCloudinaryUpload";

/** Upload assinado para cuts (preset `cuts`, só vídeo). */
export async function POST(request: Request) {
  return handleSignedCloudinaryUpload(request, "cuts", "signed-cuts");
}
