import TextLimitComponent from "../SuspenseFallBack/TextLimitComponent/TextLimitComponent";

export type PostTextProps = {
  /** Esta variavel recebe um objeto de um post qualquer, e através dele, este componente pega o comment deste post e então exibe na tela */
  resource: {
    comment: string;
  };
  /** Este componente também utiliza o componente "TextLimitComponent" e portanto, esta variável consegue receber uma quantidade máxima de caracteres para limitar o texto
   * em um determinado ponto. No caso da página feed, são 500 caracteres.
   */
  maxCharacteres: number;
};

/** Este é o componente responsável por gerar os textos dos posts da página feed */
const PostText = ({ resource, maxCharacteres }: PostTextProps) => {
  return (
    <div className="w-full text-left pl-4 lg:pl-6 pr-6 PostsText-wrapper text-sm">
      <TextLimitComponent
        text={`${resource?.comment}`}
        maxCharacters={maxCharacteres}
      />
    </div>
  );
};

export default PostText;
