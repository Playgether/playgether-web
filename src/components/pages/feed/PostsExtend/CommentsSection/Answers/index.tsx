import React from "react";
import { ExpandedComments } from "../ExpandComments/ExpandComments";
import { BsArrowReturnRight } from "react-icons/bs";
import { NoHaveAnswersYet } from "../NoHaveAnswersYet/NoHaveAnswersYet";
import { useCommentsContext } from "@/context/CommentsContext";

export const Answers = ({ expandedComments, item }) => {
  const { fetchNextAnswers } = useCommentsContext();
  return (
    <>
      {expandedComments[item.id] && (
        <div className="w-11/12 ml-auto flex flex-col items-start mb-3 Answers-wrapper rounded-3xl p-4 mt-2 mr-2">
          {item.answers.results.length > 0 ? (
            <>
              {item.answers.results.map((answer) => (
                <React.Fragment key={answer.id}>
                  {expandedComments && (
                    <ExpandedComments
                      comment_id={item.id}
                      answer={answer}
                      key={answer.id}
                    />
                  )}
                </React.Fragment>
              ))}
              {item.answers.next && (
                <div
                  className="flex gap-2 text- cursor-pointer VirtualizedComments-expand"
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
    </>
  );
};

export default Answers;
