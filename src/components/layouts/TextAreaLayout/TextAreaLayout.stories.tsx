import {Meta, StoryObj} from "@storybook/react"
import TextAreaLayout from "./TextAreaLayout"

const meta: Meta<typeof TextAreaLayout> = {
    component: TextAreaLayout,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof TextAreaLayout>;
export const Primary: Story = {
    args:{
        placeholder:"Edite o comentário",
        className:"h-40 bg-white-200 w-40 mb-3",
        textAreaClassName:"resize-none",
        maxRows:10,
    }
};