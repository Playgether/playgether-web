import {Meta, StoryObj} from "@storybook/react"
import {EditCommentItens} from "./EditCommentItens"
import { EditCommentItensProps } from "./EditCommentItens";
import { action } from '@storybook/addon-actions';


const onClickEdit = () =>{
    return "Você clicou no button edit"
}

const onClickDelete = () => {
    return "Você clicou no button de delete"
}

const meta: Meta<typeof EditCommentItens> = {
    component: EditCommentItens,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<EditCommentItensProps>;

/** Perceba que funções diferentes são executadas em "Actions" ao clicar em cada icone */
export const Primary: Story = {
    args: {
        onClickEdit:action('Você clicou no button de editar'),
        onClickDelete:action('Você clicou no button de delete'),
    }
};
