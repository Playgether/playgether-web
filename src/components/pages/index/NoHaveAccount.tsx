interface NoHaveAccount {
    onClickAqui: () => void
}

const NoHaveAccount = ({onClickAqui}) => {
    return (
        <div className='nb-4'>
            <p className="text-black-300">Não possui uma conta? <a href='#' onClick={onClickAqui} className='text-blue-600'>Registre-se aqui.</a></p>
        </div>
    )
}

export default NoHaveAccount;