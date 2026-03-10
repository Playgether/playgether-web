import axios from "axios";
import type { PostProps } from "@/app/feed/types/PostProps";

async function deleteMediaFromCloudinary(
  publicId: string,
  resourceType: "image" | "video"
) {
  await axios.post("/api/signed-delete-posts/", {
    public_id: publicId,
    resource_type: resourceType,
  });
}

export async function deletePostProfile(
  postId: number,
  post: PostProps | null
): Promise<void> {
  if (post?.medias && post.medias.length > 0) {
    for (const media of post.medias) {
      try {
        const resourceType =
          media.media_type === "video" ? "video" : "image";
        await deleteMediaFromCloudinary(media.media_file, resourceType);
      } catch (err) {
        console.error("Erro ao remover mídia do Cloudinary:", err);
      }
    }
  }

  const response = await fetch(`/api/posts/${postId}`, {
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
