import {Meta, StoryObj} from "@storybook/react"
import OnlineFriendsCard from "./OnlineFriendsCard"

const meta: Meta<typeof OnlineFriendsCard> = {
    component: OnlineFriendsCard,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof OnlineFriendsCard>;
export const Primary: Story = {};