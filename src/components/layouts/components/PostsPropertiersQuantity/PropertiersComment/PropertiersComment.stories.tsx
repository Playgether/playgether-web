import PropertiersComment from "./PropertiersComment";
import type {Meta, StoryObj} from "@storybook/react"
import  PropertiersCommentProps  from "./PropertiersComment";


const meta: Meta<typeof PropertiersCommentProps> = {
    component: PropertiersComment,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof PropertiersCommentProps>;

/** Formato padrão */
export const Default: Story = {
    args: {
        quantity_comment:50,
    },
}

/** Perceba que o ícone de "comment" mudou de cor. */
export const WithIconClassName: Story = {
    args: {
        quantity_comment:50,
        iconClassName: "text-orange-500",
    },
}



