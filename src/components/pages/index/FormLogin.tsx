import React from "react";
import {} from "../../../context/AuthContext";
import { LoginFormSchema } from "./LoginFormSchema";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { SubmitingForm } from "../../layouts/SubmitingFormLayout";
import { FormLoginImplementation } from "./FormLoginImplementation";
import { loginUserProps } from "../../../services/loginUser";

interface FormLoginProps {
  onClickAqui: () => void;
}

const FormLogin = ({ onClickAqui }: FormLoginProps) => {
  // const { login, wrongPassword } = ();
  const LoginUserSchema = LoginFormSchema();
  const { register, handleSubmit, errors } = UseFormState(LoginUserSchema);

  const Submiting = (data: loginUserProps) => {
    SubmitingForm(() => login(data));
  };

  return (
    <FormLoginImplementation
      handleSubmit={handleSubmit}
      //   wrongPassword={wrongPassword}
      register={register}
      errors={errors}
      Submiting={Submiting}
      onClickAqui={onClickAqui}
    />
  );
};

export default FormLogin;
