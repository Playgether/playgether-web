import TextLimitComponent from "@/components/layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent"
import { useState } from "react"
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri"

export interface PostTextPostExpandProps {
    /** Este é o texto do post propriamente dito */
    text:string

    /** Esta propriedade recebe um boolean (true ou false) para mostrar ou não um button para expandir a div que possui o texto (ela recebe um absolute z-10 h-full) */
    showExpandButton:boolean
}
/** Este componente é responsável por gerar o texto de um post/comentário, ele é extremamente simples e apenas recebe uma string e retorna uma div com esta string */
export const PostTextPostExpand = ({text, showExpandButton}:PostTextPostExpandProps) => {
    const [isExtended, setIsExtended] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleToggle = () => {
        setIsExtended((prev) => !prev);
        setHasInteracted(true); 
    };
    return (
        <>
            {isExtended ? (
                <div
                    className={`absolute z-10 h-full bg-white-300 flex flex-col w-full ${
                        hasInteracted ? "animate-expandVertical" : ""
                    }`}
                >
                    {showExpandButton ? (
                        <div className="pt-4 pl-4 pb-4 overflow-y-auto">
                            <p className="whitespace-pre-wrap">{text}</p>
                        </div>
                    ) : null
                    }
                    <div
                        className="text-blue-400 sticky bottom-0 pl-4 cursor-pointer p-2 text-center text-2xl flex items-end justify-center flex-1"
                        onClick={handleToggle}
                    >
                        <RiArrowUpSLine className="animate-bounce"/>
                    </div>
                </div>
            ) : (
                <div
                    className={`bg-white-300 w-full ${
                        hasInteracted ? "animate-shrinkVertical" : ""
                    }`}
                >
                    <div className="pt-4 pl-4 pb-4">
                        <TextLimitComponent
                            text={text}
                            maxCharacters={150}
                            className="whitespace-pre-wrap"
                        />
                    </div>
                    {showExpandButton ? (
                        <div
                        className="text-blue-400  pl-4 cursor-pointer p-2 text-center text-2xl flex items-center justify-center"
                        onClick={handleToggle}
                        >
                            <RiArrowDownSLine  className="animate-bounce"/>
                        </div>
                    ):null}
                </div>
            )}
        </>
    );
}