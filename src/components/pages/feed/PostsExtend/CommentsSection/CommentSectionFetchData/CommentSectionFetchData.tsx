import { getComments } from "@/services/getComments";
import { useCommentsContext } from "../../../../../../context/CommentsContext";
import VirtualizedComments from "../VirtualizedComments/VirtualizedComments";


export interface Props {
  params?: { username: string };
}
// async function fetchData() {
//   // const { initializeComments } = useCommentsContext();
//   // initializeComments(postId);
//   console.log(postId);
// }

export interface CommentSectionLogicInterface {
  /**  Esta prop recebe o número do post em que você quer dar o get nos comentários */
  postId: number;
}

/** Este componente é responsável apenas por acionar a função "fetchComments" em "useCommentsContext". Seu intuito é servir como uma função assíncrona que espera os comentários
 * serem carregados para só depois mostras a aba de comentários, o seu return é o próprio CommentsSection, ele é apenas para servir como uma função assíncrona que espera a
 * requisição afim de ser possível ver o fallback do Suspense. Neste caso CommentsSection esta retornando o componente "NoCommentsYet" porque nós não estamos fazendo uma
 * para o backend."
 */


// const CommentSectionFetchData = async ({
//   postId,
// }: CommentSectionLogicInterface) => {
//   await fetchData(postId);

//   return <VirtualizedComments post_id={postId} />;
// };

// export default CommentSectionFetchData;

export default async function CommentSectionFetchData({postId}) {
  // const response = await getComments(postId);
  // console.log(response)
  // await fetchData(postId);
  return <VirtualizedComments post_id={postId} />;
}