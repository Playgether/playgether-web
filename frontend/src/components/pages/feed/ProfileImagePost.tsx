import { CgProfile } from "react-icons/cg";
import Image from "next/legacy/image";

type ProfileImagePost = {
    resource: {
        created_by_user_photo:string
    }
}

const ProfileImagePost = ({resource} : ProfileImagePost) => {
    return (

        <div className="flex flex-row">
            <div className="rounded-full h-16 w-16 flex items-center justify-center relative mt-3 ml-3 bg-white-200">
                {resource?.created_by_user_photo === null ? (
                    <CgProfile className="h-full w-full text-gray-300" />
                ) : (
                    <Image
                        src={`${resource?.created_by_user_photo}`}
                        width={400}
                        height={400}
                        alt={"Imagem de perfil de quem postou um post no feed"}
                        className="rounded-full h-10"
                    />
                )}
            </div>
        </div>

    );
};

export default ProfileImagePost;
