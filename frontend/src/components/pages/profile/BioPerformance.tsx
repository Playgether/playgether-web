import {LuMonitorUp} from "react-icons/lu"
import {TbChartInfographic} from "react-icons/tb"
import {MdOutlineAssessment} from "react-icons/md"
import {LiaGamepadSolid} from "react-icons/lia"
import {TfiTimer} from "react-icons/tfi"


export const BioPerformance = () => {
    return (
        <div className="relative h-full w-full bg-blue-300 rounded-lg">
            <div className=" flex shadow-gray-400 shadow-md w-full h-12 bg-blue-300 rounded-lg items-center justify-center">
                <p className="text-blue-500 text-xl">Performance</p>
                <LuMonitorUp className="h-12 w-12 pr-2 absolute text-blue-500 right-0"/>
            </div>
            <div className="text-black-500 w-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
                <div className="w-full flex flex-col gap-1 items-center">
                    <TbChartInfographic className="text-blue-500 h-8 w-8"/>
                    <p className="text-black-400 font-bold text-lg">ALTO</p>
                    <p className="text-black-400">Desempenho</p>
                </div>
                <div className="w-full flex flex-col gap-1 items-center">
                    <MdOutlineAssessment className="text-blue-500 h-8 w-8"/>
                    <p className="text-black-400 font-bold text-lg">BOA</p>
                    <p className="text-black-400">Avaliação</p>
                </div>
                <div className="w-full flex flex-col gap-1 items-center">
                    <LiaGamepadSolid className="text-blue-500 h-8 w-8 -rotate-45"/>
                    <p className="text-black-400 font-bold text-lg">143</p>
                    <p className="text-black-400">Partidas</p>
                </div>
                <div className="w-full flex flex-col gap-1 items-center">
                    <TfiTimer className="text-blue-500 h-8 w-8"/>
                    <p className="text-black-400 font-bold text-lg">348</p>
                    <p className="text-black-400">Horas</p>
                </div>
            </div>
        </div>
    )
}