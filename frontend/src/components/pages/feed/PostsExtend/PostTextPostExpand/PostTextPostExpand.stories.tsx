import {Meta, StoryObj} from "@storybook/react"
import {PostTextPostExpand} from "./PostTextPostExpand"

const meta: Meta<typeof PostTextPostExpand> = {
    component: PostTextPostExpand,
    parameters:{
        layout: 'centered'
    },
    tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof PostTextPostExpand>;
export const Primary: Story = {
    args:{
        text:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore quod error totam eligendi alias et fugiat vero dolor, ad, aliquid expedita illum assumenda fuga possimus, dicta aliquam? Natus, numquam!"
    }
};