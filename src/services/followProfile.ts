export const followProfile = async (pk: string | number) => {
  try {
    const response = await fetch(`/api/profiles/${pk}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.error("Erro ao seguir perfil:", error);
    throw error;
  }
};
