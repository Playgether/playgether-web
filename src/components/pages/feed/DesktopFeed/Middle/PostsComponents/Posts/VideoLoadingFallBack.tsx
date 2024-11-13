import { LoadingComponent } from "../../../../../../layouts/components/LoadingComponent"

export const VideoLoadingFallback = () => {
    return (
        <div className="h-full w-full flex items-center justify-center bg-white-400">
            <div className="flex gap-2">
            <p>Your video is loading...</p>
            <LoadingComponent className="h-8 w-8"/>
            </div>
        </div>
    )
}