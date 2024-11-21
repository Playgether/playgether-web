export interface PostTextPostExpandProps {
    /** Este é o texto do post propriamente dito */
    text:string
}
/** Este componente é responsável por gerar o texto de um post/comentário, ele é extremamente simples e apenas recebe uma string e retorna uma div com esta string */
export const PostTextPostExpand = ({text}:PostTextPostExpandProps) => {
    return (
        <div className="pt-4 pl-4">
            <p className='whitespace-pre-wrap'>{text}</p>
        </div> 
    )
}