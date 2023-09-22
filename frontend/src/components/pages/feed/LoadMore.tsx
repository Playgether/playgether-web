import { IoArrowDownCircleSharp } from "react-icons/io5"

const LoadMore = () => {
    return (
        <div className="relative h-24 w-full text-orange-500 flex flex-row items-center justify-center bg-white-400 flex-grow mt-8 gap-2">
            <h1>Carregar mais</h1>
            <button>
                <IoArrowDownCircleSharp className="h-8 w-8 animate-bounce" />
            </button>
        </div>
    )
}

export default LoadMore