import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import { WrongPasswordComponent } from "./WrongPassword";
import NoHaveAccount from "./NoHaveAccount";
import { UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import { loginAction } from "@/actions/auth";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import {
  CustomToastErrorMessages,
  CustomToastProps,
} from "@/error/custom-toaster/enum";
import FormLoginButton from "./FormLoginButton";
import { useState } from "react";
import { LoginFormSchema } from "./LoginFormSchema";
import { redirect } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

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
  const { setIsLoggedOut } = useAuthContext();
  const LoginUserSchema = LoginFormSchema();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { message: string }>
  >({});

  const clientAction = async (formData: FormData) => {
    const newUser = {
      username: formData.get("username"),
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
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await clientAction(formData);
      }}
    >
      <CustomToaster />
      {unauthorized && (
        <WrongPasswordComponent
          wrongPassword={"Username ou senha incorreto(s)"}
        />
      )}
      <ErrosInput field={validationErrors.username || errors.username} />
      <InputLayout
        type="text"
        placeholder="Username"
        register={{ ...register("username") }}
        name="username"
      />

      <ErrosInput field={validationErrors.password || errors.password} />
      <InputLayout
        type="password"
        placeholder="Password"
        register={{ ...register("password") }}
        name="password"
      />
      <FormLoginButton />
      <div className="mb-4"></div>
      <NoHaveAccount onClickAqui={onClickAqui} />
    </form>
  );
};
