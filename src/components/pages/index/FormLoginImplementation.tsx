import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import { WrongPasswordComponent } from "./WrongPassword";
import NoHaveAccount from "./NoHaveAccount";
import { UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import { loginAction, completeTwoFALogin } from "@/actions/auth";
import { unlockE2EKeys } from "@/context/E2ECryptoContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import {
  CustomToastErrorMessages,
  CustomToastProps,
} from "@/error/custom-toaster/enum";
import FormLoginButton from "./FormLoginButton";
import PasswordInput from "@/components/layouts/PasswordInput";
import { useState, useRef, useEffect } from "react";
import { LoginFormSchema } from "./LoginFormSchema";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { GoogleAuthButton } from "@/components/ui/GoogleAuthButton";
import { ShieldCheck, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormLoginImplementationProps {
  handleSubmit: UseFormHandleSubmit<any | undefined>;
  wrongPassword?: string | null;
  register: void | any;
  errors: FieldErrors<any>;
  Submiting: any;
  onClickAqui: () => void;
  redirectTo?: string;
}

function safeInternalRedirect(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/feed";
  return path;
}

export const FormLoginImplementation = ({
  register,
  errors,
  onClickAqui,
  redirectTo,
}: FormLoginImplementationProps) => {
  const router = useRouter();
  const [unauthorized, setUnauthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoggedOut } = useAuthContext();
  const LoginUserSchema = LoginFormSchema();
  const [validationErrors, setValidationErrors] = useState<Record<string, { message: string }>>({});

  // 2FA step
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [completing2FA, setCompleting2FA] = useState(false);
  const totpRef = useRef<HTMLInputElement>(null);
  const pendingPasswordRef = useRef<string>("");

  useEffect(() => {
    if (pendingToken) {
      setTotpCode("");
      setTimeout(() => totpRef.current?.focus(), 100);
    }
  }, [pendingToken]);

  const clientAction = async (formData: FormData) => {
    const newUser = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    const result = LoginUserSchema.safeParse(newUser);
    if (!result.success) {
      const errs: Record<string, { message: string }> = {};
      result.error.issues.forEach((issue) => {
        errs[issue.path[0]] = { message: issue.message };
      });
      setValidationErrors(errs);
      return;
    }

    const { error, pending_token } = await loginAction(formData);

    if (error === "requires_2fa" && pending_token) {
      pendingPasswordRef.current = formData.get("password") as string;
      setPendingToken(pending_token);
      return;
    }

    if (error === "wrong_password") {
      setUnauthorized(true);
      return;
    }
    setUnauthorized(false);

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
        },
      );
    }
    setIsLoggedOut(false);
    router.push(safeInternalRedirect(redirectTo));
  };

  const handleComplete2FA = async () => {
    if (!pendingToken || totpCode.length < 6) return;
    setCompleting2FA(true);
    try {
      const { error } = await completeTwoFALogin(pendingToken, totpCode, trustDevice);
      if (error) {
        CustomToast.error(error);
        return;
      }
      // Unlock E2E keys with the saved password
      if (pendingPasswordRef.current) {
        await unlockE2EKeys(pendingPasswordRef.current);
      }
      setIsLoggedOut(false);
      router.push(safeInternalRedirect(redirectTo));
    } finally {
      setCompleting2FA(false);
    }
  };

  // ── 2FA Step ────────────────────────────────────────────────────────────────
  if (pendingToken) {
    return (
      <div className="space-y-5">
        <CustomToaster />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Verificação em dois fatores</h3>
          <p className="text-sm text-muted-foreground">
            Informe o código do seu aplicativo autenticador.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Código 2FA</Label>
          <Input
            ref={totpRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="bg-background/40 border border-border/60 text-center text-2xl tracking-[0.4em] font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleComplete2FA()}
          />
        </div>

        <label className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border transition-all duration-200
          ${trustDevice
            ? "border-primary/60 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-[0_0_8px_rgba(var(--primary),0.15)]"
            : "border-border/40 bg-background/30 hover:border-border hover:bg-muted/50"
          }`}>
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="sr-only"
          />
          <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
            ${trustDevice ? "border-primary bg-gradient-primary" : "border-border/60 bg-transparent"}`}>
            {trustDevice && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <span className={`text-sm leading-tight transition-colors duration-200 ${trustDevice ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            Confiar neste dispositivo por 30 dias
          </span>
        </label>

        <Button
          className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
          onClick={handleComplete2FA}
          disabled={completing2FA || totpCode.length < 6}
        >
          {completing2FA
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</>
            : "Confirmar"}
        </Button>

        <button
          type="button"
          onClick={() => { setPendingToken(null); setTotpCode(""); }}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
        >
          ← Voltar ao login
        </button>
      </div>
    );
  }

  // ── Normal login form ────────────────────────────────────────────────────────
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
        <WrongPasswordComponent wrongPassword={"Email ou senha incorreto(s)"} />
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

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <GoogleAuthButton
        label="Continuar com Google"
        onError={(msg) => CustomToast.error(msg)}
        redirectTo={redirectTo}
      />

      <NoHaveAccount onClickAqui={onClickAqui} />
    </form>
  );
};
