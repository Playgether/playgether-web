import { TopCard } from "../MultUseComponents/TopCard"
import Notifications from "./Notification/Notifications"
import TopicsOfMoment from "./TopicsOfTheMomment/TopicsOfMoment"


/** Este é o componente principal da parte "Right" da página de feed. Seu intuito é servir como wrapper de toda a parte direita da página. */
const Right = () => {
    return (
        <div className="w-full 2xl:sticky top-0 h-full 2xl:h-fit min-w-[420px]">
            <div className="bg-white-200 flex-1 h-full flex flex-col space-y-4 sticky-last">
                <div className="bg-white-200 h-3/6 flex mt-2 flex-col items-center space-y-2 shadow-lg rounded-lg w-10/12 2xl:w-[374px] min-h-[300px] 2xl:h-[400px] 2xl:max-h-[400px] max-h-[350px] 2xl:static">
                    <TopCard title={"Notificações recentes"}/>
                    <div className="overflow-y-auto h-full flex flex-col grow">
                       <Notifications />
                    </div>
                </div>
                <div className="bg-white-200 grow flex mt-2 flex-col items-center shadow-lg rounded-lg w-10/12 2xl:w-[374px] min-h-[300px] h-[350px] 2xl:grow max-h-[350px] 2xl:max-h-[400px] 2xl:static">
                    <TopCard title={"Assuntos do momento"}/>
                    <div className="overflow-y-auto h-full flex flex-col grow">
                        <TopicsOfMoment />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Right