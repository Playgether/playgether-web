import { PiMaskHappyThin } from "react-icons/pi";
import { LoadingComponent } from "../../components/layouts/components/LoadingComponent";

export default function LoadingFeed() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-2 SuspensePagesStyle-wrapper ">
      <div className="flex items-center justify-center text-xl gap-2">
        <LoadingComponent
          className="h-8 w-8"
          text="Seu feed está sendo preparado..."
          showText={true}
        />
      </div>
      <div className="SuspensePagesStyle-icon ">
        <PiMaskHappyThin className="h-10 w-10" />
      </div>
    </div>
  );
}
