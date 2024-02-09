import { ResponsiveFeedComponent } from "./ResponsiveFeedComponent"


export const ResponsiveContainer = () => {
    return (
        <div className="h-full w-full overflow-y-auto flex flex-col shadow-lg bg-white-300">
           <ResponsiveFeedComponent />
        </div>
    )
}