interface AlreadyHaveAccountProps {
  onClickAqui: () => void;
}

const AlreadyHaveAccount = ({ onClickAqui }: AlreadyHaveAccountProps) => {
  return (
    <div className="nb-4">
      <p className="AlreadyHaveAccount-p">
        Já possui uma conta?{" "}
        <a href="#" onClick={onClickAqui} className="AlreadyHaveAccount-a">
          Entre aqui.
        </a>
      </p>
    </div>
  );
};

export default AlreadyHaveAccount;
