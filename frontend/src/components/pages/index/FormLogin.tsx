import React from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { LoginFormSchema } from "./LoginFormSchema";
import { zInferForm } from "../../layouts/FormTypeLayout";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { SubmitingForm } from "../../layouts/SubmitingFormLayout";
import { FormLoginImplementation } from "./FormLoginImplementation";

interface FormLoginProps {
    onClickAqui: () => void
}

const FormLogin = ({onClickAqui}: FormLoginProps) => {
    const { login, wrongPassword } = useAuthContext();
    const LoginUserSchema = LoginFormSchema()
    const LoginUserFormData = zInferForm(LoginUserSchema)
    const { register, handleSubmit, errors } = UseFormState(LoginUserFormData, LoginUserSchema);

    const Submiting = (data: typeof LoginUserFormData) => {
        SubmitingForm(() => login(data))   
    }

    return (
        <FormLoginImplementation
            handleSubmit={handleSubmit}
            wrongPassword={wrongPassword}
            register={register}
            errors={errors}
            Submiting={Submiting}
            onClickAqui={onClickAqui}
        />
    );
};

export default FormLogin;
