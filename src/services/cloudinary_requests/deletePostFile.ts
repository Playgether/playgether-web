import axios from "axios";

export const deletePostFile = async (public_id:string, media_folder:string, media_type:string) => {
    try {
        const response = await axios.post('/api/signed-delete-posts/', {
            public_id: public_id,
            resource_type: media_type     
        });

        return response.data;
    } catch (error) {
        console.error('Algum erro ocorreu ao deletar o arquivo:', error);
        throw error;
    }
    
};