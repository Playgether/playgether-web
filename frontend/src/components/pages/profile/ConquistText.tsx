export const ConquistText = ({text, title, Icon, date}:{text:string, title:string, Icon:React.ReactNode, date:string}) => {
    return (
        <div className="w-full flex h-fit">
            <div className="relative h-full">
                <div className="h-4 w-4 rounded-full bg-orange-500 z-50 mt-2 -ml-2 absolute"></div> 
            </div>

            <div className="w-full pl-4">
                <p className="text-2xl text-orange-500">{title}</p>
                <p className="text-black-500 bg-gray-500 font-thin bg-opacity-20 flex justify-center items-center w-1/6">{date}</p>
                <div className="flex justify-between">
                    <div className="relative whitespace-normal">
                        <p className="text-black-400">{text}</p>
                    </div>
                    <div className="pr-4">{Icon}</div>
                </div>
            </div> 
        </div>   
    )
}