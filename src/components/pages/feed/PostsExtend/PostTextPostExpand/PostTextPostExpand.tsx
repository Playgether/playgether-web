"use client";
import HideTextButton from "./HideTextButton";
import ExpandTextButton from "./ExpandTextButton";
import ShowPostText from "./ShowPostText";
import PhotoAndText from "./PhotoAndText";
import { FeedProps } from "@/services/getFeed";

export interface PostTextPostExpandProps {
  /** Este é o texto do post propriamente dito */
  text: string;
  /** Esta variável também é uma string que recebe o link de url da foto de perfil */
  created_by_user_photo: string;
  /** Esta variável é uma string que recebe o username do usuário */
  created_by_user_name: string;
  /** Esta também é uma variável opcional onde você pode passar datas no tipo Date caso precise adicionar datas. Este componente utiliza o react-time-ago, que é uma biblioteca
   * que faz um cálculo com a data atual, gerando a quanto tempo foi o post (Exemplo: á 5 horas / mês ...)
   */
  timestamp?: Date;
  /** Esta propriedade recebe um boolean (true ou false) para mostrar ou não um button para expandir a div que possui o texto (ela recebe um absolute z-10 h-full) */
  showExpandButton: boolean;
  /** Esta propriedade recebe um boolean que define se o texto esta expandido ou não */
  isExtended: boolean;
  /** Esta propriedade recebe um boolean que define se o usuário interagiu com o texto para então aplicar uma animação */
  hasInteracted: boolean;
  /** Esta propriedade recebe uma função que gerencia o toggle para exibir o texto ou não */
  handleToggle: () => void;

  resourceObject: FeedProps | undefined;
}
/** Este componente é responsável por gerar / expandir o texto de um post em PostsExtend */
export const PostTextPostExpand = ({
  text,
  showExpandButton,
  isExtended,
  hasInteracted,
  handleToggle,
  resourceObject,
}: PostTextPostExpandProps) => {
  return (
    <>
      {isExtended ? (
        <div
          className={`absolute z-10 h-full flex flex-col w-full PostTextPostExpand-wrapper ${
            hasInteracted ? "animate-expandVertical" : ""
          }`}
        >
          {resourceObject && (
            <PhotoAndText
              created_by_user_photo={resourceObject.created_by_user_photo}
              created_by_user_name={resourceObject.created_by_user_name}
              timestamp={resourceObject.timestamp}
              text={resourceObject.comment}
            />
          )}
          {showExpandButton ? (
            <HideTextButton handleToggle={handleToggle} />
          ) : null}
        </div>
      ) : (
        <div
          className={`w-full ${hasInteracted ? "animate-shrinkVertical" : ""}`}
        >
          {showExpandButton ? (
            <ExpandTextButton handleToggle={handleToggle} />
          ) : (
            <ShowPostText text={text} />
          )}
        </div>
      )}
    </>
  );
};
