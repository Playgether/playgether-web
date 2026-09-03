import {
  authorizeCloudinaryMutation,
  cloudinaryMutationErrorResponse,
} from "./authorizeCloudinaryMutation";
import { signCloudinaryUploadParams } from "./signCloudinaryUpload";

type UploadKind = Parameters<typeof signCloudinaryUploadParams>[1];

export async function handleSignedCloudinaryUpload(
  request: Request,
  kind: UploadKind,
  routeName: string,
): Promise<Response> {
  try {
    await authorizeCloudinaryMutation();

    const body = (await request.json()) as { paramsToSign?: unknown };
    const { paramsToSign } = body;
    if (
      !paramsToSign ||
      typeof paramsToSign !== "object" ||
      Array.isArray(paramsToSign)
    ) {
      return Response.json(
        { error: "Parâmetros de upload inválidos" },
        { status: 400 },
      );
    }

    const result = await signCloudinaryUploadParams(
      paramsToSign as Record<string, unknown>,
      kind,
    );
    return Response.json(result);
  } catch (error) {
    return cloudinaryMutationErrorResponse(error, routeName);
  }
}
