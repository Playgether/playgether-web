import { LoadingComponent } from "../../components/layouts/components/LoadingComponent"

export const LoadingComments = () => {
    return (
        <div className="flex gap-2 bg-black-400 text-white-200">
            <p>The comments are loading </p>
            <LoadingComponent className="h-8 w-8"/>
        </div>
    )
}