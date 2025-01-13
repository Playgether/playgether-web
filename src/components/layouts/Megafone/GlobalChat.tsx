import { IoIosMegaphone } from "react-icons/io";
import { IntervalFunctionComponent } from "./IntervalFunction";

const GlobalChat = ({}) => {
  return (
    <>
      <div className="w-full h-16 bottom-0 flex rounded-lg overflow-x-hidden overflow-y-hidden z-50">
        <div className="GlobalChat-wrapper h-full flex items-center relative rounded-lg z-20">
          <div className="inset-0 bg-purple-600 absolute blur-sm rounded-md bg-gradient-to-r from-pink-400 via-purple-500 to-purple-500 animate-moveRight"></div>
          <div className="cursor-pointer leading-none bg-blue-400 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 hover:from-blue-500 hover:via-blue-600 hover:to-blue-600 w-40 h-14 flex items-center justify-center gap-2 relative ml-1 mr-1 rounded-lg z-10">
            <button>MEGAFONE</button>
            <IoIosMegaphone className="w-1/6 h-3/6 -rotate-12" />
          </div>
        </div>
        <IntervalFunctionComponent />
      </div>
    </>
  );
};

export default GlobalChat;
