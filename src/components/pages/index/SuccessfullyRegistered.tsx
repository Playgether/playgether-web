import OrangeButton from "../../elements/OrangeButton/OrangeButton";

interface SuccessfullyRegisteredProps {
    onClickAqui: () => void
    success: string
}


const SuccessfullyRegistered = ({onClickAqui, success} : SuccessfullyRegisteredProps) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-green-400 text-center font-medium text-md">{success}</h1>
            <OrangeButton
                onClick={onClickAqui}
                className="inline-block w-full leading-none shadow px-8 py-4"
              >
                Login
              </OrangeButton>
        </div>
    )
}

export default SuccessfullyRegistered;