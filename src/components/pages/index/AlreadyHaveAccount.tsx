interface AlreadyHaveAccountProps {
  onClickAqui: () => void;
}

const AlreadyHaveAccount = ({ onClickAqui }: AlreadyHaveAccountProps) => {
  return (
    <p className="text-center text-muted-foreground text-sm">
      Já possui uma conta?{" "}
      <button
        type="button"
        onClick={onClickAqui}
        className="text-neon-blue hover:underline font-medium"
      >
        Entre aqui.
      </button>
    </p>
  );
};

export default AlreadyHaveAccount;
