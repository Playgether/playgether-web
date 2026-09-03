import { handleSignedCloudinaryUpload } from "../_lib/handleSignedCloudinaryUpload";

/** Upload assinado para banner de sala (preset `chat-room-banner`). */
export async function POST(request: Request) {
  return handleSignedCloudinaryUpload(
    request,
    "chat_room_banner",
    "signed-room-banner",
  );
}
