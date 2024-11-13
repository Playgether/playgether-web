import {Meta, StoryObj} from "@storybook/react"
import Right from "./Right"

const meta: Meta<typeof Right> = {
    component: Right,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof Right>;
export const Primary: Story = {};