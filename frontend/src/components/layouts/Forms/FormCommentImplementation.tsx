import { FieldErrors, UseFormHandleSubmit } from "react-hook-form"
import { ErrosInput } from "../ErrosInputLayout/ErrorsInputLayout"
import OrangeButton from "../../elements/OrangeButton/OrangeButton";
import TextAreaLayout from "../TextAreaLayout/TextAreaLayout";

interface FormCommentProps {
    handleSubmit: UseFormHandleSubmit<any | undefined>
    register: void | any;
    errors: FieldErrors<any>;
    Submiting: any;
}

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