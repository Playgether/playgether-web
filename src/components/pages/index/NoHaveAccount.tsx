interface NoHaveAccount {
  onClickAqui: () => void;
}

const NoHaveAccount = ({ onClickAqui }) => {
  return (
    <div className="nb-4">
      <p className="AlreadyHaveAccount-p">
        Não possui uma conta?{" "}
        <a href="#" onClick={onClickAqui} className="AlreadyHaveAccount-a">
          Registre-se aqui.
        </a>
      </p>
    </div>
  );
};

export default NoHaveAccount;
