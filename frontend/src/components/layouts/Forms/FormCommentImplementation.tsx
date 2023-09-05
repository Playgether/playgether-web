import { FieldErrors, UseFormHandleSubmit } from "react-hook-form"
import { ErrosInput } from "../ErrorsInputLayout"
import InputLayout from "../InputLayout"
import OrangeButton from "../../elements/OrangeButton";
import TextAreaLayout from "../TextAreaLayout";

interface FormCommentProps {
    handleSubmit: UseFormHandleSubmit<any | undefined>
    register: void | any;
    errors: FieldErrors<any>;
    Submiting: any;
}

export const FormCommentImplementation = ({handleSubmit, register, errors, Submiting}: FormCommentProps) => {
    return (
        <>
        <div className="border border-solid border-blue-500 flex flex-row justify-between h-full items-center bg-white-200">
          <form
            onSubmit={handleSubmit(Submiting)}
            className="h-full w-full flex-grow flex-shrink relative"
          >
            <div className="relative flex h-full">
              <TextAreaLayout
                register={...register('comment')}
                type="text"
                placeholder="Digite um comentário"
                className="h-full bg-white-200 w-full pr-12"
              />
            </div>
            <div className="h-full flex items-center">
            <OrangeButton
              type="submit"
              className="absolute right-0 top-0 h-full px-2"
            >
              Enviar
            </OrangeButton>
            {errors ? (
                <div className="pl-4 absolute top-8 h-full px-2 pt flex flex-col w-full pt-2">
                    <ErrosInput field={errors.comment} />
                </div>
            ): null}
            </div>
          </form>
        </div>
        </>
      );
    }      