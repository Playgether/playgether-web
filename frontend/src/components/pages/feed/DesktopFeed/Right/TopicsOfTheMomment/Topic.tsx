import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent"

export type TopicProps = {
    /** Esta variável define o tópico em que este assunto esta inserido, Exemplo:
     * Rank, Notícia, Competiçoes...
     */
    topic_category:string,
    /** Esta variável define o assunto especificamente, Exemplo:
     * "O LoL está acabando", "Rei do LoL"...
     */
    topic:string,
}

/** Este é o componente wrapper de cada topico no componente "TopicsOfMoment", seu intuito é gerar cada tópico neste componente. */
export const Topic = ({topic_category, topic}:TopicProps) => {
    return (
        <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center break-words whitespace-normal">
            <h1 className="text-blue-500 font-semibold text-sm">{topic_category}</h1>
            <h2 className="text-orange-500 font-normal text-xs">{topic}</h2>
        </div>
    )
}