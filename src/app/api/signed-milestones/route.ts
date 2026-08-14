import { handleSignedCloudinaryUpload } from "../_lib/handleSignedCloudinaryUpload";

export async function POST(request: Request) {
  return handleSignedCloudinaryUpload(
    request,
    "milestones",
    "signed-milestones",
  );
}
