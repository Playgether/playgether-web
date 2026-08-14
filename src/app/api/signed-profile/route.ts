import { signCloudinaryUploadParams } from "../_lib/signCloudinaryUpload";

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;
  const result = await signCloudinaryUploadParams(
    paramsToSign,
    "profile_photos",
  );
  return Response.json(result);
}
