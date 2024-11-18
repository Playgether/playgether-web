import { FieldErrors, UseFormGetValues, UseFormHandleSubmit } from "react-hook-form";
import OrangeButton from "../../elements/OrangeButton/OrangeButton";
import { ErrosInput } from "../../layouts/ErrosInputLayout/ErrorsInputLayout";
import InputLayout from "../../layouts/InputLayout";
import AlreadyHaveAccount from "./AlreadyHaveAccount";

interface FormCadastroImplementationProps {
    handleSubmit: UseFormHandleSubmit<any | undefined>;
    register: void | any;
    errors: FieldErrors<any>;
    Submiting: any;
    onClickAqui: () => void;
    handleAvailableUsernames: (username: string) => Promise<void>;
    availableUsernameResult: React.ReactNode
    getValues: UseFormGetValues<any>
}

export const FormRegisterImplementation = ({handleSubmit, handleAvailableUsernames, register, errors, Submiting, onClickAqui, availableUsernameResult, getValues} : FormCadastroImplementationProps) => {
    return (
        <form onSubmit={handleSubmit(Submiting)}>
            <div className="mb-4 grid grid-row-2 grid-cols-6 space-x-1 w-full">
                <div className="col-span-5">
                    <InputLayout
                        type="text"
                        placeholder="Nome de usuário"
                        register = {{...register('username')}}
                        className="mb-0"
                        
                    />
                    {availableUsernameResult}
                    <ErrosInput field={errors.username}/>
                </div>
                <div className="col-span-1">
                    <OrangeButton
                    onClick={() => handleAvailableUsernames(getValues("username"))}
                    className="h-12 w-14 text-sm px-2 py-2"
                    type="button"
                    >
                    Testar
                    </OrangeButton> 
                </div>
            </div>
            <InputLayout
                type="email"
                placeholder="Email"
                register = {{...register('email')}}
            />
            <ErrosInput field={errors.email}/>
            

            <InputLayout
                type="password"
                placeholder="Senha"
                register = {{...register('password')}}
            />
            <ErrosInput field={errors.password}/>
            
        
            <InputLayout
                type="password"
                placeholder="Repita a senha"
                register = {{...register('repeatPassword')}}
            />
            <ErrosInput field={errors.repeatPassword}/>
            
        
            <InputLayout
                type="text"
                placeholder="Primeiro nome"
                register = {{...register('first_name')}}
            />
            <ErrosInput field={errors.first_name}/>
            
        
            <InputLayout
                type="text"
                placeholder="Sobrenome"
                register = {{...register('last_name')}}
            />
            <ErrosInput field={errors.last_name}/>
            
            
            <div className="mb-4">
                <div className= "flex flex-row gap-2 text-black-300 items-center">
                    <div className="flex flex-col items-center justify-center">
                        <input
                            type="checkbox"
                            {...register('agree')}
                        />
                    </div>
                    <div className="mb-1">
                        <p>Concordo com os termos</p>
                    </div>
                </div>
                <ErrosInput field={errors.agree}/>
            </div>
            <div className="mb-4">
                <OrangeButton
                    className="inline-block w-full leading-none shadow px-8 py-4"
                >
                    CADASTRAR
                </OrangeButton>
            </div>
            <AlreadyHaveAccount onClickAqui={onClickAqui} />
        </form>
    )
}