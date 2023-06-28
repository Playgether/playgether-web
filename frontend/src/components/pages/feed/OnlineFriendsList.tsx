import React from "react";

const OnlineFriendsList = ({}) => {
    return (

        <div className="flex flex-col">
            <div className="flex items-center justify-center space-x-2 pt-2">
                <div className="rounded-full h-12 w-12 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <h1 className="font-medium text-orange-500">Mia Jensen</h1>
                </div>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
                <div className="rounded-full h-12 w-12 bg-red-200 flex items-center justify-center relative">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div>
                    <h1 className="font-medium text-orange-500">Mia Jensen</h1>
                </div>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
                <div className="rounded-full h-12 w-12 bg-red-200 flex items-center justify-center relative">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div>
                    <h1 className="font-medium text-orange-500">Mia Jensen</h1>
                </div>
            </div>
        </div>

    );
};

export default OnlineFriendsList