import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine";

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
}
/** Este componente é responsável por gerar / expandir o texto de um post em PostsExtend */
export const PostTextPostExpand = ({
  text,
  showExpandButton,
  created_by_user_photo,
  created_by_user_name,
  timestamp,
}: PostTextPostExpandProps) => {
  const [isExtended, setIsExtended] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggle = () => {
    setIsExtended((prev) => !prev);
    setHasInteracted(true);
  };
  return (
    <>
      {isExtended ? (
        <div
          className={`absolute z-10 h-full flex flex-col w-full PostTextPostExpand-wrapper ${
            hasInteracted ? "animate-expandVertical" : ""
          }`}
        >
          <ProfileAndUsername
            profile_photo={created_by_user_photo}
            username={created_by_user_name}
            timestamp={timestamp}
            imageClassName="mt-3 ml-3 h-10 w-10"
            usernameAndTimestampDiv="self-end"
          />
          <BorderLine />
          <div className="pt-4 pl-4 pb-4 overflow-y-auto">
            <p className="whitespace-pre-wrap">{text}</p>
          </div>
          {showExpandButton ? (
            <div
              className="PostTextPostExpand-toggle sticky bottom-0 pl-4 cursor-pointer p-2 text-center gap-2 text-2xl flex items-end justify-center flex-1"
              onClick={handleToggle}
            >
              <p className="text-base">Esconder texto</p>
              <RiArrowUpSLine className="animate-bounce" />
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`w-full ${hasInteracted ? "animate-shrinkVertical" : ""}`}
        >
          {showExpandButton ? (
            <div
              className="text-blue-400  pl-4 cursor-pointer p-2 text-center text-2xl flex gap-2 items-center justify-center"
              onClick={handleToggle}
            >
              <p className="text-base">Ver texto</p>
              <RiArrowDownSLine className="animate-bounce" />
            </div>
          ) : (
            <div className="pt-4 pl-4 pb-4">
              <p>{text}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
