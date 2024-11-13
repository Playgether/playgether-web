import { CgProfile } from "react-icons/cg";
import Image from "next/legacy/image";
import { twJoin} from "tailwind-merge";
import { HTMLAttributes } from "react";


interface DivProps extends HTMLAttributes<HTMLDivElement> {


}

export type Resource = {
    /** Esta propriedade recebe uma string, que deve ser a url da foto de perfil. */
    link_photo: string
}

/**
 * Este componente serve para mostrar a foto de perfil do autor de algum post
 * OBS: Você precisa passar um className definindo a altura (height) e a largura (width) do container, visto que a imagem possui a propriedade "fill". Caso não passe, a imagem não aparecerá na tela.
 * Outra OBS: Tenha certeza de que o link da imagem que está sendo enviada possui o base URL configurado nas URLs de imagens do Next.js.
 */
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
                    alt={"Imagem de perfil de quem postou um post no feed"}
                    className="rounded-full h-10"
                    layout="fill"
                    objectFit="cover"
                    unoptimized
                />
            )}
        </div>
    );
};

export default ProfileImagePost;
