import {
  FieldErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useState, useEffect } from "react";
import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import AlreadyHaveAccount from "./AlreadyHaveAccount";
import PasswordInput from "@/components/layouts/PasswordInput";
import { Check, FileText } from "lucide-react";
import { TermsViewModal } from "@/components/terms/TermsViewModal";
import { useTermsContext } from "@/context/TermsContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { LegalDocumentData } from "@/context/TermsContext";

interface FormCadastroImplementationProps {
  handleSubmit: UseFormHandleSubmit<any | undefined>;
  register: void | any;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  backendErrors?: { username?: string; email?: string; general?: string; accepted_documents?: string };
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
  setValue,
  watch,
  backendErrors = {},
  Submiting,
  onClickAqui,
  availableUsernameResult,
  getValues,
}: FormCadastroImplementationProps) => {
  const { documents, loadDocuments } = useTermsContext();
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState<LegalDocumentData | null>(null);

  const acceptedDocuments: number[] = watch("accepted_documents") ?? [];

  useEffect(() => {
    loadDocuments().finally(() => setLoading(false));
  }, [loadDocuments]);

  const toggleDocument = (doc: LegalDocumentData) => {
    const next = acceptedDocuments.includes(doc.id)
      ? acceptedDocuments.filter((id) => id !== doc.id)
      : [...acceptedDocuments, doc.id];
    setValue("accepted_documents", next, { shouldValidate: true });
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit(Submiting)}>
        {backendErrors.general && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {backendErrors.general}
          </div>
        )}
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
            <ErrosInput field={errors.username || (backendErrors.username && { message: backendErrors.username })} />
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
          <ErrosInput field={errors.email || (backendErrors.email && { message: backendErrors.email })} />
        </div>

        <div className="space-y-1">
          <PasswordInput
            placeholder="Senha"
            register={{ ...register("password") }}
            autoComplete="new-password"
            inputClassName="bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 backdrop-blur-sm"
          />
          <ErrosInput field={errors.password} />
        </div>

        <div className="space-y-1">
          <PasswordInput
            placeholder="Repita a senha"
            register={{ ...register("repeatPassword") }}
            autoComplete="new-password"
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

        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <LoadingComponent showText={false} className="h-4 w-4" />
              <span className="text-muted-foreground text-sm">Carregando termos...</span>
            </div>
          ) : documents.length > 0 ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                Termos &amp; Políticas
              </p>
              <div className="space-y-2">
                {documents.map((doc) => {
                  const checked = acceptedDocuments.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border transition-all duration-200
                        ${checked
                          ? "border-primary/60 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-[0_0_8px_rgba(var(--primary),0.15)]"
                          : "border-border/40 bg-background/30 hover:border-border hover:bg-muted/20"
                        }`}
                    >
                      {/* Hidden native checkbox for accessibility */}
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocument(doc)}
                        className="sr-only"
                      />

                      {/* Custom checkbox */}
                      <div
                        className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                          ${checked
                            ? "border-primary bg-gradient-primary"
                            : "border-border/60 bg-transparent"
                          }`}
                      >
                        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>

                      {/* Icon */}
                      <div className={`shrink-0 p-1 rounded-lg transition-colors duration-200 ${checked ? "bg-primary/20" : "bg-muted/40"}`}>
                        <FileText className={`w-3.5 h-3.5 ${checked ? "text-primary" : "text-muted-foreground"}`} />
                      </div>

                      {/* Label */}
                      <span className={`flex-1 text-xs leading-tight transition-colors duration-200 ${checked ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {doc.title}
                      </span>

                      {/* Ler button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setViewingDoc(doc);
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70 transition-all duration-200"
                      >
                        Ler
                      </button>
                    </label>
                  );
                })}
              </div>
              <ErrosInput
                field={
                  errors.accepted_documents ||
                  (backendErrors.accepted_documents && {
                    message: backendErrors.accepted_documents,
                  })
                }
              />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nenhum termo disponível no momento. Entre em contato com o suporte.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-bold text-lg tracking-widest uppercase hover:scale-[1.02] hover:shadow-glow-primary transition-all duration-300"
        >
          CADASTRAR
        </button>

        <AlreadyHaveAccount onClickAqui={onClickAqui} />
      </form>

      <TermsViewModal
        open={!!viewingDoc}
        onOpenChange={(open) => !open && setViewingDoc(null)}
        document={viewingDoc}
      />
    </>
  );
};
