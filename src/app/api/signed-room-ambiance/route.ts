import { signCloudinaryUploadParams } from "../_lib/signCloudinaryUpload";

/** Upload assinado para ambientação (preset image ou video). */
export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;
  const result = await signCloudinaryUploadParams(
    paramsToSign,
    "rooms_ambiance",
  );
  return Response.json(result);
}
