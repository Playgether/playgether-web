import { LoadingComponent } from "../components/layouts/components/LoadingComponent";
import { BrandLogo } from "@/components/general/BrandLogo";

export default function LoadingHome() {
  return (
    <div className="flex flex-col gap-6 h-screen w-screen SuspensePagesStyle-wrapper items-center justify-center text-xl">
      <BrandLogo variant="icon" className="h-16 w-16 animate-pulse" priority />
      <div className="flex gap-2 items-center">
        <LoadingComponent
          className="h-8 w-8"
          text="Carregando..."
          showText={true}
        />
      </div>
    </div>
  );
}
