import { Metadata } from "next";
import { cookies } from "next/headers";
import BaseLayout from "../base-layout/components/structure/BaseLayout";
import { getCuts } from "@/actions/getCuts";
import { CutsViewer } from "./components/CutsViewer";

export const metadata: Metadata = {
  title: "Playgether - Cuts",
  description: "Vídeos curtos da comunidade gamer",
};

export default async function CutsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const isAuthenticated = !!accessToken;

  const { data: initialCuts, next: initialNext } = await getCuts();

  return (
    <BaseLayout>
      <div className="flex h-layout-main min-h-0 w-full overflow-hidden bg-black lg:pl-20">
        <CutsViewer
          initialCuts={initialCuts}
          initialNext={initialNext}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </BaseLayout>
  );
}
