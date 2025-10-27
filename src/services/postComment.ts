export interface commentProps {
  comment: string;
  content_type: string;
  object_id: number;
}

export const postComment = async (data: commentProps) => {
  try {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
    console.error("Erro ao postar comentário:", error);
    throw error;
  }
};
