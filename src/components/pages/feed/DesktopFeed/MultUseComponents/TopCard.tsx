export const TopCard = ({ title }: { title: string }) => {
  return (
    <div className="pb-2 flex flex-row items-center justify-center w-full rounded-t-lg pb-2s">
      <h1 className=" font-semibold text-black-200 text-center pt-2 border-opacity-30 text-md w-4/6 text-md">
        {title}
      </h1>
    </div>
  );
};
