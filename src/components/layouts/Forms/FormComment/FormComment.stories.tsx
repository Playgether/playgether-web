import { action } from '@storybook/addon-actions';
import {Meta, StoryObj} from "@storybook/react"
import FormComment from "./FormComment"
import { FormCommentProps } from './FormComment';
import { CommentContentType } from '../../../content_types/CommentContentType';

const meta: Meta<typeof FormComment> = {
    component: FormComment,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<FormCommentProps>;
export const Primary: Story = {
    args:{
        object_id: 1,
        content_type: CommentContentType.post
    }

};
