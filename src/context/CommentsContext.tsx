"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useInfiniteQuery,
  InfiniteData,
  InfiniteQueryObserverResult,
  FetchNextPageOptions,
} from "@tanstack/react-query";
import { PostsCommentsProps, getCommentsClient } from "@/services/getComments";
import { getAnswers } from "@/services/getAnswers";

export interface ApiResponseComments {
  data: PostsCommentsProps[];
  next_page?: string | null;
  previous_page?: string | null;
}

type CommentsContextProps = {
  comments: ApiResponseComments;
  addNewComment: (newComment: PostsCommentsProps) => void;
  addAnswerComment: (
    objectId: number,
    answerComment: PostsCommentsProps,
  ) => void;
  editComment: (updatedComment: PostsCommentsProps) => void;
  deleteCommentContext: (comment: number) => void;
  openAnswers: (commentId: number, pageParam?: string) => Promise<void>;
  decreaseRepliesCount: (comment: number) => void;
  editAnswerComment: (
    comment_id: number,
    answer_id: number,
    answerComment: PostsCommentsProps,
  ) => void;
  deleteAnswerContext: (comment_id: number, answer_id: number) => void;
  handleLikeComment: (id: number) => void;
  handleLikeAny: (id: number, parentId?: number) => void;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<any> | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextAnswers: (comment: PostsCommentsProps) => Promise<void>;
  isFecthingNextAnswers: boolean;
};

const CommentsContext = createContext<CommentsContextProps | undefined>(
  undefined,
);

export { CommentsContext };

export function CommentsContextProvider({
  children,
  response,
  postId,
}: {
  children: ReactNode;
  response: ApiResponseComments;
  postId: number;
}) {
  const [comments, setComments] = useState<ApiResponseComments>(response);
  const [isFecthingNextAnswers, setIsFecthingNextAnswers] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage = false,
  } = useInfiniteQuery<ApiResponseComments>({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) =>
      getCommentsClient(postId, pageParam as string | null | undefined),
    getNextPageParam: (lastPage) => {
      if (lastPage?.next_page) {
        try {
          const url = new URL(lastPage.next_page);
          return url.searchParams.get("cursor");
        } catch {
          return null;
        }
      }
      return null;
    },
    enabled: false, // 🚫 nunca faz fetch automático
    retry: false, // 🚫 nunca tenta novamente se falhar
    initialPageParam: null, // obrigatório
    initialData: {
      pageParams: [null],
      pages: [response],
    },
  });

  // Atualiza o estado local quando novas páginas são carregadas manualmente
  useEffect(() => {
    if (data) {
      const merged = data.pages.flatMap((p) => p.data);

      setComments((prev) => {
        // mantém os dados locais (respostas carregadas, etc)
        const existingMap = new Map(prev.data.map((c) => [c.id, c]));

        for (const comment of merged) {
          // Se já existe no local, preserva campos mutados (answers, etc)
          const existing = existingMap.get(comment.id);
          if (existing?.answers) {
            comment.answers = existing.answers;
          }
          existingMap.set(comment.id, { ...existing, ...comment });
        }

        return {
          data: Array.from(existingMap.values()),
          next_page: data.pages.at(-1)?.next_page ?? null,
        };
      });
    }
  }, [data]);

  // ===================== FUNÇÕES ===================== //

  // Like otimista para comentário OU reply
  const handleLikeAny = (id: number, parentId?: number) => {
    setComments((prev) => ({
      ...prev,
      data: prev.data.map((comment) => {
        // Se for comentário principal
        if (!parentId && comment.id === id) {
          const newUserAlreadyLike = !comment.user_already_like;
          return {
            ...comment,
            user_already_like: newUserAlreadyLike,
            quantity_likes: newUserAlreadyLike
              ? comment.quantity_likes + 1
              : Math.max(0, comment.quantity_likes - 1),
          };
        }
        // Se for reply
        if (parentId && comment.id === parentId && comment.answers?.results) {
          return {
            ...comment,
            answers: {
              ...comment.answers,
              results: comment.answers.results.map((reply) => {
                if (reply.id !== id) return reply;
                const newUserAlreadyLike = !reply.user_already_like;
                return {
                  ...reply,
                  user_already_like: newUserAlreadyLike,
                  quantity_likes: newUserAlreadyLike
                    ? reply.quantity_likes + 1
                    : Math.max(0, reply.quantity_likes - 1),
                };
              }),
            },
          };
        }
        return comment;
      }),
    }));
  };

  // Mantém função antiga para compatibilidade
  const handleLikeComment = (postId: number) => handleLikeAny(postId);

  const fetchNextAnswers = async (comment: PostsCommentsProps) => {
    setIsFecthingNextAnswers(true);
    try {
      const cursor = comment.answers?.next
        ? new URL(comment.answers.next).searchParams.get("cursor")
        : null;

      if (!cursor) {
        setIsFecthingNextAnswers(false);
        return;
      }

      const res = await getAnswers(comment.id, cursor);

      setComments((prev) => ({
        data: prev.data.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                answers: {
                  previous: res.previous_page || "",
                  next: res.next_page || "",
                  results: [...(c.answers?.results || []), ...res.data],
                },
              }
            : c,
        ),
      }));
    } catch (error) {
      console.error("Erro ao carregar mais respostas:", error);
    } finally {
      setIsFecthingNextAnswers(false);
    }
  };
  const openAnswers = async (commentId: number, pageParam = "") => {
    setIsFecthingNextAnswers(true);
    const comment = comments.data.find((c) => c.id === commentId);
    if (
      comment &&
      (!comment.answers || (comment.answers.results ?? []).length === 0) &&
      comment.quantity_comment > 0
    ) {
      const res = await getAnswers(commentId, pageParam);
      setComments((prev) => ({
        data: prev.data.map((c) =>
          c.id === commentId
            ? {
                ...c,
                answers: {
                  previous: res.previous_page || "",
                  next: res.next_page || "",
                  results: res.data,
                },
              }
            : c,
        ),
      }));
    }
    setIsFecthingNextAnswers(false);
  };

  const decreaseRepliesCount = (commentId: number) => {
    setComments((prev) => ({
      data: prev.data.map((c) =>
        c.id === commentId
          ? { ...c, quantity_replies: (c.quantity_replies || 1) - 1 }
          : c,
      ),
    }));
  };

  const addNewComment = (newComment: PostsCommentsProps) => {
    setComments((prev) => ({
      ...prev,
      data: [
        {
          ...newComment,
          answers: { next_page: "", previous_page: "", results: [] } as any,
        },
        ...prev.data,
      ],
    }));
  };

  const addAnswerComment = (
    objectId: number,
    answerComment: PostsCommentsProps,
  ) => {
    setComments((prev) => ({
      data: prev.data.map((c) =>
        c.id === objectId
          ? {
              ...c,
              quantity_replies: (c.quantity_replies || 0) + 1,
              answers: {
                ...c.answers,
                results: [answerComment, ...(c.answers?.results || [])],
              },
            }
          : c,
      ),
    }));
  };

  const editComment = (updatedComment: PostsCommentsProps) => {
    setComments((prev) => ({
      data: prev.data.map((c) =>
        c.id === updatedComment.id
          ? { ...c, comment: updatedComment.comment }
          : c,
      ),
    }));
  };

  const deleteCommentContext = (idComment: number) => {
    setComments((prev) => ({
      data: prev.data.filter((c) => c.id !== idComment),
    }));
  };

  const editAnswerComment = (
    comment_id: number,
    answer_id: number,
    answerComment: PostsCommentsProps,
  ) => {
    setComments((prev) => ({
      data: prev.data.map((c) =>
        c.id === comment_id
          ? {
              ...c,
              quantity_replies: Math.max(0, (c.quantity_replies || 1) - 1),
              answers: {
                ...(c.answers || {}),
                results: (c.answers?.results || []).map((a) =>
                  a.id === answer_id ? answerComment : a,
                ),
              },
            }
          : c,
      ),
    }));
  };

  const deleteAnswerContext = (comment_id: number, answer_id: number) => {
    setComments((prev) => ({
      data: prev.data.map((c) =>
        c.id === comment_id
          ? {
              ...c,
              answers: {
                ...(c.answers || {}),
                results: (c.answers?.results || []).filter(
                  (a) => a.id !== answer_id,
                ),
              },
            }
          : c,
      ),
    }));
  };

  const fetchNextPageOrNull =
    fetchNextPage ??
    (async () =>
      null as unknown as InfiniteQueryObserverResult<
        InfiniteData<{ data: PostsCommentsProps[]; next_page: string | null }>,
        Error
      >);

  // ===================== PROVIDER ===================== //

  return (
    <CommentsContext.Provider
      value={{
        comments,
        addNewComment,
        addAnswerComment,
        editComment,
        deleteCommentContext,
        openAnswers,
        editAnswerComment,
        deleteAnswerContext,
        handleLikeComment,
        handleLikeAny,
        fetchNextPage: fetchNextPageOrNull,
        hasNextPage,
        isFetchingNextPage,
        fetchNextAnswers,
        isFecthingNextAnswers,
        decreaseRepliesCount,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export function useCommentsContext() {
  const ctx = useContext(CommentsContext);
  if (!ctx)
    throw new Error(
      "useCommentsContext must be used within CommentsContextProvider",
    );
  return ctx;
}
