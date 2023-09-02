import { CgProfile } from "react-icons/cg";
import Image from "next/legacy/image";
import { twJoin} from "tailwind-merge";
import { HTMLAttributes } from "react";


interface DivProps extends HTMLAttributes<HTMLDivElement> {


}

type Resource = {
    link_photo: string
}


const ProfileImagePost = ({ link_photo, ...rest }: Resource & DivProps) => {
    return (   
        <div 
        {...rest}
        className = {twJoin("relative bg-white-200 rounded-full", rest.className)}>
            {typeof link_photo !== 'string' ? (
                <CgProfile className="h-full w-full text-gray-300" />
            ) : (
                <Image
                    src={`${link_photo}`}
                    width={400}
                    height={400}
                    alt={"Imagem de perfil de quem postou um post no feed"}
                    className="rounded-full h-10"
                />
            )}
        </div>
    );
};

export default ProfileImagePost;
