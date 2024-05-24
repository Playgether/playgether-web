import {NotificationWrapper} from "./NotificationWrapper";
import type {Meta, StoryObj} from "@storybook/react"
import { NotificationWrapperProps } from "./NotificationWrapper";


const meta: Meta<NotificationWrapperProps> = {
    component: NotificationWrapper,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<NotificationWrapperProps>;

export const Default: Story = {
    args: {
        title:"David Matthew",
        profile_photo: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
        text:"entrou para o mesmo clã que você.",    
    },
}

