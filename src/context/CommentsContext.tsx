"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { PostsCommentsProps, getComments } from "../services/getComments";
import { commentProps } from "../services/postComment";
import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {} from "./AuthContext";
import { getAnswers } from "@/services/getAnswers";

export interface ApiResponseComments {
  data: PostsCommentsProps[];
}

type CommentsContextProps = {
  fetchNextAnswers?: (comment: PostsCommentsProps) => void;
  initializeComments: (postId: number) => void;
  comments: ApiResponseComments;
  addNewComment: (newComment: PostsCommentsProps) => void;
  openAnswers: (commentId: number, pageParam?: string) => void;
  editComment: (updatedComment: PostsCommentsProps) => void;
  deleteCommentContext: (Comment: commentProps) => void;
  deleteAnswerContext: (comment_id: number, answer_id: number) => void;
  addAnswerComment: (
    objectId: number,
    answerComment: PostsCommentsProps
  ) => void;
  editAnswerComment: (
    comment_id: number,
    answer_id: number,
    answerComment: PostsCommentsProps
  ) => void;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<
    InfiniteQueryObserverResult<
      InfiniteData<
        {
          data: any;
          next_page: any;
        },
        unknown
      >,
      Error
    >
  >;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

export const CommentsContext = createContext<CommentsContextProps>(
  {} as CommentsContextProps
);

export function CommentsContextProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<ApiResponseComments>({ data: [] });
  const [postId, setPostId] = useState<number>(0);
  // const { authTokens } = ();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed-comments", postId],
      queryFn: async ({ pageParam }) =>
        await getComments(authTokens, postId, pageParam),
      getNextPageParam: (lastPage) => {
        if (lastPage?.next_page) {
          const url = new URL(lastPage.next_page);
          return url.searchParams.get("cursor");
        }
        return null;
      },
      enabled: !!postId,
      initialPageParam: null,
    });

  const fetchNextAnswers = async (comment: PostsCommentsProps) => {
    const cursor = comment.answers.next
      ? new URL(comment.answers.next).searchParams.get("cursor")
      : null;
    const response = await getAnswers(authTokens, comment.id, cursor);
    setComments((prevComments) => {
      const commentsList = prevComments.data.map((c) => {
        if (c.id === comment.id) {
          const newComment = {
            ...c,
            answers: {
              results: [...(c.answers?.results || []), ...response.data],
              next: response.next_page,
              previous: response.previous_page,
            },
          };
          return newComment;
        }
        return c;
      });
      return {
        data: commentsList,
      };
    });
  };

  const openAnswers = async (commentId, pageParam = "") => {
    const comment = comments.data.find((c) => c.id === commentId);

    if (
      comment &&
      (!comment.answers || comment.answers.results.length === 0) &&
      comment.quantity_comment > 0
    ) {
      const response = await getAnswers(authTokens, commentId, pageParam);

      setComments((prevComments) => {
        const commentsList = prevComments.data.map((c) => {
          if (c.id === commentId) {
            c.answers = {
              previous: response.previous_page || "",
              next: response.next_page || "",
              results: response.data,
            };
          }
          return c;
        });

        return {
          data: commentsList,
        };
      });
    }
  };

  const initializeComments = (id: number) => {
    setPostId(id);
  };

  const addNewComment = (newComment: PostsCommentsProps) => {
    const newCommentEdited = {
      ...newComment,
      answers: {
        next_page: "",
        previous_page: "",
        results: [],
      },
    };
    setComments((prevState) => {
      return {
        ...prevState,
        data: [newCommentEdited, ...prevState.data],
      };
    });
  };

  const addAnswerComment = (
    objectId: number,
    answerComment: PostsCommentsProps
  ) => {
    setComments((prevComments) => {
      const commentsList = prevComments.data.map((comment) => {
        if (comment.id === objectId) {
          const newComment = {
            ...comment,
            quantity_comment: comment.quantity_comment + 1,
            answers: {
              ...comment.answers,
              results: [answerComment, ...comment.answers.results],
            },
          };
          return newComment;
        }
        return comment;
      });
      return {
        data: commentsList,
      };
    });
  };

  const editComment = (updatedComment: PostsCommentsProps) => {
    setComments((prevComments) => {
      const updatedComments = [...prevComments.data];
      const commentIndex = updatedComments.findIndex(
        (comment) => comment.id === updatedComment.id
      );

      if (commentIndex !== -1) {
        updatedComments[commentIndex].comment = updatedComment.comment;
      }

      return { data: updatedComments };
    });
  };

  const deleteCommentContext = (deleteComment: PostsCommentsProps) => {
    setComments((prevComments) => {
      const deleteComments = [...prevComments.data];
      const commentIndex = deleteComments.findIndex(
        (comment) => comment.id === deleteComment.id
      );

      if (commentIndex !== -1) {
        deleteComments.splice(commentIndex, 1);
      }
      return { data: deleteComments };
    });
  };

  const editAnswerComment = (
    comment_id: number,
    answer_id: number,
    answerComment: PostsCommentsProps
  ) => {
    setComments((prevComments) => {
      const commentsList = [...prevComments.data];
      const commentIndex = commentsList.findIndex(
        (comment) => comment.id === comment_id
      );

      if (commentIndex !== -1) {
        const answersComment = commentsList[commentIndex].answers.results;
        const answerIndex = answersComment.findIndex(
          (answer) => answer.id === answer_id
        );

        if (answerIndex !== -1) {
          answersComment[answerIndex] = answerComment;
        }
      }
      return { data: commentsList };
    });
  };

  const deleteAnswerContext = (comment_id: number, answer_id: number) => {
    setComments((prevComments) => {
      const listComments = [...prevComments.data];
      const commentIndex = listComments.findIndex(
        (comment) => comment.id === comment_id
      );

      if (commentIndex !== -1) {
        const listAnswers = listComments[commentIndex].answers.results;
        const answerIndex = listAnswers.findIndex(
          (answer) => answer.id === answer_id
        );
        if (answerIndex !== -1) {
          listAnswers.splice(answerIndex, 1);
          listComments[commentIndex].quantity_comment =
            listComments[commentIndex].quantity_comment - 1;
        }
      }
      return { data: listComments };
    });
  };
  useEffect(() => {
    setComments((prevComments) => ({
      data:
        data?.pages?.flatMap((page) =>
          page.data.map((item) => ({
            ...item,
            answers: { next_page: "", previous_page: "", results: [] },
          }))
        ) || [],
      next_page: data?.pages?.[data.pages.length - 1]?.next_page || null,
    }));
  }, [data]);

  return (
    <CommentsContext.Provider
      value={{
        comments: comments,
        addAnswerComment,
        deleteCommentContext,
        editComment,
        openAnswers,
        addNewComment,
        initializeComments,
        editAnswerComment,
        deleteAnswerContext,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
        fetchNextAnswers,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

const useCommentsContext = () => {
  const context = useContext(CommentsContext);
  return context;
};

export { useCommentsContext };
