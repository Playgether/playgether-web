'use client'

import { useState } from "react"
import { MenuProfile } from "./Menu"
import { Texts } from "./Texts"
import { Medias } from "./Medias"
import { Bio } from "./Bio"
import { Conquists } from "./Conquists"
import { Statistics } from "./Statistics"
import { Moments } from "./Moments"
import { Game } from "./Game"



export const RightProfile = () => {

    const [content, setContent] = useState("bio")

    return (
        <div className="bg-white-300 w-full rounded-lg overflow-y-auto">
            <MenuProfile setContent={setContent} content={content}/>
            {content === "bio" && <Bio />}
            {content === "medias" && <Medias />}
            {content === "textos" && <Texts />}
            {content === "estatisticas" && <Statistics />}
            {content === "conquistas" && <Conquists />}
            {content === "marcos" && <Moments />}
            {content === "games" && <Game />}
        </div>
    )
}