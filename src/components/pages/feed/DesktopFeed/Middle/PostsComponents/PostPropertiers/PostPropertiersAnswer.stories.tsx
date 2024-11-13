import {Meta, StoryObj} from "@storybook/react"
import PostPropertiers from "./PostPropertiers"
import { PostPropertiersPostsAnswerProps } from "./PostPropertiersAnswer";

const meta: Meta<PostPropertiersPostsAnswerProps> = {
    component: PostPropertiers,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<PostPropertiersPostsAnswerProps>;
export const Primary: Story = {
    args:{
        quantity_likes: 1052,
        object_id: 1,
        user_already_like:false,
    }
};