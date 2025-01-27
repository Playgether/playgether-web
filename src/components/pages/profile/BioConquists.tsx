import { FaMedal } from "react-icons/fa";
import { GiRibbonMedal } from "react-icons/gi";
import { FaUserShield } from "react-icons/fa";
import { GiImperialCrown } from "react-icons/gi";

export const BioConquists = () => {
  return (
    <div className="relative h-full w-full Bio-conquists-wrapper rounded-lg overflow-y-auto">
      <div className=" flex w-full h-12 rounded-lg items-center justify-center">
        <p className="Bio-conquists-title text-xl">Destaques</p>
        <GiRibbonMedal className="h-20 w-20 absolute Bio-conquists-title right-0 pt-4" />
      </div>
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="w-full flex gap-2 items-center">
          <FaMedal className="text-yellow-200 h-8 w-8" />
          <p>1st. Cs2 First America Championship</p>
        </div>

        <div className="w-full flex gap-2 items-center">
          <FaMedal className=" text-yellow-950 h-8 w-8" />
          <p>3st. Valorant High Cup</p>
        </div>

        <div className="w-full flex gap-2 items-center">
          <FaMedal className=" text-slate-400 h-8 w-8" />
          <p>2st. League of Legends Ult Power</p>
        </div>

        <div className="w-full flex gap-2 items-center">
          <FaUserShield className=" text-white-200 h-8 w-8" />
          <p>Play Grand Guild (Marechal)</p>
        </div>

        <div className="w-full flex gap-2 items-center">
          <GiImperialCrown className="text-red-500 h-8 w-8" />
          <p>King of League (1x1)</p>
        </div>
      </div>
    </div>
  );
};
