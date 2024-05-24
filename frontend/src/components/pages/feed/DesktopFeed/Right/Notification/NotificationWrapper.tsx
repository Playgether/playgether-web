import Image from "next/legacy/image";

export type NotificationWrapperProps = {
    /** Esta prop recebe a url para a foto de perfil */
    profile_photo: string,
    /** Esta prop recebe o título da notificação, em casos de usuários, será seu nome */
    title: string,
    /** Esta prop recebe o texto da notificação */
    text: string,
    
}

/** Este é o componente responsável por cada notificação do componente Notification, em "Right" na página de feed. */
export const NotificationWrapper = ({profile_photo, title, text}:NotificationWrapperProps) => {
    return (
        <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
        <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
            <Image src={profile_photo} 
            objectFit="cover"
            width={400} 
            height={400} 
            alt={"Imagem de perfil do card profile do feed"}
            className="rounded-full"/>
        </div>
        <div>
            <a href=""><h1 className="font-medium text-orange-500 text-sm">{title}</h1></a>
        </div>
        <div className="text-black-300 text-xs pt-2 pb-2">
            <p>{text}</p>
        </div>
    </div>
    )
}