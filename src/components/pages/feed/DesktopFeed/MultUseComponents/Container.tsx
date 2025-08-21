const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid xl:grid-cols-[250px_600px_350px] 2xl:grid-cols-[250px_600px_305px] w-auto gap-4">
      {children}
    </div>
  );
};

export default Container;
