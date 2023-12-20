import { ResponsiveFeedComponent } from "./ResponsiveFeedComponent"


export const ResponsiveContainer = () => {
    return (
        <div className="h-full w-full overflow-y-auto flex flex-col shadow-lg">
           <ResponsiveFeedComponent />
        </div>
    )
}