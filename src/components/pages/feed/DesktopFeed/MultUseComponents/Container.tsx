const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-[250px_600px_250px] w-auto gap-4">
      {children}
    </div>
  );
};

export default Container;
