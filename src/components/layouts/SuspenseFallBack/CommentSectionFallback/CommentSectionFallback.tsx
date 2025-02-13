import SkeletonComments from "@/components/elements/SkeletonComments/SkeletonComments";

/** Este componente serve como fallback enquanto o fetch de comentários não acontece */
export const CommentSectionFallback = () => {
  return (
    <div className="flex p-10 gap-10 w-full h-full items-center justify-between flex-col bg-white-200">
      <SkeletonComments className="w-full" />
      <SkeletonComments className="w-full" />
      <SkeletonComments className="w-full" />
      <SkeletonComments className="w-full" />
      <SkeletonComments className="w-full" />
      <SkeletonComments className="w-full" />
    </div>
  );
};
