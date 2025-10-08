export default function TestLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  console.log("Test Layout");
  console.log({ modal });
  return (
    <>
      {children}
      {modal}
    </>
  );
}
