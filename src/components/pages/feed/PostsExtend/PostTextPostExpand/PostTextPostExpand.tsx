"use client";
import HideTextButton from "./HideTextButton";
import ExpandTextButton from "./ExpandTextButton";
import ShowPostText from "./ShowPostText";
import PhotoAndText from "./PhotoAndText";
import { FeedProps } from "../../../../../types/FeedProps";
import {motion, AnimatePresence} from "framer-motion";

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

      {/* <AnimatePresence>
        {shouldShow && (
          <motion.div
            className="absolute z-10 left-20 min-w-[50vw] top-0 h-[calc(100vh-160px)] flex motion-preset-slide-right-sm"
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {children}
            <ButtonClose
              className="h-10 mt-2"
              onClick={() => setShouldShow(false)}
            >
              X
            </ButtonClose>
          </motion.div>
        )}
      </AnimatePresence> */}
      {/* <AnimatePresence>
        {isExtended ? (
          <motion.div
            initial={{ height: isExtended ? "30%" : "100%" }}
            animate={{ height: isExtended ? "100%" : "30%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
          </motion.div>
        ) : (
          <motion.div
            className={`w-full ${hasInteracted ? "animate-shrinkVertical" : ""}`}
          >
            {showExpandButton ? (
              <ExpandTextButton handleToggle={handleToggle} />
            ) : (
              <ShowPostText text={text} />
            )}
          </motion.div>
        )}
      </AnimatePresence> */}
      <AnimatePresence>
        {isExtended ? (
          <motion.div 
          className="absolute z-10 h-full flex flex-col w-full PostTextPostExpand-wrapper animate-expandVertical"
          exit={{ animation: "animate-shrinkVertical" }}
          transition={{ type: "tween", duration: 0.3 }}
          >
           {resourceObject && (
              <PhotoAndText
                created_by_user_photo={resourceObject.created_by_user_photo}
                created_by_user_name={resourceObject.created_by_user_name}
                timestamp={resourceObject.timestamp}
                text={resourceObject.comment}
              />
            )}
            <HideTextButton handleToggle={handleToggle} />
          </motion.div>
        ): (
          <ExpandTextButton handleToggle={handleToggle} />
        )}
      </AnimatePresence>
    </>
  );
};
