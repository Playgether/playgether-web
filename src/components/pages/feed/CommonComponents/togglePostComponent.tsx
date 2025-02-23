export const TogglePostComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-row w-full space-x-3 items-center justify-center">
      <div className="text-sm w-full flex flex-row justify-center items-center space-x-2 pt-1">
        {children}
      </div>
    </div>
  );
};
