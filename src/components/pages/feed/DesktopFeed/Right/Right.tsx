import { Suspense } from "react";
import { TopCard } from "../MultUseComponents/TopCard";
import Notifications from "./Notification/Notifications";
import TopicsOfMoment from "./TopicsOfTheMomment/TopicsOfMoment";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

/** Este é o componente principal da parte "Right" da página de feed. Seu intuito é servir como wrapper de toda a parte direita da página. */
const Right = () => {
  return (
    <div className="w-full 2xl:sticky top-16 h-full 2xl:h-fit min-w-[420px]">
      <div className="flex-1 h-full flex flex-col space-y-4">
        {/* Primeiro Card */}
        <div className="Right-notifications h-3/6 flex mt-2 flex-col items-center space-y-2 rounded-2xl w-10/12 2xl:w-[374px] min-h-[300px] max-h-[350px] 2xl:h-[400px] 2xl:max-h-[400px] 2xl:static top-[calc(4rem+16px)]">
          <TopCard title={"Notificações recentes"} />
          <div className="overflow-y-auto h-full flex flex-col grow">
            <Suspense fallback={<LoadingComponent />}>
              <Notifications />
            </Suspense>
          </div>
        </div>

        {/* Segundo Card */}
        <div className="Right-topics grow flex mt-2 flex-col items-center rounded-2xl w-10/12 2xl:w-[374px] min-h-[300px] h-[350px] max-h-[350px] 2xl:max-h-[400px] 2xl:static sticky top-[calc(4rem+16px)]">
          <TopCard title={"Assuntos do momento"} />
          <div className="overflow-y-auto h-full flex flex-col grow">
            <TopicsOfMoment />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Right;
