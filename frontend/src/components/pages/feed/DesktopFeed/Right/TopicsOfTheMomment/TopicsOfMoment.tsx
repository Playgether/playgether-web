import { Topic } from "./Topic"


/** Este componente é o wrapper principal dos topicos do momento na parte "Right" em feed. Seu intuito é ser o componente principal e wrapper de todos os filhos. */
const TopicsOfMoment = () => {
    return (
        <div className="h-full shadow-lg rounded-sm w-full grow p-2 pr-2 overflow-y-auto">
            <div className="flex flex-col items-center h-full space-y-4 w-full pt-2 overflow-x-hidden">
                <Topic topic_category="Assunto: " topic="Counter Strinke 2"/>
                <Topic topic_category="Thread: " topic="O LoL está acabando"/>
                <Topic topic_category="Rank: " topic="Top 1 Jett Valorant"/>
                <Topic topic_category="Noticia: " topic="Ato 7 do Valorant, veja tudo de novo aqui."/>
                <Topic topic_category="Eventos: " topic="Rei do LoL"/>
                <Topic topic_category="Competições: " topic="Quinto campeonato de disputa de clãs euquerosabereuquerotestarcomoissoquebraesequebralegalestacaralha"/>
                <Topic topic_category="Competições: " topic="What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."/>
                <Topic topic_category="Competições: " topic="dsadasdadsad"/>
                <Topic topic_category="Competições: " topic="dsadasdsa"/>
            </div>
        </div>
    )
}

export default TopicsOfMoment