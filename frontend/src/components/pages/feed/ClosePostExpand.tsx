import ButtonClose from "../../elements/ButtonClose"

interface ClosePostExpandProps {
    onClose: () => void
}

export const ClosePostExpand = ({onClose}: ClosePostExpandProps) => {
    return (
        <div className="h-10 w-10">
            <ButtonClose className="h-full w-full" onClick={onClose}>X</ButtonClose>
        </div>
    )
}