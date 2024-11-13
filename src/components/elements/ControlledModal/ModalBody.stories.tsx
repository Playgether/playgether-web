import {Meta, StoryObj} from "@storybook/react"
import { ModalBody} from "./ControlledModal"

const meta: Meta<typeof ModalBody> = {
    component: ModalBody,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof ModalBody>;
export const Primary: Story = {
    args: {
        children: <div> ESTE É UM EXEMPLO DE CONTEÚDO DO MODAL BODY</div>,
    }
};
