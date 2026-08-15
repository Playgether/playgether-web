import axios from "axios";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";
import { api } from "@/services/api";

export async function authorizeCloudinaryMutation(): Promise<void> {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    throw new CloudinaryAuthorizationError(401, "Não autorizado");
  }

  await api.post(
    "/api/v1/uploads/authorize/",
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

export async function authorizeCloudinaryDeleteMutation(
  publicId: string,
  resourceType: string,
): Promise<void> {
  const accessToken = await ensureAccessTokenCookie();
  if (!accessToken) {
    throw new CloudinaryAuthorizationError(401, "Não autorizado");
  }

  await api.post(
    "/api/v1/uploads/authorize-delete/",
    { public_id: publicId, resource_type: resourceType },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

export class CloudinaryAuthorizationError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function cloudinaryMutationErrorResponse(
  error: unknown,
  routeName: string,
): Response {
  if (error instanceof CloudinaryAuthorizationError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) {
      const message =
        error.response?.data?.detail ??
        (status === 429
          ? "Muitas solicitações de mídia. Aguarde e tente novamente."
          : "Não autorizado");
      return Response.json({ error: message }, { status });
    }
  }

  const message =
    error instanceof Error ? error.message : "Falha na operação do Cloudinary";
  console.error(`${routeName}:`, message);
  return Response.json({ error: message }, { status: 400 });
}
