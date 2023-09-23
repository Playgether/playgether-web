import { HTMLAttributes } from "react"
import TextLimitComponent from "./TextLimitComponent"

interface GlobalMessagesProps extends HTMLAttributes<HTMLDivElement> {
    message: {
        username: string,
        message: string
    }
}
export const GlobalMessagesComponent = ({message, ...rest}: GlobalMessagesProps) => {
    return (
        <div className="relative w-full z-0">
            <TextLimitComponent text={message.username + ":"} maxCharacters={192} className="ml-2 lg:text-sm z-0" paragraphClassName="whitespace-no-wrap font-semibold text-blue-500"/>
            <TextLimitComponent text={message.message} maxCharacters={250} className="flex-1 ml-2 lg:text-sm z-0" paragraphClassName="font-normal text-black-300 whitespace-no-wrap"/>
        </div>
    )
}