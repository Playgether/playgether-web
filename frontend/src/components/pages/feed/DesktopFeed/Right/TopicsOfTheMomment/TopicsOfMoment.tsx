import { Topic } from "./Topic"


/** Este componente é o wrapper principal dos topicos do momento na parte "Right" em feed. Seu intuito é ser o componente principal e wrapper de todos os filhos. */
const TopicsOfMoment = () => {
    return (
        <div className="h-full shadow-lg overflow-x-hidden rounded-sm w-full grow">
            <div className="flex flex-col items-center h-full space-y-4 w-full flex-wrap pt-2">
                <Topic topic_category="Assunto: " topic="Counter Strinke 2"/>
                <Topic topic_category="Thread: " topic="O LoL está acabando"/>
                <Topic topic_category="Rank: " topic="Top 1 Jett Valorant"/>
                <Topic topic_category="Noticia: " topic="Ato 7 do Valorant, veja tudo de novo aqui."/>
                <Topic topic_category="Eventos: " topic="Rei do LoL"/>
                <Topic topic_category="Competições: " topic="Quinto campeonato de disputa de clãs euquerosabereuquerotestarcomoissoquebraesequebralegalestacaralha"/>
            </div>
        </div>
    )
}

export default TopicsOfMoment