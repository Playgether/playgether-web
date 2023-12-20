import TextLimitComponent from "../../../../../layouts/TextLimitComponent"


const TopicsOfMoment = () => {
    return (
        <div className="bg-white-200 h-full shadow-lg  overflow-y-auto rounded-sm w-full">
            <div className="flex flex-row items-center justify-center w-full pb-2 bg-white-200">
                <h1 className="font-medium text-black-200 text-center pt-2 border-b border-black-200 border-opacity-30 text-md w-4/6 text-sm">Assuntos do Momento</h1>
            </div>
            <div className="flex flex-col items-center h-full space-y-4 w-full flex-wrap pt-2">
                <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                    <h1 className="text-blue-500 font-semibold text-sm">Assunto: </h1>
                    <h2 className="text-orange-500 font-normal text-xs">Counter Strike 2</h2>
                </div>
                <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                    <h1 className="text-blue-500 font-semibold text-sm">Thread: </h1>
                    <h2 className="text-orange-500 font-normal text-xs">O LoL está acabando</h2>
                </div>
                <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                    <h1 className="text-blue-500 font-semibold text-sm">Noticia: </h1>
                    <h2 className="text-orange-500 font-normal text-xs">Ato 7 do Valorant, veja tudo de novo aqui.</h2>
                </div>
                <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                    <h1 className="text-blue-500 font-semibold text-sm">Rank: </h1>
                    <h2 className="text-orange-500 font-normal text-xs">Top 1 Jett Valorant</h2>
                </div>
                <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                    <h1 className="text-blue-500 font-semibold text-sm">Eventos: </h1>
                    <h2 className="text-orange-500 font-normal text-xs">Rei do LoL</h2>
                </div>  
                <div className="flex flex-row space-x-2 flex-wrap text-center items-center justify-center space-y-1 w-5/6">
                    <h1 className="text-blue-500 font-semibold text-sm">Competições: </h1>
                    <h2 className="text-orange-500 font-normal text-xs break-all"> <TextLimitComponent text="Quinto campeonato de disputa de clãs euquerosabereuquerotestarcomoissoquebraesequebralegalestacaralha" maxCharacters={150} /></h2>
                </div>                          
            </div>
        </div>
    )
}

export default TopicsOfMoment