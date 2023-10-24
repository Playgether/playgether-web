import { LoadingComponent } from "../components/LoadingComponent"

export const CommentSectionFallback = () => {
    return (
        <div className="flex gap-2 bg-white-200 w-full h-full items-center justify-center text-lg 2xl:text-xl">
            <p>Os comentários estão carregando...</p>
            <LoadingComponent className="h-8 w-8"/>
        </div>    
    )
}