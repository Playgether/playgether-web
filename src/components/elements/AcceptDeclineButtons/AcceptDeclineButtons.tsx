import { IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5"

type AcceptDeclineButtonsProps = {
    acceptAction: () => any,
    declineAction: () => any,
}
const AcceptDeclineButtons = ({acceptAction, declineAction}) => {
    return (
        <>
            <div className="h-14 w-14 bg-gray-200 flex justify-center items-center rounded hover:bg-green-200 group cursor-pointer transition-all duration-200 ease-in-out" onClick={() => acceptAction()}>
                <IoCheckmarkOutline className='h-8 w-8 text-black-200 group-hover:scale-125 transition-transform duration-200 ease-in-out'></IoCheckmarkOutline>
            </div>
            <div className="h-14 w-14 bg-gray-200 flex justify-center items-center rounded hover:bg-red-200 group cursor-pointer transition-all duration-200 ease-in-out" onClick={() => declineAction()}>
                <IoCloseOutline className='h-8 w-8 text-black-200 group-hover:scale-125 transition-transform duration-200 ease-in-out'></IoCloseOutline>
            </div>
        </>
    )
}

export default AcceptDeclineButtons;