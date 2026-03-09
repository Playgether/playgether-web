export interface PatchProfilePayload {
  name?: string;
  bio?: string;
  profile_photo?: string | null;
  profile_banner?: string | null;
}

export const patchProfile = async (pk: string | number, data: PatchProfilePayload) => {
  try {
    const response = await fetch(`/api/profiles/${pk}`, {
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
      const errorMessage =
        responseData?.detail ||
        responseData?.message ||
        `Erro ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};
