import type {Meta, StoryObj} from "@storybook/react"
import { BorderLine } from "./BorderLine";


const meta: Meta<typeof BorderLine> = {
    component: BorderLine,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof BorderLine>;

/** Formato padrão */
export const Default: Story = {
    args:{
        className:"bg-green-300 h-20 w-20 border-b-8"
    }
}

/** Perceba que a borda inferior diminuiu */
export const WithBorderSmaller: Story = {
    args:{
        className:"bg-green-300 h-20 w-20 border-b-4"
    }
}

