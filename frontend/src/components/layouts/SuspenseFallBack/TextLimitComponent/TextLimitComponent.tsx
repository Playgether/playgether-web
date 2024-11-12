'use client'

import { useState, useEffect, HTMLAttributes } from 'react';
import { twJoin } from 'tailwind-merge';

export interface TextLimitComponentProps extends HTMLAttributes<HTMLDivElement> {
  /** Esta variável recebe o texto que você quer limitar (por exemplo, uma descrição que pode ser muito grande e quebrar o template), passe o texto que será recebido ou já está criado. */
  text: string
  /**
   * Essa propriedade recebe o número máximo de caracteres que este texto pode receber (exemplo 150 caracteres), ao chegar nesta quantidade, o resto do texto receberá reticências.
   */
  maxCharacters: number
  /** Você também pode passar um estilo personalizado para o parágrafo que será gerado a partir deste componente, como no tawilnd, é só passar os estilos e forma de string, Exemplo:
   * "w-full text-blue-500 ..."
   */
  paragraphClassName?: string
  /** Com a propriedade textFinal você pode modificar o que deseja que apareça no final do texto, por padrão, ele adicionará reticências, porém, você pode adicionar alguma outra coisa como por exemplo um "ver mais" */
  textFinal?:string
  /** Com esta variável é possível adicionar um estilo próprio para a string textFinal */
  textFinalClassName?:string
}

/** Esse componente é responsável por limitar a quantidade de caracteres em um design, após uma quantidade específica (passada via props) ele adiciona reticências na string passada.
 * Seu intuito é definir uma quantidade máxima de carcteres para algum componente que use texto para que o layout não seja quebrado
 */
const TextLimitComponent = ({ text, maxCharacters, textFinalClassName="", paragraphClassName, textFinal='...', ...rest }: TextLimitComponentProps) => {
  const [limitedText, setLimitedText] = useState(text);

  useEffect(() => {
    if (text.length > maxCharacters) {
      setLimitedText(text.substring(0, maxCharacters));
    } else {
      setLimitedText(text);
    }
  }, [text, maxCharacters]);

  return (
    <div className={twJoin(rest.className)}>

        <p className={twJoin(paragraphClassName)}>{limitedText}{text.length > maxCharacters && <span className={textFinalClassName}>{textFinal}</span>}</p>

    </div>
  );
};

export default TextLimitComponent;
