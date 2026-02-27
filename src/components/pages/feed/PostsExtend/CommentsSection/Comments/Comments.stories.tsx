import { Meta, StoryObj } from "@storybook/react";
import { Comments } from "./Comments";
import { CommentsProps } from "./Comments";
import { PostsCommentsProps } from "../../../../../../services/getComments";
import { CommentContentType } from "../../../../../content_types/CommentContentType";

const mockComment: PostsCommentsProps = {
  id: 1,
  created_by_user_name: "David Matthew",
  quantity_likes: 55,
  quantity_comment: 2,
  object_id: 1,
  content_type: CommentContentType.post,
  comment:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea fugiat autem dolorem, fugit fuga esse?",
  timestamp: new Date("2024-05-29T10:30:00Z"),
  user_already_like: true,
  user: 1,
  created_by_user_photo:
    "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
  answers: { next: "", previous: "", results: [] },
  edited: false,
  quantity_replies: 0,
  user_username: "david_matthew",
};

const meta: Meta<typeof Comments> = {
  component: Comments,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<CommentsProps>;
export const Primary: Story = {
  args: {
    item: mockComment,
  },
};
