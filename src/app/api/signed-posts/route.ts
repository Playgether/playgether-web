import axios from "axios";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";
import { api } from "@/services/api";
import { signCloudinaryUploadParams } from "../_lib/signCloudinaryUpload";

export async function POST(request: Request) {
  try {
    const accessToken = await ensureAccessTokenCookie();
    if (!accessToken) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    // O Django valida o JWT e aplica throttle por usuário antes de assinarmos.
    await api.post(
      "/api/v1/uploads/authorize/",
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const body = await request.json();
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

    const result = await signCloudinaryUploadParams(paramsToSign, "posts");
    return Response.json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403 || status === 429) {
        const message =
          error.response?.data?.detail ??
          (status === 429
            ? "Muitas tentativas de upload. Aguarde e tente novamente."
            : "Não autorizado");
        return Response.json({ error: message }, { status });
      }
    }

    const message =
      error instanceof Error ? error.message : "Falha ao assinar upload";
    console.error("signed-posts:", message);
    return Response.json({ error: message }, { status: 400 });
  }
}
