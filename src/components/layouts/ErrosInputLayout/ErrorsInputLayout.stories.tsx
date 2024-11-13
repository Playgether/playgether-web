import {Meta, StoryObj} from "@storybook/react"
import { ErrosInputProps, ErrosInput } from "./ErrorsInputLayout";

const meta: Meta<ErrosInputProps> = {
    component: ErrosInput,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<ErrosInputProps>;
export const Primary: Story = {};