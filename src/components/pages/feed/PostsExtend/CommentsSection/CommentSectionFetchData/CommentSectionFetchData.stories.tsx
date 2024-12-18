import { Meta, StoryObj } from "@storybook/react";
import CommentSectionLogic, {
  CommentSectionLogicInterface,
} from "./CommentSectionFetchData";
import {
  ApiResponseComments,
  CommentsContext,
} from "../../../../../../context/CommentsContext";
import {
  PostCommentsOfCommentsProps,
  PostsCommentsProps,
} from "../../../../../../services/getComments";
import { CommentContentType } from "../../../../../content_types/CommentContentType";
import { AuthContext, UserProps } from "../../../../../../context/AuthContext";
import { loginUserProps } from "../../../../../../services/loginUser";
import { CommentsSection } from "../CommentsSectionLogic/CommentsSectionLogic";

const meta: Meta<typeof CommentSectionLogic> = {
  component: CommentSectionLogic,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

const mockCommentsLogin: PostsCommentsProps[] = [
  {
    comment: "Primeiro Comentário",
    user_already_like: false,
    content_type: CommentContentType.post,
    created_by_user_name: "David Matthew",
    created_by_user_photo:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    id: 3,
    quantity_likes: 23,
    quantity_comment: 0,
    timestamp: new Date("2024-05-29T10:30:00Z"),
    object_id: 2,
    user: 1,
    comments_of_comments: [],
  },
  {
    comment:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea fugiat autem dolorem, fugit fuga esse?",
    user_already_like: true,
    content_type: CommentContentType.post,
    created_by_user_name: "Mia Jensen",
    created_by_user_photo:
      "https://images.unsplash.com/photo-1614090965443-3df21c6906ec?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTR8fHxlbnwwfHx8fHw%3D",
    id: 2,
    quantity_likes: 45,
    quantity_comment: 0,
    timestamp: new Date("2024-05-29T10:30:00Z"),
    object_id: 1,
    user: 2,
    comments_of_comments: [],
  },
];

const UserContextMock = ({ children }) => {
  const mockUser: UserProps = {
    first_name: "Henry",
    last_name: "Johnson",
    user_id: 1,
    username: "henry_johnson",
  };

  const login = (mockLoginUserProps: loginUserProps) => {
    return new Promise<void>((resolve) => {
      resolve();
    });
  };

  const logout = () => {
    return;
  };

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        login: login,
        logout: logout,
        wrongPassword: null,
        authTokens: null,
        isLoggedOut: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const CommentsContextMockLogin = ({ children }) => {
  const mockComments: ApiResponseComments = {
    data: mockCommentsLogin,
  };

  const fetchComments = () => {};

  const deleteCommentContext = (deleteComment: PostsCommentsProps) => {};

  const editComment = (updatedComment: PostsCommentsProps) => {};

  const addAnswerComment = (
    objectId: number,
    answerComment: PostCommentsOfCommentsProps
  ) => {};

  const addNewComment = (newComment: PostsCommentsProps) => {
    mockCommentsLogin;
  };

  return (
    <CommentsContext.Provider
      value={{
        comments: mockComments,
        addAnswerComment: addAnswerComment,
        addNewComment: addNewComment,
        deleteCommentContext: deleteCommentContext,
        editComment: editComment,
        fetchComments: fetchComments,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

type Story = StoryObj<CommentSectionLogicInterface>;

export const Primary: Story = {
  render: CommentsSection,
  args: {},
  decorators: [
    (Story, args) => {
      return (
        <CommentsContextMockLogin>
          <UserContextMock>{Story()}</UserContextMock>
        </CommentsContextMockLogin>
      );
    },
  ],
};
