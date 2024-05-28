import {Meta, StoryObj} from "@storybook/react"
import ButtonClose from "./ButtonClose"
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof ButtonClose> = {
    component: ButtonClose,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs'],
}

export default meta;

type Story = StoryObj<typeof ButtonClose>;
/** Formato padrão */
export const Primary: Story = {
    args:{
        children: "X",
    }
};

/** Perceba que a altura e a largura do button foram alteradas, atingimos isso passando o className para o componente */
export const WithOtherSizes: Story = {
    args:{
        children: "X",
        className:"px-8 py-4"
    }
};

/** Perceba que nesta variação estamos passando o onClick do button, dessa forma que conseguimos controlar o que este button vai executar ao ser clicado 
 * (Você pode passar função para ele), você pode ver o resultado em "Actions""*/
export const UsingOnClickToExecuteTheButton: Story = {
    args:{
        children: "X",
        onClick: action("Você clicou no X")
    }
};
