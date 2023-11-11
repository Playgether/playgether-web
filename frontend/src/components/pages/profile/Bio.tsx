import { BioConquists } from "./BioConquists"
import { BioPerformance } from "./BioPerformance"

let text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

export const Bio = () => {
    return (
       <div className="flex-grow w-full animate-menuProfileFadeIn">
            <div className="bg-white-300 w-full h-[50vh] rounded-lg shadow-md shadow-gray-400 my-4">
                <div className=" bg-white-300 h-1/6 text-black-300 shadow-md shadow-gray-400 flex items-center justify-center rounded-lg font-medium text-xl">
                    <p>Bio</p>
                </div>
                <div className="text-black-300 p-4 text-justify">
                    <p>{text}</p>
                </div>   
            </div>
            <div className="flex w-full h-[40vh] gap-2 justify-center items-center">
                <div className="relative h-full w-full bg-orange-300 rounded-lg overflow-y-auto">
                    <BioConquists />
                </div>
                <div className="h-full w-full bg-blue-300 rounded-lg overflow-y-auto">
                    <BioPerformance />
                </div>
            </div> 
        </div>
    )
}