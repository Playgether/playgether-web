import PostText from "./PostText";
import {Meta, StoryObj} from "@storybook/react"
import { PostTextProps } from "./PostText";

const mockPost = {
    created_by_user: "test_user",
    created_by_user_name: "David Matthew",
    created_by_user_photo: "",
    likes: "",
    reposts: "",
    medias: "",
    id: "", 
    timestamp: "",
    quantity_visualization: "",
    quantity_comment: "",
    quantity_likes: "",
    quantity_reposts: "",
    comment: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aperiam asperiores voluptas sed! Cum mollitia modi beatae quam. Commodi placeat a, neque molestiae rem tenetur. Suscipit, sapiente explicabo temporibus nobis est eveniet debitis vel veritatis nam aliquid, consequatur quia ipsa. Optio perspiciatis deleniti doloribus nisi iste molestiae, excepturi nobis laborum non atque numquam quod debitis suscipit vitae fugit error, accusamus eos aliquid dolorum inventore ut? Illo id a maxime rerum, odio porro quo tempore esse accusamus in. Harum eligendi qui vero tenetur aperiam nihil aliquid expedita, quos ratione repellat maxime consectetur.",
    has_post_media: "",
    link: "",
    user_already_like: "",
}

const meta:Meta<PostTextProps>={
    component:PostText,
    tags:['autodocs'],
    parameters:{
        layout:"centered",
    },
}

export default meta

type Story = StoryObj<PostTextProps>;

/** Perceba que o texto esta sendo limitado em 500 caracteres, você pode limitar na quantidade que desejar */
export const Default:Story = {
    args:{
        maxCharacteres:500,
        resource:mockPost
    }
}