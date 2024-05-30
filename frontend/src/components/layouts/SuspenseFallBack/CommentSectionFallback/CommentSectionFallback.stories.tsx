import {Meta, StoryObj} from "@storybook/react"
import {CommentSectionFallback} from "./CommentSectionFallback"

const meta: Meta<typeof CommentSectionFallback> = {
    component: CommentSectionFallback,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof CommentSectionFallback>;
export const Primary: Story = {};