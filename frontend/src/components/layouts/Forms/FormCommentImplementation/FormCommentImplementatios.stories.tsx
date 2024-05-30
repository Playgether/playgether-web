import {Meta, StoryObj} from "@storybook/react"
import {FormCommentImplementation, FormCommentProps} from "./FormCommentImplementation"
import { UseFormState } from "../../ConstFormStateLayout";
import { useCommentFormSchema } from "../CommentFormSchema";
import { action } from '@storybook/addon-actions';


// const getFunctions = () => {
//     const CommentFormSchema = useCommentFormSchema();
//     const {register, handleSubmit, errors, reset} = UseFormState(CommentFormSchema);
//     const Submiting = () =>{}

//     return {register, handleSubmit,errors}
// }
// const CommentFormSchema = useCommentFormSchema();
// const {register, handleSubmit, errors, reset} = UseFormState(CommentFormSchema);

const CommentFormContainer: React.FC = () => {
    const CommentFormSchema = useCommentFormSchema();
    const { register, handleSubmit, errors, reset } = UseFormState(CommentFormSchema);

    const Submiting = () => {
        // Your submitting logic here
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
const Submiting = () =>{}

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
        Submiting:Submiting,
        errors: {},
        register:{}
    }
};