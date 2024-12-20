import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { useCommentsContext } from "@/context/CommentsContext";
import { useCallback, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import PostPropertiersPostsExpand from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiers";
import EditedComment from "../EditedComment/EditedComment";
import { Comments } from "../Comments/Comments";
import { ExpandedComments } from "../ExpandComments/ExpandComments";
import React from "react";
import NoHaveCommentsYet from "../NoHaveCommentsYet/NoHaveCommentsYet";
import { NoHaveAnswersYet } from "../NoHaveAnswersYet/NoHaveAnswersYet";
import { BsArrowReturnRight } from "react-icons/bs";
import Answers from "../Answers";

/** Este componente é responsável por gerar toda a lógica de exibição da seção de comentários em PostsExpand, ou seja, fazer map nos comentários, exibir os componente corretos quando não houver
 * comentários ainda, etc...
 */
const VirtualizedComments = ({ post_id }: { post_id: number }) => {
  const [expandedComments, setExpandedComments] = useState({});
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
    setExpandedComments((prevExpandedComments) => ({
      ...prevExpandedComments,
      [commentId]: !prevExpandedComments[commentId],
    }));
  };
  return (
    <>
      {comments?.data.length > 0 ? (
        <Virtuoso
          increaseViewportBy={200}
          data={comments.data}
          endReached={loadMore}
          overscan={3}
          itemContent={(index, item) => (
            <>
              <div
                className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full pl-4 overflow-x-hidden"
                key={item.id}
              >
                <div className="w-full">
                  <div className="w-full flex justify-between mt-4 ">
                    <div className="w-full space-y-1">
                      <ProfileAndUsername
                        className="w-full "
                        profile_photo={item.created_by_user_photo}
                        username={item.created_by_user_name}
                        timestamp={item.timestamp}
                        usernameAndTimestampDiv="flex flex-row w-full justify-between pr-4"
                        imageClassName="h-6 w-6"
                      />
                      {item.edited === true ? <EditedComment /> : null}
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
                      {expandedComments[item.id] === true
                        ? "Ocultar Respostas"
                        : "Ver Respostas"}
                    </p>
                    <Answers item={item} expandedComments={expandedComments} />
                  </div>
                </div>
              </div>
            </>
          )}
        />
      ) : (
        <NoHaveCommentsYet />
      )}
    </>
  );
};

export default VirtualizedComments;
