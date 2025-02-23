"use client";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";
import ButtonClose from "../../../elements/ButtonClose/ButtonClose";

export const ClosePostExpand = () => {
  const { handlePostsCloseExtend } = useMiddleFeedContext();
  return (
    <div className="h-10 ">
      <ButtonClose className="h-full" onClick={handlePostsCloseExtend}>
        X
      </ButtonClose>
    </div>
  );
};
