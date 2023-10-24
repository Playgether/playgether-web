import { LoadingComponent } from "../../components/layouts/components/LoadingComponent"

export const LoadingPosts = () => {
    return (
        <div className="flex gap-2 bg-blue-400">
            <p>The posts are loading </p>
            <LoadingComponent className="h-8 w-8"/>
        </div>
    )
}