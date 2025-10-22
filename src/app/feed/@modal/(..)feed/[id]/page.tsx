import React from "react";
import ClientPostModal from "./ClientPostModal";
import { CommentsContextProvider } from "@/context/CommentsContext";
import { getCommentsServer } from "@/services/getCommentsServer";

export default async function page({ params }) {
  const { id } = await params;
  const postId = Number(id);
  const response = await getCommentsServer(postId);
  return (
    <CommentsContextProvider response={response} postId={postId}>
      <ClientPostModal postId={postId} />
    </CommentsContextProvider>
  );
}
