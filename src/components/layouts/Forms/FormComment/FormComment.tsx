'use client'

import { UseFormState } from "../../ConstFormStateLayout"
import { SubmitingForm } from "../../SubmitingFormLayout";
import { useCommentFormSchema } from "../CommentFormSchema"
import { postComment } from "../../../../services/postComment";
import { FormCommentImplementation } from "../FormCommentImplementation/FormCommentImplementation";
import { useAuthContext } from "../../../../context/AuthContext";
import { useCommentsContext } from "../../../../context/CommentsContext";
import { useFeedContext } from "../../../../context/FeedContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastErrorMessages, CustomToastProps } from "@/error/custom-toaster/enum";

export type FormCommentProps = {
    /** Este componente recebe o content_type do componente pai, esta prop vai utilizar CommentTypes para pegar a chave para definir em que esta sendo comentado, neste caso
     * um post
     */
    content_type: string,
    /** Esta prop recebe o id do objeto que esta sendo comentado, ou seja, neste caso, o id do post que está sendo comentado. */
    object_id: number,
}

type dataProps = {
    comment: string
}

/** Este componente é responsável por utilizar os layouts da construção de formulário, enquanto FormCommentImplementation é a implementação do formulário em sí,
 * além disso, sua responsabilidade, e gerar a função handleSubmit que define como para onde o formulário será enviado, e então
 * passar isso pro seu componente filho, neste caso, FormCommentImplementation. A ideia aqui, é separar a implementação visual, da lógica do componente.
 * OBS: O retorno visual aqui, esta sendo o mesmo que "FormCommentImplementation" porque este componente retorna o componente "FormCommentImplementation", ele apenas existe,
 * como dito anteriormente, para separar a lógica de implementação da implementação propriamente dita.
 */
const FormComment = ({content_type, object_id} : FormCommentProps) => {
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors, reset} = UseFormState(CommentFormSchema);
    const { user, authTokens } = useAuthContext();
    const {addNewComment} = useCommentsContext()
    const {alterCommentQuantity} = useFeedContext()

    const Submiting = async (data: dataProps) => {
        const newData = {
            content_type: content_type,
            object_id: object_id,
            user: user?.user_id,
            ...data
        };

        const response = await SubmitingForm(() => postComment(newData, authTokens));
        if (response.status === 201){
            addNewComment(response.data);
            alterCommentQuantity(object_id)
            reset({comment: ''});
        } else {
        CustomToast.error(CustomToastErrorMessages.defaultTitle, {
            description: CustomToastErrorMessages.commentErrorMessage,
            duration: CustomToastProps.defaultDuration
        });
        console.error('Algo deu errado', response)
    }    
}

return (
    <>
        <CustomToaster/>
        <FormCommentImplementation 
        handleSubmit={handleSubmit}
        register={register}
        Submiting={Submiting}
        errors={errors}
        />
    </>

)}

export default FormComment;