import { IoIosMegaphone } from "react-icons/io";
import { IntervalFunctionComponent } from "./IntervalFunction";

export const ResponsiveMegafone = () => {
  return (
    <div className="flex items-center justify-center gap-5 w-full ResponsiveMegafone-wrapper">
      <div className="w-16 rounded-lg relative h-14 z-10 ">
        <div className="-inset-0 bg-purple-600 absolute bg-blur-sm rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-purple-500 animate-moveRight"></div>
        <div className="inset-0 m-1 ml-1 mr-1 rounded-lg absolute flex bg-blue-400 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 hover:from-blue-500 hover:via-blue-600 hover:to-blue-600 gap-2 text-xs items-center justify-center">
          <IoIosMegaphone className="w-5 h-5 -rotate-12" />
        </div>
      </div>
      <div className="w-5/6 z-0 bg-red-200">
        <IntervalFunctionComponent />
      </div>
    </div>
  );
};
