import React from "react";
import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";

/** Este componente é o wrapper da lista de usuários online, seu intuito é mostrar e estilizar a lista de pessoas onlines dentro do componente de OnlineFriends na feed page */
const OnlineFriendsList = ({}) => {
    return (

        <div className="flex flex-col pl-2">
            <div className="flex items-center justify-start space-x-2 pt-2">
                <div className="rounded-full h-12 w-12 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500">Mia Jensen</h1></a>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2 pt-2">
                <div className="rounded-full h-12 w-12 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500">Mia Jensen</h1></a>
                </div>
            </div>
            <div className="flex items-center justify-start space-x-2 pt-2">
                <div className="rounded-full h-12 w-12 bg-red-200 flex items-center justify-center relative">
                    <a href=""><h1 className="text-sm">pic</h1></a>
                </div>
                <div>
                    <a href=""><h1 className="font-medium text-orange-500"><TextLimitComponent text={"Mustabellin Krustaprole"} maxCharacters={15}/></h1></a>
                </div>
            </div>
        </div>

    );
};

export default OnlineFriendsList