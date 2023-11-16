import { FaWind } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { HiMiniTrophy } from "react-icons/hi2";
import { PiMaskHappyFill } from "react-icons/pi";
import { ConquistText } from "./ConquistText";


export const Conquists = () => {
    return (
        <div className="text-black-400 animate-menuProfileFadeIn h-full mt-4 w-full space-y-8 bg-white-400 rounded-lg">
            <div className=" bg-white-400 h-12 text-black-300 shadow-md shadow-gray-400 flex items-center justify-center rounded-lg text-xl">
                <p>Suas Conquistas</p>
            </div>
   
            <div className=" bg-white-400 h-fit text-black-300 rounded-lg font-medium text-xl w-full">
                <div className=" border-l border-black-500 ml-3 z-10 space-y-4">
                    <ConquistText 
                    date={'2023-03-28'} 
                    title="Mestre dos Ventos" 
                    text="Conquistou mais de 350 mil pontos com o personagem Yasuo" 
                    Icon={<FaWind className="h-16 w-16 text-blue-500"/>}/>

                    <ConquistText 
                    date={'02/02/2023'} 
                    title="Popular" 
                    text="Atingiu a marca de 100 mil seguidores" 
                    Icon={<IoPeopleSharp className="h-16 w-16 text-blue-500"/>}/>

                    <ConquistText 
                    date={'05/09/2022'} 
                    title="Campeão" 
                    text="Venceu em primeiro lugar o campeonato de CSGO: Counter Strinke Global Offensive Nutrion Cup kdsaopkopsakopdksadopsa" 
                    Icon={<HiMiniTrophy className="h-16 w-16 text-blue-500"/>}/>

                    <ConquistText 
                    date={'05/09/2022'} 
                    title="Amigável" 
                    text="Conseguiu um score de avaliações gerais superior a 4.0" 
                    Icon={<PiMaskHappyFill className="h-16 w-16 text-blue-500"/>}/>               
                </div>                         
            </div>

            
        </div>
    )
}