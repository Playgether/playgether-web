import OrangeButton from "../../elements/OrangeButton/OrangeButton";
import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import { WrongPasswordComponent } from "./WrongPassword";
import NoHaveAccount from "./NoHaveAccount";
import { UseFormHandleSubmit, FieldErrors } from "react-hook-form";

interface FormLoginImplementationProps {
    handleSubmit: UseFormHandleSubmit<any | undefined>;
    wrongPassword: string | null;
    register: void | any;
    errors: FieldErrors<any>;
    Submiting: any;
    onClickAqui: () => void;
}

export const FormLoginImplementation = ({handleSubmit, wrongPassword, register, errors, Submiting, onClickAqui} : FormLoginImplementationProps) => {
    return (
        <form onSubmit={handleSubmit(Submiting)}>
            <WrongPasswordComponent wrongPassword={wrongPassword} />
            
            <InputLayout
                type='text'
                placeholder='Username' 
                register={{...register('username')}} 
            />
            <ErrosInput field={errors.username}/>
        
        
            <InputLayout
                type='password'
                placeholder='Password' 
                register={{...register('password')}} 
            />
            <ErrosInput field={errors.password}/>
            
            <div className='mb-4'>
                <OrangeButton className='inline-block w-full leading-none shadow px-8, py-4' onSubmit={handleSubmit(Submiting)}>
                    LOGAR
                </OrangeButton>
            </div>
            <NoHaveAccount onClickAqui={onClickAqui} />
        </form>
    )
}