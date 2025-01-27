import { LuMonitorUp } from "react-icons/lu";
import { TbChartInfographic } from "react-icons/tb";
import { MdOutlineAssessment } from "react-icons/md";
import { LiaGamepadSolid } from "react-icons/lia";
import { TfiTimer } from "react-icons/tfi";

export const BioPerformance = () => {
  return (
    <div className="relative h-full w-full Bio-performance-wrapper rounded-lg">
      <div className=" flex w-full h-12 ounded-lg items-center justify-center">
        <p className="Bio-performance-title text-xl">Performance</p>
        <LuMonitorUp className="h-12 w-12 pr-2 absolute Bio-performance-title right-0" />
      </div>
      <div className=" w-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
        <div className="w-full flex flex-col gap-1 items-center">
          <TbChartInfographic className="Bio-performance-title h-8 w-8" />
          <p className="font-bold text-lg">ALTO</p>
          <p className="Bio-performance-text">Desempenho</p>
        </div>
        <div className="w-full flex flex-col gap-1 items-center">
          <MdOutlineAssessment className="h-8 w-8 Bio-performance-title" />
          <p className="font-bold text-lg">BOA</p>
          <p className="Bio-performance-text">Avaliação</p>
        </div>
        <div className="w-full flex flex-col gap-1 items-center">
          <LiaGamepadSolid className="h-8 w-8 -rotate-45 Bio-performance-title" />
          <p className="font-bold text-lg">143</p>
          <p className="Bio-performance-text">Partidas</p>
        </div>
        <div className="w-full flex flex-col gap-1 items-center">
          <TfiTimer className="h-8 w-8 Bio-performance-title" />
          <p className=" font-bold text-lg">348</p>
          <p className="Bio-performance-text">Horas</p>
        </div>
      </div>
    </div>
  );
};
