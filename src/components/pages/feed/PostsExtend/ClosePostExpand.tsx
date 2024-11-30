import ButtonClose from "../../../elements/ButtonClose/ButtonClose"

interface ClosePostExpandProps {
    onClose: () => void
}

export const ClosePostExpand = ({onClose}: ClosePostExpandProps) => {
    return (
        <div className="h-10 w-10 mr-4">
            <ButtonClose className="h-full" onClick={onClose}>X</ButtonClose>
        </div>
    )
}