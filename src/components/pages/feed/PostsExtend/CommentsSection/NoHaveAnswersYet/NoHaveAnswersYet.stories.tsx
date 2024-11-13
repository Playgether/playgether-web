import {Meta, StoryObj} from "@storybook/react"
import {NoHaveAnswersYet} from "./NoHaveAnswersYet"

const meta: Meta<typeof NoHaveAnswersYet> = {
    component: NoHaveAnswersYet,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof NoHaveAnswersYet>;
export const Primary: Story = {};