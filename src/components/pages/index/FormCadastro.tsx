import React, { useState, useEffect } from "react";
import { post, postCadastroProps, CadastroError } from "../../../services/postCadastro";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { RegisterFormSchema } from "./RegisterFormSchema";
import { FormRegisterImplementation } from "./FormRegisterImplementation";
import SuccessfullyRegistered from "./SuccessfullyRegistered";
import HandleAvailableUsernames from "./HandleAvailableUsername";
import { useTermsContext } from "@/context/TermsContext";

interface FormCadastroProps {
  onClickAqui: () => void;
}

const FormCadastro = ({ onClickAqui }: FormCadastroProps) => {
  const [success, setSuccess] = useState("");
  const [backendErrors, setBackendErrors] = useState<CadastroError>({});
  const [availableUsernameResult, setAvailableUsernameResult] = useState(<span />);
  const { documents, loadDocuments } = useTermsContext();
  const [requiredIds, setRequiredIds] = useState<number[]>([]);

  useEffect(() => {
    loadDocuments().then((docs) => {
      setRequiredIds(docs.map((d) => d.id));
    });
  }, [loadDocuments]);

  const RegisterUserSchema = RegisterFormSchema(requiredIds);
  const { register, handleSubmit, errors, getValues, setValue, watch } =
    UseFormState(RegisterUserSchema, { accepted_documents: [] });

  const handleAvailableUsernames = async (username: string) => {
    HandleAvailableUsernames(username, errors, setAvailableUsernameResult);
  };

  const Submiting = async (data: postCadastroProps & { accepted_documents?: number[] }) => {
    setBackendErrors({});
    const payload: postCadastroProps = {
      ...data,
      accepted_documents: data.accepted_documents ?? [],
    };
    const result = await post(payload);

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
          setValue={setValue}
          watch={watch}
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
