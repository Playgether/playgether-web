import {Meta, StoryObj} from "@storybook/react"
import { action } from '@storybook/addon-actions';
import { ModalBackground, ModalBody, ModalProps } from "./ControlledModal"

const meta: Meta<typeof ModalBackground> = {
    component: ModalBackground,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<ModalProps>;
export const Primary: Story = {
    args: {
        children: <ModalBody onClick={action("Você clicou no body")}> Aqui é o modal body, (o children do ModalBackground recebe o ModalBody e o children do ModalBody
        recebe o conteúdo)</ModalBody>,
    }
};
