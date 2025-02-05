import { LeftProfile } from "./LeftProfile";
import { RightProfile } from "./RightProfile";

const Page = ({}) => {
  return (
    <div className="max-w-[1420px] w-[90vw] flex flex-col items-center">
      <div className="mr-2 flex flex-col lg:flex-row md:flex-row mt-2 gap-2 w-full">
        <LeftProfile />
        <RightProfile />
      </div>
    </div>
  );
};

export default Page;
