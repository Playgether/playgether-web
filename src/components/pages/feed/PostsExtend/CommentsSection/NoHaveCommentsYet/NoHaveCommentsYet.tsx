/** Este componente é exibido quando algum post ainda não obteve nenhum comentário */
const NoHaveCommentsYet = () => {
    return (
        <div className="bg-white-200 flex flex-col gap-3 text-center items-center justify-center h-full ">
            <p className="text-lg font-medium text-black-200">Parece que ainda não há comentários por aqui...</p>
            <p className="text-md font-small text-gray-400">Seja o primeiro a realizar um comentário abaixo</p>
        </div>
    )
}

export default NoHaveCommentsYet