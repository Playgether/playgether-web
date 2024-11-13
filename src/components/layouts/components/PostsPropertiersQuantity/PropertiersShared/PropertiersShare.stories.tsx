import PropertiersShare from "./PropertiersShare";
import type {Meta, StoryObj} from "@storybook/react"
import  PropertiersShareProps  from "./PropertiersShare";


const meta: Meta<typeof PropertiersShareProps> = {
    component: PropertiersShare,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof PropertiersShareProps>;

/** Formato padrão */
export const Default: Story = {
    args: {
        quantity_reposts:50,
    },
}

/** Perceba que o ícone de "comment" mudou de cor. */
export const WithIconClassName: Story = {
    args: {
        quantity_reposts:50,
        iconClassName: "text-orange-500",
    },
}



