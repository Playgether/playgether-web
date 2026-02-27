import { FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import { ErrosInput } from "../../ErrosInputLayout/ErrorsInputLayout";
import DefaultButton from "../../../elements/DefaultButton/DefaultButton";
import TextAreaLayout from "../../TextAreaLayout/TextAreaLayout";

export interface FormCommentProps {
  /** handleSubmit é uma prop do tipo "UseFormHandleSubmit" da biblioteca zod, que por sua vez é uma função que receberá outra função (neste caso Submiting, prop abaixo) que
   * vai gerenciar o envio de um formulário zod.
   * Em resumo é: Esta é uma função da biblioteca zod que gerencia o envio de formulários, todos os formulários que seram enviados precisam desta função, esta função por sua
   * vez recebe outra função (que vai ser criada por você) pra definir para onde vai ser o envio do formulário. Você pode receber esta função ao utilizar o componente
   * "UseFormState" passando um schema para ele.
   */
  handleSubmit: UseFormHandleSubmit<any | undefined>;
  /** Esta também é uma função que vem da biblioteca zod (você também pode ter acesso a ela utilizando "UseFormState") que tem como função registrar os campos deste formulário
   * (ou qualquer outro que estejamos criando)
   */
  register: void | any;
  /** Este é um objeto que também vem a biblioteca zod, seu intuito é exibir erros (caso haja algum) em cada campo do formulário, assim, é possível exibí-los para o usuário */
  errors: FieldErrors<any>;
  /** Esta prop deve receber uma função propriamente dita para onde o formulário será enviado */
  Submiting?: any;
}

/** Este componente é responsável por implementar o formulário de envio de comentários */
export const FormCommentImplementation = ({
  handleSubmit,
  register,
  errors,
  Submiting,
}: FormCommentProps) => {
  return (
    <form
      onSubmit={handleSubmit(Submiting)}
      className="h-full w-full flex flex-col overflow-y-hidden max-h-[80vh]"
    >
      {/* Área do TextArea */}
      <div className="flex-grow flex flex-col AnswerComment-wrapper justify-start items-center w-full overflow-y-auto h-full">
        <TextAreaLayout
          register={register("comment")}
          maxRows={10}
          minRows={2}
          placeholder="Digite um comentário"
          className="h-full max-h-[124px] w-full"
          textAreaClassName="resize-none h-full max-h-[124px] py-4 AnswerComment-text-area"
        />
      </div>

      {/* Botão na parte inferior */}
      <div className="flex-shrink-0">
        <DefaultButton className="w-full" type="submit">
          Enviar
        </DefaultButton>
      </div>

      {/* Exibição de erros */}
      {errors && (
        <ErrosInput
          field={errors.comment}
          className="pl-4 absolute top-8 h-full px-2 flex flex-col mt-4"
        />
      )}
    </form>
  );
};
