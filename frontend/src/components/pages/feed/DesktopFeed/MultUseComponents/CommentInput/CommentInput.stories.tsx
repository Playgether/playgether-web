import { Meta, StoryObj } from "@storybook/react"
import CommentInput from "./CommentInput"
import { CommentProps } from "./CommentInput"

const meta:Meta<typeof CommentInput> = {
    component:CommentInput,
    tags:['autodocs'],
    parameters:{
        layout:'centered'
    }
}

export default meta

type Story = StoryObj<CommentProps>;

export const Primary:Story = {
    args:{
        id: 1
    }
}
