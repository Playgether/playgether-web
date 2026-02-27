import { Meta, StoryObj } from "@storybook/react";
import { ExpandedComments } from "./ExpandComments";
import { ExpandedCommentsProps } from "./ExpandComments";
import { PostsCommentsProps } from "../../../../../../services/getComments";
import { CommentContentType } from "../../../../../content_types/CommentContentType";

const meta: Meta<typeof ExpandedComments> = {
  component: ExpandedComments,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

const mockCommentsOfComments: PostsCommentsProps[] = [
  {
    comment: "Comment of a comment test 1",
    user_already_like: false,
    content_type: CommentContentType.comment,
    created_by_user_name: "David Matthew",
    created_by_user_photo:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    id: 3,
    quantity_likes: 23,
    quantity_comment: 0,
    timestamp: new Date("2024-05-29T10:30:00Z"),
    object_id: 2,
    user: 1,
    answers: { next: "", previous: "", results: [] },
    edited: false,
    quantity_replies: 0,
    user_username: "david_matthew",
  },
  {
    comment:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea fugiat autem dolorem, fugit fuga esse?",
    user_already_like: true,
    content_type: CommentContentType.comment,
    created_by_user_name: "Mia Jensen",
    created_by_user_photo:
      "https://images.unsplash.com/photo-1614090965443-3df21c6906ec?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTR8fHxlbnwwfHx8fHw%3D",
    id: 2,
    quantity_likes: 45,
    quantity_comment: 0,
    timestamp: new Date("2024-05-29T10:30:00Z"),
    object_id: 1,
    user: 1,
    answers: { next: "", previous: "", results: [] },
    edited: false,
    quantity_replies: 0,
    user_username: "mia_jensen",
  },
];

const CommentOfCommentComponent = (args) => {
  return (
    <div>
      {mockCommentsOfComments.map((comment) => (
        <div key={comment.id}>
          <ExpandedComments answer={comment} comment_id={1} key={comment.id} />
        </div>
      ))}
    </div>
  );
};

type Story = StoryObj<ExpandedCommentsProps>;
export const Primary: Story = {
  render: CommentOfCommentComponent,
};
