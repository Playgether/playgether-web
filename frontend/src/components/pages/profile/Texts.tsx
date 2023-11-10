import { useEffect, useState } from "react"
import TextLimitComponent from "../../layouts/TextLimitComponent"
import { PostsStats } from "./PostStats"

let text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

const objPosts = [

    {ob1: {
        text: text
    }},
    {ob2: {
        text: text
    }},
    {ob3: {
        text: text
    }},
    {ob4: {
        text: text
    }},
    {ob5: {
        text: text
    }},
    {ob6: {
        text: text
    }},
    {ob7: {
        text: text
    }},
    {ob8: {
        text: text
    }},
    {ob9: {
        text: text
    }},
    {ob10: {
        text: text
    }}
]


export const Texts = () => {

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [effect, setEffect] = useState("animate-hoverUp")


    const handleMouseOver = (index) => {
        setTimeout(()=> {
            setEffect("animate-hoverUp")
            setHoveredIndex(index);
        }, 70)
    }


    const handleMouseOut = (index) => {
        setEffect("animate-hoverDown")
        setTimeout(() => {
            setHoveredIndex(null);  
        }, 70);
    }



    return (
        <div className="grid grid-cols-2 w-full items-center justify-center gap-8 p-4 text-black-400 animate-menuProfileFadeIn">
        {objPosts.map((obj, index) => (
        <div
          key={index}
          className={`bg-white-400 rounded-lg hover:bg-white-500 cursor-pointer shadow-md shadow-gray-400 relative ${
            hoveredIndex === index ? 'hovered' : ''
          }`}
          onMouseOver={() => handleMouseOver(index)}
          onMouseLeave={() => handleMouseOut(index)}
        >
          <TextLimitComponent
            text={text}
            maxCharacters={200}
            className="p-3 z-40"
            textFinal={" ...expandir"}
          />
          {hoveredIndex === index && 
            <div className="absolute z-50 bottom-0 w-full">
                <PostsStats className={effect} />
            </div>
          }
        </div>
        ))}
        </div>
    )
}