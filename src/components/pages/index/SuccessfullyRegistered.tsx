import { CheckCircle2 } from "lucide-react";

interface SuccessfullyRegisteredProps {
  onClickAqui: () => void;
  success: string;
}

const SuccessfullyRegistered = ({
  onClickAqui,
  success,
}: SuccessfullyRegisteredProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-4">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-neon-green/20 p-4 ring-4 ring-neon-green/30">
          <CheckCircle2 className="h-14 w-14 text-neon-green" strokeWidth={2} />
        </div>
        <h2 className="text-center font-semibold text-lg text-foreground">
          Cadastro realizado!
        </h2>
        <p className="text-center text-sm text-muted-foreground max-w-xs">
          {success}
        </p>
      </div>
      <button
        type="button"
        onClick={onClickAqui}
        className="w-full py-3.5 rounded-xl font-bold text-base tracking-wider uppercase bg-gradient-primary text-primary-foreground hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-300"
      >
        Ir para Login
      </button>
    </div>
  );
};

export default SuccessfullyRegistered;
