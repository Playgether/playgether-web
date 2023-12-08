import { ItemsHeader } from "./HeaderItems"
import IconsHeader from "./IconsHeader"

export const ResponsiveHearderItems = () => {
    return (
        <div className="lg:hidden flex flex-col bg-white-300 w-full h-screen absolute">
        <ItemsHeader />
        </div>    
    )
}