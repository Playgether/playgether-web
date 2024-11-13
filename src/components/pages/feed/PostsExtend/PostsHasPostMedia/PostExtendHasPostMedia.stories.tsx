import {Meta, StoryObj} from "@storybook/react"
import PostsExtendHasPostMedia from "./PostsExtendHasPostMedia"
import { PostsExtendHasPostMediaProps } from "./PostsExtendHasPostMedia";
import { FeedProps, PostLikes, PostMedias } from "../../../../../services/getFeed";
import { LikeContentType } from "../../../../content_types/LikeContentType";

const meta: Meta<typeof PostsExtendHasPostMedia> = {
    component: PostsExtendHasPostMedia,
    tags: ['autodocs']
}

export default meta;


const mockLikes:PostLikes[] = [
    {
        id:1,
        content_type: LikeContentType.post,
        created_by_user_name: "David Matthew",
        created_by_user_photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbiUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
        timestamp: new Date('2024-05-29T10:30:00Z'),
        object_id: 1,
        user: 2
    },
    {
        id:2,
        content_type: LikeContentType.post,
        created_by_user_name: "Raymond Junior",
        created_by_user_photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMHBpY3xlbnwwfHwwfHx8MA%3D%3D",
        timestamp: new Date('2024-05-29T10:30:00Z'),
        object_id: 1,
        user: 3
    }
] 

const mockMedias:PostMedias[] = [
    {
        id: 1,
        media_type: "image",
        position: 0,
        post: 1,
        media_file: "https://t4.ftcdn.net/jpg/06/10/26/15/360_F_610261529_vk9kf4ooTP5eSsQdOEyB4miRHn1YWCD1.jpg"
    }, 
    {
        id: 2,
        media_type: "image",
        position: 1,
        post: 1,
        media_file: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?ixlib=rb-4.0.3"
    },
    {
        id: 3,
        media_type: "image",
        position: 2,
        post: 1,
        media_file: "https://petapixel.com/assets/uploads/2022/12/what-is-unsplash.jpg"
    },

]
const mockPost:FeedProps = {
    comment: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugit ducimus quidem, fuga voluptatem dolore ad!",
    created_by_user: 1,
    created_by_user_name: "Lia Mensen",
    has_post_media:true,
    id:1,
    quantity_comment: 2,
    quantity_likes: 2,
    quantity_reposts: 0,
    quantity_visualization: 10,
    user_already_like:true,
    reposts: [],
    link: "www.test.com",
    timestamp: new Date('2024-05-29T10:30:00Z'),
    created_by_user_photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
    medias:mockMedias,
    likes: mockLikes
}

type Story = StoryObj<PostsExtendHasPostMediaProps>;
export const Primary: Story = {
    args: {
        resource:mockPost,
    }
};
