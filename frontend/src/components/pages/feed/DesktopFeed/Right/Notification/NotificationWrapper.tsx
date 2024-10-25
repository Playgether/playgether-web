import Image from "next/legacy/image";
import { CgProfile } from "react-icons/cg";
import TimeAgo from "react-timeago";
import brazilianStrings from 'react-timeago/lib/language-strings/pt-br'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

export type NotificationWrapperProps = {
    /** Esta prop recebe a url para a foto de perfil */
    profile_photo: string,
    /** Esta prop recebe o título da notificação, em casos de usuários, será seu nome */
    title: string,
    /** Esta prop recebe o texto da notificação */
    text: string,
    /** Esta prop recebe o datetime da notificação */
    timestamp:number | Date
    
}

/** Este é o componente responsável por cada notificação do componente Notification, em "Right" na página de feed. */
export const NotificationWrapper = ({profile_photo, title, text, timestamp}:NotificationWrapperProps) => {
    const formatter = buildFormatter(brazilianStrings)
    return (
        <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
            <div className="w-full flex justify-between">
                <div className=" flex items-center gap-2">
                    <div className="rounded-full h-8 w-8  flex items-center relative">
                        {profile_photo === null || profile_photo === undefined ? (
                            <CgProfile className="h-full w-full text-gray-300"/>
                        ) : (
                            <Image src={profile_photo} 
                            objectFit="cover"
                            width={400} 
                            height={400} 
                            alt={"Imagem de perfil do card profile do feed"}
                            className="rounded-full"/>
                        )}
                    </div>
                    <div>
                        <a href=""><h1 className="font-medium text-orange-500 text-sm">{title}</h1></a>
                    </div>
                </div>
                <div className="text-gray-400 text-sm pt-1">
                    <TimeAgo date={timestamp} formatter={formatter} />
                </div>
            </div>
            <div className="text-black-300 text-xs pt-2 pb-5 font-medium">
                <p>{text}</p>
                {/* <TextLimitComponent text={title} maxCharacters={60} className="w-full"/> */}
            </div>
        </div>
    )
}