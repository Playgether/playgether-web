import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { useCommentsContext } from "@/context/CommentsContext";
import { useCallback, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import PostPropertiersPostsExpand from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiers";
import EditedComment from "../EditedComment/EditedComment";
import { Comments } from "../Comments/Comments";
import { ExpandedComments } from "../ExpandComments/ExpandComments";
import React from "react";
import NoHaveCommentsYet from "../NoHaveCommentsYet/NoHaveCommentsYet";
import { NoHaveAnswersYet } from "../NoHaveAnswersYet/NoHaveAnswersYet";
import { BsArrowReturnRight } from "react-icons/bs";

/** Este componente é responsável por gerar toda a lógica de exibição da seção de comentários em PostsExpand, ou seja, fazer map nos comentários, exibir os componente corretos quando não houver
 * comentários ainda, etc...
 */
const VirtualizedComments = ({ post_id }: { post_id: number }) => {
  const [expandedComments, setExpandedComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 0]);

  const {
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    comments,
    openAnswers,
    fetchNextAnswers,
  } = useCommentsContext();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleExpandComment = (commentId: number) => {
    if (!expandedComments[commentId]) {
      openAnswers(commentId);
    }
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Limita o estado ao intervalo visível
  useEffect(() => {
    setExpandedComments((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(
          ([commentId]) =>
            Number(commentId) >= visibleRange[0] &&
            Number(commentId) <= visibleRange[1]
        )
      )
    );
  }, [visibleRange]);

  return (
    <>
      {comments?.data.length > 0 ? (
        <Virtuoso
          increaseViewportBy={200}
          data={comments.data}
          endReached={loadMore}
          overscan={3}
          rangeChanged={({ startIndex, endIndex }) => {
            setVisibleRange([startIndex, endIndex]);
          }}
          itemContent={(index, item) => (
            <div
              className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full pl-4 overflow-x-hidden"
              key={item.id}
            >
              <div className="w-full">
                <div className="w-full flex justify-between mt-4">
                  <div className="w-full space-y-1">
                    <ProfileAndUsername
                      className="w-full"
                      profile_photo={item.created_by_user_photo}
                      username={item.created_by_user_name}
                      timestamp={item.timestamp}
                      usernameAndTimestampDiv="flex flex-row w-full justify-between pr-4"
                      imageClassName="h-6 w-6"
                    />
                    {item.edited && <EditedComment />}
                  </div>
                  <PostPropertiersPostsExpand
                    quantity_comment={item.quantity_comment}
                    quantity_likes={item.quantity_likes}
                    user_already_like={item.user_already_like}
                    object_id={item.id}
                  />
                </div>
                <div className="w-full flex flex-col items-start justify-start text-sm">
                  <Comments post_id={post_id} item={item} />
                  <p
                    className="text-blue-500 cursor-pointer text-xs pl-1 pt-2 h-10"
                    onClick={() => handleExpandComment(item.id)}
                  >
                    {expandedComments[item.id]
                      ? "Ocultar Respostas"
                      : "Ver Respostas"}
                  </p>
                  {expandedComments[item.id] && (
                    <div className="w-11/12 ml-auto flex flex-col items-start mb-3 bg-white-300 rounded-3xl p-4 mt-2 mr-2">
                      {item.answers.results.length > 0 ? (
                        <>
                          {item.answers.results.map((answer) => (
                            <ExpandedComments
                              comment_id={item.id}
                              answer={answer}
                              key={answer.id}
                            />
                          ))}
                          {item.answers.next && (
                            <div
                              className="flex gap-2 cursor-pointer text-blue-400"
                              onClick={() => fetchNextAnswers(item)}
                            >
                              <BsArrowReturnRight />
                              <p>Ver mais respostas</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <NoHaveAnswersYet />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      ) : (
        <NoHaveCommentsYet />
      )}
    </>
  );
};

export default VirtualizedComments;
