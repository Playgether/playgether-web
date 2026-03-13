import React, { useState } from "react";
import { post, postCadastroProps, CadastroError } from "../../../services/postCadastro";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { RegisterFormSchema } from "./RegisterFormSchema";
import { FormRegisterImplementation } from "./FormRegisterImplementation";
import SuccessfullyRegistered from "./SuccessfullyRegistered";
import HandleAvailableUsernames from "./HandleAvailableUsername";

interface FormCadastroProps {
  onClickAqui: () => void;
}

const FormCadastro = ({ onClickAqui }: FormCadastroProps) => {
  const [success, setSuccess] = useState("");
  const [backendErrors, setBackendErrors] = useState<CadastroError>({});
  const [availableUsernameResult, setAvailableUsernameResult] = useState(<span />);
  const RegisterUserSchema = RegisterFormSchema();
  const { register, handleSubmit, errors, getValues } = UseFormState(RegisterUserSchema);

  const handleAvailableUsernames = async (username: string) => {
    HandleAvailableUsernames(username, errors, setAvailableUsernameResult);
  };

  const Submiting = async (data: postCadastroProps) => {
    setBackendErrors({});
    const result = await post(data);

    if (result.success) {
      setSuccess("O seu cadastro foi realizado com sucesso!");
    } else {
      setBackendErrors(result.errors);
    }
  };

  return (
    <>
      {success ? (
        <SuccessfullyRegistered success={success} onClickAqui={onClickAqui} />
      ) : (
        <FormRegisterImplementation
          handleSubmit={handleSubmit}
          register={register}
          errors={errors}
          backendErrors={backendErrors}
          Submiting={Submiting}
          onClickAqui={onClickAqui}
          handleAvailableUsernames={handleAvailableUsernames}
          availableUsernameResult={availableUsernameResult}
          getValues={getValues}
        />
      )}
    </>
  );
};
  
export default FormCadastro;
