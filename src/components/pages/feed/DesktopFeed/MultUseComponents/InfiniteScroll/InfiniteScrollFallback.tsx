import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { HTMLAttributes } from "react";
import { twJoin } from "tailwind-merge"

interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
    message:string;
};

const InfiniteScrollFallback = ({message, ...rest}:InfiniteScrollProps)=> {
    return (
        <div className="w-full flex items-center justify-center flex-col text-center">
            <div className={twJoin("rounded bg-blue-100 text-blue-400 flex flex-col justify-center items-center", rest.className)}>
                <h1 className="font-bold text-lg">Um momento por favor</h1>
                <div className="flex gap-2">
                    <p>
                        {message}
                    </p>
                    <LoadingComponent className="h-6 w-6"/>
                </div>
            </div>
        </div>
    )
}

export default InfiniteScrollFallback;