import PostText from "../../../layouts/PostText"
import { TogglePostComponent } from "../CommonComponents/togglePostComponent"
import { NameAndUsernameResponsive } from "./PostsComponents/NameAndUsername"
import { CiShare1 } from "react-icons/ci";
import Image from "next/legacy/image";
import PostProperies from "../DesktopFeed/Middle/PostsComponents/PostsProperies";

const resource =  {
    comment: 'Test Comment'
}

export const ResponsiveFeedComponent = () => {
    return (
        <>                  
            <TogglePostComponent />
            <div className="flex justify-between items-center">
                <NameAndUsernameResponsive />
                <CiShare1 className="h-8 w-8 text-orange-500 mr-4"/>
            </div>
            <div className="pt-4 flex justify-between pb-2">
                <PostText resource={resource} maxCharacteres={150} />
            </div>
            <div className="h-full w-full relative flex-grow">
                <Image
                    src={"http://localhost:8000/media/profile/5c37913c-67a0-403f-be85-cc0a9ddba6c52023-12-20_153849.491384.jpg"}
                    alt={"TESTE"}
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <div className="pt-2">
                <PostProperies quantity_comment={10} quantity_likes={142} quantity_reposts={30} user_already_like={true} object_id={2} />   
            </div> 
            
        </>
    )
}