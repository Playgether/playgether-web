import React from "react";
import ClientPostModal from "./ClientPostModal";
import { CommentsContextProvider } from "@/context/CommentsContext";
import { getCommentsServer } from "@/services/getCommentsServer";
import { isPublicId } from "@/lib/publicId";
import { notFound } from "next/navigation";

export default async function page({ params }) {
  const { id } = await params;
  if (!isPublicId(id)) notFound();
  const response = await getCommentsServer(id);
  return (
    <CommentsContextProvider response={response} postId={id}>
      <ClientPostModal postId={id} />
    </CommentsContextProvider>
  );
}
