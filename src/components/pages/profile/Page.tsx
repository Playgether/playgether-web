const Page = ({ children }:{ children: React.ReactNode }) => {
  return (
    <div className="max-w-[1420px] w-[90vw] flex flex-col items-center">
      <div className="mr-2 flex flex-col lg:flex-row md:flex-row mt-2 gap-2 w-full">
          {children}
      </div>
    </div>
  );
};

export default Page;
