
import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent"

const Notifications = () => {

    // const { notifications, authTokens } = useNotifications()

    return (
        <div className="flex flex-col w-full pl-2 flex-wrap divide-y-2 flex-grow justify-center 2xl:space-y-4 bg-white-200">
            <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                <div>
                    {/* {authTokens && notifications.map((notification) => (
                        <p key={notification.id} className="text-black-200">{notification.message}</p>
                    ))} */}
                </div>
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative flex-wrap">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">Mia Jensen</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2">
                    <p>curtiu sua foto </p>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">Mia Jensen</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2">
                    <p>comentou sua foto</p>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2  pt-2 flex-wrap">
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2 break-all w-5/6">
                    <TextLimitComponent text="entrou para o mesmo clã que você dsadsadsadsadsadsadsadsadsadsadsadsadasds" maxCharacters={150} />
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2  pt-2 flex-wrap">
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2">
                    <p>seguiu você</p>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2">
                    <p>entrou para o mesmo clã que você </p>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2  pt-2 flex-wrap">
                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                </div>
                <div className="text-black-300 text-xs pt-2 pb-2">
                    <p>entrou para o mesmo clã que você dsadsadsadsaasd dsadsadasdasdasdasdsdadsadsd</p>
                </div>
            </div>
        </div>
    )
}

export default Notifications