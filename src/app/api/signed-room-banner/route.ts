import { signCloudinaryUploadParams } from "../_lib/signCloudinaryUpload";

/** Upload assinado para banner de sala (preset `chat-room-banner`). */
export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;
  const result = await signCloudinaryUploadParams(
    paramsToSign,
    "chat_room_banner",
  );
  return Response.json(result);
}
