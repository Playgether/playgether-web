import {Meta, StoryObj} from "@storybook/react"
import NoHaveCommentsYet from "./NoHaveCommentsYet"

const meta: Meta<typeof NoHaveCommentsYet> = {
    component: NoHaveCommentsYet,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof NoHaveCommentsYet>;
export const Primary: Story = {};