import {Meta, StoryObj} from "@storybook/react"
import {FormCommentImplementation, FormCommentProps} from "./FormCommentImplementation"
import { UseFormState } from "../../ConstFormStateLayout";
import { useCommentFormSchema } from "../CommentFormSchema";
import { action } from "@storybook/addon-actions"


const CommentFormContainer = (args) => {
    const CommentFormSchema = useCommentFormSchema();
    const { register, handleSubmit, errors, reset } = UseFormState(CommentFormSchema);

    const Submiting = () => {
        action("Você enviou o formulário")
    };

    return (
        <FormCommentImplementation 
            Submiting={Submiting} 
            errors={errors} 
            handleSubmit={handleSubmit} 
            register={register} 
        />
    );
}

const meta: Meta<typeof FormCommentImplementation> = {
    component: FormCommentImplementation,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<FormCommentProps>;
export const Primary: Story = {
    args:{
        Submiting:CommentFormContainer,
        errors: {},
        register:{}
    },
    render:CommentFormContainer
};