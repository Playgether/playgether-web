import ProfileImagePost from "./ProfileImagePost";
import type {Meta, StoryObj} from "@storybook/react"
import { Resource } from "./ProfileImagePost";


const meta: Meta<Resource> = {
    component: ProfileImagePost,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof ProfileImagePost>;

export const Default: Story = {
    args: {
        className: "h-20 w-20",
        link_photo: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"  
    },
}


/** Perceba que a imagem some, quando não é passado o width e o height */
export const WithoutHeighAndWidth: Story = {
    args: {
        link_photo: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"  
    },
}

