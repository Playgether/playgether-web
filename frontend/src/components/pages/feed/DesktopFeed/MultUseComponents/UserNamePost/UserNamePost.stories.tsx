import UserNamePost from "./UserNamePost";
import type {Meta, StoryObj} from "@storybook/react"
import  UserNameProps  from "./UserNamePost";


const meta: Meta<typeof UserNameProps> = {
    component: UserNamePost,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof UserNameProps>;

export const Default: Story = {
    args: {
        username: "test_username"  
    },
}
