"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { PostsCommentsProps, getComments } from "@/services/getComments";
import { getAnswers } from "@/services/getAnswers";
import { useAuthContext } from "@/context/AuthContext";
import {
  useInfiniteQuery,
  InfiniteData,
  InfiniteQueryObserverResult,
  FetchNextPageOptions,
} from "@tanstack/react-query";

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
    answerComment: PostsCommentsProps
  ) => void;
  editComment: (updatedComment: PostsCommentsProps) => void;
  deleteCommentContext: (comment: PostsCommentsProps) => void;
  openAnswers: (commentId: number, pageParam?: string) => Promise<void>;
  editAnswerComment: (
    comment_id: number,
    answer_id: number,
    answerComment: PostsCommentsProps
  ) => void;
  deleteAnswerContext: (comment_id: number, answer_id: number) => void;
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
  > | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextAnswers?: (comment: PostsCommentsProps) => Promise<void>;
};

const CommentsContext = createContext<CommentsContextProps | undefined>(
  undefined
);

export function CommentsContextProvider({
  children,
  response,
  postId: initialPostId,
}: {
  children: ReactNode;
  /**
   * `response` pode ser:
   * - ApiResponseComments (com { data: [...] })
   * - ou diretamente PostsCommentsProps[] (quando você passa response.data)
   */
  response?: ApiResponseComments | PostsCommentsProps[];
  postId?: number; // opcional — se não fornecer, não faremos fetch automático
}) {
  // Normaliza response para ApiResponseComments
  const normalizeResponse = (
    r?: ApiResponseComments | PostsCommentsProps[]
  ) => {
    if (!r) return undefined;
    if (Array.isArray(r)) return { data: r };
    return r;
  };

  const initialResponse = normalizeResponse(response);

  const [comments, setComments] = useState<ApiResponseComments>(
    initialResponse ?? { data: [] }
  );

  const [postId, setPostId] = useState<number | null>(
    typeof initialPostId === "number" ? initialPostId : null
  );

  const { authTokens } = useAuthContext();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: async ({ pageParam }) => {
        // somente será chamado quando postId estiver definido (enabled abaixo)
        return await getComments(postId!, pageParam);
      },
      getNextPageParam: (lastPage) => {
        if (lastPage?.next_page) {
          try {
            const url = new URL(String(lastPage.next_page));
            return url.searchParams.get("cursor");
          } catch {
            return null;
          }
        }
        return null;
      },
      enabled: !!postId, // se não houver postId, a query fica desabilitada
      initialPageParam: null,
    });

  // Se o provider recebeu comentários do server, inicializa com eles.
  // Só aplica quando não há páginas carregadas pela query (evita sobrescrever).
  useEffect(() => {
    if (initialResponse && (!data || data.pages?.length === 0)) {
      setComments(initialResponse);
      if (typeof initialPostId === "number") setPostId(initialPostId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, initialPostId]);

  // Quando a query carregar páginas, sincroniza para o estado local.
  useEffect(() => {
    if (!data) return; // importante: evita sobrescrever com vazio
    const merged = data.pages.flatMap((page) =>
      page.data.map((item: any) => ({
        ...item,
        answers:
          item.answers ??
          ({
            next_page: "",
            previous_page: "",
            results: [],
          } as any),
      }))
    );
    setComments({
      data: merged,
      next_page: data.pages?.[data.pages.length - 1]?.next_page ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const fetchNextAnswers = async (comment: PostsCommentsProps) => {
    const cursor = comment.answers?.next
      ? new URL(comment.answers.next).searchParams.get("cursor")
      : null;
    const response = await getAnswers(authTokens, comment.id, cursor);
    setComments((prev) => {
      const list = prev.data.map((c) => {
        if (c.id === comment.id) {
          return {
            ...c,
            answers: {
              previous: response.previous_page || "",
              next: response.next_page || "",
              results: [...(c.answers?.results || []), ...response.data],
            },
          };
        }
        return c;
      });
      return { data: list };
    });
  };

  const openAnswers = async (commentId: number, pageParam = "") => {
    const comment = comments.data.find((c) => c.id === commentId);
    if (
      comment &&
      (!comment.answers || (comment.answers.results ?? []).length === 0) &&
      comment.quantity_comment > 0
    ) {
      const response = await getAnswers(authTokens, commentId, pageParam);
      setComments((prev) => {
        const list = prev.data.map((c) =>
          c.id === commentId
            ? {
                ...c,
                answers: {
                  previous: response.previous_page || "",
                  next: response.next_page || "",
                  results: response.data,
                },
              }
            : c
        );
        return { data: list };
      });
    }
  };

  const addNewComment = (newComment: PostsCommentsProps) => {
    const normalized: PostsCommentsProps = {
      ...newComment,
      answers: {
        next_page: "",
        previous_page: "",
        results: [],
      } as any,
    };
    setComments((prev) => ({ ...prev, data: [normalized, ...prev.data] }));
  };

  const addAnswerComment = (
    objectId: number,
    answerComment: PostsCommentsProps
  ) => {
    setComments((prev) => {
      const list = prev.data.map((c) =>
        c.id === objectId
          ? {
              ...c,
              quantity_comment: (c.quantity_comment || 0) + 1,
              answers: {
                ...c.answers,
                results: [answerComment, ...(c.answers?.results || [])],
              },
            }
          : c
      );
      return { data: list };
    });
  };

  const editComment = (updatedComment: PostsCommentsProps) => {
    setComments((prev) => {
      const list = [...prev.data];
      const idx = list.findIndex((c) => c.id === updatedComment.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], comment: updatedComment.comment };
      }
      return { data: list };
    });
  };

  const deleteCommentContext = (deleteComment: PostsCommentsProps) => {
    setComments((prev) => {
      const list = prev.data.filter((c) => c.id !== deleteComment.id);
      return { data: list };
    });
  };

  const editAnswerComment = (
    comment_id: number,
    answer_id: number,
    answerComment: PostsCommentsProps
  ) => {
    setComments((prev) => {
      const list = prev.data.map((c) => {
        if (c.id !== comment_id) return c;
        const answers = (c.answers?.results || []).map((a) =>
          a.id === answer_id ? answerComment : a
        );
        return {
          ...c,
          answers: { ...(c.answers || {}), results: answers } as any,
        };
      });
      return { data: list };
    });
  };

  const deleteAnswerContext = (comment_id: number, answer_id: number) => {
    setComments((prev) => {
      const list = prev.data.map((c) => {
        if (c.id !== comment_id) return c;
        const answers = (c.answers?.results || []).filter(
          (a) => a.id !== answer_id
        );
        return {
          ...c,
          quantity_comment: (c.quantity_comment || 1) - 1,
          answers: { ...(c.answers || {}), results: answers } as any,
        };
      });
      return { data: list };
    });
  };

  // If react-query fetchNextPage is available use it, otherwise return null
  const fetchNextPageOrNull = fetchNextPage ?? (async () => null);

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
        fetchNextPage: fetchNextPageOrNull,
        hasNextPage: !!hasNextPage,
        isFetchingNextPage: !!isFetchingNextPage,
        fetchNextAnswers,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export function useCommentsContext() {
  const ctx = useContext(CommentsContext);
  if (!ctx) {
    throw new Error(
      "useCommentsContext must be used within CommentsContextProvider"
    );
  }
  return ctx;
}
