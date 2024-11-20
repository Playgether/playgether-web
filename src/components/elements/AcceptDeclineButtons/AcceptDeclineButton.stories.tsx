import {Meta, StoryObj} from "@storybook/react"
import { action } from '@storybook/addon-actions';
import AcceptDeclineButtons from "./AcceptDeclineButtons";

const meta: Meta<typeof AcceptDeclineButtons> = {
    component: AcceptDeclineButtons,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs'],
}

export default meta;

type Story = StoryObj<typeof AcceptDeclineButtons>;
/** Formato padrão */
export const Primary: Story = {
    args: {
        acceptAction: () => {
            action("Ação aceita")();
        },
        declineAction: () => {
            action("Ação rejeitada")();
        },
    },
};
