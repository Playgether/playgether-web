import { HTMLAttributes } from "react"
import UserNamePost from "../../pages/feed/DesktopFeed/MultUseComponents/UserNamePost/UserNamePost"
import { twJoin } from "tailwind-merge"
import TimeAgo from "react-timeago";
import brazilianStrings from 'react-timeago/lib/language-strings/pt-br'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import ProfileImagePost from "../../pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";


export interface ProfileAndUsernameProps extends HTMLAttributes<HTMLDivElement>{
    /** Esta variável é uma string que recebe o username do usuário */
    username: string
    /** Esta variável também é uma string que recebe o link de url da foto de perfil */
    profile_photo: string
    /** Esta prop recebe a altura e a largura da imagem de perfil (Ela utiliza ProfileImagePost, o componente de imagem e portanto essas propriedades são necessárias) e passa 
     * para o componente ProfileImagePost que esta sendo utilizado dentro deste componente.
     */
    imageClassName?: string
    /** Esta também é uma variável opcional onde você pode passar datas no tipo Date caso precise adicionar datas. Este componente utiliza o react-time-ago, que é uma biblioteca
     * que faz um cálculo com a data atual, gerando a quanto tempo foi o post (Exemplo: á 5 horas / mês ...)
     */
    timestamp?:number | Date
    /** Esta variável opcional recebe estilos adicionais para o wrapper da div que está o componente UserNamePost */
    usernameAndTimestampDiv?:string
}

/** Este componente é responsável por criar uma identidade visual pré definida para identificação de usuários (autor de posts, comentários etc.), use-o quando precisar deste
 * tipo de identificação
 */
const ProfileAndUsername = ({username, profile_photo, imageClassName, timestamp, usernameAndTimestampDiv, ...rest}: ProfileAndUsernameProps) => {
    const formatter = buildFormatter(brazilianStrings)
    return (
        <div className={twJoin("", rest.className)} {...rest}>
            <div className="flex items-center gap-2">
                <ProfileImagePost link_photo={profile_photo} className={`${imageClassName} h-10 w-10`}/>
                <div className={twJoin('text-lg', usernameAndTimestampDiv)}>   
                <UserNamePost username={username}/>
                {timestamp ?
                    <div className="text-gray-400 text-sm">
                        <TimeAgo date={timestamp} formatter={formatter} />
                    </div>
                    : null
                }
                </div>
            </div>
        </div>
    )
}

export default ProfileAndUsername