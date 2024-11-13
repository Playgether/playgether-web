import {Meta, StoryObj} from "@storybook/react"
import PostPropertiers from "./PostPropertiers"
import { PostPropertiersPostsExpandProps } from "./PostPropertiers";

const meta: Meta<PostPropertiersPostsExpandProps> = {
    component: PostPropertiers,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<PostPropertiersPostsExpandProps>;
export const Primary: Story = {
    args:{
        quantity_comment:150,
        quantity_likes: 1052,
        object_id: 1,
        user_already_like:false,
    }
};