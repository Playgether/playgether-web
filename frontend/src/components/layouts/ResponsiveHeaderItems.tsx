import { ItemsHeader } from "./HeaderItems"

export const ResponsiveHearderItems = () => {
    return (
        <div className="lg:hidden flex flex-col bg-white-300 w-full h-screen absolute">
        <ItemsHeader />
        </div>    
    )
}