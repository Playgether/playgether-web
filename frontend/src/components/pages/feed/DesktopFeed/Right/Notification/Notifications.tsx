
import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent"
import { NotificationWrapper } from "./NotificationWrapper"


/** Este é o wrapper principal do card de Notificações em "Right" na página de feed. */
const Notifications = () => {

    // const { notifications, authTokens } = useNotifications()

    return (
        <div className="flex flex-col w-full pl-2 flex-wrap divide-y-2 flex-grow justify-center 2xl:space-y-4 bg-white-200">
            {/* <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                <div> */}
                    {/* {authTokens && notifications.map((notification) => (
                        <p key={notification.id} className="text-black-200">{notification.message}</p>
                    ))} */}
                {/* </div>
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative flex-wrap">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">Mia Jensen</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2">
                    <p>curtiu sua foto </p>
                </div>
            </div> */}
            <NotificationWrapper 
            profile_photo="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            title="Mia Jensen" 
            text="comentou sua foto"
            />
            <NotificationWrapper 
            profile_photo="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            title="David Matthew" 
            text="entrou para o mesmo clã que você dsadsadsadsadsadsadsadsadsadsadsadsadasds"
            />
            <NotificationWrapper 
            profile_photo="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            title="David Matthew" 
            text="seguiu você"
            />
            <NotificationWrapper 
            profile_photo="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            title="David Matthew" 
            text="entrou para o mesmo clã que você"
            />
            <NotificationWrapper 
            profile_photo="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            title="David Matthew" 
            text="entrou para o mesmo clã que você dsadsadsadsadsadsadsadsadsadsadsadsadasds"
            />
        </div>
    )
}

export default Notifications