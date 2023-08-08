import React from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { LoginFormSchema } from "./LoginFormSchema";
import { zInferForm } from "../../layouts/FormTypeLayout";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { SubmitingForm } from "../../layouts/SubmitingFormLayout";
import { FormLoginImplementation } from "./FormLoginImplementation";

const FormLogin = ({onClickAqui}) => {
    const { login, wrongPassword } = useAuthContext();
    const LoginUserSchema = LoginFormSchema()
    const LoginUserFormData = zInferForm(LoginUserSchema)
    const { register, handleSubmit, errors } = UseFormState(LoginUserFormData, LoginUserSchema);

    const Submiting = (data: typeof LoginUserFormData) => {
        SubmitingForm(data, login)   
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
