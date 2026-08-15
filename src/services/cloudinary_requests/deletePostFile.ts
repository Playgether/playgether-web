import axios from "axios";
import { cloudinaryResourceForAmbientDelete } from "@/app/utils/roomAmbientMedia";

/**
 * Remove uma imagem pelo `public_id` (mesmo endpoint do perfil).
 * Retorna true se a exclusão foi bem-sucedida. Com novas tentativas para evitar mídia órfã.
 */
export async function deleteCloudinaryImage(
  publicId: string
): Promise<boolean> {
  const id = String(publicId ?? "").trim();
  if (!id) return true;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await axios.post("/api/signed-delete-posts/", {
        public_id: id,
        resource_type: "image",
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // O asset já foi persistido. A proteção do backend impediu apagar
        // mídia viva (ex.: resposta do create/update se perdeu por timeout).
        return true;
      }
      console.error(
        `Erro ao excluir imagem no Cloudinary (tentativa ${attempt + 1}/3):`,
        error
      );
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
  }
  return false;
}

/** Valor salvo em `ambient_images` (imagem ou `video:public_id`). */
export async function deleteCloudinaryRoomAmbientAsset(
  stored: string,
): Promise<boolean> {
  const { public_id, resource_type } = cloudinaryResourceForAmbientDelete(stored);
  const id = String(public_id ?? "").trim();
  if (!id) return true;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await axios.post("/api/signed-delete-posts/", {
        public_id: id,
        resource_type,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return true;
      }
      console.error(
        `Erro ao excluir mídia de ambientação (tentativa ${attempt + 1}/3):`,
        error,
      );
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
  }
  return false;
}

export const deletePostFile = async (public_id:string, media_folder:string, media_type:string) => {
    try {
        const response = await axios.post('/api/signed-delete-posts/', {
            public_id: public_id,
            resource_type: media_type     
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            return { protected: true };
        }
        console.error('Algum erro ocorreu ao deletar o arquivo:', error);
        throw error;
    }
    
};