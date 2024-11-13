import { Topic } from "./Topic";
import type {Meta, StoryObj} from "@storybook/react"
import { TopicProps } from "./Topic";


const meta: Meta<TopicProps> = {
    component: Topic,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<TopicProps>;

export const Default: Story = {
    args: {
        topic_category:"Notícia: ",
        topic:"Exemplo de uma notícia",     
    },
}
