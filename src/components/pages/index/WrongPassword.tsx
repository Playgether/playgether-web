export const WrongPasswordComponent = ({wrongPassword}) => {
    return (
        <div className="text-center pb-2">
            {wrongPassword && <p className="text-red-400 ">{wrongPassword}</p>}    
        </div> 
    )
}