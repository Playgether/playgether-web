import {
  FieldErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
} from "react-hook-form";
import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import AlreadyHaveAccount from "./AlreadyHaveAccount";

interface FormCadastroImplementationProps {
  handleSubmit: UseFormHandleSubmit<any | undefined>;
  register: void | any;
  errors: FieldErrors<any>;
  Submiting: any;
  onClickAqui: () => void;
  handleAvailableUsernames: (username: string) => Promise<void>;
  availableUsernameResult: React.ReactNode;
  getValues: UseFormGetValues<any>;
}

export const FormRegisterImplementation = ({
  handleSubmit,
  handleAvailableUsernames,
  register,
  errors,
  Submiting,
  onClickAqui,
  availableUsernameResult,
  getValues,
}: FormCadastroImplementationProps) => {
  return (
    <form className="space-y-4" onSubmit={handleSubmit(Submiting)}>
      <div className="grid grid-cols-6 gap-2 w-full">
        <div className="col-span-5 space-y-1">
          <InputLayout
            type="text"
            placeholder="Nome de usuário"
            register={{ ...register("username") }}
            className="mb-0"
            inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
          />
          {availableUsernameResult}
          <ErrosInput field={errors.username} />
        </div>
        <div className="col-span-1 flex items-start">
          <button
            type="button"
            onClick={() => handleAvailableUsernames(getValues("username"))}
            className="w-full h-[46px] rounded-lg gradient-primary text-primary-foreground font-bold text-xs tracking-widest uppercase hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-300"
          >
            Testar
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <InputLayout
          type="email"
          placeholder="Email"
          register={{ ...register("email") }}
          inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
        />
        <ErrosInput field={errors.email} />
      </div>

      <div className="space-y-1">
        <InputLayout
          type="password"
          placeholder="Senha"
          register={{ ...register("password") }}
          inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
        />
        <ErrosInput field={errors.password} />
      </div>

      <div className="space-y-1">
        <InputLayout
          type="password"
          placeholder="Repita a senha"
          register={{ ...register("repeatPassword") }}
          inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
        />
        <ErrosInput field={errors.repeatPassword} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <InputLayout
            type="text"
            placeholder="Primeiro nome"
            register={{ ...register("first_name") }}
            inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
          />
          <ErrosInput field={errors.first_name} />
        </div>

        <div className="space-y-1">
          <InputLayout
            type="text"
            placeholder="Sobrenome"
            register={{ ...register("last_name") }}
            inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
          />
          <ErrosInput field={errors.last_name} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            {...register("agree")}
            className="w-5 h-5 rounded border-2 border-foreground/30 bg-transparent accent-neon-blue"
          />
          <span className="text-muted-foreground text-sm group-hover:text-foreground/80 transition-colors">
            Concordo com os termos
          </span>
        </label>
        <ErrosInput field={errors.agree} />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-bold text-lg tracking-widest uppercase hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-300"
      >
        CADASTRAR
      </button>

      <AlreadyHaveAccount onClickAqui={onClickAqui} />
    </form>
  );
};
