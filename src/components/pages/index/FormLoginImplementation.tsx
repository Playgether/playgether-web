import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import { WrongPasswordComponent } from "./WrongPassword";
import NoHaveAccount from "./NoHaveAccount";
import { UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import { loginAction } from "@/actions/auth";
import { unlockE2EKeys } from "@/context/E2ECryptoContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import {
  CustomToastErrorMessages,
  CustomToastProps,
} from "@/error/custom-toaster/enum";
import FormLoginButton from "./FormLoginButton";
import PasswordInput from "@/components/layouts/PasswordInput";
import { useState } from "react";
import { LoginFormSchema } from "./LoginFormSchema";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { GoogleAuthButton } from "@/components/ui/GoogleAuthButton";

interface FormLoginImplementationProps {
  handleSubmit: UseFormHandleSubmit<any | undefined>;
  wrongPassword?: string | null;
  register: void | any;
  errors: FieldErrors<any>;
  Submiting: any;
  onClickAqui: () => void;
}

export const FormLoginImplementation = ({
  register,
  errors,
  onClickAqui,
}: FormLoginImplementationProps) => {
  const [unauthorized, setUnauthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoggedOut } = useAuthContext();
  const LoginUserSchema = LoginFormSchema();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { message: string }>
  >({});

  const clientAction = async (formData: FormData) => {
    const newUser = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    const result = LoginUserSchema.safeParse(newUser);
    if (!result.success) {
      const errors: Record<string, { message: string }> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0]] = { message: issue.message };
      });
      setValidationErrors(errors);
      return;
    }
    const { error } = await loginAction(formData);
    if (error === "wrong_password") {
      setUnauthorized(true);
      return;
    } else {
      setUnauthorized(false);
    }

    // Unlock and cache the E2E private key while we still have the plaintext password
    if (!error) {
      const password = formData.get("password") as string;
      await unlockE2EKeys(password);
    }

    if (error && error !== "wrong_password") {
      CustomToast.error(
        "Oops, parece que algo deu errado com a sua requisição",
        {
          description: CustomToastErrorMessages.wrongAuthRequest,
          duration: CustomToastProps.defaultDuration,
        }
      );
    }
    setIsLoggedOut(false);
    redirect("/feed");
  };
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
          await clientAction(formData);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <CustomToaster />
      {unauthorized && (
        <WrongPasswordComponent
          wrongPassword={"Email ou senha incorreto(s)"}
        />
      )}
      <div className="space-y-1">
        <ErrosInput field={validationErrors.email || errors.email} />
        <InputLayout
          type="email"
          placeholder="Email"
          register={{ ...register("email") }}
          name="email"
          inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-1">
        <ErrosInput field={validationErrors.password || errors.password} />
        <PasswordInput
          placeholder="Password"
          register={{ ...register("password") }}
          name="password"
          autoComplete="off"
          inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
        />
        <div className="flex justify-end pt-0.5">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
      <FormLoginButton pending={isSubmitting} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <GoogleAuthButton
        label="Continuar com Google"
        onError={(msg) => CustomToast.error(msg)}
      />

      <NoHaveAccount onClickAqui={onClickAqui} />
    </form>
  );
};
