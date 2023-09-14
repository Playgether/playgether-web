import React from "react";
import { useState } from "react";
import { post, postCadastroProps } from "../../../services/postCadastro";
import { zInferForm } from "../../layouts/FormTypeLayout";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { RegisterFormSchema } from "./RegisterFormSchema";
import { SubmitingForm } from "../../layouts/SubmitingFormLayout";
import { FormRegisterImplementation } from "./FormRegisterImplementation";
import SuccessfullyRegistered from "./SuccessfullyRegistered";
import  HandleAvailableUsernames  from "./HandleAvailableUsername";
import { ZodSchema } from "zod";

interface FormCadastroProps {
  onClickAqui: () => void
}

const FormCadastro = ({ onClickAqui }: FormCadastroProps) => {
    const [success, setSuccess] = useState('');
    const [availableUsernameResult, setAvailableUsernameResult] = useState(<span></span>);
    const RegisterUserSchema = RegisterFormSchema()
    const RegisterUserFormData = zInferForm(RegisterUserSchema)
    const { register, handleSubmit, errors, getValues } = UseFormState(RegisterUserFormData, RegisterUserSchema);

    const handleAvailableUsernames = async (username : string) => {
        HandleAvailableUsernames(username, errors, setAvailableUsernameResult)
      };
      
      
    const Submiting = (data: postCadastroProps) => {
      SubmitingForm(() => post(data))   
      setSuccess('O seu cadastro foi realizado com sucesso!');
  }

  
    return (
      <>
        {success ? (
          <SuccessfullyRegistered 
              success={success}
              onClickAqui={onClickAqui}
          />
        ) : (
          <FormRegisterImplementation 
            handleSubmit={handleSubmit}
            register={register}
            errors={errors}
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
