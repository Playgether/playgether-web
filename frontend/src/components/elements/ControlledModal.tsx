import { ReactNode } from "react"
import OrangeButton from "./OrangeButton"

type ModalProps = {
    onClick: () => void;
    children: ReactNode
}

const ModalBackground = ({onClick, children} : ModalProps) => {
    const handleClick = (e: MouseEvent) => {
        onClick();
    };

    return (
        <div className="absolute z-1 w-full h-2/6 bg-slate-200" onClick={()=> handleClick}>
            {children}
        </div>
    );
};

const ModalBody = ({children}: ModalProps) => {
    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
    }

    return (
        <div className="bg-red-200 m-auto p-20 w-3/6" onClick={() => handleClick}>
            {children}
        </div>
    )
}



interface ControlledModalProps {
    children: ReactNode
    shouldShow: boolean
    onRequestClose: () => void
    buttonHideChildren: string
}

const ControlledModal = ({shouldShow, onRequestClose, buttonHideChildren, children}:ControlledModalProps) => {
    return (
        <>
        {shouldShow ? (
            <ModalBackground onClick={onRequestClose}>
                <ModalBody onClick={()=> shouldShow}>
                    <OrangeButton onClick={onRequestClose}>{buttonHideChildren}</OrangeButton>
                    {children}
                </ModalBody>
            </ModalBackground>
        ): null}
        </>
    )
}

export default ControlledModal