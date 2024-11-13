
import { ErrosInput } from "../../../../../../layouts/ErrosInputLayout/ErrorsInputLayout";
import TextAreaLayout from "../../../../../../layouts/TextAreaLayout/TextAreaLayout";

const Step1 = ({register, errors}) => {
    return (
        <div className="h-full border-black-200 p-2 ">
            <div className="flex flex-col gap-1 w-full text-center">
                <p className="text-gray-500 text-xs">O texto não pode estar vazio e pode ter no máximo 2200 caracteres.</p>
            </div>
            <ErrosInput field={errors.text} className="text-center"/>
            <TextAreaLayout
                register={register('text')}
                maxRows={4}
                minRows={2}
                placeholder="Digite o texto e avance"
                className="h-5/6 w-full"
                textAreaClassName="resize-none focus:bg-gray-50 border focus:border-none max-h-full"
            />
        </div>
    )
}

export default Step1;