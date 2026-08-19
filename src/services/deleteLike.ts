import { apiFetch } from "@/services/apiFetch";

export const deleteLike = async (object_id: string | number, content_type: string) => {
  try {
    const response = await apiFetch(
      `/api/likes/?content_type=${content_type}&object_id=${object_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result; // ✅ Retorna o resultado da API
  } catch (error) {
    console.error("Erro no postLike:", error);
    throw error; // ✅ Re-lança o erro para tratamento no componente
  }
};
