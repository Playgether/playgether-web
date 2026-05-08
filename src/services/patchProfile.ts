export interface PatchProfilePayload {
  name?: string;
  bio?: string;
  profile_photo?: string | null;
  profile_banner?: string | null;
}

import { apiFetch } from "@/services/apiFetch";

/** Alinhado ao `max_length` do campo `Profile.bio` no Django. */
export const PROFILE_BIO_MAX_LENGTH = 500;

function messageFromPatchErrorBody(responseData: unknown): string {
  if (!responseData || typeof responseData !== "object") {
    return "Erro ao atualizar perfil.";
  }
  const data = responseData as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((x) => String(x)).join(" ");
  }
  const parts: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (key === "detail") continue;
    if (Array.isArray(val)) parts.push(val.map(String).join(" "));
    else if (typeof val === "string") parts.push(val);
  }
  if (parts.length > 0) return parts.join(" ");
  if (typeof data.message === "string") return data.message;
  return "Erro ao atualizar perfil.";
}

export const patchProfile = async (pk: string | number, data: PatchProfilePayload) => {
  try {
    const response = await apiFetch(`/api/profiles/${pk}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const responseData = isJson ? await response.json() : null;

    if (!response.ok) {
      const aggregated = messageFromPatchErrorBody(responseData);
      const hasBioField =
        responseData &&
        typeof responseData === "object" &&
        "bio" in (responseData as object);
      const looksLikeBioLength =
        hasBioField &&
        /\b500\b|at most|no more than|máximo|caracter|character/i.test(
          aggregated,
        );
      if (looksLikeBioLength) {
        throw new Error(
          `BIO_MAX_LENGTH:A bio pode ter no máximo ${PROFILE_BIO_MAX_LENGTH} caracteres. Encurte o texto e salve novamente.`,
        );
      }
      throw new Error(
        aggregated || `Erro ${response.status}: ${response.statusText}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};
