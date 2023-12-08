import { LeftProfile } from "./LeftProfile";
import { RightProfile } from "./RightProfile";

const Page = ({}) => {
    return (
        <div className="w-full mr-2 h-full flex flex-col lg:flex-row md:flex-row  gap-2 max-h-full max-w-full">
            <LeftProfile />
            <RightProfile />
        </div>
    );
};

export default Page;