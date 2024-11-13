import {  PiMaskHappyThin } from "react-icons/pi";
import { LoadingComponent } from "../../components/layouts/components/LoadingComponent";


export default function LoadingFeed() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-orange-500 gap-2">
                <div className="flex items-center justify-center text-xl gap-2">
                    <p>Seu feed está sendo preparado...</p>
                    <LoadingComponent className="h-8 w-8"/>
                </div>
                <div className="text-blue-500">
                    <PiMaskHappyThin className="h-10 w-10"/>
                </div>
        </div>
    )
}