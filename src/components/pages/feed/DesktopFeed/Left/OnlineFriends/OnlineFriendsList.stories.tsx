import {Meta, StoryObj} from "@storybook/react"
import OnlineFriendsList from "./OnlineFriendsList"

const meta: Meta<typeof OnlineFriendsList> = {
    component: OnlineFriendsList,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof OnlineFriendsList>;
export const Primary: Story = {};