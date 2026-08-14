import { handleSignedCloudinaryUpload } from "../_lib/handleSignedCloudinaryUpload";

export async function POST(request: Request) {
  return handleSignedCloudinaryUpload(
    request,
    "profile_banners",
    "signed-profile-banner",
  );
}
