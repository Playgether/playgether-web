import { LoadingComponent } from "../components/layouts/components/LoadingComponent";

export default function LoadingHome() {
  return (
    <div className="flex gap-2 h-screen w-screen SuspensePagesStyle-wrapper items-center justify-center text-xl">
      <LoadingComponent
        className="h-8 w-8"
        text="Carregando..."
        showText={true}
      />
    </div>
  );
}
