import {Meta, StoryObj} from "@storybook/react"
import TopicsOfMoment from "./TopicsOfMoment"

const meta: Meta<typeof TopicsOfMoment> = {
    component: TopicsOfMoment,
    parameters:{
        layout:'centered',
    },
    tags:['autodocs'],
}

export default meta
type Story = StoryObj<typeof TopicsOfMoment>;

export const Default: Story = {}