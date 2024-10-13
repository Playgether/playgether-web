import Notifications from "./Notification/Notifications"
import TopicsOfMoment from "./TopicsOfTheMomment/TopicsOfMoment"


/** Este é o componente principal da parte "Right" da página de feed. Seu intuito é servir como wrapper de toda a parte direita da página. */
const Right = () => {
    return (
        <div className="bg-white-200">
            <div className="bg-white-200 flex-1 h-5/6 flex flex-col space-y-4">
                <div className="bg-white-400 h-3/6 flex mt-2 flex-col items-center space-y-2 shadow-lg overflow-y-auto max-h-[400px]">
                    <div>
                        <h1 className="font-medium text-black-200 text-center pt-2 border-b border-black-200 border-opacity-30 text-md">Notificações Recentes</h1>
                    </div>
                    <Notifications />
                </div>
                <div className="bg-white-200 h-3/6 flex mt-2 flex-col items-center space-y-2 rounded-lg shadow-lg max-h-[400px]">
                    <TopicsOfMoment />
                </div>
            </div>
        </div>
    )
}

export default Right