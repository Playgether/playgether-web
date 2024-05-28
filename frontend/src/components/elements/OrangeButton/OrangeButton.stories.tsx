import {Meta, StoryObj} from "@storybook/react"
import OrangeButton from "./OrangeButton"
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof OrangeButton> = {
    component: OrangeButton,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof OrangeButton>;
/** Formato padrão */
export const Primary: Story = {
    args:{
        className:"py-10 px-16",
        children:"Button padrão"
    }
};

/** Perceba que a altura e a largura do button foram alteradas */
export const WithOtherSizes: Story = {
    args:{
        className:"py-4 px-8",
        children:"Com outros tamanhos"
    }
};

/** Perceba que nesta variação estamos passando o onClick do button, dessa forma que conseguimos controlar o que este button vai executar ao ser clicado (Você pode passar 
 * função para ele) */
    export const UsingOnClickToExecuteTheButton: Story = {
        args:{
            className:"py-4 px-8",
            children:"Executar button",
            onClick:action("Button executado")
        }
    };