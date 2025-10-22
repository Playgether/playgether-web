export interface LikeProps {
  content_type: string;
  object_id: number;
}

export const postLike = async (data: LikeProps) => {
  try {
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

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
