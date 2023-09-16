import { ReactNode } from "react"
import ButtonClose from "./ButtonClose";

type ModalProps = {
    onClick: () => void;
    children: ReactNode
}

const ModalBackground = ({onClick, children} : ModalProps) => {
    const handleClick = (e: MouseEvent) => {
        onClick();
    };

    return (
        <div className="w-full h-2/6 bg-white-400" onClick={()=> handleClick}>
            {children}
        </div>
    );
};

const ModalBody = ({children}: ModalProps) => {
    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
    }

    return (
        <div className=" bg-white-300 m-auto h-full w-full overflow-y-auto" onClick={() => handleClick}>
            {children}
        </div>
    )
}



interface ControlledModalProps {
    children: ReactNode
    shouldShow: boolean
    onRequestClose: () => void
}

const ControlledModal = ({shouldShow, onRequestClose, children}:ControlledModalProps) => {
    return (
        <>
        {shouldShow ? (
            <ModalBackground onClick={onRequestClose}>
                <ModalBody onClick={()=> shouldShow}>
                    {children}
                </ModalBody>
            </ModalBackground>
        ): null}
        </>
    )
}

export default ControlledModal