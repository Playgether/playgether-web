/** Este componente é exibido quando algum post ainda não obteve nenhum comentário */
const NoHaveCommentsYet = () => {
  return (
    <div className="NoHaveCommentsYet-wrapper flex flex-col gap-3 text-center items-center justify-center h-full ">
      <p className="text-lg font-medium NoHaveCommentsYet-first-message">
        Parece que ainda não há comentários por aqui...
      </p>
      <p className="text-md font-small NoHaveCommentsYet-second-message">
        Seja o primeiro a realizar um comentário abaixo
      </p>
    </div>
  );
};

export default NoHaveCommentsYet;
