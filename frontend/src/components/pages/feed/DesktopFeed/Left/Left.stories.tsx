import {Meta, StoryObj} from "@storybook/react"
import Left from "./Left"

const meta: Meta<typeof Left> = {
    component: Left,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof Left>;
export const Primary: Story = {};