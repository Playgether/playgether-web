import OrangeButton from "../../elements/OrangeButton";
import { ErrosInput } from "../../layouts/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import { WrongPasswordComponent } from "./WrongPassword";
import NoHaveAccount from "./NoHaveAccount";

export const FormLoginImplementation = ({handleSubmit, wrongPassword, register, errors, Submiting, onClickAqui}) => {
    return (
        <form onSubmit={handleSubmit(Submiting)}>
            <WrongPasswordComponent wrongPassword={wrongPassword} />
            
            <InputLayout
                type='text'
                placeholder='Username' 
                register={...register('username')} 
            />
            <ErrosInput field={errors.username}/>
        
        
            <InputLayout
                type='text'
                placeholder='Password' 
                register={...register('password')} 
            />
            <ErrosInput field={errors.password}/>
            
            <div className='mb-4'>
                <OrangeButton className='inline-block w-full leading-none shadow px-8, py-4'>
                    LOGAR
                </OrangeButton>
            </div>
            <NoHaveAccount onClickAqui={onClickAqui} />
        </form>
    )
}