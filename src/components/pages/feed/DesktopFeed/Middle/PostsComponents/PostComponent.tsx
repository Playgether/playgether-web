"use client";

/**
 * @deprecated This component is deprecated and no longer functional.
 * Post creation logic has been migrated to CreatePostModal.
 * This component is kept only for backwards compatibility but does not create posts.
 */

const PostComponent = ({
  isComponentVisible,
}: {
  isComponentVisible: Boolean;
}) => {
  return (
    <div
      className={` ${
        isComponentVisible
          ? "motion-preset-slide-down-sm"
          : "motion-preset-slide-up-lg"
      } w-full PostComponent-wrapper h-[300px] mt-2 rounded-lg flex flex-col shadow-lg mb-4 gap-1`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Componente Descontinuado</h2>
        <p className="text-sm text-muted-foreground">
          Este componente foi descontinuado. A funcionalidade de criação de posts
          foi movida para o modal principal.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Use o botão "Criar Post" no topo da página para criar novos posts.
        </p>
      </div>
    </div>
  );
};

export default PostComponent;
