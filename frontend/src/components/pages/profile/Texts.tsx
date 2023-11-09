import { useState } from "react"
import TextLimitComponent from "../../layouts/TextLimitComponent"
import { PostsStats } from "./PostStats"

let text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

export const Texts = () => {

    const [isHovering, setIsHovering] = useState(false)

    const handleMouseOver = () => {
        setIsHovering(true)
    }

    const handleMouseOut = () => {
        setIsHovering(false)
    }


    return (
        <div className="grid grid-cols-2 w-full items-center justify-center gap-4 p-4 text-black-400 animate-menuProfileFadeIn">
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400" onMouseOver={()=> handleMouseOver()} onMouseOut={()=> handleMouseOut()}>
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
                {isHovering && <PostsStats />}
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
            <div className="bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400">
                <TextLimitComponent text={text} maxCharacters={200} className="p-3" textFinal={" ...expandir"}/>
            </div>
        </div>
    )
}