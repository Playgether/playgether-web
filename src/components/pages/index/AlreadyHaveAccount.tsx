interface AlreadyHaveAccountProps {
    onClickAqui: () => void
}

const AlreadyHaveAccount = ({onClickAqui}: AlreadyHaveAccountProps) => {
    return (
        <div className="nb-4">
            <p className="text-black-300">
                Já possui uma conta?{' '}
                <a href="#" onClick={onClickAqui} className="text-blue-600">
                Entre aqui.
                </a>
            </p>
        </div>
    )
}

export default AlreadyHaveAccount