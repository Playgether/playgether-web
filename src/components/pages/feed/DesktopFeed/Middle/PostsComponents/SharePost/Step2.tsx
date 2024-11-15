import AcceptDeclineButtons from "../../../../../../elements/AcceptDeclineButtons/AcceptDeclineButtons";

const Step2 = ({nextStep, makeRequestWithoutMedia}) => {
    return(
        <div className="flex flex-col w-full justify-center items-center text-black-300 h-full gap-4 text-lg">
            <p>Você deseja adicionar medias para o seu post ?</p>
            <div className="flex justify-between gap-4">
                <AcceptDeclineButtons acceptAction={nextStep} declineAction={makeRequestWithoutMedia}/>
            </div>
        </div>
        
    )
}

export default Step2;