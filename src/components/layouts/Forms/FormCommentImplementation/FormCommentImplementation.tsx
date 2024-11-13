import { FieldErrors, UseFormHandleSubmit } from "react-hook-form"
import { ErrosInput } from "../../ErrosInputLayout/ErrorsInputLayout"
import OrangeButton from "../../../elements/OrangeButton/OrangeButton";
import TextAreaLayout from "../../TextAreaLayout/TextAreaLayout";

export interface FormCommentProps {
    /** handleSubmit é uma prop do tipo "UseFormHandleSubmit" da biblioteca zod, que por sua vez é uma função que receberá outra função (neste caso Submiting, prop abaixo) que
     * vai gerenciar o envio de um formulário zod.
     * Em resumo é: Esta é uma função da biblioteca zod que gerencia o envio de formulários, todos os formulários que seram enviados precisam desta função, esta função por sua
     * vez recebe outra função (que vai ser criada por você) pra definir para onde vai ser o envio do formulário. Você pode receber esta função ao utilizar o componente
     * "UseFormState" passando um schema para ele.
    */
    handleSubmit: UseFormHandleSubmit<any | undefined>
    /** Esta também é uma função que vem da biblioteca zod (você também pode ter acesso a ela utilizando "UseFormState") que tem como função registrar os campos deste formulário
     * (ou qualquer outro que estejamos criando)
     */
    register: void | any;
    /** Este é um objeto que também vem a biblioteca zod, seu intuito é exibir erros (caso haja algum) em cada campo do formulário, assim, é possível exibí-los para o usuário */
    errors: FieldErrors<any>;
    /** Esta prop deve receber uma função propriamente dita para onde o formulário será enviado */
    Submiting: any;
}

/** Este componente é responsável por implementar o formulário de envio de comentários */
export const FormCommentImplementation = ({handleSubmit, register, errors, Submiting}: FormCommentProps) => {
    return (
        <>
        <form
            onSubmit={handleSubmit(Submiting)}
            className="h-full w-full relative border border-solid border-blue-500 bg-white-200 "
          >
          <div className="flex w-full h-full justify-end items-center"> 
              <TextAreaLayout
                register={register('comment')}
                maxRows={10}
                minRows={2}
                placeholder="Digite um comentário"
                className="h-full w-full"
                textAreaClassName="resize-none py-4 focus:bg-gray-50 border focus:border-none h-full"
              />
            </div> 
            <div className=" h-full flex justify-end bg-gray-50">
                <OrangeButton
                  className="py-2 w-full"
                  type="submit"
                >
                  Enviar
                </OrangeButton>
            </div>
            {errors ? (     
                  <ErrosInput 
                  field={errors.comment} 
                  className="pl-4 absolute top-8 h-full px-2 pt flex flex-col pt-2"/>     
              ): null}
        </form>
        </>
      );
    }      