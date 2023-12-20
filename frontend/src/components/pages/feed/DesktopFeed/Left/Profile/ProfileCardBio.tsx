import { Suspense } from "react";
import TextLimitComponent from "../../../../../layouts/TextLimitComponent";
import { useProfileContext } from "../../../../../../context/ProfileContext";


export const ProfileCardBio = () => {
    const {profile} = useProfileContext() 

    // return profile ? (
    //     <>
    //        <div className="w-5/6  text-xs text-center text-black-200 opacity-90">
    //             <TextLimitComponent text={`${profile?.bio}`} maxCharacters={100}/>
    //         </div>
    //     </>
    // ) : <p className="text-black-200">Loading ...</p>
    return (
        <>
        <Suspense fallback={<div>Loading page, hopefully not too much..</div>}>
            <div className="w-5/6  text-xs text-center text-black-200 opacity-90">
                <TextLimitComponent text={`${profile?.bio}`} maxCharacters={100}/>
            </div>
         </Suspense>
        </>
    )
    
}