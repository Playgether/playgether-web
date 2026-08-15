import type { PostProps } from "@/app/feed/types/PostProps";
import { apiFetch } from "@/services/apiFetch";

export async function deletePostProfile(
  postId: number,
  _post: PostProps | null,
): Promise<void> {
  const response = await apiFetch(`/api/posts/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `Erro ao excluir post`
    );
  }
}
