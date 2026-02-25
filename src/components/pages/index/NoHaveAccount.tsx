interface NoHaveAccount {
  onClickAqui: () => void;
}

const NoHaveAccount = ({ onClickAqui }) => {
  return (
    <p className="text-center text-muted-foreground text-sm">
      Não possui uma conta?{" "}
      <button
        type="button"
        onClick={onClickAqui}
        className="text-neon-blue hover:underline font-medium"
      >
        Registre-se aqui.
      </button>
    </p>
  );
};

export default NoHaveAccount;
